import { button, node, t } from "./desk-kit.js";

const halfFov = Math.PI / 8;
const degrees = 180 / Math.PI;
const previewLimit = 220;
const depthBins = 48;
const root = [0, 0, 0];
const clamp = (n, low, high) => Math.min(high, Math.max(low, n));
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function rotate([w, x, y, z], [a, b, c]) {
  const dx = 2 * (y * c - z * b);
  const dy = 2 * (z * a - x * c);
  const dz = 2 * (x * b - y * a);
  return [
    a + w * dx + y * dz - z * dy,
    b + w * dy + z * dx - x * dz,
    c + w * dz + x * dy - y * dx,
  ];
}

export function fitTrajectory(frames, width, height) {
  const low = [0, -0.9, 0];
  const high = [0, 0, 0.9];
  for (const { position } of frames)
    for (let i = 0; i < 3; i++) {
      low[i] = Math.min(low[i], position[i]);
      high[i] = Math.max(high[i], position[i]);
    }
  const target = low.map((min, i) => (min + high[i]) / 2);
  const extent = high.map((max, i) => max - low[i]);
  let radius = 0.7;
  for (const point of [root, [0, -0.9, 0], [0, 0, 0.9]])
    radius = Math.max(
      radius,
      Math.hypot(...target.map((v, i) => v - point[i])),
    );
  for (const { position } of frames)
    radius = Math.max(
      radius,
      Math.hypot(
        position[0] - target[0],
        position[1] - target[1],
        position[2] - target[2],
      ),
    );
  const limitingFov = Math.atan(
    Math.tan(halfFov) * Math.min(1, width / height),
  );
  return {
    target,
    radius,
    azimuth: -0.89,
    elevation: clamp(0.86 - (0.34 * extent[2]) / radius, 0.45, 0.86),
    distance: (1.19 * radius) / Math.sin(limitingFov),
  };
}

export function viewProjection(view, width, height) {
  const { azimuth, elevation, distance, target, radius } = view;
  const c = Math.cos(azimuth);
  const s = Math.sin(azimuth);
  const upAngle = Math.sin(elevation);
  const level = Math.cos(elevation);
  const right = [-s, c, 0];
  const up = [-upAngle * c, -upAngle * s, level];
  const back = [level * c, level * s, upAngle];
  const focal = height / 2 / Math.tan(halfFov);
  const near = Math.max(0.015, radius * 0.025);
  function project(point) {
    const relative = [
      point[0] - target[0],
      point[1] - target[1],
      point[2] - target[2],
    ];
    const depth = distance - dot(relative, back);
    if (depth < near) return null;
    return [
      width * 0.5 + (dot(relative, right) * focal) / depth,
      height * 0.49 - (dot(relative, up) * focal) / depth,
      depth,
    ];
  }
  return { project, right, up, focal };
}

function segment(ctx, a, b) {
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
}

function label(ctx, text, point, color, x = 6, y = -5) {
  if (!point) return;
  ctx.font = "600 11px system-ui";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#101a20";
  ctx.strokeText(text, point[0] + x, point[1] + y);
  ctx.fillStyle = color;
  ctx.fillText(text, point[0] + x, point[1] + y);
}

function grid(ctx, project, view, frames, width, height) {
  const extent = Math.max(
    2,
    view.radius,
    Math.abs(view.target[0]),
    Math.abs(view.target[1]),
  );
  const unit = 2 ** Math.max(0, Math.ceil(Math.log2(extent / 8)));
  const reach = unit * Math.min(12, Math.ceil((1.2 * extent) / unit) + 1);
  ctx.beginPath();
  for (let i = -reach; i <= reach; i += unit) {
    for (const ends of [
      [
        [i, -reach, 0],
        [i, reach, 0],
      ],
      [
        [-reach, i, 0],
        [reach, i, 0],
      ],
    ]) {
      const a = project(ends[0]);
      const b = project(ends[1]);
      if (a && b) segment(ctx, a, b);
    }
  }
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#293b46";
  ctx.stroke();
  label(
    ctx,
    t(`Grid ${unit} m · Z up`, `网格 ${unit} m · Z 轴向上`),
    [13, height - 12],
    "#9eb7c3",
    0,
    0,
  );
  if (!frames.length) {
    ctx.font = "13px system-ui";
    ctx.textAlign = "center";
    ctx.fillStyle = "#bdd0d9";
    ctx.fillText(
      t("Track a clip to see its path", "反求片段后显示轨迹"),
      width / 2,
      28,
    );
    ctx.textAlign = "start";
  }
}

