import React from "react";
import {
  ZoomIn,
  Plus,
  Trash2,
  Scissors,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Crosshair,
  MousePointerClick,
  Gauge,
  Undo2,
} from "lucide-react";
import { MousePoint, VideoClipSegment, ZoomSegment } from "../types";

interface TimelineProps {
  duration: number;
  currentTime: number;
  trimStart: number;
  trimEnd: number;
  isPlaying: boolean;
  clipSegments: VideoClipSegment[];
  selectedClipId: string | null;
  zoomSegments: ZoomSegment[];
  selectedSegmentId: string | null;
  mouseEvents: MousePoint[];
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  onTrimChange: (start: number, end: number) => void;
  onSelectClip: (id: string | null) => void;
  onSplitClipAtPlayhead: () => void;
  onUpdateClip: (id: string, patch: Partial<VideoClipSegment>) => void;
  onDeleteOrRestoreClip: (id: string) => void;
  onResetClips: () => void;
  onSelectSegment: (id: string | null) => void;
  onAddSegment: () => void;
  onUpdateSegment: (id: string, patch: Partial<ZoomSegment>) => void;
  onDeleteSegment: (id: string) => void;
  onRegenerateAutoZoom: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  trimStart,
  trimEnd,
  isPlaying,
  clipSegments,
  selectedClipId,
  zoomSegments,
  selectedSegmentId,
  mouseEvents,
  onSeek,
  onTogglePlay,
  onTrimChange,
  onSelectClip,
  onSplitClipAtPlayhead,
  onUpdateClip,
  onDeleteOrRestoreClip,
  onResetClips,
  onSelectSegment,
  onAddSegment,
  onUpdateSegment,
  onDeleteSegment,
  onRegenerateAutoZoom,
}) => {
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = React.useState<{
    type:
      | "playhead"
      | "seg-move"
      | "seg-left"
      | "seg-right"
      | "trim-left"
      | "trim-right";
    segId?: string;
    initialX: number;
    initialStart: number;
    initialEnd: number;
  } | null>(null);

  const safeDuration = Math.max(0.5, duration);
  const selectedSeg =
    zoomSegments.find((s) => s.id === selectedSegmentId) || null;
  const selectedClip =
    clipSegments.find((c) => c.id === selectedClipId) || null;
  const clickEvents = React.useMemo(
    () => mouseEvents.filter((e) => e.type === "down"),
    [mouseEvents],
  );

  const clientXToTime = React.useCallback(
    (clientX: number) => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / Math.max(1, rect.width)),
      );
      return Number((ratio * safeDuration).toFixed(2));
    },
    [safeDuration],
  );

  React.useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const deltaSec =
        ((e.clientX - dragState.initialX) / Math.max(1, rect.width)) *
        safeDuration;

      if (dragState.type === "playhead") {
        onSeek(clientXToTime(e.clientX));
      } else if (dragState.type === "trim-left") {
        const nextStart = Math.max(
          0,
          Math.min(trimEnd - 0.5, dragState.initialStart + deltaSec),
        );
        onTrimChange(Number(nextStart.toFixed(2)), trimEnd);
      } else if (dragState.type === "trim-right") {
        const nextEnd = Math.min(
          safeDuration,
          Math.max(trimStart + 0.5, dragState.initialEnd + deltaSec),
        );
        onTrimChange(trimStart, Number(nextEnd.toFixed(2)));
      } else if (dragState.segId) {
        const len = dragState.initialEnd - dragState.initialStart;
        if (dragState.type === "seg-move") {
          const nextStart = Math.max(
            0,
            Math.min(safeDuration - len, dragState.initialStart + deltaSec),
          );
          onUpdateSegment(dragState.segId, {
            startTime: Number(nextStart.toFixed(2)),
            endTime: Number((nextStart + len).toFixed(2)),
          });
        } else if (dragState.type === "seg-left") {
          const nextStart = Math.max(
            0,
            Math.min(
              dragState.initialEnd - 0.4,
              dragState.initialStart + deltaSec,
            ),
          );
          onUpdateSegment(dragState.segId, {
            startTime: Number(nextStart.toFixed(2)),
          });
        } else if (dragState.type === "seg-right") {
          const nextEnd = Math.min(
            safeDuration,
            Math.max(
              dragState.initialStart + 0.4,
              dragState.initialEnd + deltaSec,
            ),
          );
          onUpdateSegment(dragState.segId, {
            endTime: Number(nextEnd.toFixed(2)),
          });
        }
      }
    };

    const handleMouseUp = () => setDragState(null);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    dragState,
    safeDuration,
    trimStart,
    trimEnd,
    clientXToTime,
    onSeek,
    onTrimChange,
    onUpdateSegment,
  ]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(1).padStart(4, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="h-60 bg-[#12141a] border-t border-[#232733] flex flex-col px-4 py-2.5 select-none">
      {/* Top Timeline Toolbar */}
      <div className="flex items-center justify-between mb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow"
            title={isPlaying ? "暂停 (Space)" : "播放 (Space)"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
          <button
            onClick={() => onSeek(trimStart)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1c2029] hover:bg-[#252a36] text-zinc-300 transition"
            title="回到起点"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="text-xs font-mono bg-[#181b23] border border-[#262b38] px-2.5 py-1 rounded-md text-zinc-300">
            <span className="text-indigo-400 font-semibold">
              {formatTime(currentTime)}
            </span>
            <span className="text-zinc-500 mx-1">/</span>
            <span>{formatTime(safeDuration)}</span>
          </div>

          {/* Split Clip at Playhead Button */}
          <button
            onClick={onSplitClipAtPlayhead}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-semibold text-amber-300 transition"
            title="在当前播放帧位置一刀切分视频轨道 (快捷键 S)"
          >
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            在此帧切分 (Split · S)
          </button>

          {clipSegments.length > 1 && (
            <button
              onClick={onResetClips}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#191c24] hover:bg-[#222733] border border-[#2a3040] text-[11px] text-zinc-400 hover:text-zinc-200 transition"
              title="合并还原所有切分片段"
            >
              <Undo2 className="w-3 h-3" />
              还原切分
            </button>
          )}
        </div>

        {/* Center Contextual Inspector: either Selected Video Clip Speed/Cut OR Selected Zoom Block */}
        {selectedClip ? (
          <div className="flex items-center gap-3 bg-[#172026] border border-emerald-500/40 px-3 py-1 rounded-lg text-xs">
            <span className="text-emerald-300 font-medium flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" />
              片段 ({selectedClip.startTime.toFixed(1)}s -{" "}
              {selectedClip.endTime.toFixed(1)}s)
            </span>

            {/* Per-Segment Speed Selector Pills */}
            <div className="flex items-center gap-1 bg-[#10161b] p-0.5 rounded border border-emerald-500/25">
              {[0.5, 1, 1.5, 2, 3, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onUpdateClip(selectedClip.id, { speed: spd })}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition ${
                    selectedClip.speed === spd
                      ? "bg-emerald-600 text-white font-semibold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              onClick={() => onDeleteOrRestoreClip(selectedClip.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition ${
                selectedClip.deleted
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30"
              }`}
              title="删除该切分片段后，播放与导出会自动跳过这段时间"
            >
              <Trash2 className="w-3 h-3" />
              {selectedClip.deleted ? "恢复此片段" : "跳过/删除此片段"}
            </button>
          </div>
        ) : selectedSeg ? (
          <div className="flex items-center gap-3 bg-[#191d26] border border-indigo-500/40 px-3 py-1 rounded-lg text-xs">
            <span className="text-indigo-300 font-medium flex items-center gap-1">
              <ZoomIn className="w-3.5 h-3.5" />
              缩放 ({selectedSeg.startTime.toFixed(1)}s -{" "}
              {selectedSeg.endTime.toFixed(1)}s)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">倍率</span>
              <input
                type="range"
                min={1.2}
                max={3.2}
                step={0.05}
                value={selectedSeg.scale}
                onChange={(e) =>
                  onUpdateSegment(selectedSeg.id, {
                    scale: parseFloat(e.target.value),
                  })
                }
                className="w-20 accent-indigo-500 cursor-pointer"
              />
              <span className="font-mono text-indigo-300 w-9">
                {selectedSeg.scale.toFixed(1)}x
              </span>
            </div>
            <div className="flex items-center gap-1 bg-[#12151c] p-0.5 rounded border border-[#272c3a]">
              <button
                onClick={() =>
                  onUpdateSegment(selectedSeg.id, { mode: "follow-cursor" })
                }
                className={`px-2 py-0.5 rounded text-[11px] transition ${
                  selectedSeg.mode === "follow-cursor"
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                跟随光标
              </button>
              <button
                onClick={() =>
                  onUpdateSegment(selectedSeg.id, { mode: "manual" })
                }
                className={`px-2 py-0.5 rounded text-[11px] transition flex items-center gap-1 ${
                  selectedSeg.mode === "manual"
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="点击上方预览画面可直接指定固定缩放焦点"
              >
                <Crosshair className="w-3 h-3" />
                固定焦点
              </button>
            </div>
            <button
              onClick={() => onDeleteSegment(selectedSeg.id)}
              className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition"
              title="删除此缩放块 (Delete)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="text-xs text-zinc-400 truncate">
            按 <span className="text-amber-300 font-mono">S</span>{" "}
            键在当前帧切分视频并单独调节片段倍速 · 点击绿色片段调倍速 ·
            点击紫色块调缩放
          </div>
        )}

        {/* Right Actions: Add Zoom & Auto-Generate */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onAddSegment}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1e222d] hover:bg-[#272c3a] border border-[#2e3446] text-xs font-medium text-zinc-200 transition"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            添加缩放
          </button>
          <button
            onClick={onRegenerateAutoZoom}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-xs font-medium text-indigo-300 transition"
            title="根据录制的鼠标点击事件重新自动生成平滑缩放块"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            智能缩放
          </button>
        </div>
      </div>

      {/* Main Multi-Track Timeline Area */}
      <div
        ref={trackRef}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).dataset.stopTrack) return;
          onSeek(clientXToTime(e.clientX));
          setDragState({
            type: "playhead",
            initialX: e.clientX,
            initialStart: 0,
            initialEnd: 0,
          });
        }}
        className="relative flex-1 bg-[#0d0f14] border border-[#222632] rounded-xl overflow-hidden flex flex-col justify-between px-0 py-2 cursor-pointer"
      >
        {/* Time Ruler Marks */}
        <div className="relative h-5 border-b border-[#1c202b] flex items-center text-[10px] font-mono text-zinc-500 pointer-events-none">
          {Array.from({ length: 11 }).map((_, idx) => {
            const pct = idx * 10;
            const sec = ((safeDuration * idx) / 10).toFixed(1);
            return (
              <div
                key={idx}
                style={{ left: `${pct}%` }}
                className="absolute top-0 bottom-0 flex flex-col items-start"
              >
                <div className="h-1.5 border-l border-zinc-700" />
                <span className="ml-1">{sec}s</span>
              </div>
            );
          })}
        </div>

        {/* Track 1: Split Video Clip Segments + Speed Badges + Click Dots */}
        <div className="relative h-12 my-1 mx-0 flex items-center bg-[#10131b]">
          {clipSegments.map((clip, index) => {
            const leftPct = (clip.startTime / safeDuration) * 100;
            const widthPct = Math.max(
              0.8,
              ((clip.endTime - clip.startTime) / safeDuration) * 100,
            );
            const isSelected = clip.id === selectedClipId;

            return (
              <div
                key={clip.id}
                data-stop-track="true"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSegment(null);
                  onSelectClip(clip.id);
                }}
                style={{
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                }}
                className={`absolute top-1 bottom-1 rounded-md border transition flex items-center justify-between px-2.5 overflow-hidden ${
                  clip.deleted
                    ? "bg-rose-950/30 border-rose-500/30 opacity-45 line-through"
                    : isSelected
                      ? "bg-emerald-500/30 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.28)] z-10"
                      : "bg-emerald-500/18 border-emerald-500/40 hover:bg-emerald-500/25"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-200 truncate pointer-events-none">
                  <Scissors className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">
                    片段 #{index + 1} ({clip.startTime.toFixed(1)}s-
                    {clip.endTime.toFixed(1)}s)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pointer-events-none">
                  {clip.deleted ? (
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-200 text-[10px] font-semibold">
                      已跳过
                    </span>
                  ) : (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        clip.speed !== 1
                          ? "bg-amber-400 text-black"
                          : "bg-black/40 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {clip.speed}x 倍速
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Mouse Click Dots along the clip track */}
          {clickEvents.map((ce, i) => {
            const leftPct = Math.max(
              0,
              Math.min(100, (ce.t / 1000 / safeDuration) * 100),
            );
            return (
              <div
                key={i}
                style={{ left: `${leftPct}%` }}
                title={`鼠标点击 @ ${(ce.t / 1000).toFixed(2)}s`}
                className="absolute top-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] pointer-events-none z-20"
              />
            );
          })}

          {/* Global Trim Left Handle */}
          <div
            data-stop-track="true"
            onMouseDown={(e) => {
              e.stopPropagation();
              setDragState({
                type: "trim-left",
                initialX: e.clientX,
                initialStart: trimStart,
                initialEnd: trimEnd,
              });
            }}
            style={{ left: `${(trimStart / safeDuration) * 100}%` }}
            className="absolute top-0 bottom-0 w-2 bg-emerald-400 hover:bg-emerald-300 cursor-ew-resize z-20 flex items-center justify-center rounded-l"
            title="拖拽裁切整段起点"
          >
            <div className="w-0.5 h-4 bg-black/70 rounded" />
          </div>

          {/* Global Trim Right Handle */}
          <div
            data-stop-track="true"
            onMouseDown={(e) => {
              e.stopPropagation();
              setDragState({
                type: "trim-right",
                initialX: e.clientX,
                initialStart: trimStart,
                initialEnd: trimEnd,
              });
            }}
            style={{ left: `calc(${(trimEnd / safeDuration) * 100}% - 8px)` }}
            className="absolute top-0 bottom-0 w-2 bg-emerald-400 hover:bg-emerald-300 cursor-ew-resize z-20 flex items-center justify-center rounded-r"
            title="拖拽裁切整段终点"
          >
            <div className="w-0.5 h-4 bg-black/70 rounded" />
          </div>
        </div>

        {/* Track 2: Auto-Zoom & Manual Zoom Keyframe Blocks */}
        <div className="relative h-12 bg-[#12151e] border-t border-[#1d2130] flex items-center">
          <span className="ml-3 text-[11px] text-zinc-500 pointer-events-none">
            ZOOM 镜头轨道
          </span>

          {zoomSegments.map((seg) => {
            const leftPct = (seg.startTime / safeDuration) * 100;
            const widthPct = Math.max(
              1.5,
              ((seg.endTime - seg.startTime) / safeDuration) * 100,
            );
            const isSelected = seg.id === selectedSegmentId;

            return (
              <div
                key={seg.id}
                data-stop-track="true"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onSelectClip(null);
                  onSelectSegment(seg.id);
                  setDragState({
                    type: "seg-move",
                    segId: seg.id,
                    initialX: e.clientX,
                    initialStart: seg.startTime,
                    initialEnd: seg.endTime,
                  });
                }}
                style={{
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                }}
                className={`absolute top-1.5 bottom-1.5 rounded-lg border transition flex items-center justify-between px-2 cursor-grab active:cursor-grabbing ${
                  isSelected
                    ? "bg-indigo-600/45 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.35)] z-10"
                    : "bg-indigo-500/25 border-indigo-500/50 hover:bg-indigo-500/35"
                }`}
              >
                {/* Left Resize Handle */}
                <div
                  data-stop-track="true"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onSelectClip(null);
                    onSelectSegment(seg.id);
                    setDragState({
                      type: "seg-left",
                      segId: seg.id,
                      initialX: e.clientX,
                      initialStart: seg.startTime,
                      initialEnd: seg.endTime,
                    });
                  }}
                  className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-indigo-300/50 rounded-l-lg"
                />

                <div className="flex items-center gap-1.5 overflow-hidden pointer-events-none">
                  <ZoomIn className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                  <span className="text-[11px] font-semibold text-indigo-100 truncate">
                    {seg.scale.toFixed(1)}x ·{" "}
                    {seg.mode === "follow-cursor" ? "跟随鼠标" : "固定焦点"}
                  </span>
                </div>

                {/* Right Resize Handle */}
                <div
                  data-stop-track="true"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onSelectClip(null);
                    onSelectSegment(seg.id);
                    setDragState({
                      type: "seg-right",
                      segId: seg.id,
                      initialX: e.clientX,
                      initialStart: seg.startTime,
                      initialEnd: seg.endTime,
                    });
                  }}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-indigo-300/50 rounded-r-lg"
                />
              </div>
            );
          })}
        </div>

        {/* Playhead Vertical Line */}
        <div
          style={{ left: `${(currentTime / safeDuration) * 100}%` }}
          className="absolute top-0 bottom-0 w-0.5 bg-rose-500 pointer-events-none z-30"
        >
          <div className="w-3 h-3 -ml-[5px] bg-rose-500 rotate-45 rounded-xs shadow" />
        </div>
      </div>
    </div>
  );
};
