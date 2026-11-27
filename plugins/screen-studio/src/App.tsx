import React from "react";
import {
  Video,
  Square,
  Upload,
  Download,
  Sparkles,
  Crosshair,
  Activity,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  AreaCropBounds,
  DesktopSource,
  HudRecordPayload,
  MousePoint,
  StudioConfig,
  VideoClipSegment,
  ZoomSegment,
} from "./types";
import { createDemoProjectData } from "./utils/demoGenerator";
import {
  generateAutoZoomSegments,
  getCursorAtTime,
  SPRING_CONFIGS,
  stepSpring,
} from "./utils/springPhysics";
import {
  CameraSpringState,
  createInitialSpringState,
  FrameLayoutMetrics,
  getCanvasResolution,
  renderStudioFrame,
} from "./utils/canvasRenderer";
import { Timeline } from "./components/Timeline";
import { InspectorPanel } from "./components/InspectorPanel";
import { SourcePickerModal } from "./components/SourcePickerModal";
import { FloatingHudWindow } from "./components/FloatingHudWindow";
import { AreaSelectorOverlay } from "./components/AreaSelectorOverlay";
import { RecordingDimMask } from "./components/RecordingDimMask";

const DEFAULT_CONFIG: StudioConfig = {
  wallpaperId: "sequoia-twilight",
  customColor: "#1e1b4b",
  padding: 68,
  borderRadius: 20,
  shadowIntensity: 78,
  insetBorder: true,
  macosHeader: true,
  aspectRatio: "16:9",
  springPreset: "smooth",
  playbackSpeed: 1,
  cursorScale: 1.4,
  showClickRipple: true,
  smoothCursorMove: true,
  motionBlur: true,
  webcamEnabled: false,
  webcamCorner: "bottom-right",
  webcamShape: "circle",
  webcamSize: 210,
  webcamShrinkOnZoom: true,
};