function axes(ctx, project, view) {
  const origin = project(root);
  if (!origin) return;
  const scale = Math.min(2, Math.max(0.7, view.radius * 0.42));
  for (const [name, end, color] of [
    ["+X", [scale, 0, 0], "#f29b93"],
    ["+Y", [0, scale, 0], "#99d7a5"],
    ["+Z", [0, 0, scale], "#85c1f1"],
  ]) {
    const tip = project(end);
    if (!tip) continue;
    ctx.beginPath();
    segment(ctx, origin, tip);
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.globalAlpha = 1;
    label(ctx, name, tip, color);
  }
}

function pelvisMarker(ctx, project, origin) {
  if (!origin) return;
  const torso = project([0, 0, 0.54]);
  const head = project([0, 0, 0.75]);
  if (torso && head) {
    ctx.beginPath();
    segment(ctx, origin, torso);
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#bc8e57";
    ctx.stroke();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#efb776";
    ctx.stroke();
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.arc(head[0], head[1], 4.2, 0, Math.PI * 2);
    ctx.fillStyle = "#f5c991";
    ctx.fill();
    label(ctx, t("Pelvis", "骨盆"), torso, "#ffd39e", 9, 3);
  }
  const front = project([0, -0.82, 0]);
  const left = project([-0.12, -0.58, 0]);
  const right = project([0.12, -0.58, 0]);
  if (front && left && right) {
    ctx.beginPath();
    segment(ctx, origin, front);
    segment(ctx, left, front);
    ctx.lineTo(right[0], right[1]);
    ctx.strokeStyle = "#efb776";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    label(ctx, t("Front −Y", "朝向 −Y"), front, "#efb776", 7, 11);
  }
}

function pathSamples(frames) {
  let run = 0;
  return frames.map((frame, i) => {
    if (i > 0 && frame.shot !== frames[i - 1].shot) run++;
    return { position: frame.position, i, run };
  });
}

function drawPath(ctx, project, view, samples) {
  const bins = Array.from({ length: depthBins }, () => ({
    lines: [],
    points: [],
  }));
  const near = view.distance - view.radius;
  const bin = (depth) =>
    bins[
      clamp(
        Math.floor(((depth - near) / (2 * view.radius)) * depthBins),
        0,
        depthBins - 1,
      )
    ];
  const projected = samples.map((sample) => project(sample.position));
  const pelvis = project(root);
  const pelvisLayer = pelvis ? bin(pelvis[2]) : null;
  for (let i = 0; i < samples.length; i++) {
    const point = projected[i];
    if (!point) continue;
    bin(point[2]).points.push(point);
    const previous = projected[i - 1];
    if (previous && samples[i - 1].run === samples[i].run)
      bin((point[2] + previous[2]) / 2).lines.push([previous, point]);
  }
  // Depth buckets keep the painter's order linear in the number of points.
  for (let j = depthBins - 1; j >= 0; j--) {
    const layer = bins[j];
    ctx.beginPath();
    for (const [a, b] of layer.lines) segment(ctx, a, b);
    ctx.strokeStyle = "#68d6c1";
    ctx.globalAlpha = 1 - j / (depthBins * 2.8);
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.beginPath();
    for (const [x, y] of layer.points) {
      ctx.moveTo(x + 1.6, y);
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
    }
    ctx.fillStyle = "#a6eddf";
    ctx.fill();
    ctx.globalAlpha = 1;
    if (layer === pelvisLayer) pelvisMarker(ctx, project, pelvis);
  }
  const first = projected[0];
  const last = projected.at(-1);
  if (first && last && Math.hypot(first[0] - last[0], first[1] - last[1]) < 17)
    label(ctx, t("Start / End", "起点／终点"), first, "#a6eddf");
  else {
    label(ctx, t("Start", "起点"), first, "#a6eddf");
    label(ctx, t("End", "终点"), last, "#a6eddf", 6, 10);
  }
  return projected;
}

