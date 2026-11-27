import { MousePoint, SpringPreset, ZoomSegment } from "../types";

export interface WallpaperOption {
  id: string;
  name: string;
  stops: [string, string, string];
  angle: number;
}

export const WALLPAPERS: WallpaperOption[] = [
  {
    id: "sequoia-twilight",
    name: "Sequoia 暮光紫",
    stops: ["#312e81", "#6d28d9", "#ec4899"],
    angle: 135,
  },
  {
    id: "sonoma-horizon",
    name: "Sonoma 极光蓝",
    stops: ["#0f172a", "#1d4ed8", "#06b6d4"],
    angle: 125,
  },
  {
    id: "ventura-sunset",
    name: "Ventura 琥珀橙",
    stops: ["#7c2d12", "#ea580c", "#facc15"],
    angle: 140,
  },
  {
    id: "emerald-glow",
    name: "翡翠森林",
    stops: ["#064e3b", "#059669", "#34d399"],
    angle: 135,
  },
  {
    id: "obsidian-pro",
    name: "黑曜石深空",
    stops: ["#09090b", "#18181b", "#27272a"],
    angle: 145,
  },
  {
    id: "cotton-candy",
    name: "柔和霓虹",
    stops: ["#4f46e5", "#a855f7", "#f43f5e"],
    angle: 120,
  },
  {
    id: "minimal-silver",
    name: "极简银灰",
    stops: ["#334155", "#64748b", "#94a3b8"],
    angle: 135,
  },
  {
    id: "custom-solid",
    name: "自定义纯色",
    stops: ["#1e1b4b", "#1e1b4b", "#1e1b4b"],
    angle: 0,
  },
];

export const SPRING_CONFIGS: Record<
  SpringPreset,
  { stiffness: number; damping: number; label: string }
> = {
  mellow: { stiffness: 90, damping: 19, label: "柔和 (Mellow)" },
  smooth: { stiffness: 150, damping: 24, label: "丝滑 (Smooth)" },
  snappy: { stiffness: 240, damping: 29, label: "灵动 (Snappy)" },
  instant: { stiffness: 450, damping: 42, label: "快速 (Rapid)" },
};

/**
 * Step a 1D critically/under-damped spring towards target
 */
export function stepSpring(
  current: number,
  velocity: number,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
): { value: number; velocity: number } {
  const safeDt = Math.min(dt, 0.05);
  const force = -stiffness * (current - target);
  const dampForce = -damping * velocity;
  const accel = force + dampForce;
  const nextVel = velocity + accel * safeDt;
  const nextVal = current + nextVel * safeDt;
  return { value: nextVal, velocity: nextVel };
}

/**
 * Automatically cluster mouse click ("down") events into Screen Studio ZoomSegments.
 * Clusters clicks within 2.5 seconds of each other into a single continuous zoom block.
 */
export function generateAutoZoomSegments(
  events: MousePoint[],
  durationSec: number,
): ZoomSegment[] {
  const clicks = events.filter((e) => e.type === "down");
  if (clicks.length === 0) return [];

  const segments: ZoomSegment[] = [];
  const leadIn = 0.25; // start zooming 250ms before the click
  const holdOut = 1.65; // stay zoomed for 1.65s after click

  for (let i = 0; i < clicks.length; i++) {
    const click = clicks[i];
    const clickSec = click.t / 1000;
    const start = Math.max(0, Number((clickSec - leadIn).toFixed(2)));
    const end = Math.min(
      Math.max(durationSec, clickSec + 1),
      Number((clickSec + holdOut).toFixed(2)),
    );

    const prev = segments[segments.length - 1];
    if (prev && start <= prev.endTime + 0.35) {
      // Merge with previous zoom segment and switch to follow-cursor if focus shifted
      prev.endTime = Math.max(prev.endTime, end);
      const dist = Math.hypot(click.x - prev.targetX, click.y - prev.targetY);
      if (dist > 0.14) {
        prev.mode = "follow-cursor";
      } else {
        prev.targetX = Number(((prev.targetX + click.x) / 2).toFixed(3));
        prev.targetY = Number(((prev.targetY + click.y) / 2).toFixed(3));
      }
    } else {
      segments.push({
        id: `zoom-${Date.now()}-${i}`,
        startTime: start,
        endTime: Math.max(start + 0.8, end),
        scale: 2.0,
        targetX: Number(click.x.toFixed(3)),
        targetY: Number(click.y.toFixed(3)),
        mode: "follow-cursor",
        label: `自动缩放 #${segments.length + 1}`,
      });
    }
  }

  return segments;
}

/**
 * Interpolate cursor position at time `timeSec` from recorded MousePoint array
 */
export function getCursorAtTime(
  events: MousePoint[],
  timeSec: number,
): {
  x: number;
  y: number;
  isPressed: boolean;
  recentClickAgeMs: number | null;
  clickX: number;
  clickY: number;
} {
  if (!events || events.length === 0) {
    return {
      x: 0.5,
      y: 0.5,
      isPressed: false,
      recentClickAgeMs: null,
      clickX: 0.5,
      clickY: 0.5,
    };
  }

  const timeMs = timeSec * 1000;

  // Binary search for closest event <= timeMs
  let lo = 0;
  let hi = events.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (events[mid].t <= timeMs) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  const curr = events[lo];
  const next = events[Math.min(events.length - 1, lo + 1)];

  let x = curr.x;
  let y = curr.y;

  if (next && next.t > curr.t && timeMs >= curr.t && timeMs <= next.t) {
    const ratio = (timeMs - curr.t) / (next.t - curr.t);
    x = curr.x + (next.x - curr.x) * ratio;
    y = curr.y + (next.y - curr.y) * ratio;
  }

  // Check if there was a recent "down" event within last 550ms for click ripple & cursor shrink
  let recentClickAgeMs: number | null = null;
  let clickX = x;
  let clickY = y;
  let isPressed = false;

  for (let i = lo; i >= 0; i--) {
    const dt = timeMs - events[i].t;
    if (dt > 600) break;
    if (events[i].type === "down" && dt >= 0) {
      recentClickAgeMs = dt;
      clickX = events[i].x;
      clickY = events[i].y;
      if (dt < 160) isPressed = true;
      break;
    }
  }

  return { x, y, isPressed, recentClickAgeMs, clickX, clickY };
}
