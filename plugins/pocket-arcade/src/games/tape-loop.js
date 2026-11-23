export default function makeGame({ renderGrid, hint, end, showPoints }) {
  const marks = ["1 ◇", "2 ◎", "3 △", "4 □"];
  let pattern, index, step, delay, lit, listen;
  function reset() {
    pattern = [];
    newRound();
  }
  function newRound() {
    pattern.push(Math.floor(Math.random() * 4));
    index = 0;
    step = 0;
    lit = -1;
    listen = false;
    delay = 0.45;
    hint(
      "Watch round " + pattern.length + " / 5",
      "观察第 " + pattern.length + " / 5 轮",
    );
  }
  function draw() {
    renderGrid(
      2,
      2,
      marks.map((v, i) => ({ v, t: i === lit ? "warm" : "dim" })),
    );
  }
  function tick(dt) {
    if (listen) return;
    delay -= dt;
    if (delay > 0) return;
    if (lit >= 0) {
      lit = -1;
      delay = 0.23;
    } else if (step < pattern.length) {
      lit = pattern[step++];
      delay = 0.56;
    } else {
      listen = true;
      hint(
        "Your turn · " + pattern.length + " notes",
        "请复现 · " + pattern.length + " 个音符",
      );
    }
    draw();
  }
  function cell(i) {
    if (!listen) return;
    if (i !== pattern[index]) {
      lit = i;
      draw();
      end(false, "A note broke the loop", "音符不合，磁带中断");
      return;
    }
    index++;
    showPoints(
      (pattern.length - 1) * 100 + Math.round((index / pattern.length) * 100),
    );
    if (index === pattern.length) {
      if (pattern.length === 5)
        end(true, "All five loops restored", "五段旋律均已复原");
      else {
        newRound();
        draw();
      }
    } else
      hint(
        "Your turn · " + index + " / " + pattern.length,
        "请复现 · " + index + " / " + pattern.length,
      );
  }
  return {
    reset,
    draw,
    tick,
    cell,
    press(k) {
      if (/^[1-4]$/.test(k)) cell(Number(k) - 1);
    },
  };
}
