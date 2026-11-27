import React from "react";
import {
  X,
  Monitor,
  AppWindow,
  Scan,
  Smartphone,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  ChevronDown,
  Square,
  Check,
  MousePointerClick,
} from "lucide-react";
import { AreaCropBounds, DesktopSource } from "../types";

export const FloatingHudWindow: React.FC = () => {
  const [mode, setMode] = React.useState<
    "display" | "window" | "area" | "device"
  >("display");
  const [cameraEnabled, setCameraEnabled] = React.useState(false);
  const [micEnabled, setMicEnabled] = React.useState(false);
  const [systemAudioEnabled, setSystemAudioEnabled] = React.useState(false);

  const [sources, setSources] = React.useState<DesktopSource[]>([]);
  const [selectedSourceId, setSelectedSourceId] = React.useState<string>("");
  const [areaCrop, setAreaCrop] = React.useState<AreaCropBounds | null>(null);
  const [showWindowMenu, setShowWindowMenu] = React.useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = React.useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = React.useState(false);

  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingSec, setRecordingSec] = React.useState(0);
  const [clickCount, setClickCount] = React.useState(0);

  // Make body transparent for floating HUD window
  React.useEffect(() => {
    document.body.style.background = "transparent";
    document.documentElement.style.background = "transparent";
  }, []);

  const refreshSources = React.useCallback(async () => {
    if (!window.studioAPI?.getSources) return;
    const res = await window.studioAPI.getSources();
    if (Array.isArray(res)) {
      setSources(res);
      const firstScreen = res.find((s) => s.isScreen);
      if (firstScreen && !selectedSourceId) {
        setSelectedSourceId(firstScreen.id);
      }
    }
  }, [selectedSourceId]);

  React.useEffect(() => {
    refreshSources();
  }, [refreshSources]);

  // Listen for Area selection completion
  React.useEffect(() => {
    if (!window.studioAPI?.onAreaSelected) return;
    return window.studioAPI.onAreaSelected((bounds) => {
      if (bounds) {
        setAreaCrop(bounds);
      }
    });
  }, []);

  // Listen for live mouse click count while recording
  React.useEffect(() => {
    if (!window.studioAPI?.onMouseEvent) return;
    return window.studioAPI.onMouseEvent((evt) => {
      if (evt.type === "down") {
        setClickCount((c) => c + 1);
      }
    });
  }, []);

  React.useEffect(() => {
    if (!isRecording) {
      setRecordingSec(0);
      return;
    }
    const id = window.setInterval(() => setRecordingSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  // Sync HUD window height dynamically so when no popup is open, window is 68px tight with zero shadow space below
  React.useEffect(() => {
    const expanded =
      !isRecording && (showWindowMenu || showDeviceMenu || showSettingsMenu);
    window.studioAPI?.setHudExpanded(expanded);
  }, [isRecording, showWindowMenu, showDeviceMenu, showSettingsMenu]);

  const handleSelectMode = async (
    nextMode: "display" | "window" | "area" | "device",
  ) => {
    setMode(nextMode);
    setShowWindowMenu(false);
    setShowDeviceMenu(false);
    setShowSettingsMenu(false);

    if (nextMode === "display") {
      setAreaCrop(null);
      await window.studioAPI?.clearMask();
      const scr = sources.find((s) => s.isScreen);
      if (scr) setSelectedSourceId(scr.id);
    } else if (nextMode === "window") {
      setAreaCrop(null);
      await window.studioAPI?.clearMask();
      await refreshSources();
      setShowWindowMenu(true);
    } else if (nextMode === "area") {
      await window.studioAPI?.openAreaSelector(null);
    } else if (nextMode === "device") {
      setShowDeviceMenu(true);
    }
  };

  const handleStartRecord = async () => {
    setShowWindowMenu(false);
    setShowDeviceMenu(false);
    setShowSettingsMenu(false);
    setClickCount(0);
    setIsRecording(true);

    const screenSrc = sources.find((s) => s.isScreen);
    const sourceId =
      mode === "window" && selectedSourceId
        ? selectedSourceId
        : screenSrc?.id || selectedSourceId;

    await window.studioAPI?.hudStartRecord({
      mode,
      sourceId,
      areaCrop: mode === "area" || mode === "device" ? areaCrop : null,
      cameraEnabled,
      micEnabled,
      systemAudioEnabled,
    });
  };

  const handleStopRecord = async () => {
    setIsRecording(false);
    await window.studioAPI?.clearMask();
    await window.studioAPI?.hudStopRecord();
  };

  const windowSources = sources.filter((s) => !s.isScreen);
  const activeWindowName =
    windowSources.find((w) => w.id === selectedSourceId)?.name || "选择窗口";

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Universal Drag-Anywhere Handler for the Floating HUD Bar
  const dragStateRef = React.useRef<{
    active: boolean;
    moved: boolean;
    lastScreenX: number;
    lastScreenY: number;
  }>({ active: false, moved: false, lastScreenX: 0, lastScreenY: 0 });

  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current.active) return;
      const dx = e.screenX - dragStateRef.current.lastScreenX;
      const dy = e.screenY - dragStateRef.current.lastScreenY;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        dragStateRef.current.moved = true;
        dragStateRef.current.lastScreenX = e.screenX;
        dragStateRef.current.lastScreenY = e.screenY;
        window.studioAPI?.moveHud(dx, dy);
      }
    };

    const onMouseUp = () => {
      dragStateRef.current.active = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleBarMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragStateRef.current = {
      active: true,
      moved: false,
      lastScreenX: e.screenX,
      lastScreenY: e.screenY,
    };
  };

  const handleBarClickCapture = (e: React.MouseEvent) => {
    if (dragStateRef.current.moved) {
      e.stopPropagation();
      e.preventDefault();
      dragStateRef.current.moved = false;
    }
  };

  // Dedicated Sleek Recording-in-Progress Pill (Zero overflow, spacious layout)
  if (isRecording) {
    return (
      <div className="w-screen h-screen flex items-end justify-center select-none bg-transparent overflow-hidden">
        <div
          onMouseDown={handleBarMouseDown}
          onClickCapture={handleBarClickCapture}
          className="h-[68px] w-full px-5 rounded-2xl bg-[#323236]/95 backdrop-blur-2xl border border-rose-500/40 flex items-center justify-between text-zinc-100 cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-semibold text-white">
              正在录制 ({mode.toUpperCase()}
              {areaCrop ? ` · ${areaCrop.pxW}×${areaCrop.pxH}` : ""})
            </span>
            <span className="text-xs font-mono bg-black/40 px-2.5 py-1 rounded-lg text-rose-300 border border-white/10">
              {formatTimer(recordingSec)}
            </span>
            <span className="text-xs text-zinc-300 flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
              <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
              已捕获 {clickCount} 次点击自动缩放
            </span>
          </div>

          <div className="flex items-center gap-2.5 app-no-drag">
            <button
              onClick={handleStopRecord}
              className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 transition"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>完成并停止录制 (Stop)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-end items-center select-none bg-transparent overflow-hidden">
      {/* Popup Menus above the HUD bar */}
      {showWindowMenu && (
        <div className="mb-2 w-[520px] max-h-44 overflow-y-auto bg-[#2b2b2e]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-3 grid grid-cols-3 gap-2.5 app-no-drag">
          {windowSources.length === 0 ? (
            <div className="col-span-3 text-center py-6 text-xs text-zinc-300">
              未检测到独立窗口，请先打开目标应用或使用 Display / Area 模式
            </div>
          ) : (
            windowSources.map((win) => (
              <button
                key={win.id}
                onClick={() => {
                  setSelectedSourceId(win.id);
                  setShowWindowMenu(false);
                }}
                className={`p-2 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                  selectedSourceId === win.id
                    ? "bg-white/15 border-white/50"
                    : "bg-black/25 border-white/10 hover:border-white/30"
                }`}
              >
                <img
                  src={win.thumbnail}
                  alt={win.name}
                  className="w-full h-16 object-cover rounded-lg bg-black"
                />
                <span className="text-[11px] text-zinc-100 truncate font-medium">
                  {win.name}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {showDeviceMenu && (
        <div className="mb-2 w-80 bg-[#2b2b2e]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 flex flex-col gap-1 app-no-drag">
          <div className="text-[11px] text-zinc-400 px-2.5 py-1 font-medium">
            选择移动设备画幅框选录制 (Device Frame Area)
          </div>
          {[
            { label: "iPhone 16 Pro (9:16 竖屏)", w: 430, h: 764 },
            { label: "iPad Air (4:3 平板)", w: 820, h: 615 },
            { label: "社交媒体方形 (1:1)", w: 680, h: 680 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={async () => {
                setShowDeviceMenu(false);
                await window.studioAPI?.openAreaSelector({
                  w: preset.w,
                  h: preset.h,
                });
              }}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-zinc-100 transition"
            >
              <span>{preset.label}</span>
              <span className="text-[11px] font-mono text-zinc-400">
                {preset.w}×{preset.h}
              </span>
            </button>
          ))}
        </div>
      )}

      {showSettingsMenu && (
        <div className="mb-2 w-72 bg-[#2b2b2e]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-3 text-xs text-zinc-200 space-y-2 app-no-drag">
          <div className="flex items-center justify-between py-1">
            <span>原生 Swift 鼠标点击自动缩放</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5" /> 已启用
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-t border-white/10">
            <span>最高帧率目标</span>
            <span className="font-mono text-zinc-300">60 FPS</span>
          </div>
          <button
            onClick={() => window.studioAPI?.closeHud(true)}
            className="w-full mt-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-center text-zinc-100 font-medium transition"
          >
            返回主编辑器窗口
          </button>
        </div>
      )}

      {/* Main Screen Studio Idle Floating Pill Toolbar (860px exact fit, zero overflow, drag anywhere!) */}
      <div
        onMouseDown={handleBarMouseDown}
        onClickCapture={handleBarClickCapture}
        className="h-[68px] w-full px-3.5 rounded-2xl bg-[#48484b]/95 backdrop-blur-2xl border border-white/15 flex items-center justify-between text-zinc-100 whitespace-nowrap cursor-grab active:cursor-grabbing"
      >
        {/* Left Close Circle Button */}
        <button
          onClick={() => window.studioAPI?.closeHud(true)}
          title="关闭悬浮录制条并返回编辑器"
          className="w-7 h-7 rounded-full bg-white hover:bg-zinc-200 text-[#333] flex items-center justify-center transition app-no-drag shrink-0"
        >
          <X className="w-4 h-4 stroke-[2.8]" />
        </button>

        <div className="h-8 w-px bg-white/15 shrink-0" />

        {/* 4 Capture Modes: Display | Window | Area | Device */}
        <div className="flex items-center gap-1 app-no-drag shrink-0">
          <button
            onClick={() => handleSelectMode("display")}
            className={`w-14 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition ${
              mode === "display"
                ? "bg-white/18 text-white"
                : "text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Monitor className="w-4 h-4 stroke-[2]" />
            <span className="text-[11px] font-medium leading-none">
              Display
            </span>
          </button>

          <button
            onClick={() => handleSelectMode("window")}
            title={
              mode === "window" ? activeWindowName : "选择单个应用窗口录制"
            }
            className={`w-14 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition ${
              mode === "window"
                ? "bg-white/18 text-white"
                : "text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <AppWindow className="w-4 h-4 stroke-[2]" />
            <span className="text-[11px] font-medium leading-none">Window</span>
          </button>

          <button
            onClick={() => handleSelectMode("area")}
            title={
              areaCrop
                ? `已框选区域: ${areaCrop.pxW}×${areaCrop.pxH}`
                : "在桌面上拖拽框选自定义区域录制"
            }
            className={`w-14 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition ${
              mode === "area"
                ? "bg-white/18 text-white"
                : "text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Scan className="w-4 h-4 stroke-[2]" />
            <span className="text-[11px] font-medium leading-none">Area</span>
          </button>

          <button
            onClick={() => handleSelectMode("device")}
            className={`w-14 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition ${
              mode === "device"
                ? "bg-white/18 text-white"
                : "text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Smartphone className="w-4 h-4 stroke-[2]" />
            <span className="text-[11px] font-medium leading-none">Device</span>
          </button>
        </div>

        <div className="h-8 w-px bg-white/15 shrink-0" />

        {/* Device Input Toggles: Camera | Microphone | System Audio */}
        <div className="flex items-center gap-1 app-no-drag shrink-0">
          <button
            onClick={() => setCameraEnabled((v) => !v)}
            className={`px-2.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-medium transition ${
              cameraEnabled
                ? "bg-white/18 text-white"
                : "text-zinc-300 hover:bg-white/10 hover:text-zinc-100"
            }`}
          >
            {cameraEnabled ? (
              <Video className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <VideoOff className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
            <span>{cameraEnabled ? "Camera On" : "No camera"}</span>
          </button>

          <button
            onClick={() => setMicEnabled((v) => !v)}
            className={`px-2.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-medium transition ${
              micEnabled
                ? "bg-white/18 text-white"
                : "text-zinc-300 hover:bg-white/10 hover:text-zinc-100"
            }`}
          >
            {micEnabled ? (
              <Mic className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <MicOff className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
            <span>{micEnabled ? "Mic On" : "No microphone"}</span>
          </button>

          <button
            onClick={() => setSystemAudioEnabled((v) => !v)}
            className={`px-2.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-medium transition ${
              systemAudioEnabled
                ? "bg-white/18 text-white"
                : "text-zinc-300 hover:bg-white/10 hover:text-zinc-100"
            }`}
          >
            {systemAudioEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
            <span>{systemAudioEnabled ? "Audio On" : "No system audio"}</span>
          </button>
        </div>

        <div className="h-8 w-px bg-white/15 shrink-0" />

        {/* Right Gear Dropdown & Red Record Button */}
        <div className="flex items-center gap-1.5 app-no-drag shrink-0">
          <button
            onClick={() => setShowSettingsMenu((s) => !s)}
            className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 flex items-center gap-0.5 transition shrink-0"
            title="录制设置"
          >
            <Settings className="w-4 h-4 shrink-0" />
            <ChevronDown className="w-3 h-3 shrink-0" />
          </button>

          <button
            onClick={handleStartRecord}
            className="h-9 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0" />
            <span>Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};
