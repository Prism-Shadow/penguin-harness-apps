(() => {
  const words = TRANSLATIONS;
  const keys = Object.keys(words).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(
    keys.map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
    "g",
  );
  const han = /[\u3400-\u9fff]/;
  const translate = (s) => {
    if (!han.test(s)) return s;
    if (s.trim().startsWith("技巧："))
      return "Drift to charge up to two nitro boosts. Tap Up as you straighten for a mini boost. Combine it with nitro for a double boost. Tap Up on GO or as you land for an extra burst. Blue pads accelerate your kart.";
    return s
      .replace(/第\s*(\d+)\s*圈/g, "Lap $1")
      .replace(/第\s*(\d+)\s*名/g, "Place $1")
      .replace(/(\d+)\s*圈/g, (_, n) => n + (n === "1" ? " lap" : " laps"))
      .replace(/(\d+)\s*秒/g, "$1 s")
      .replace(pattern, (key) => words[key]);
  };
  const previous = new WeakMap();
  let en = new URLSearchParams(location.search).get("lang") === "en";
  function render(node, attribute) {
    const text = attribute ? node.getAttribute(attribute) : node.nodeValue;
    if (!text) return;
    const map = previous.get(node) || new Map(),
      old = map.get(attribute);
    const source = old?.shown === text ? old.source : text;
    if (!han.test(source)) return;
    const shown = en ? translate(source) : source;
    map.set(attribute, { source, shown });
    previous.set(node, map);
    if (shown === text) return;
    if (attribute) node.setAttribute(attribute, shown);
    else node.nodeValue = shown;
  }
  function visit(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.parentElement?.closest("script,style")) render(node);
      return;
    }
    if (!(node instanceof Element) || node.matches("style,script")) return;
    for (const a of ["title", "aria-label", "placeholder"])
      if (node.hasAttribute(a)) render(node, a);
    for (const child of node.childNodes) visit(child);
  }
  addEventListener("DOMContentLoaded", () => {
    const update = () => {
      document.documentElement.lang = en ? "en" : "zh-CN";
      visit(document.body);
      document.title = en ? GAME_TITLE : ORIGINAL_TITLE;
    };
    update();
    new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "characterData") visit(r.target);
        else if (r.type === "attributes") render(r.target, r.attributeName);
        else for (const node of r.addedNodes) visit(node);
      }
    }).observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-label", "title", "placeholder"],
    });
    addEventListener("message", (event) => {
      if (
        event.source !== parent ||
        event.data?.type !== "penguin.game-language"
      )
        return;
      en = event.data.lang === "en";
      update();
    });
  });
})();
