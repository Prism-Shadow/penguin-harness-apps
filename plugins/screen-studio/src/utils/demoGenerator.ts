import { MousePoint, ZoomSegment } from "../types";

/**
 * Generates an interactive synthetic 12-second product demo trajectory
 * with realistic cursor movement, clicks, and pre-built Auto-Zoom segments.
 */
export function createDemoProjectData(): {
  duration: number;
  mouseEvents: MousePoint[];
  zoomSegments: ZoomSegment[];
} {
  const duration = 12.0;
  const waypoints: Array<{ t: number; x: number; y: number; click?: boolean }> =
    [
      { t: 0, x: 0.5, y: 0.52 },
      { t: 900, x: 0.16, y: 0.26 },
      { t: 1250, x: 0.16, y: 0.26, click: true }, // Click sidebar "Analytics"
      { t: 2400, x: 0.16, y: 0.36, click: true }, // Click sidebar "Campaigns"
      { t: 3800, x: 0.56, y: 0.42 },
      { t: 4300, x: 0.62, y: 0.46, click: true }, // Click main chart metric card
      { t: 5600, x: 0.68, y: 0.48 },
      { t: 6800, x: 0.84, y: 0.18 },
      { t: 7200, x: 0.84, y: 0.18, click: true }, // Click top-right "Deploy Release" button
      { t: 8400, x: 0.52, y: 0.56, click: true }, // Click modal confirm button
      { t: 10200, x: 0.48, y: 0.72 },
      { t: 12000, x: 0.5, y: 0.5 },
    ];

  const events: MousePoint[] = [];
  const stepMs = 16;

  for (let t = 0; t <= duration * 1000; t += stepMs) {
    // Find surrounding waypoints
    let idx = 0;
    while (idx < waypoints.length - 2 && waypoints[idx + 1].t < t) {
      idx++;
    }
    const a = waypoints[idx];
    const b = waypoints[idx + 1];
    const span = Math.max(1, b.t - a.t);
    const rawProgress = Math.max(0, Math.min(1, (t - a.t) / span));
    // Smoothstep easing
    const ease = rawProgress * rawProgress * (3 - 2 * rawProgress);

    const x = a.x + (b.x - a.x) * ease;
    const y = a.y + (b.y - a.y) * ease;

    events.push({
      t,
      x: Number(x.toFixed(4)),
      y: Number(y.toFixed(4)),
      type: "move",
      button: 0,
    });
  }

  for (const wp of waypoints) {
    if (wp.click) {
      events.push({
        t: wp.t,
        x: wp.x,
        y: wp.y,
        type: "down",
        button: 0,
      });
      events.push({
        t: wp.t + 120,
        x: wp.x,
        y: wp.y,
        type: "up",
        button: 0,
      });
    }
  }

  events.sort((p, q) => p.t - q.t);

  const zoomSegments: ZoomSegment[] = [
    {
      id: "demo-zoom-1",
      startTime: 1.0,
      endTime: 3.3,
      scale: 2.1,
      targetX: 0.18,
      targetY: 0.31,
      mode: "follow-cursor",
      label: "侧边栏导航特写",
    },
    {
      id: "demo-zoom-2",
      startTime: 4.1,
      endTime: 6.1,
      scale: 1.95,
      targetX: 0.62,
      targetY: 0.46,
      mode: "follow-cursor",
      label: "核心增长图表聚焦",
    },
    {
      id: "demo-zoom-3",
      startTime: 6.9,
      endTime: 9.5,
      scale: 2.25,
      targetX: 0.82,
      targetY: 0.22,
      mode: "follow-cursor",
      label: "右上角一键发布交互",
    },
  ];

  return { duration, mouseEvents: events, zoomSegments };
}

/**
 * Draws a crisp, animated SaaS Dashboard scene onto an offscreen canvas
 * when the user is previewing the built-in interactive Demo Project.
 */
