export interface MousePoint {
  t: number; // ms since recording start
  x: number; // normalized 0.0 - 1.0
  y: number; // normalized 0.0 - 1.0
  rawX?: number;
  rawY?: number;
  screenW?: number;
  screenH?: number;
  type: "move" | "down" | "up";
  button: number;
}

export interface AreaCropBounds {
  x: number; // normalized 0..1 of screen width
  y: number; // normalized 0..1 of screen height
  w: number; // normalized 0..1 of screen width
  h: number; // normalized 0..1 of screen height
  pxW: number;
  pxH: number;
}

export interface ZoomSegment {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  scale: number; // e.g. 1.5 - 3.0
  targetX: number; // normalized 0.0 - 1.0
  targetY: number; // normalized 0.0 - 1.0
  mode: "manual" | "follow-cursor";
  label?: string;
}

export interface VideoClipSegment {
  id: string;
  startTime: number; // in seconds (source media time)
  endTime: number; // in seconds (source media time)
  speed: number; // 0.5, 1, 1.5, 2, 3, 4
  muted?: boolean;
  deleted?: boolean; // if true, playhead & export automatically skip this cut segment
}

export type AspectRatioPreset = "16:9" | "9:16" | "1:1" | "4:3" | "original";

export type SpringPreset = "mellow" | "smooth" | "snappy" | "instant";

export type WebcamCorner =
  "bottom-right" | "bottom-left" | "top-right" | "top-left";
export type WebcamShape = "circle" | "rounded" | "square";

export interface StudioConfig {
  wallpaperId: string;
  customColor: string;
  padding: number;
  borderRadius: number;
  shadowIntensity: number;
  insetBorder: boolean;
  macosHeader: boolean;
  aspectRatio: AspectRatioPreset;
  springPreset: SpringPreset;
  playbackSpeed: number;
  cursorScale: number;
  showClickRipple: boolean;
  smoothCursorMove: boolean;
  motionBlur: boolean;
  // Webcam PiP
  webcamEnabled: boolean;
  webcamCorner: WebcamCorner;
  webcamShape: WebcamShape;
  webcamSize: number;
  webcamShrinkOnZoom: boolean;
}

export interface DesktopSource {
  id: string;
  name: string;
  displayId: string;
  isScreen: boolean;
  thumbnail: string;
  appIcon: string | null;
  screenWidth: number;
  screenHeight: number;
}

export interface HudRecordPayload {
  mode: "display" | "window" | "area" | "device";
  sourceId?: string;
  areaCrop?: AreaCropBounds | null;
  cameraEnabled: boolean;
  micEnabled: boolean;
  systemAudioEnabled: boolean;
}

declare global {
  interface Window {
    studioAPI?: {
      isDesktopApp: boolean;
      getSources: () => Promise<DesktopSource[] | { error: string }>;
      getPermissions: () => Promise<{
        screen: string;
        mic: string;
        camera: string;
      }>;
      startMouseTracker: () => Promise<{ ok: boolean; error?: string }>;
      stopMouseTracker: () => Promise<{ ok: boolean; events: MousePoint[] }>;
      saveVideo: (
        buffer: ArrayBuffer,
        ext: string,
      ) => Promise<{ canceled: boolean; filePath?: string }>;
      openHud: (hideMain?: boolean) => Promise<{ ok: boolean }>;
      closeHud: (restoreMain?: boolean) => Promise<{ ok: boolean }>;
      moveHud: (dx: number, dy: number) => void;
      setHudExpanded: (expanded: boolean) => Promise<{ ok: boolean }>;
      clearMask: () => Promise<{ ok: boolean }>;
      openAreaSelector: (
        preset?: { w: number; h: number } | null,
      ) => Promise<{ ok: boolean }>;
      confirmArea: (
        bounds: AreaCropBounds | null,
      ) => Promise<{ ok: boolean; bounds: AreaCropBounds | null }>;
      hudStartRecord: (payload: HudRecordPayload) => Promise<{ ok: boolean }>;
      hudStopRecord: () => Promise<{ ok: boolean }>;
      onMouseEvent: (callback: (evt: MousePoint) => void) => () => void;
      onAreaSelected: (
        callback: (bounds: AreaCropBounds | null) => void,
      ) => () => void;
      onCommandStartRecord: (
        callback: (payload: HudRecordPayload) => void,
      ) => () => void;
      onCommandStopRecord: (callback: () => void) => () => void;
    };
  }
}
