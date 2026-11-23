const zh = (() => {
  try {
    return (
      (window.parent !== window &&
        window.parent.document.documentElement.lang) ||
      navigator.language
    ).startsWith("zh");
  } catch {
    return navigator.language.startsWith("zh");
  }
})();
document.documentElement.lang = zh ? "zh" : "en";
document.title = document.getElementById("title").textContent = zh
  ? "口袋街机厅"
  : "Pocket Arcade";
document.getElementById("sub").textContent = zh
  ? "选一台街机开始。每款都可以离线游玩。"
  : "Pick a cabinet. Every game works offline.";
const legends = {
  directions: ["Arrow keys / D-pad", "方向键 / 方向盘"],
  pick: ["Enter / tap a card", "回车 / 点选"],
  flags: ["Enter, F / tap", "回车、F / 点选"],
  horizontal: ["Left, right / drag", "左右键 / 拖动"],
  jump: ["Space / tap", "空格 / 点按"],
  shoot: ["Arrows, Space / tap", "方向键、空格 / 点按"],
  tones: ["1–4 / tap a pad", "数字 1–4 / 鼓垫"],
};
for (const game of games) {
  const link = document.createElement("a");
  link.className = "cart";
  link.href = "games/" + game.id + "/index.html";
  link.style.setProperty("--accent", game.color);
  const art = document.createElement("span");
  art.className = "art";
  const ns = "http://www.w3.org/2000/svg",
    canvas = document.createElementNS(ns, "svg");
  canvas.setAttribute("viewBox", "0 0 13 10");
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("shape-rendering", "crispEdges");
  const palette = {
    P: "#e2e8c7",
    R: "#f7c18e",
    B: "#243943",
    ".": "#adae91",
    "*": "#ffe79a",
  };
  game.art.forEach((line, y) =>
    [...line].forEach((c, x) => {
      if (!palette[c]) return;
      const r = document.createElementNS(ns, "rect");
      for (const [k, v] of Object.entries({
        x: x + 1,
        y: y + 1,
        width: 1,
        height: 1,
        fill: palette[c],
      }))
        r.setAttribute(k, v);
      canvas.append(r);
    }),
  );
  art.append(canvas);
  link.append(art);
  for (const [tag, value] of [
    ["strong", zh ? game.zh : game.en],
    ["p", game.blurb[zh ? 1 : 0]],
    ["small", legends[game.controls][zh ? 1 : 0]],
  ]) {
    const node = document.createElement(tag);
    node.textContent = value;
    link.append(node);
  }
  document.getElementById("games").append(link);
}
