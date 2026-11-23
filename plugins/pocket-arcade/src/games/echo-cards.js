export default function makeGame({
  renderGrid,
  showPoints,
  hint,
  end,
  cursor,
  shuffle,
}) {
  const symbols = ["♞", "★", "♫", "◆"];
  let cards, matched, open, turns, wait, select;
  function reset() {
    cards = shuffle([...symbols, ...symbols]);
    matched = new Set();
    open = [];
    turns = 0;
    wait = 0;
    select = 0;
    hint("Eight turns", "八轮机会");
  }
  function cell(i) {
    if (wait || matched.has(i) || open.includes(i)) return;
    select = i;
    open.push(i);
    if (open.length === 2) {
      turns++;
      const [a, b] = open;
      if (cards[a] === cards[b]) {
        matched.add(a);
        matched.add(b);
        open = [];
        showPoints(matched.size * 50);
        if (matched.size === cards.length)
          end(true, "Every pair found", "所有对子已配齐");
        else if (turns >= 8) end(false, "No turns remaining", "翻牌机会用尽");
      } else wait = 0.7;
      hint("Turns left: " + (8 - turns), "剩余轮数：" + (8 - turns));
    }
    draw();
  }
  function tick(dt) {
    if (wait) {
      wait = Math.max(0, wait - dt);
      if (!wait) {
        open = [];
        draw();
        if (turns >= 8) end(false, "No turns remaining", "翻牌机会用尽");
      }
    }
  }
  function draw() {
    renderGrid(
      4,
      2,
      cards.map((v, i) =>
        matched.has(i)
          ? { v, t: "bright" }
          : open.includes(i)
            ? { v, t: "warm" }
            : { v: "?", t: "dim" },
      ),
      select,
    );
  }
  function press(k) {
    if (k === "A") cell(select);
    else select = cursor(select, k, 4, 2);
  }
  return { reset, draw, tick, press, cell };
}
