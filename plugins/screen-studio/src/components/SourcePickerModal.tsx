import React from "react";
import {
  Monitor,
  AppWindow,
  RefreshCw,
  X,
  CircleDot,
  Mic,
  Camera,
  ShieldAlert,
} from "lucide-react";
import { DesktopSource } from "../types";

interface SourcePickerModalProps {
  isOpen: boolean;
  sources: DesktopSource[];
  loading: boolean;
  error: string | null;
  micEnabled: boolean;
  webcamEnabled: boolean;
  onRefresh: () => void;
  onToggleMic: () => void;
  onToggleWebcam: () => void;
  onSelectSourceAndRecord: (source: DesktopSource) => void;
  onBrowserFallbackRecord: () => void;
  onClose: () => void;
}

export const SourcePickerModal: React.FC<SourcePickerModalProps> = ({
  isOpen,
  sources,
  loading,
  error,
  micEnabled,
  webcamEnabled,
  onRefresh,
  onToggleMic,
  onToggleWebcam,
  onSelectSourceAndRecord,
  onBrowserFallbackRecord,
  onClose,
}) => {
  const [tab, setTab] = React.useState<"screen" | "window">("screen");

  if (!isOpen) return null;

  const filtered = sources.filter((s) =>
    tab === "screen" ? s.isScreen : !s.isScreen,
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-3xl bg-[#14171f] border border-[#282d3e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222634]">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <CircleDot className="w-4 h-4 text-rose-500 animate-pulse" />
              选择录制目标 (自动启用 macOS 原生鼠标点击追踪)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              录制期间你在屏幕上的每次鼠标点击都会被原生 Swift
              追踪器捕获并自动生成丝滑缩放镜头
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-[#1f2430] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar + Audio/Webcam Toggles */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#101219] border-b border-[#1f2330]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("screen")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                tab === "screen"
                  ? "bg-indigo-600 text-white"
                  : "bg-[#1a1e29] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              整个屏幕 ({sources.filter((s) => s.isScreen).length})
            </button>
            <button
              onClick={() => setTab("window")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                tab === "window"
                  ? "bg-indigo-600 text-white"
                  : "bg-[#1a1e29] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <AppWindow className="w-3.5 h-3.5" />
              应用窗口 ({sources.filter((s) => !s.isScreen).length})
            </button>
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg bg-[#1a1e29] hover:bg-[#232836] text-zinc-300 transition"
              title="刷新列表"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMic}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                micEnabled
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-[#181b24] border-[#262b38] text-zinc-400"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              {micEnabled ? "麦克风已开启" : "麦克风关闭"}
            </button>
            <button
              onClick={onToggleWebcam}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                webcamEnabled
                  ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                  : "bg-[#181b24] border-[#262b38] text-zinc-400"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              {webcamEnabled ? "摄像头画中画开启" : "摄像头关闭"}
            </button>
          </div>
        </div>

        {/* Source Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold mb-1">提示：{error}</div>
                  <div className="text-amber-300/80">
                    若 macOS 尚未向 Electron 授予屏幕录制权限，可前往「系统设置
                    → 隐私与安全性 →
                    屏幕与系统音频录制」开启，或者点击右侧按钮使用系统级选择器。
                  </div>
                </div>
              </div>
              <button
                onClick={onBrowserFallbackRecord}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-semibold shrink-0 hover:bg-amber-400 transition"
              >
                调用系统录制选择器
              </button>
            </div>
          )}

          {loading ? (
            <div className="h-52 flex items-center justify-center text-sm text-zinc-400">
              正在读取 macOS 桌面与窗口画面源...
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center gap-3 text-sm text-zinc-400">
              <span>未找到可用的{tab === "screen" ? "屏幕" : "窗口"}源</span>
              <button
                onClick={onBrowserFallbackRecord}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
              >
                直接调起系统屏幕选择器开始录制
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filtered.map((src) => (
                <button
                  key={src.id}
                  onClick={() => onSelectSourceAndRecord(src)}
                  className="group bg-[#1a1e29] hover:bg-[#222736] border border-[#2a3042] hover:border-indigo-500 rounded-xl p-2.5 text-left transition flex flex-col"
                >
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-2.5 border border-white/5">
                    <img
                      src={src.thumbnail}
                      alt={src.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-200"
                    />
                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/20 transition flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-semibold shadow-lg transition">
                        点击立即开始录制
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {src.appIcon && (
                      <img
                        src={src.appIcon}
                        alt=""
                        className="w-4 h-4 rounded shrink-0"
                      />
                    )}
                    <span className="text-xs font-medium text-zinc-200 truncate">
                      {src.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
