import React from "react";
import { Check, X, Move } from "lucide-react";
import { AreaCropBounds } from "../types";

export const AreaSelectorOverlay: React.FC = () => {
  // Parse optional preset dimensions from hash query (#area?w=430&h=764)
  const initialBox = React.useMemo(() => {
    const hash = window.location.hash || "";
    const qIdx = hash.indexOf("?");
    const sw = window.innerWidth || 1470;
    const sh = window.innerHeight || 956;

    if (qIdx !== -1) {
      const params = new URLSearchParams(hash.slice(qIdx + 1));
      const pw = Number(params.get("w")) || 800;
      const ph = Number(params.get("h")) || 600;
      return {
        x: Math.round((sw - pw) / 2),
        y: Math.round((sh - ph) / 2),
        w: pw,
        h: ph,
      };
    }

    const defaultW = Math.round(sw * 0.56);
    const defaultH = Math.round(sh * 0.58);
    return {
      x: Math.round((sw - defaultW) / 2),
      y: Math.round((sh - defaultH) / 2),
      w: defaultW,
      h: defaultH,
    };
  }, []);

  const [box, setBox] = React.useState(initialBox);
  const [dragMode, setDragMode] = React.useState<
    null | "draw" | "move" | "nw" | "ne" | "sw" | "se"
  >(null);
  const startRef = React.useRef({
    mouseX: 0,
    mouseY: 0,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });

  React.useEffect(() => {
    document.body.style.background = "transparent";
    document.documentElement.style.background = "transparent";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        window.studioAPI?.confirmArea(null);
      } else if (e.key === "Enter") {
        handleConfirm();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const handleConfirm = () => {
    const sw = Math.max(1, window.innerWidth);
    const sh = Math.max(1, window.innerHeight);
    const bounds: AreaCropBounds = {
      x: Number((box.x / sw).toFixed(4)),
      y: Number((box.y / sh).toFixed(4)),
      w: Number((box.w / sw).toFixed(4)),
      h: Number((box.h / sh).toFixed(4)),
      pxW: Math.round(box.w),
      pxH: Math.round(box.h),
    };
    window.studioAPI?.confirmArea(bounds);
  };

  const handleCancel = () => {
    window.studioAPI?.confirmArea(null);
  };

  React.useEffect(() => {
    if (!dragMode) return;

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startRef.current.mouseX;
      const dy = e.clientY - startRef.current.mouseY;
      const sw = window.innerWidth;
      const sh = window.innerHeight;

      if (dragMode === "draw") {
        const x1 = Math.min(startRef.current.mouseX, e.clientX);
        const y1 = Math.min(startRef.current.mouseY, e.clientY);
        const w = Math.max(120, Math.abs(e.clientX - startRef.current.mouseX));
        const h = Math.max(90, Math.abs(e.clientY - startRef.current.mouseY));
        setBox({ x: x1, y: y1, w, h });
      } else if (dragMode === "move") {
        const nx = Math.max(
          0,
          Math.min(sw - startRef.current.w, startRef.current.x + dx),
        );
        const ny = Math.max(
          0,
          Math.min(sh - startRef.current.h, startRef.current.y + dy),
        );
        setBox((prev) => ({ ...prev, x: nx, y: ny }));
      } else if (dragMode === "se") {
        const nw = Math.max(
          140,
          Math.min(sw - startRef.current.x, startRef.current.w + dx),
        );
        const nh = Math.max(
          100,
          Math.min(sh - startRef.current.y, startRef.current.h + dy),
        );
        setBox((prev) => ({ ...prev, w: nw, h: nh }));
      } else if (dragMode === "nw") {
        const nx = Math.max(
          0,
          Math.min(
            startRef.current.x + startRef.current.w - 140,
            startRef.current.x + dx,
          ),
        );
        const ny = Math.max(
          0,
          Math.min(
            startRef.current.y + startRef.current.h - 100,
            startRef.current.y + dy,
          ),
        );
        const nw = startRef.current.w - (nx - startRef.current.x);
        const nh = startRef.current.h - (ny - startRef.current.y);
        setBox({ x: nx, y: ny, w: nw, h: nh });
      } else if (dragMode === "ne") {
        const ny = Math.max(
          0,
          Math.min(
            startRef.current.y + startRef.current.h - 100,
            startRef.current.y + dy,
          ),
        );
        const nw = Math.max(
          140,
          Math.min(sw - startRef.current.x, startRef.current.w + dx),
        );
        const nh = startRef.current.h - (ny - startRef.current.y);
        setBox((prev) => ({ ...prev, y: ny, w: nw, h: nh }));
      } else if (dragMode === "sw") {
        const nx = Math.max(
          0,
          Math.min(
            startRef.current.x + startRef.current.w - 140,
            startRef.current.x + dx,
          ),
        );
        const nw = startRef.current.w - (nx - startRef.current.x);
        const nh = Math.max(
          100,
          Math.min(sh - startRef.current.y, startRef.current.h + dy),
        );
        setBox((prev) => ({ ...prev, x: nx, w: nw, h: nh }));
      }
    };

    const onMouseUp = () => setDragMode(null);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragMode]);

  return (
    <div
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).dataset.handle) return;
        startRef.current = {
          mouseX: e.clientX,
          mouseY: e.clientY,
          x: e.clientX,
          y: e.clientY,
          w: 0,
          h: 0,
        };
        setDragMode("draw");
      }}
      className="fixed inset-0 cursor-crosshair select-none overflow-hidden"
    >
      {/* Top Floating Hint Banner */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-30 bg-[#1e1e22]/90 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full text-xs text-zinc-100 shadow-2xl pointer-events-none flex items-center gap-2">
        <span>
          拖拽画面任意位置重新拉框 · 拖动四角调整大小 · 按 Enter 确认选区
        </span>
      </div>

      {/* Selected Crop Region with huge outside dim shadow */}
      <div
        data-handle="move"
        onMouseDown={(e) => {
          e.stopPropagation();
          startRef.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            ...box,
          };
          setDragMode("move");
        }}
        style={{
          left: box.x,
          top: box.y,
          width: box.w,
          height: box.h,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.56)",
        }}
        className="absolute border-2 border-dashed border-white rounded-xl cursor-move flex items-center justify-center"
      >
        {/* Center Dimensions Pill & Confirm Actions */}
        <div
          data-handle="true"
          onMouseDown={(e) => e.stopPropagation()}
          className="bg-[#252529]/95 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3 cursor-default"
        >
          <div className="flex items-center gap-1.5 text-xs font-mono text-white">
            <Move className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {Math.round(box.w)} × {Math.round(box.h)} px
            </span>
          </div>

          <div className="h-4 w-px bg-white/15" />

          {/* Quick Aspect Ratio Locks */}
          <div className="flex items-center gap-1 text-[11px]">
            {[
              { label: "16:9", r: 16 / 9 },
              { label: "9:16", r: 9 / 16 },
              { label: "1:1", r: 1 },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  const nextH = Math.round(box.w / item.r);
                  setBox((prev) => ({
                    ...prev,
                    h: Math.min(window.innerHeight - 40, nextH),
                  }));
                }}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-zinc-200 transition"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-white/15" />

          <button
            onClick={handleConfirm}
            className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow transition"
          >
            <Check className="w-3.5 h-3.5" />
            确认区域
          </button>
          <button
            onClick={handleCancel}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 transition"
            title="取消 (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Corner Resize Handles */}
        {(["nw", "ne", "sw", "se"] as const).map((dir) => {
          const posClass =
            dir === "nw"
              ? "-top-2 -left-2 cursor-nwse-resize"
              : dir === "ne"
                ? "-top-2 -right-2 cursor-nesw-resize"
                : dir === "sw"
                  ? "-bottom-2 -left-2 cursor-nesw-resize"
                  : "-bottom-2 -right-2 cursor-nwse-resize";

          return (
            <div
              key={dir}
              data-handle={dir}
              onMouseDown={(e) => {
                e.stopPropagation();
                startRef.current = {
                  mouseX: e.clientX,
                  mouseY: e.clientY,
                  ...box,
                };
                setDragMode(dir);
              }}
              className={`absolute w-4 h-4 rounded-full bg-white border-2 border-indigo-600 shadow ${posClass}`}
            />
          );
        })}
      </div>
    </div>
  );
};
