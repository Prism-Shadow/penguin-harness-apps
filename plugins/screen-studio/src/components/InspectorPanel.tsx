import React from "react";
import {
  Palette,
  Sparkles,
  MousePointer,
  Camera,
  Maximize2,
  Gauge,
} from "lucide-react";
import {
  AspectRatioPreset,
  SpringPreset,
  StudioConfig,
  WebcamCorner,
  WebcamShape,
} from "../types";
import { SPRING_CONFIGS, WALLPAPERS } from "../utils/springPhysics";

interface InspectorPanelProps {
  config: StudioConfig;
  hasWebcamStream: boolean;
  onChange: (patch: Partial<StudioConfig>) => void;
  onToggleWebcamDevice: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  config,
  hasWebcamStream,
  onChange,
  onToggleWebcamDevice,
}) => {
  return (
    <aside className="w-80 bg-[#12141a] border-l border-[#232733] flex flex-col overflow-y-auto p-4 space-y-6 select-none">
      {/* Section 1: Wallpaper & Background */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            画布背景 (Wallpaper)
          </h3>
          <span className="text-[11px] text-zinc-500">macOS Presets</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {WALLPAPERS.map((wp) => {
            const isSelected = config.wallpaperId === wp.id;
            const bgStyle =
              wp.id === "custom-solid"
                ? { background: config.customColor }
                : {
                    background: `linear-gradient(${wp.angle}deg, ${wp.stops[0]}, ${wp.stops[1]}, ${wp.stops[2]})`,
                  };

            return (
              <button
                key={wp.id}
                onClick={() => onChange({ wallpaperId: wp.id })}
                title={wp.name}
                style={bgStyle}
                className={`h-11 rounded-lg border transition relative overflow-hidden ${
                  isSelected
                    ? "border-white ring-2 ring-indigo-500/70 scale-[1.03]"
                    : "border-white/15 hover:border-white/40"
                }`}
              >
                <span className="sr-only">{wp.name}</span>
              </button>
            );
          })}
        </div>

        {config.wallpaperId === "custom-solid" && (
          <div className="flex items-center justify-between bg-[#181b23] px-3 py-2 rounded-lg border border-[#262b38]">
            <span className="text-xs text-zinc-300">自定义背景色</span>
            <input
              type="color"
              value={config.customColor}
              onChange={(e) => onChange({ customColor: e.target.value })}
              className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
        )}
      </section>

      {/* Section 2: Frame Geometry & Shadow */}
      <section className="space-y-3 pt-2 border-t border-[#1e222d]">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
          边框与比例 (Frame & Aspect)
        </h3>

        {/* Aspect Ratio Pills */}
        <div className="grid grid-cols-5 gap-1.5 bg-[#181b23] p-1 rounded-lg border border-[#242936]">
          {(
            ["16:9", "9:16", "1:1", "4:3", "original"] as AspectRatioPreset[]
          ).map((ratio) => (
            <button
              key={ratio}
              onClick={() => onChange({ aspectRatio: ratio })}
              className={`py-1 rounded text-[11px] font-medium transition ${
                config.aspectRatio === ratio
                  ? "bg-indigo-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {ratio === "original" ? "原比例" : ratio}
            </button>
          ))}
        </div>

        {/* Sliders: Padding, Border Radius, Shadow */}
        <div className="space-y-2.5 text-xs">
          <div>
            <div className="flex justify-between text-zinc-400 mb-1">
              <span>内边距 (Padding)</span>
              <span className="font-mono text-zinc-300">
                {config.padding}px
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={160}
              value={config.padding}
              onChange={(e) => onChange({ padding: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-zinc-400 mb-1">
              <span>画面圆角 (Corner Radius)</span>
              <span className="font-mono text-zinc-300">
                {config.borderRadius}px
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={44}
              value={config.borderRadius}
              onChange={(e) =>
                onChange({ borderRadius: Number(e.target.value) })
              }
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-zinc-400 mb-1">
              <span>立体阴影 (Shadow Depth)</span>
              <span className="font-mono text-zinc-300">
                {config.shadowIntensity}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={config.shadowIntensity}
              onChange={(e) =>
                onChange({ shadowIntensity: Number(e.target.value) })
              }
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <label className="flex items-center gap-2 text-xs text-zinc-300 bg-[#181b23] px-2.5 py-2 rounded-lg border border-[#242936] cursor-pointer">
            <input
              type="checkbox"
              checked={config.insetBorder}
              onChange={(e) => onChange({ insetBorder: e.target.checked })}
              className="accent-indigo-500 rounded"
            />
            <span>玻璃高光边</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-zinc-300 bg-[#181b23] px-2.5 py-2 rounded-lg border border-[#242936] cursor-pointer">
            <input
              type="checkbox"
              checked={config.macosHeader}
              onChange={(e) => onChange({ macosHeader: e.target.checked })}
              className="accent-indigo-500 rounded"
            />
            <span>macOS 顶栏</span>
          </label>
        </div>
      </section>

      {/* Section 3: Spring Physics & Auto-Zoom Feel */}
      <section className="space-y-3 pt-2 border-t border-[#1e222d]">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          弹簧物理推镜 (Spring Physics)
        </h3>

        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(SPRING_CONFIGS) as SpringPreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => onChange({ springPreset: preset })}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition text-left ${
                config.springPreset === preset
                  ? "bg-indigo-600/25 border-indigo-500 text-indigo-200"
                  : "bg-[#181b23] border-[#242936] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {SPRING_CONFIGS[preset].label}
            </button>
          ))}
        </div>
      </section>

      {/* Section 4: Cursor & Click Effects */}
      <section className="space-y-3 pt-2 border-t border-[#1e222d]">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <MousePointer className="w-3.5 h-3.5 text-indigo-400" />
          光标与点击动效 (Cursor & Ripple)
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-zinc-400">
            <span>平滑光标大小 (Custom Cursor)</span>
            <span className="font-mono text-zinc-300">
              {config.cursorScale === 0
                ? "关闭"
                : `${config.cursorScale.toFixed(1)}x`}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={2.5}
            step={0.1}
            value={config.cursorScale}
            onChange={(e) =>
              onChange({ cursorScale: parseFloat(e.target.value) })
            }
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 text-xs text-zinc-300 bg-[#181b23] px-2.5 py-2 rounded-lg border border-[#242936] cursor-pointer">
            <input
              type="checkbox"
              checked={config.showClickRipple}
              onChange={(e) => onChange({ showClickRipple: e.target.checked })}
              className="accent-indigo-500 rounded"
            />
            <span>点击波纹环</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-zinc-300 bg-[#181b23] px-2.5 py-2 rounded-lg border border-[#242936] cursor-pointer">
            <input
              type="checkbox"
              checked={config.smoothCursorMove}
              onChange={(e) => onChange({ smoothCursorMove: e.target.checked })}
              className="accent-indigo-500 rounded"
            />
            <span>轨迹物理平滑</span>
          </label>
        </div>
      </section>

      {/* Section 5: Webcam PiP Overlay */}
      <section className="space-y-3 pt-2 border-t border-[#1e222d]">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
            摄像头画中画 (Webcam PiP)
          </h3>
          <button
            onClick={onToggleWebcamDevice}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              hasWebcamStream
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-[#1c202a] text-zinc-300 border border-[#2b3140] hover:bg-[#252a37]"
            }`}
          >
            {hasWebcamStream ? "已开启摄像头" : "开启摄像头"}
          </button>
        </div>

        {hasWebcamStream && (
          <div className="space-y-2.5 text-xs">
            <div className="grid grid-cols-4 gap-1 bg-[#181b23] p-1 rounded-lg border border-[#242936]">
              {(
                [
                  ["bottom-right", "右下"],
                  ["bottom-left", "左下"],
                  ["top-right", "右上"],
                  ["top-left", "左上"],
                ] as [WebcamCorner, string][]
              ).map(([pos, label]) => (
                <button
                  key={pos}
                  onClick={() => onChange({ webcamCorner: pos })}
                  className={`py-1 rounded text-[11px] transition ${
                    config.webcamCorner === pos
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-1 bg-[#181b23] p-1 rounded-lg border border-[#242936]">
              {(
                [
                  ["circle", "圆形"],
                  ["rounded", "横版圆角"],
                  ["square", "方角"],
                ] as [WebcamShape, string][]
              ).map(([sh, label]) => (
                <button
                  key={sh}
                  onClick={() => onChange({ webcamShape: sh })}
                  className={`py-1 rounded text-[11px] transition ${
                    config.webcamShape === sh
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>画中画尺寸</span>
                <span className="font-mono text-zinc-300">
                  {config.webcamSize}px
                </span>
              </div>
              <input
                type="range"
                min={120}
                max={340}
                value={config.webcamSize}
                onChange={(e) =>
                  onChange({ webcamSize: Number(e.target.value) })
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-zinc-300 bg-[#181b23] px-2.5 py-2 rounded-lg border border-[#242936] cursor-pointer">
              <input
                type="checkbox"
                checked={config.webcamShrinkOnZoom}
                onChange={(e) =>
                  onChange({ webcamShrinkOnZoom: e.target.checked })
                }
                className="accent-indigo-500 rounded"
              />
              <span>镜头放大时自动缩小避让</span>
            </label>
          </div>
        )}
      </section>

      {/* Section 6: Playback Speed */}
      <section className="space-y-2.5 pt-2 border-t border-[#1e222d]">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-indigo-400" />
          播放与导出倍速 (Speed)
        </h3>
        <div className="grid grid-cols-4 gap-1.5 bg-[#181b23] p-1 rounded-lg border border-[#242936]">
          {[1, 1.25, 1.5, 2].map((spd) => (
            <button
              key={spd}
              onClick={() => onChange({ playbackSpeed: spd })}
              className={`py-1 rounded text-xs font-mono transition ${
                config.playbackSpeed === spd
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
};
