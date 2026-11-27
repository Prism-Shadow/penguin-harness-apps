import {
  AreaCropBounds,
  MousePoint,
  StudioConfig,
  ZoomSegment,
} from "../types";
import { drawSyntheticDashboardFrame } from "./demoGenerator";
import { getCursorAtTime, WALLPAPERS } from "./springPhysics";

export interface CameraSpringState {
  scale: number;
  scaleVel: number;
  focusX: number;
  focusXVel: number;
  focusY: number;
  focusYVel: number;
  cursorX: number;
  cursorXVel: number;
  cursorY: number;
  cursorYVel: number;
  webcamScale: number;
  webcamScaleVel: number;
}

export function createInitialSpringState(): CameraSpringState {
  return {
    scale: 1,
    scaleVel: 0,
    focusX: 0.5,
    focusXVel: 0,
    focusY: 0.5,
    focusYVel: 0,
    cursorX: 0.5,
    cursorXVel: 0,
    cursorY: 0.5,
    cursorYVel: 0,
    webcamScale: 1,
    webcamScaleVel: 0,
  };
}

export interface FrameLayoutMetrics {
  canvasW: number;
  canvasH: number;
  frameX: number;
  frameY: number;
  frameW: number;
  frameH: number;
  scale: number;
  focusX: number;
  focusY: number;
}

/**
 * Computes canvas dimensions based on user-selected aspect ratio preset
 */
export function getCanvasResolution(
  aspect: StudioConfig["aspectRatio"],
  sourceW = 1920,
  sourceH = 1080,
): { width: number; height: number } {
  switch (aspect) {
    case "16:9":
      return { width: 1920, height: 1080 };
    case "9:16":
      return { width: 1080, height: 1920 };
    case "1:1":
      return { width: 1440, height: 1440 };
    case "4:3":
      return { width: 1600, height: 1200 };
    case "original":
    default: {
      const ratio = sourceW / Math.max(1, sourceH);
      const w = 1920;
      const h = Math.round(w / ratio);
      return { width: w, height: h };
    }
  }
}

/**
 * Renders one composited Screen Studio frame onto `ctx`.
 * Returns layout metrics so clicking the preview canvas can accurately map back to normalized [0..1] video coordinates.
 */