export function drawSyntheticDashboardFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeSec: number,
) {
  ctx.save();

  // App background
  ctx.fillStyle = "#0f1117";
  ctx.fillRect(0, 0, width, height);

  // Left Sidebar
  const sideW = width * 0.21;
  ctx.fillStyle = "#151821";
  ctx.fillRect(0, 0, sideW, height);
  ctx.strokeStyle = "#252a38";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sideW, 0);
  ctx.lineTo(sideW, height);
  ctx.stroke();

  // Brand header in sidebar
  ctx.fillStyle = "#6366f1";
  ctx.beginPath();
  ctx.roundRect(width * 0.025, height * 0.06, width * 0.03, width * 0.03, 8);
  ctx.fill();

  ctx.fillStyle = "#f8fafc";
  ctx.font = `600 ${Math.round(width * 0.014)}px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillText("Acme Cloud Studio", width * 0.065, height * 0.088);

  // Sidebar menu items
  const menuItems = [
    { label: "Overview", y: 0.18 },
    { label: "Realtime Analytics", y: 0.26 },
    { label: "Growth Campaigns", y: 0.36 },
    { label: "API Keys & Webhooks", y: 0.46 },
    { label: "Team Settings", y: 0.56 },
  ];

  const activeIndex = timeSec < 2.2 ? 1 : timeSec < 3.8 ? 2 : 1;

  menuItems.forEach((item, idx) => {
    const itemY = height * item.y;
    const isActive = idx === activeIndex;
    if (isActive) {
      ctx.fillStyle = "rgba(99, 102, 241, 0.18)";
      ctx.beginPath();
      ctx.roundRect(
        width * 0.018,
        itemY - height * 0.032,
        sideW - width * 0.036,
        height * 0.058,
        10,
      );
      ctx.fill();
      ctx.strokeStyle = "rgba(99, 102, 241, 0.5)";
      ctx.stroke();
    }
    ctx.fillStyle = isActive ? "#a5b4fc" : "#94a3b8";
    ctx.font = `${isActive ? "600" : "500"} ${Math.round(width * 0.0115)}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(item.label, width * 0.035, itemY + height * 0.004);
  });

  // Top Header Bar
  ctx.fillStyle = "#f8fafc";
  ctx.font = `700 ${Math.round(width * 0.02)}px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillText(
    activeIndex === 2
      ? "Growth Campaigns · Q4 Launch"
      : "Realtime Product Telemetry",
    sideW + width * 0.04,
    height * 0.15,
  );

  // Top Right CTA Button ("Deploy Release")
  const btnX = width * 0.76;
  const btnY = height * 0.135;
  const btnW = width * 0.16;
  const btnH = height * 0.075;
  const isDeployClicked = timeSec >= 7.15 && timeSec <= 9.8;

  ctx.fillStyle = isDeployClicked ? "#10b981" : "#6366f1";
  ctx.beginPath();
  ctx.roundRect(btnX, btnY, btnW, btnH, 10);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = `600 ${Math.round(width * 0.012)}px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillText(
    isDeployClicked ? "✓ Production Live" : "⚡ Deploy v2.4",
    btnX + width * 0.025,
    btnY + btnH * 0.62,
  );

  // Metric Cards Row
  const cards = [
    { title: "ACTIVE USERS", val: "128,490", delta: "+24.8%", x: 0.25 },
    { title: "CONVERSION RATE", val: "6.84%", delta: "+1.42%", x: 0.49 },
    { title: "LATENCY (P95)", val: "18.2 ms", delta: "-6.4 ms", x: 0.73 },
  ];

  cards.forEach((c, idx) => {
    const cx = width * c.x;
    const cy = height * 0.26;
    const cw = width * 0.21;
    const ch = height * 0.21;

    const highlightCard = idx === 1 && timeSec >= 4.2 && timeSec <= 6.2;
    ctx.fillStyle = highlightCard ? "#1e2436" : "#161923";
    ctx.beginPath();
    ctx.roundRect(cx, cy, cw, ch, 14);
    ctx.fill();
    ctx.strokeStyle = highlightCard ? "#6366f1" : "#262b3c";
    ctx.lineWidth = highlightCard ? 2 : 1;
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = `600 ${Math.round(width * 0.0095)}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(c.title, cx + width * 0.018, cy + height * 0.055);

    ctx.fillStyle = "#f8fafc";
    ctx.font = `700 ${Math.round(width * 0.022)}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(c.val, cx + width * 0.018, cy + height * 0.13);

    ctx.fillStyle = "#34d399";
    ctx.font = `600 ${Math.round(width * 0.011)}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(c.delta, cx + width * 0.018, cy + height * 0.175);
  });

  // Main Interactive Chart Panel
  const chartX = width * 0.25;
  const chartY = height * 0.52;
  const chartW = width * 0.69;
  const chartH = height * 0.39;

  ctx.fillStyle = "#161923";
  ctx.beginPath();
  ctx.roundRect(chartX, chartY, chartW, chartH, 16);
  ctx.fill();
  ctx.strokeStyle = "#262b3c";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Animated spline wave inside chart
  ctx.save();
  ctx.beginPath();
  const pts = 24;
  for (let i = 0; i <= pts; i++) {
    const px = chartX + width * 0.03 + (i / pts) * (chartW - width * 0.06);
    const wave =
      Math.sin(i * 0.45 + timeSec * 1.8) * (chartH * 0.16) +
      Math.cos(i * 0.22 - timeSec * 0.9) * (chartH * 0.1);
    const py = chartY + chartH * 0.56 - (i / pts) * (chartH * 0.18) + wave;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = "#818cf8";
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.restore();

  // Modal overlay when Deploy button is clicked (7.3s - 9.4s)
  if (timeSec >= 7.25 && timeSec <= 9.35) {
    ctx.fillStyle = "rgba(9, 11, 17, 0.68)";
    ctx.fillRect(0, 0, width, height);

    const mw = width * 0.36;
    const mh = height * 0.32;
    const mx = (width - mw) / 2;
    const my = (height - mh) / 2;

    ctx.fillStyle = "#1b2030";
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 18);
    ctx.fill();
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#f8fafc";
    ctx.font = `700 ${Math.round(width * 0.016)}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(
      "Confirm Production Rollout",
      mx + width * 0.03,
      my + height * 0.09,
    );

    ctx.fillStyle = "#94a3b8";
    ctx.font = `400 ${Math.round(width * 0.011)}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(
      "All 14 edge regions passed health checks.",
      mx + width * 0.03,
      my + height * 0.15,
    );

    const confirmed = timeSec >= 8.4;
    ctx.fillStyle = confirmed ? "#10b981" : "#4f46e5";
    ctx.beginPath();
    ctx.roundRect(
      mx + width * 0.03,
      my + height * 0.2,
      mw - width * 0.06,
      height * 0.075,
      10,
    );
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = `600 ${Math.round(width * 0.012)}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(
      confirmed ? "✓ Deployed Successfully!" : "Confirm & Ship Now",
      mx + width * 0.11,
      my + height * 0.248,
    );
  }

  ctx.restore();
}