export default function App() {
  const [routeHash, setRouteHash] = React.useState<string>(
    () => window.location.hash || "#studio",
  );

  React.useEffect(() => {
    const onHash = () => setRouteHash(window.location.hash || "#studio");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (routeHash.startsWith("#hud")) {
    return <FloatingHudWindow />;
  }
  if (routeHash.startsWith("#area")) {
    return <AreaSelectorOverlay />;
  }
  if (routeHash.startsWith("#mask")) {
    return <RecordingDimMask />;
  }

  return <MainStudioWorkspace />;
}

function MainStudioWorkspace() {
  const initialDemo = React.useMemo(() => createDemoProjectData(), []);

  // Project state
  const [config, setConfig] = React.useState<StudioConfig>(DEFAULT_CONFIG);
  const [isDemoMode, setIsDemoMode] = React.useState<boolean>(true);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [areaCrop, setAreaCrop] = React.useState<AreaCropBounds | null>(null);
  const areaCropRef = React.useRef<AreaCropBounds | null>(null);
  areaCropRef.current = areaCrop;
  const [duration, setDuration] = React.useState<number>(initialDemo.duration);
  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [trimStart, setTrimStart] = React.useState<number>(0);
  const [trimEnd, setTrimEnd] = React.useState<number>(initialDemo.duration);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(true);

  // Split Video Clip Segments state (supports frame-accurate splitting & per-segment speed)
  const [clipSegments, setClipSegments] = React.useState<VideoClipSegment[]>(
    () => [
      {
        id: "clip-initial",
        startTime: 0,
        endTime: initialDemo.duration,
        speed: 1,
      },
    ],
  );
  const [selectedClipId, setSelectedClipId] = React.useState<string | null>(
    null,
  );

  // Zoom & Mouse Tracking state
  const [mouseEvents, setMouseEvents] = React.useState<MousePoint[]>(
    initialDemo.mouseEvents,
  );
  const [zoomSegments, setZoomSegments] = React.useState<ZoomSegment[]>(
    initialDemo.zoomSegments,
  );
  const [selectedSegmentId, setSelectedSegmentId] = React.useState<
    string | null
  >(initialDemo.zoomSegments[0]?.id || null);

  // Recording & Source Picker state
  const [pickerOpen, setPickerOpen] = React.useState<boolean>(false);
  const [sources, setSources] = React.useState<DesktopSource[]>([]);
  const [loadingSources, setLoadingSources] = React.useState<boolean>(false);
  const [sourceError, setSourceError] = React.useState<string | null>(null);
  const [micEnabled, setMicEnabled] = React.useState<boolean>(false);
  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const [recordingSec, setRecordingSec] = React.useState<number>(0);
  const [liveClickCount, setLiveClickCount] = React.useState<number>(0);

  // Export state
  const [isExporting, setIsExporting] = React.useState<boolean>(false);
  const [exportProgress, setExportProgress] = React.useState<number>(0);
  const [statusBanner, setStatusBanner] = React.useState<string | null>(
    "已加载交互演示工程 — 可直接播放体验弹簧缩放，或点击左上角「新录制」捕获真实屏幕与全局鼠标点击",
  );

  // Refs for Canvas & Media Elements
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const webcamRef = React.useRef<HTMLVideoElement | null>(null);
  const webcamStreamRef = React.useRef<MediaStream | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const recordedChunksRef = React.useRef<Blob[]>([]);
  const fallbackEventsRef = React.useRef<MousePoint[]>([]);
  const recordStartPerfRef = React.useRef<number>(0);

  const springRef = React.useRef<CameraSpringState>(createInitialSpringState());
  const lastLayoutRef = React.useRef<FrameLayoutMetrics | null>(null);
  const currentTimeRef = React.useRef<number>(0);
  currentTimeRef.current = currentTime;

  const updateConfig = React.useCallback((patch: Partial<StudioConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  // Toggle Webcam stream
  const handleToggleWebcamDevice = React.useCallback(async () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current = null;
      if (webcamRef.current) webcamRef.current.srcObject = null;
      updateConfig({ webcamEnabled: false });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
      webcamStreamRef.current = stream;
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        await webcamRef.current.play();
      }
      updateConfig({ webcamEnabled: true });
    } catch (err: any) {
      setStatusBanner(`摄像头开启失败: ${err?.message || "请检查权限"}`);
    }
  }, [updateConfig]);

  // Subscribe to live native mouse events during recording
  React.useEffect(() => {
    if (!window.studioAPI?.onMouseEvent) return;
    const unsub = window.studioAPI.onMouseEvent((evt) => {
      if (evt.type === "down") {
        setLiveClickCount((c) => c + 1);
      }
    });
    return unsub;
  }, []);

  // Recording timer
  React.useEffect(() => {
    if (!isRecording) {
      setRecordingSec(0);
      return;
    }
    const timer = window.setInterval(() => {
      setRecordingSec((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  // Split video clip at current playhead position
  const handleSplitClipAtPlayhead = React.useCallback(() => {
    const t = Number(currentTimeRef.current.toFixed(2));
    const targetClip = clipSegments.find(
      (c) => t > c.startTime + 0.25 && t < c.endTime - 0.25,
    );
    if (!targetClip) {
      setStatusBanner(
        "请先将红色播放指针移动到片段中间位置（距离边缘大于 0.25 秒）再执行切分",
      );
      return;
    }

    const firstHalf: VideoClipSegment = {
      ...targetClip,
      endTime: t,
    };
    const secondHalf: VideoClipSegment = {
      id: `clip-${Date.now()}`,
      startTime: t,
      endTime: targetClip.endTime,
      speed: targetClip.speed,
      deleted: targetClip.deleted,
    };

    setClipSegments((prev) =>
      prev
        .flatMap((c) =>
          c.id === targetClip.id ? [firstHalf, secondHalf] : [c],
        )
        .sort((a, b) => a.startTime - b.startTime),
    );
    setSelectedSegmentId(null);
    setSelectedClipId(secondHalf.id);
    setStatusBanner(
      `已在 ${t.toFixed(2)}s 处切分视频！现在可在下方工具栏为切出的片段单独设置 0.5x~4x 倍速或跳过该段`,
    );
  }, [clipSegments]);

  const handleUpdateClip = React.useCallback(
    (id: string, patch: Partial<VideoClipSegment>) => {
      setClipSegments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      );
    },
    [],
  );

  const handleDeleteOrRestoreClip = React.useCallback((id: string) => {
    setClipSegments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, deleted: !c.deleted } : c)),
    );
  }, []);

  const handleResetClips = React.useCallback(() => {
    setClipSegments([
      {
        id: `clip-reset-${Date.now()}`,
        startTime: 0,
        endTime: duration,
        speed: 1,
      },
    ]);
    setSelectedClipId(null);
    setStatusBanner("已合并还原所有切分片段");
  }, [duration]);

  // Keyboard shortcuts (Space to play/pause, S to Split clip at playhead, Delete to remove zoom block)
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName))
        return;
      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === "KeyS" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleSplitClipAtPlayhead();
      } else if (
        (e.code === "Backspace" || e.code === "Delete") &&
        selectedSegmentId
      ) {
        setZoomSegments((segs) =>
          segs.filter((s) => s.id !== selectedSegmentId),
        );
        setSelectedSegmentId(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedSegmentId, handleSplitClipAtPlayhead]);

  // Main 60fps Animation & Spring Physics Render Loop
  React.useEffect(() => {
    let rafId = 0;
    let lastPerf = performance.now();

    const tick = (now: number) => {
      const rawDt = Math.min(0.05, (now - lastPerf) / 1000);
      lastPerf = now;

      let nextTime = currentTimeRef.current;

      if (isPlaying && !isRecording && !isExporting) {
        // Find active split clip segment at current time to apply per-segment speed or skip deleted cuts
        const currentClip = clipSegments.find(
          (c) => nextTime >= c.startTime && nextTime < c.endTime,
        );

        if (currentClip && currentClip.deleted) {
          // Automatically skip over deleted/cut clip segments!
          const nextValidClip = clipSegments.find(
            (c) => c.startTime >= currentClip.endTime && !c.deleted,
          );
          nextTime = nextValidClip ? nextValidClip.startTime : trimStart;
          if (!isDemoMode && videoRef.current) {
            videoRef.current.currentTime = nextTime;
          }
        } else {
          const clipSpeed =
            (currentClip ? currentClip.speed : 1) * config.playbackSpeed;
          const clampedRate = Math.max(0.25, Math.min(8, clipSpeed));

          if (!isDemoMode && videoRef.current) {
            videoRef.current.playbackRate = clampedRate;
            nextTime = videoRef.current.currentTime;
            if (nextTime >= trimEnd || videoRef.current.ended) {
              videoRef.current.currentTime = trimStart;
              nextTime = trimStart;
              videoRef.current.play().catch(() => {});
            }
          } else {
            nextTime += rawDt * clampedRate;
            if (nextTime >= trimEnd) {
              nextTime = trimStart;
            }
          }
        }
        currentTimeRef.current = nextTime;
        setCurrentTime(nextTime);
      }

      // Determine active zoom segment at `nextTime`
      const activeSeg =
        zoomSegments.find(
          (s) => nextTime >= s.startTime && nextTime <= s.endTime,
        ) || null;

      const cursorNow = getCursorAtTime(mouseEvents, nextTime);
      const targetScale = activeSeg ? activeSeg.scale : 1.0;
      const targetFocusX = activeSeg
        ? activeSeg.mode === "follow-cursor"
          ? cursorNow.x
          : activeSeg.targetX
        : 0.5;
      const targetFocusY = activeSeg
        ? activeSeg.mode === "follow-cursor"
          ? cursorNow.y
          : activeSeg.targetY
        : 0.5;

      const { stiffness, damping } = SPRING_CONFIGS[config.springPreset];
      const sp = springRef.current;

      const sScale = stepSpring(
        sp.scale,
        sp.scaleVel,
        targetScale,
        stiffness,
        damping,
        rawDt,
      );
      const sFx = stepSpring(
        sp.focusX,
        sp.focusXVel,
        targetFocusX,
        stiffness,
        damping,
        rawDt,
      );
      const sFy = stepSpring(
        sp.focusY,
        sp.focusYVel,
        targetFocusY,
        stiffness,
        damping,
        rawDt,
      );

      // Cursor spring smoothing (snappier so cursor feels responsive yet butter-smooth)
      const sCx = stepSpring(
        sp.cursorX,
        sp.cursorXVel,
        cursorNow.x,
        380,
        34,
        rawDt,
      );
      const sCy = stepSpring(
        sp.cursorY,
        sp.cursorYVel,
        cursorNow.y,
        380,
        34,
        rawDt,
      );

      // Webcam PiP shrinks slightly when camera zooms in
      const targetWebcamScale =
        activeSeg && config.webcamShrinkOnZoom ? 0.76 : 1.0;
      const sWeb = stepSpring(
        sp.webcamScale,
        sp.webcamScaleVel,
        targetWebcamScale,
        stiffness,
        damping,
        rawDt,
      );

      springRef.current = {
        scale: sScale.value,
        scaleVel: sScale.velocity,
        focusX: sFx.value,
        focusXVel: sFx.velocity,
        focusY: sFy.value,
        focusYVel: sFy.velocity,
        cursorX: sCx.value,
        cursorXVel: sCx.velocity,
        cursorY: sCy.value,
        cursorYVel: sCy.velocity,
        webcamScale: sWeb.value,
        webcamScaleVel: sWeb.velocity,
      };

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const vEl = videoRef.current;
          const res = getCanvasResolution(
            config.aspectRatio,
            vEl?.videoWidth || 1920,
            vEl?.videoHeight || 1080,
          );
          if (canvas.width !== res.width || canvas.height !== res.height) {
            canvas.width = res.width;
            canvas.height = res.height;
          }

          lastLayoutRef.current = renderStudioFrame({
            ctx,
            canvasW: canvas.width,
            canvasH: canvas.height,
            videoEl: vEl,
            webcamEl: webcamRef.current,
            isDemoMode,
            timeSec: nextTime,
            config,
            springState: springRef.current,
            mouseEvents,
            activeSegment: activeSeg,
            areaCrop,
          });
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [
    isPlaying,
    isRecording,
    isExporting,
    isDemoMode,
    trimStart,
    trimEnd,
    config,
    clipSegments,
    zoomSegments,
    mouseEvents,
    areaCrop,
  ]);

  // Seek handler
  const handleSeek = React.useCallback(
    (timeSec: number) => {
      const clamped = Math.max(0, Math.min(duration, timeSec));
      currentTimeRef.current = clamped;
      setCurrentTime(clamped);
      if (!isDemoMode && videoRef.current) {
        videoRef.current.currentTime = clamped;
      }
    },
    [duration, isDemoMode],
  );

  // Toggle Play/Pause
  const handleTogglePlay = React.useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (!isDemoMode && videoRef.current) {
        if (next) videoRef.current.play().catch(() => {});
        else videoRef.current.pause();
      }
      return next;
    });
  }, [isDemoMode]);

  // Open Floating Desktop Recorder HUD (or fallback to in-window modal / workbench recorder)
  const handleOpenRecorderModal = React.useCallback(async () => {
    if (window.studioAPI?.openHud) {
      await window.studioAPI.openHud(true);
      return;
    }

    setPickerOpen(true);
    setLoadingSources(true);
    setSourceError(null);

    if (window.studioAPI?.getSources) {
      const res = await window.studioAPI.getSources();
      setLoadingSources(false);
      if (Array.isArray(res)) {
        setSources(res);
      } else {
        setSources([]);
        setSourceError(res.error);
      }
    } else {
      setLoadingSources(false);
      setSources([]);
    }
  }, []);

  // Start Recording with a specific Electron desktopCapturer source or system fallback
  const startStreamRecording = React.useCallback(
    async (stream: MediaStream, cropBounds?: AreaCropBounds | null) => {
      setPickerOpen(false);
      setIsPlaying(false);
      setLiveClickCount(0);
      setAreaCrop(cropBounds || null);
      areaCropRef.current = cropBounds || null;
      recordedChunksRef.current = [];
      fallbackEventsRef.current = [];
      recordStartPerfRef.current = performance.now();

      // Start Native macOS Global Mouse & Click Tracker (Electron IPC or Penguin Workbench Backend)
      if (window.studioAPI?.startMouseTracker) {
        await window.studioAPI.startMouseTracker();
      } else {
        fetch("../api/tracker/start", { method: "POST" }).catch(() => {});
      }

      // Also attach window listener as supplemental fallback
      const onWindowPointer = (e: MouseEvent) => {
        fallbackEventsRef.current.push({
          t: performance.now() - recordStartPerfRef.current,
          x: Math.max(
            0,
            Math.min(1, e.clientX / Math.max(1, window.innerWidth)),
          ),
          y: Math.max(
            0,
            Math.min(1, e.clientY / Math.max(1, window.innerHeight)),
          ),
          type:
            e.type === "mousedown"
              ? "down"
              : e.type === "mouseup"
                ? "up"
                : "move",
          button: e.button,
        });
      };
      window.addEventListener("mousemove", onWindowPointer);
      window.addEventListener("mousedown", onWindowPointer);

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 12_000_000,
      });

      recorder.ondataavailable = (evt) => {
        if (evt.data && evt.data.size > 0) {
          recordedChunksRef.current.push(evt.data);
        }
      };

      recorder.onstop = async () => {
        window.removeEventListener("mousemove", onWindowPointer);
        window.removeEventListener("mousedown", onWindowPointer);
        stream.getTracks().forEach((t) => t.stop());

        if (window.studioAPI?.clearMask) {
          await window.studioAPI.clearMask();
        }

        const totalSec = Math.max(
          1.5,
          (performance.now() - recordStartPerfRef.current) / 1000,
        );
        let capturedEvents: MousePoint[] = fallbackEventsRef.current;

        if (window.studioAPI?.stopMouseTracker) {
          const trackerRes = await window.studioAPI.stopMouseTracker();
          if (
            trackerRes.ok &&
            trackerRes.events &&
            trackerRes.events.length > 0
          ) {
            capturedEvents = trackerRes.events;
          }
        } else {
          try {
            const resp = await fetch("../api/tracker/stop", { method: "POST" });
            if (resp.ok) {
              const trackerRes = await resp.json();
              if (
                trackerRes.ok &&
                trackerRes.events &&
                trackerRes.events.length > 0
              ) {
                capturedEvents = trackerRes.events;
              }
            }
          } catch {
            // ignore
          }
        }

        // If user recorded an Area or Device crop, remap normalized screen mouse coordinates
        // into the cropped area's [0..1] coordinate space so Auto-Zoom & cursor match 100%!
        const activeCrop = areaCropRef.current;
        if (activeCrop && activeCrop.w > 0.05 && activeCrop.h > 0.05) {
          capturedEvents = capturedEvents.map((ev) => ({
            ...ev,
            x: Math.max(0, Math.min(1, (ev.x - activeCrop.x) / activeCrop.w)),
            y: Math.max(0, Math.min(1, (ev.y - activeCrop.y) / activeCrop.h)),
          }));
        }

        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);

        if (videoUrl) URL.revokeObjectURL(videoUrl);
        setVideoUrl(url);
        setIsDemoMode(false);
        setIsRecording(false);
        const dSec = Number(totalSec.toFixed(2));
        setDuration(dSec);
        setTrimStart(0);
        setTrimEnd(dSec);
        setCurrentTime(0);
        setClipSegments([
          {
            id: `clip-${Date.now()}`,
            startTime: 0,
            endTime: dSec,
            speed: 1,
          },
        ]);
        setSelectedClipId(null);
        setMouseEvents(capturedEvents);

        const autoSegs = generateAutoZoomSegments(capturedEvents, totalSec);
        setZoomSegments(autoSegs);
        setSelectedSegmentId(autoSegs[0]?.id || null);

        const clickTotal = capturedEvents.filter(
          (e) => e.type === "down",
        ).length;
        const cropLabel = activeCrop
          ? ` · 区域裁剪 ${activeCrop.pxW}×${activeCrop.pxH}`
          : "";
        setStatusBanner(
          `录制完成 (${totalSec.toFixed(1)}s${cropLabel}) — 原生追踪到 ${clickTotal} 次鼠标点击，已自动生成 ${autoSegs.length} 个丝滑缩放镜头`,
        );

        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.src = url;
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
          }
        }, 120);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(200);
      setIsRecording(true);
      setStatusBanner(
        "正在录制屏幕与全局鼠标轨迹... 在任意软件中点击鼠标都会自动生成缩放关键帧",
      );
    },
    [videoUrl],
  );

  const handleSelectSourceAndRecord = React.useCallback(
    async (source: DesktopSource) => {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: "desktop",
              chromeMediaSourceId: source.id,
              maxWidth: 3840,
              maxHeight: 2160,
              maxFrameRate: 60,
            },
          } as any,
        });

        if (micEnabled) {
          try {
            const audioStream = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: false,
            });
            audioStream
              .getAudioTracks()
              .forEach((t) => videoStream.addTrack(t));
          } catch {
            // continue without mic if denied
          }
        }

        await startStreamRecording(videoStream);
      } catch (err: any) {
        setSourceError(
          err?.message || "无法启动指定源录制，请尝试调用系统屏幕选择器",
        );
      }
    },
    [micEnabled, startStreamRecording],
  );

  const handleBrowserFallbackRecord = React.useCallback(async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 60 },
        audio: micEnabled,
      });
      await startStreamRecording(displayStream);
    } catch (err: any) {
      setSourceError(err?.message || "已取消屏幕录制选择");
    }
  }, [micEnabled, startStreamRecording]);

  const handleStopRecording = React.useCallback(() => {
    window.studioAPI?.clearMask?.();
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Listen for Start / Stop Recording commands sent from the standalone Floating HUD Window
  React.useEffect(() => {
    if (!window.studioAPI?.onCommandStartRecord) return;
    const unsubStart = window.studioAPI.onCommandStartRecord(
      async (payload: HudRecordPayload) => {
        try {
          setMicEnabled(payload.micEnabled);
          if (payload.cameraEnabled && !webcamStreamRef.current) {
            await handleToggleWebcamDevice();
          } else if (!payload.cameraEnabled && webcamStreamRef.current) {
            await handleToggleWebcamDevice();
          }

          // Resolve sourceId if not provided
          let targetSourceId = payload.sourceId;
          if (!targetSourceId && window.studioAPI?.getSources) {
            const list = await window.studioAPI.getSources();
            if (Array.isArray(list) && list.length > 0) {
              const firstScreen = list.find((s) => s.isScreen) || list[0];
              targetSourceId = firstScreen.id;
            }
          }

          if (targetSourceId) {
            const videoStream = await navigator.mediaDevices.getUserMedia({
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: "desktop",
                  chromeMediaSourceId: targetSourceId,
                  maxWidth: 3840,
                  maxHeight: 2160,
                  maxFrameRate: 60,
                },
              } as any,
            });

            if (payload.micEnabled) {
              try {
                const audioStream = await navigator.mediaDevices.getUserMedia({
                  audio: true,
                  video: false,
                });
                audioStream
                  .getAudioTracks()
                  .forEach((t) => videoStream.addTrack(t));
              } catch {
                // ignore mic permission error
              }
            }

            await startStreamRecording(videoStream, payload.areaCrop || null);
          } else {
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
              video: { frameRate: 60 },
              audio: payload.micEnabled,
            });
            await startStreamRecording(displayStream, payload.areaCrop || null);
          }
        } catch (err: any) {
          setStatusBanner(
            `从悬浮工具栏启动录制失败: ${err?.message || "请检查录制权限"}`,
          );
        }
      },
    );

    const unsubStop = window.studioAPI?.onCommandStopRecord
      ? window.studioAPI.onCommandStopRecord(() => {
          handleStopRecording();
        })
      : () => {};

    return () => {
      unsubStart();
      unsubStop();
    };
  }, [handleStopRecording, handleToggleWebcamDevice, startStreamRecording]);

  // Import existing video file
  const handleImportVideoFile = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      if (videoUrl) URL.revokeObjectURL(videoUrl);

      setVideoUrl(url);
      setIsDemoMode(false);
      setMouseEvents([]);
      setZoomSegments([]);
      setSelectedSegmentId(null);

      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.onloadedmetadata = () => {
          const d = Number(
            Math.max(1, videoRef.current?.duration || 10).toFixed(2),
          );
          setDuration(d);
          setTrimStart(0);
          setTrimEnd(d);
          setCurrentTime(0);
          setClipSegments([
            {
              id: `clip-${Date.now()}`,
              startTime: 0,
              endTime: d,
              speed: 1,
            },
          ]);
          setSelectedClipId(null);
          const defaultSeg: ZoomSegment = {
            id: `zoom-${Date.now()}`,
            startTime: Number((d * 0.2).toFixed(2)),
            endTime: Number(Math.min(d, d * 0.55).toFixed(2)),
            scale: 1.9,
            targetX: 0.5,
            targetY: 0.5,
            mode: "manual",
          };
          setZoomSegments([defaultSeg]);
          setSelectedSegmentId(defaultSeg.id);
          videoRef.current?.play().catch(() => {});
          setIsPlaying(true);
          setStatusBanner(
            `已导入视频「${file.name}」— 点击画面任意位置可设置缩放焦点，或在下方时间轴添加缩放块`,
          );
        };
      }
    },
    [videoUrl],
  );

  // Clicking on the preview canvas sets or creates a manual focus point at current time
  const handleCanvasClick = React.useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const layout = lastLayoutRef.current;
      if (!canvas || !layout) return;

      const rect = canvas.getBoundingClientRect();
      const clickCanvasX =
        ((e.clientX - rect.left) / Math.max(1, rect.width)) * canvas.width;
      const clickCanvasY =
        ((e.clientY - rect.top) / Math.max(1, rect.height)) * canvas.height;

      const normX = Math.max(
        0.05,
        Math.min(
          0.95,
          (clickCanvasX - layout.frameX) / Math.max(1, layout.frameW),
        ),
      );
      const normY = Math.max(
        0.05,
        Math.min(
          0.95,
          (clickCanvasY - layout.frameY) / Math.max(1, layout.frameH),
        ),
      );

      // Check if playhead is currently inside a segment or if a segment is selected
      const activeOrSelected =
        zoomSegments.find(
          (s) => currentTime >= s.startTime && currentTime <= s.endTime,
        ) || zoomSegments.find((s) => s.id === selectedSegmentId);

      if (activeOrSelected) {
        setZoomSegments((segs) =>
          segs.map((s) =>
            s.id === activeOrSelected.id
              ? {
                  ...s,
                  mode: "manual",
                  targetX: Number(normX.toFixed(3)),
                  targetY: Number(normY.toFixed(3)),
                }
              : s,
          ),
        );
        setSelectedSegmentId(activeOrSelected.id);
        setStatusBanner(
          `已将缩放焦点更新至 (${Math.round(normX * 100)}%, ${Math.round(normY * 100)}%)`,
        );
      } else {
        // Create a new zoom segment around currentTime focused on clicked spot
        const start = Math.max(0, Number((currentTime - 0.2).toFixed(2)));
        const end = Math.min(duration, Number((start + 2.2).toFixed(2)));
        const newSeg: ZoomSegment = {
          id: `zoom-${Date.now()}`,
          startTime: start,
          endTime: Math.max(start + 0.6, end),
          scale: 2.0,
          targetX: Number(normX.toFixed(3)),
          targetY: Number(normY.toFixed(3)),
          mode: "manual",
        };
        setZoomSegments((prev) =>
          [...prev, newSeg].sort((a, b) => a.startTime - b.startTime),
        );
        setSelectedSegmentId(newSeg.id);
        setStatusBanner(
          `已在 ${start.toFixed(1)}s 处新建缩放块，焦点位于 (${Math.round(normX * 100)}%, ${Math.round(normY * 100)}%)`,
        );
      }
    },
    [currentTime, duration, selectedSegmentId, zoomSegments],
  );

  // Timeline segment CRUD
  const handleAddSegmentAtPlayhead = React.useCallback(() => {
    const start = Math.max(0, Number(currentTime.toFixed(2)));
    const end = Math.min(duration, Number((start + 2.0).toFixed(2)));
    const cursor = getCursorAtTime(mouseEvents, currentTime);
    const newSeg: ZoomSegment = {
      id: `zoom-${Date.now()}`,
      startTime: start,
      endTime: Math.max(start + 0.6, end),
      scale: 2.0,
      targetX: Number(cursor.x.toFixed(3)),
      targetY: Number(cursor.y.toFixed(3)),
      mode: mouseEvents.length > 0 ? "follow-cursor" : "manual",
    };
    setZoomSegments((prev) =>
      [...prev, newSeg].sort((a, b) => a.startTime - b.startTime),
    );
    setSelectedSegmentId(newSeg.id);
  }, [currentTime, duration, mouseEvents]);

  const handleUpdateSegment = React.useCallback(
    (id: string, patch: Partial<ZoomSegment>) => {
      setZoomSegments((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      );
    },
    [],
  );

  const handleDeleteSegment = React.useCallback(
    (id: string) => {
      setZoomSegments((prev) => prev.filter((s) => s.id !== id));
      if (selectedSegmentId === id) setSelectedSegmentId(null);
    },
    [selectedSegmentId],
  );

  const handleRegenerateAutoZoom = React.useCallback(() => {
    if (mouseEvents.length === 0) {
      setStatusBanner(
        "当前视频无系统鼠标轨迹数据，可点击预览画面直接手动添加缩放焦点",
      );
      return;
    }
    const segs = generateAutoZoomSegments(mouseEvents, duration);
    setZoomSegments(segs);
    setSelectedSegmentId(segs[0]?.id || null);
    setStatusBanner(`已根据鼠标点击事件重新生成 ${segs.length} 个自动缩放区间`);
  }, [mouseEvents, duration]);

  // Load built-in Demo Project
  const handleResetDemoProject = React.useCallback(() => {
    const demo = createDemoProjectData();
    setIsDemoMode(true);
    setDuration(demo.duration);
    setTrimStart(0);
    setTrimEnd(demo.duration);
    setCurrentTime(0);
    setClipSegments([
      {
        id: "clip-demo",
        startTime: 0,
        endTime: demo.duration,
        speed: 1,
      },
    ]);
    setSelectedClipId(null);
    setMouseEvents(demo.mouseEvents);
    setZoomSegments(demo.zoomSegments);
    setSelectedSegmentId(demo.zoomSegments[0]?.id || null);
    setIsPlaying(true);
    setStatusBanner("已恢复内置交互演示工程");
  }, []);

  // High-definition Composited Video Export
  const handleExportVideo = React.useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || isExporting) return;

    setIsExporting(true);
    setExportProgress(0);
    setIsPlaying(false);

    const stream = canvas.captureStream(60);
    const preferMp4 = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1");
    const mimeType = preferMp4
      ? "video/mp4;codecs=avc1"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
    const ext = preferMp4 ? "mp4" : "webm";

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 16_000_000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const exportSpan = Math.max(0.5, trimEnd - trimStart);
    handleSeek(trimStart);
    springRef.current = createInitialSpringState();

    await new Promise((r) => setTimeout(r, 120));
    recorder.start(100);
    setIsPlaying(true);
    if (!isDemoMode && videoRef.current) {
      videoRef.current.currentTime = trimStart;
      videoRef.current.play().catch(() => {});
    }

    const startWall = performance.now();
    const expectedMs = (exportSpan / config.playbackSpeed) * 1000;

    const checkInterval = window.setInterval(async () => {
      const elapsed = performance.now() - startWall;
      const pct = Math.min(99, Math.round((elapsed / expectedMs) * 100));
      setExportProgress(pct);

      if (elapsed >= expectedMs) {
        clearInterval(checkInterval);
        recorder.stop();
      }
    }, 80);

    recorder.onstop = async () => {
      setIsExporting(false);
      setExportProgress(100);
      const blob = new Blob(chunks, { type: mimeType });

      if (window.studioAPI?.saveVideo) {
        const ab = await blob.arrayBuffer();
        const res = await window.studioAPI.saveVideo(ab, ext);
        if (!res.canceled && res.filePath) {
          setStatusBanner(`视频已成功导出至: ${res.filePath}`);
        } else {
          setStatusBanner("已取消导出保存");
        }
      } else {
        try {
          const ab = await blob.arrayBuffer();
          const resp = await fetch(`../api/export?ext=${ext}`, {
            method: "POST",
            headers: { "Content-Type": "application/octet-stream" },
            body: ab,
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data.downloadUrl) {
              const a = document.createElement("a");
              a.href = data.downloadUrl;
              a.download = data.fileName || `ScreenStudio-Export.${ext}`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              setStatusBanner(`视频已导出保存 (${data.fileName})`);
              return;
            }
          }
        } catch {
          // fallback to object URL
        }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `ScreenStudio-Export.${ext}`;
        a.click();
        setStatusBanner("视频已合成并开始下载");
      }
    };
  }, [
    config.playbackSpeed,
    handleSeek,
    isDemoMode,
    isExporting,
    trimEnd,
    trimStart,
  ]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0c0d10] text-zinc-100 overflow-hidden select-none">
      {/* Hidden backing video elements */}
      <video ref={videoRef} className="hidden" playsInline muted={false} />
      <video ref={webcamRef} className="hidden" playsInline muted />

      {/* Top macOS Titlebar & Action Header */}
      <header
        className={`h-13 bg-[#12141a] border-b border-[#222632] flex items-center justify-between ${
          window.studioAPI?.isDesktopApp ? "pl-20" : "pl-4"
        } pr-4 py-2.5 app-drag-region shrink-0`}
      >
        <div className="flex items-center gap-3 app-no-drag">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                Screen Studio
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  macOS Native Tracker
                </span>
              </div>
            </div>
          </div>

          <div className="h-4 w-px bg-[#262b38] mx-1" />

          {/* Record / Stop Button */}
          {!isRecording ? (
            <div className="flex items-center gap-2">
              <button
                onClick={
                  window.studioAPI?.isDesktopApp
                    ? handleOpenRecorderModal
                    : handleBrowserFallbackRecord
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition"
              >
                <Video className="w-3.5 h-3.5" />
                {window.studioAPI?.isDesktopApp
                  ? "桌面悬浮录制条 (Display / Window / Area / Device)"
                  : "在当前标签页直接录制 (连动原生鼠标追踪)"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold animate-pulse shadow-lg transition"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              停止录制 ({recordingSec}s · 已捕获 {liveClickCount} 次点击)
            </button>
          )}

          {/* Import Local Video */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1f2a] hover:bg-[#242937] border border-[#2c3242] text-xs font-medium text-zinc-200 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            导入视频
            <input
              type="file"
              accept="video/*"
              onChange={handleImportVideoFile}
              className="hidden"
            />
          </label>

          {!isDemoMode && (
            <button
              onClick={handleResetDemoProject}
              className="px-2.5 py-1.5 rounded-lg bg-[#181b24] hover:bg-[#212632] text-xs text-zinc-400 hover:text-zinc-200 transition"
            >
              切回演示工程
            </button>
          )}
        </div>

        {/* Center Status Pill */}
        {statusBanner && (
          <div className="hidden xl:flex items-center gap-1.5 bg-[#171a22] border border-[#252a37] px-3 py-1 rounded-full text-[11px] text-zinc-300 max-w-md truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{statusBanner}</span>
          </div>
        )}

        {/* Right Export Action */}
        <div className="flex items-center gap-2.5 app-no-drag">
          <button
            onClick={handleExportVideo}
            disabled={isExporting || isRecording}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                正在渲染导出 ({exportProgress}%)
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                导出高清视频
              </>
            )}
          </button>
        </div>
      </header>

      {/* Center Workspace: Preview Canvas + Right Inspector */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Main Interactive Stage */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0b0d12] relative overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              title="点击画面任意位置可直接设置或新建固定缩放焦点"
              className="max-w-full max-h-full object-contain rounded-xl shadow-[0_25px_70px_rgba(0,0,0,0.75)] border border-white/10 cursor-crosshair"
            />
          </div>

          {/* Floating helper badge at bottom-left of stage */}
          <div className="absolute bottom-3 left-4 flex items-center gap-3 bg-[#14171f]/90 backdrop-blur border border-[#262b3a] px-3 py-1.5 rounded-lg text-[11px] text-zinc-400 pointer-events-none">
            <span className="flex items-center gap-1 text-indigo-300 font-medium">
              <Crosshair className="w-3.5 h-3.5" />
              画布点选对焦：点击预览画面任意位置即可将镜头聚焦到该处
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              弹簧状态：
              {Math.abs(springRef.current.scale - 1) > 0.05
                ? "特写推镜中"
                : "全局画面"}
            </span>
          </div>
        </main>

        {/* Right Inspector Sidebar */}
        <InspectorPanel
          config={config}
          hasWebcamStream={config.webcamEnabled}
          onChange={updateConfig}
          onToggleWebcamDevice={handleToggleWebcamDevice}
        />
      </div>

      {/* Bottom Dual-Track Timeline */}
      <Timeline
        duration={duration}
        currentTime={currentTime}
        trimStart={trimStart}
        trimEnd={trimEnd}
        isPlaying={isPlaying}
        clipSegments={clipSegments}
        selectedClipId={selectedClipId}
        zoomSegments={zoomSegments}
        selectedSegmentId={selectedSegmentId}
        mouseEvents={mouseEvents}
        onSeek={handleSeek}
        onTogglePlay={handleTogglePlay}
        onTrimChange={(s, e) => {
          setTrimStart(s);
          setTrimEnd(e);
          if (currentTime < s || currentTime > e) handleSeek(s);
        }}
        onSelectClip={setSelectedClipId}
        onSplitClipAtPlayhead={handleSplitClipAtPlayhead}
        onUpdateClip={handleUpdateClip}
        onDeleteOrRestoreClip={handleDeleteOrRestoreClip}
        onResetClips={handleResetClips}
        onSelectSegment={setSelectedSegmentId}
        onAddSegment={handleAddSegmentAtPlayhead}
        onUpdateSegment={handleUpdateSegment}
        onDeleteSegment={handleDeleteSegment}
        onRegenerateAutoZoom={handleRegenerateAutoZoom}
      />

      {/* Screen & Window Source Picker Modal */}
      <SourcePickerModal
        isOpen={pickerOpen}
        sources={sources}
        loading={loadingSources}
        error={sourceError}
        micEnabled={micEnabled}
        webcamEnabled={config.webcamEnabled}
        onRefresh={handleOpenRecorderModal}
        onToggleMic={() => setMicEnabled((m) => !m)}
        onToggleWebcam={handleToggleWebcamDevice}
        onSelectSourceAndRecord={handleSelectSourceAndRecord}
        onBrowserFallbackRecord={handleBrowserFallbackRecord}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
