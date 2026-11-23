export default function makeGame({
  renderGrid,
  showPoints,
  hint,
  end,
  cursor,
  shuffle,
}) {
  let board, empty, moves;
  const solved = () => board.every((v, i) => v === (i + 1) % 9);
  const adjacent = (i) =>
    ["L", "U", "D", "R"].map((k) => cursor(i, k, 3, 3)).filter((j) => j !== i);
  function reset() {
    board = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    empty = 8;
    let previous = -1;
    for (let i = 0; i < 14 || solved(); i++) {
      const j = shuffle(adjacent(empty).filter((x) => x !== previous))[0];
      [board[empty], board[j]] = [board[j], board[empty]];
      previous = empty;
      empty = j;
    }
    moves = 0;
    hint("45 moves to arrange 1–8", "45 步内排好 1–8");
  }
  function cell(i) {
    if (!adjacent(empty).includes(i)) return;
    [board[empty], board[i]] = [board[i], board[empty]];
    empty = i;
    moves++;
    showPoints(board.filter((v, j) => v && v === j + 1).length * 10);
    hint("Moves left: " + (45 - moves), "剩余步数：" + (45 - moves));
    if (solved()) end(true, "All cars in order", "车厢归位");
    else if (moves >= 45) end(false, "The shift is over", "调车时间已到");
    draw();
  }
  function press(k) {
    cell(cursor(empty, k, 3, 3));
  }
  function draw() {
    renderGrid(
      3,
      3,
      board.map((v, i) => ({
        v: v ? String(v) : "·",
        t: !v ? "dim" : v === i + 1 ? "bright" : "warm",
      })),
    );
  }
  return { reset, press, cell, draw };
}