function cameraMarker(ctx, project, frame, radius) {
  const center = project(frame.position);
  if (!center) return;
  const pelvis = project(root);
  if (pelvis) {
    ctx.beginPath();
    segment(ctx, center, pelvis);
    ctx.setLineDash([4, 5]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#e7ac6a92";
    ctx.stroke();
    ctx.setLineDash([]);
  }
  const depth = clamp(radius * 0.19, 0.32, 1.18);
  const corners = [
    [-0.42, 0.29],
    [0.42, 0.29],
    [0.42, -0.29],
    [-0.42, -0.29],
  ]
    .map(([x, y]) => rotate(frame.quaternion, [depth * x, depth * y, -depth]))
    .map((corner) => project(corner.map((v, i) => v + frame.position[i])));
  if (corners.every(Boolean)) {
    ctx.beginPath();
    ctx.moveTo(corners[0][0], corners[0][1]);
    for (const [x, y] of corners.slice(1)) ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fillStyle = "#f4d59a48";
    ctx.fill();
    for (const corner of corners) segment(ctx, center, corner);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = "#ffe0a5";
    ctx.stroke();
    // Mark the optical up side, so roll is visible on the frustum itself.
    const middle = corners[0].map((v, i) => (v + corners[1][i]) / 2);
    const raised = project(
      rotate(frame.quaternion, [0, depth * 0.47, -depth]).map(
        (v, i) => v + frame.position[i],
      ),
    );
    if (raised) {
      ctx.beginPath();
      segment(ctx, middle, raised);
      ctx.stroke();
    }
  }
  const [x, y] = center;
  const shade = ctx.createRadialGradient(x - 1.5, y - 2, 0.5, x, y, 6.5);
  shade.addColorStop(0, "#fff6d4");
  shade.addColorStop(1, "#eab56d");
  ctx.beginPath();
  ctx.arc(x, y, 6.5, 0, 2 * Math.PI);
  ctx.fillStyle = shade;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#101a20";
  ctx.stroke();
}

export function trajectoryView(seek) {
  const display = node("canvas", {
    className: "camera-plot camera-3d",
    tabIndex: 0,
  });
  display.setAttribute(
    "aria-label",
    t("Interactive 3D camera trajectory", "可交互的三维相机轨迹"),
  );
  const distance = node("dd", { className: "camera-3d-distance" });
  const direction = node("dd", { className: "camera-3d-direction" });
  const alignment = node("dd", { className: "camera-3d-alignment" });
  const frameText = node("span", { className: "camera-3d-frame" });
  const describe = node(
    "p",
    { className: "camera-3d-help" },
    t(
      "Drag to orbit · Wheel to zoom · Right or middle drag to pan · Double-click to reset · Click a point to seek",
      "左键旋转 · 滚轮缩放 · 右键或中键平移 · 双击复位 · 点轨迹跳帧",
    ),
  );
  const details = node(
    "dl",
    { className: "camera-3d-details" },
    node(
      "div",
      {},
      node("dt", {}, t("Distance to pelvis", "与骨盆的距离")),
      distance,
    ),
    node(
      "div",
      {},
      node("dt", {}, t("Frustum direction (X/Y/Z)", "视锥朝向（X/Y/Z）")),
      direction,
    ),
    node(
      "div",
      {},
      node("dt", {}, t("Off-axis angle to pelvis", "光轴偏离骨盆")),
      alignment,
    ),
  );
  const element = node(
    "div",
    { className: "camera-3d-view" },
    display,
    node(
      "div",
      { className: "camera-3d-caption" },
      frameText,
      button(t("Reset view", "复位视角"), reset),
    ),
    details,
    describe,
  );
  const ctx = display.getContext("2d");
  const scene = document.createElement("canvas");
  const background = scene.getContext("2d");
  let data, home, view, projection, gesture;
  let samples = [],
    preview = [],
    projected = [];
  let size = [];
  let index = 0;
  let pending = 0;
  let zoomEnd = 0;
  let staticDirty = true;
  let shownFrame;

  function invalidate() {
    staticDirty = true;
    schedule();
  }

  function schedule() {
    if (!pending) pending = requestAnimationFrame(draw);
  }

  function reset() {
    clearTimeout(zoomEnd);
    zoomEnd = 0;
    if (home) view = { ...home };
    invalidate();
  }

  function setFrame(trajectory, frame) {
    if (data !== trajectory) {
      data = trajectory;
      samples = pathSamples(data?.frames ?? []);
      const stride = Math.max(1, Math.ceil(samples.length / previewLimit));
      preview = samples.filter(
        (sample) => sample.i % stride === 0 || sample.i === samples.length - 1,
      );
      home = view = null;
      gesture = null;
      clearTimeout(zoomEnd);
      zoomEnd = 0;
      shownFrame = undefined;
      staticDirty = true;
    }
    index = frame;
    if (!element.hidden) schedule();
  }

  function draw() {
    pending = 0;
    const width = display.clientWidth;
    const height = display.clientHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!width || !height) return;
    if (!home || width !== size[0] || height !== size[1] || dpr !== size[2]) {
      const previous = home;
      home = fitTrajectory(data?.frames ?? [], width, height);
      view =
        view && previous
          ? {
              ...view,
              distance: (view.distance * home.distance) / previous.distance,
            }
          : { ...home };
      size = [width, height, dpr];
      display.width = scene.width = Math.round(width * dpr);
      display.height = scene.height = Math.round(height * dpr);
      staticDirty = true;
    }
    if (staticDirty) {
      projection = viewProjection(view, width, height);
      background.setTransform(dpr, 0, 0, dpr, 0, 0);
      background.fillStyle = "#101a20";
      background.fillRect(0, 0, width, height);
      const active = gesture?.dragged || zoomEnd ? preview : samples;
      grid(background, projection.project, view, active, width, height);
      axes(background, projection.project, view);
      projected = drawPath(background, projection.project, view, active);
      staticDirty = false;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.drawImage(scene, 0, 0, width, height);
    const frame = data?.frames[index];
    if (frame) cameraMarker(ctx, projection.project, frame, view.radius);
    if (shownFrame !== frame || !frameText.textContent) {
      shownFrame = frame;
      frameText.dataset.frame = frame ? String(index) : "";
      frameText.textContent = frame
        ? t(
            `Frame ${index + 1} / ${samples.length}`,
            `第 ${index + 1} / ${samples.length} 帧`,
          )
        : t("Current frame", "当前帧");
      const range = frame && Math.hypot(...frame.position);
      const forward = frame && rotate(frame.quaternion, [0, 0, -1]);
      distance.textContent = frame ? range.toFixed(2) + " m" : "—";
      direction.textContent = forward
        ? forward
            .map((v) => (Math.abs(v) < 0.005 ? "0.00" : v.toFixed(2)))
            .join(" / ")
        : "—";
      alignment.textContent =
        range > 0
          ? (
              Math.acos(clamp(-dot(forward, frame.position) / range, -1, 1)) *
              degrees
            ).toFixed(1) + "°"
          : "—";
    }
  }

  function pan(dx, dy) {
    const { right, up, focal } = viewProjection(view, size[0], size[1]);
    view.target = view.target.map(
      (v, i) => v + (view.distance / focal) * (-dx * right[i] + dy * up[i]),
    );
  }

  function orbit(dx, dy) {
    view.azimuth -= dx * 0.008;
    view.elevation = clamp(view.elevation + dy * 0.008, -1.43, 1.43);
  }

  function zoom(amount) {
    view.distance = clamp(
      view.distance * Math.exp(amount),
      view.radius * 0.22,
      home.distance * 12,
    );
  }

  function hit(event) {
    if (zoomEnd) {
      clearTimeout(zoomEnd);
      zoomEnd = 0;
      staticDirty = true;
    }
    if (staticDirty) {
      cancelAnimationFrame(pending);
      draw();
    }
    const { left, top } = display.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;
    let nearest = 10 ** 2;
    let depth = Infinity;
    let match;
    for (let i = 0; i < projected.length; i++) {
      const point = projected[i];
      if (!point) continue;
      const d = (point[0] - x) ** 2 + (point[1] - y) ** 2;
      if (d < nearest || (d === nearest && point[2] < depth)) {
        nearest = d;
        depth = point[2];
        match = i;
      }
    }
    if (match !== undefined) seek(samples[match].i);
  }

  display.addEventListener("contextmenu", (event) => event.preventDefault());
  display.addEventListener("dblclick", reset);
  display.addEventListener("pointerdown", (event) => {
    if (!view || gesture || ![0, 1, 2].includes(event.button)) return;
    event.preventDefault();
    display.focus({ preventScroll: true });
    display.setPointerCapture(event.pointerId);
    gesture = {
      id: event.pointerId,
      button: event.button,
      x: event.clientX,
      y: event.clientY,
      dragged: false,
    };
  });
  display.addEventListener("pointermove", (event) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.dragged && Math.hypot(dx, dy) < 4) return;
    gesture.dragged = true;
    gesture.x = event.clientX;
    gesture.y = event.clientY;
    if (gesture.button === 0) orbit(dx, dy);
    else pan(dx, dy);
    invalidate();
  });
  function endDrag(event) {
    if (!gesture || gesture.id !== event.pointerId) return;
    const { dragged, button } = gesture;
    gesture = null;
    if (dragged) invalidate();
    else if (button === 0 && event.type === "pointerup") hit(event);
  }
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    display.addEventListener(event, endDrag);
  display.addEventListener(
    "wheel",
    (event) => {
      if (!view) return;
      event.preventDefault();
      const pixels =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? size[1] : 1);
      zoom(clamp(pixels * 0.0014, -0.42, 0.42));
      clearTimeout(zoomEnd);
      zoomEnd = setTimeout(() => {
        zoomEnd = 0;
        invalidate();
      }, 110);
      invalidate();
    },
    { passive: false },
  );
  display.addEventListener("keydown", (event) => {
    if (!view) return;
    const offsets = {
      ArrowLeft: [-25, 0],
      ArrowRight: [25, 0],
      ArrowUp: [0, -25],
      ArrowDown: [0, 25],
    };
    if (Object.hasOwn(offsets, event.key)) {
      if (event.shiftKey) pan(...offsets[event.key]);
      else orbit(...offsets[event.key]);
    } else if (event.key === "+" || event.key === "=") zoom(-0.14);
    else if (event.key === "-") zoom(0.14);
    else if (event.key === "Home") reset();
    else return;
    event.preventDefault();
    invalidate();
  });
  new ResizeObserver(schedule).observe(display);
  return { element, setFrame };
}