export function renderStudioFrame(params: {
  ctx: CanvasRenderingContext2D;
  canvasW: number;
  canvasH: number;
  videoEl: HTMLVideoElement | null;
  webcamEl: HTMLVideoElement | null;
  isDemoMode: boolean;
  timeSec: number;
  config: StudioConfig;
  springState: CameraSpringState;
  mouseEvents: MousePoint[];
  activeSegment: ZoomSegment | null;
  areaCrop?: AreaCropBounds | null;
}): FrameLayoutMetrics {
  const {
    ctx,
    canvasW,
    canvasH,
    videoEl,
    webcamEl,
    isDemoMode,
    timeSec,
    config,
    springState,
    mouseEvents,
    areaCrop,
  } = params;

  ctx.save();
  ctx.clearRect(0, 0, canvasW, canvasH);

  // 1. Draw Wallpaper / Gradient Background
  const wp =
    WALLPAPERS.find((w) => w.id === config.wallpaperId) || WALLPAPERS[0];
  if (config.wallpaperId === "custom-solid") {
    ctx.fillStyle = config.customColor || "#1e1b4b";
    ctx.fillRect(0, 0, canvasW, canvasH);
  } else {
    const rad = (wp.angle * Math.PI) / 180;
    const cx = canvasW / 2;
    const cy = canvasH / 2;
    const len = Math.hypot(canvasW, canvasH) / 2;
    const grad = ctx.createLinearGradient(
      cx - Math.cos(rad) * len,
      cy - Math.sin(rad) * len,
      cx + Math.cos(rad) * len,
      cy + Math.sin(rad) * len,
    );
    grad.addColorStop(0, wp.stops[0]);
    grad.addColorStop(0.52, wp.stops[1]);
    grad.addColorStop(1, wp.stops[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Subtle ambient radial glow for depth
    const glow = ctx.createRadialGradient(
      canvasW * 0.25,
      canvasH * 0.2,
      10,
      canvasW * 0.5,
      canvasH * 0.5,
      canvasW * 0.75,
    );
    glow.addColorStop(0, "rgba(255, 255, 255, 0.10)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0.18)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  // 2. Calculate inner video frame box with padding & aspect ratio fit (supporting Area Crop)
  const rawVideoW =
    !isDemoMode && videoEl && videoEl.videoWidth > 0
      ? videoEl.videoWidth
      : 1920;
  const rawVideoH =
    !isDemoMode && videoEl && videoEl.videoHeight > 0
      ? videoEl.videoHeight
      : 1080;

  const srcW = areaCrop ? Math.max(64, rawVideoW * areaCrop.w) : rawVideoW;
  const srcH = areaCrop ? Math.max(64, rawVideoH * areaCrop.h) : rawVideoH;

  const padScale = Math.min(canvasW, canvasH) / 1080;
  const padPx = config.padding * padScale;
  const availW = Math.max(100, canvasW - padPx * 2);
  const availH = Math.max(100, canvasH - padPx * 2);

  const headerHeight = config.macosHeader ? Math.round(36 * padScale) : 0;
  const srcAspect = srcW / Math.max(1, srcH);
  const targetAvailH = Math.max(60, availH - headerHeight);
  const boxAspect = availW / targetAvailH;

  let contentW = availW;
  let contentH = targetAvailH;
  if (srcAspect > boxAspect) {
    contentH = availW / srcAspect;
  } else {
    contentW = targetAvailH * srcAspect;
  }

  const totalFrameW = contentW;
  const totalFrameH = contentH + headerHeight;
  const frameX = (canvasW - totalFrameW) / 2;
  const frameY = (canvasH - totalFrameH) / 2;
  const radius = config.borderRadius * padScale;

  // 3. Apply Camera Zoom & Focus Transform around inner video window
  const zoomScale = Math.max(1, springState.scale);
  const focusX = Math.max(0, Math.min(1, springState.focusX));
  const focusY = Math.max(0, Math.min(1, springState.focusY));

  ctx.save();

  // Translate & scale around the focus point inside the video frame
  // Clamp translation so zoomed frame doesn't needlessly expose empty edges
  const pivotX = frameX + focusX * totalFrameW;
  const pivotY = frameY + focusY * totalFrameH;
  const centerX = canvasW / 2;
  const centerY = canvasH / 2;

  // Blend pivot towards center based on how much we're zoomed in
  const zoomBlend = Math.min(1, Math.max(0, (zoomScale - 1) / 0.85));
  const targetCenterX =
    centerX + (centerX - pivotX) * (zoomScale - 1) * zoomBlend;
  const targetCenterY =
    centerY + (centerY - pivotY) * (zoomScale - 1) * zoomBlend;

  ctx.translate(targetCenterX, targetCenterY);
  ctx.scale(zoomScale, zoomScale);
  ctx.translate(-centerX, -centerY);

  // Motion blur subtle ghosting during fast zoom velocity
  if (config.motionBlur && Math.abs(springState.scaleVel) > 0.35) {
    ctx.shadowColor = "rgba(99, 102, 241, 0.18)";
  }

  // 4. Multi-layered macOS Elevation Shadow behind the window
  if (config.shadowIntensity > 0 && config.padding > 0) {
    ctx.save();
    const alpha = (config.shadowIntensity / 100) * 0.68;
    ctx.shadowColor = `rgba(0, 0, 0, ${alpha.toFixed(2)})`;
    ctx.shadowBlur = (config.shadowIntensity * 0.9 + 18) * padScale;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = (config.shadowIntensity * 0.28 + 10) * padScale;

    ctx.fillStyle = "#090a0f";
    ctx.beginPath();
    ctx.roundRect(frameX, frameY, totalFrameW, totalFrameH, radius);
    ctx.fill();
    ctx.restore();
  }

  // 5. Clip to Rounded Window Frame
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(frameX, frameY, totalFrameW, totalFrameH, radius);
  ctx.clip();

  // Optional macOS Window Header Bar with Traffic Lights
  if (config.macosHeader) {
    ctx.fillStyle = "#181a20";
    ctx.fillRect(frameX, frameY, totalFrameW, headerHeight);

    const dotY = frameY + headerHeight / 2;
    const dotR = Math.max(4, 6.2 * padScale);
    const colors = ["#ff5f56", "#ffbd2e", "#27c93f"];
    colors.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(frameX + (20 + i * 20) * padScale, dotY, dotR, 0, Math.PI * 2);
      ctx.fill();
    });

    // Subtle divider line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(frameX, frameY + headerHeight);
    ctx.lineTo(frameX + totalFrameW, frameY + headerHeight);
    ctx.stroke();
  }

  // 6. Draw Video Content (with Area Crop support) or Built-in Interactive Demo Scene
  const videoY = frameY + headerHeight;
  if (!isDemoMode && videoEl && videoEl.readyState >= 2) {
    if (areaCrop) {
      const sx = areaCrop.x * rawVideoW;
      const sy = areaCrop.y * rawVideoH;
      const sw = areaCrop.w * rawVideoW;
      const sh = areaCrop.h * rawVideoH;
      ctx.drawImage(
        videoEl,
        sx,
        sy,
        sw,
        sh,
        frameX,
        videoY,
        contentW,
        contentH,
      );
    } else {
      ctx.drawImage(videoEl, frameX, videoY, contentW, contentH);
    }
  } else {
    ctx.save();
    ctx.translate(frameX, videoY);
    drawSyntheticDashboardFrame(ctx, contentW, contentH, timeSec);
    ctx.restore();
  }

  // 7. Draw Click Ripple & Smooth Custom macOS Cursor inside the video coordinate space
  const cursorInfo = getCursorAtTime(mouseEvents, timeSec);
  const drawCursorX =
    frameX +
    (config.smoothCursorMove ? springState.cursorX : cursorInfo.x) * contentW;
  const drawCursorY =
    videoY +
    (config.smoothCursorMove ? springState.cursorY : cursorInfo.y) * contentH;

  // Click Ripple Ring
  if (config.showClickRipple && cursorInfo.recentClickAgeMs !== null) {
    const progress = Math.min(1, cursorInfo.recentClickAgeMs / 520);
    const rippleRadius = (10 + progress * 44) * padScale;
    const rippleAlpha = (1 - progress) * 0.78;
    const rx = frameX + cursorInfo.clickX * contentW;
    const ry = videoY + cursorInfo.clickY * contentH;

    ctx.save();
    ctx.strokeStyle = `rgba(99, 102, 241, ${rippleAlpha.toFixed(3)})`;
    ctx.lineWidth = 3.2 * padScale;
    ctx.beginPath();
    ctx.arc(rx, ry, rippleRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(129, 140, 248, ${(rippleAlpha * 0.28).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(rx, ry, rippleRadius * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Custom Vector macOS Pointer (scales smoothly & squishes on click)
  if (config.cursorScale > 0 && mouseEvents.length > 0) {
    const pressShrink = cursorInfo.isPressed ? 0.84 : 1.0;
    const cScale = config.cursorScale * pressShrink * padScale * 1.35;

    ctx.save();
    ctx.translate(drawCursorX, drawCursorY);
    ctx.scale(cScale, cScale);

    // Cursor drop shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 3;

    // Classic macOS Arrow Path
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 19);
    ctx.lineTo(4.6, 14.8);
    ctx.lineTo(8.1, 22.5);
    ctx.lineTo(11.1, 21.1);
    ctx.lineTo(7.6, 13.5);
    ctx.lineTo(13.8, 13.5);
    ctx.closePath();

    ctx.fillStyle = "#111827";
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore(); // End rounded window clip

  // 8. Subtle 1px Glass Inset Border around window
  if (config.insetBorder && config.padding > 0) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = Math.max(1, 1.5 * padScale);
    ctx.beginPath();
    ctx.roundRect(frameX, frameY, totalFrameW, totalFrameH, radius);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore(); // End camera zoom transform

  // 9. Webcam Picture-in-Picture (PiP) Overlay (floats in canvas corner, auto-shrinks during zoom)
  if (config.webcamEnabled && webcamEl && webcamEl.readyState >= 2) {
    const baseSize = config.webcamSize * padScale;
    const pipScale = config.webcamShrinkOnZoom ? springState.webcamScale : 1.0;
    const pipW =
      baseSize * (config.webcamShape === "rounded" ? 1.28 : 1.0) * pipScale;
    const pipH = baseSize * pipScale;
    const margin = Math.max(28 * padScale, padPx * 0.55);

    let pipX = canvasW - pipW - margin;
    let pipY = canvasH - pipH - margin;
    if (config.webcamCorner === "bottom-left") {
      pipX = margin;
      pipY = canvasH - pipH - margin;
    } else if (config.webcamCorner === "top-right") {
      pipX = canvasW - pipW - margin;
      pipY = margin;
    } else if (config.webcamCorner === "top-left") {
      pipX = margin;
      pipY = margin;
    }

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.shadowBlur = 24 * padScale;
    ctx.shadowOffsetY = 8 * padScale;

    ctx.beginPath();
    if (config.webcamShape === "circle") {
      ctx.arc(pipX + pipW / 2, pipY + pipH / 2, pipH / 2, 0, Math.PI * 2);
    } else {
      const r =
        config.webcamShape === "rounded" ? 24 * padScale : 10 * padScale;
      ctx.roundRect(pipX, pipY, pipW, pipH, r);
    }
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.clip();

    // Center-crop webcam feed + mirror horizontally
    const vw = webcamEl.videoWidth || 640;
    const vh = webcamEl.videoHeight || 480;
    const vAspect = vw / vh;
    const pAspect = pipW / pipH;
    let sx = 0,
      sy = 0,
      sw = vw,
      sh = vh;
    if (vAspect > pAspect) {
      sw = vh * pAspect;
      sx = (vw - sw) / 2;
    } else {
      sh = vw / pAspect;
      sy = (vh - sh) / 2;
    }

    ctx.translate(pipX + pipW, pipY);
    ctx.scale(-1, 1);
    ctx.drawImage(webcamEl, sx, sy, sw, sh, 0, 0, pipW, pipH);
    ctx.restore();

    // Subtle white border around webcam bubble
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 2.2 * padScale;
    ctx.beginPath();
    if (config.webcamShape === "circle") {
      ctx.arc(pipX + pipW / 2, pipY + pipH / 2, pipH / 2, 0, Math.PI * 2);
    } else {
      const r =
        config.webcamShape === "rounded" ? 24 * padScale : 10 * padScale;
      ctx.roundRect(pipX, pipY, pipW, pipH, r);
    }
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();

  return {
    canvasW,
    canvasH,
    frameX,
    frameY: frameY + headerHeight,
    frameW: contentW,
    frameH: contentH,
    scale: zoomScale,
    focusX,
    focusY,
  };
}
