export default function makeGame({ renderGrid, showPoints, hint, end }) {
  let board, score, moves;
  const n = 4;
  function reset() {
    board = Array(16).fill(0);
    board[4] = 2;
    board[5] = 2;
    score = moves = 0;
    hint("Forge 32 · 50 moves", "铸造 32 · 最多 50 步");
  }
  function line(values) {
    const packed = values.filter(Boolean),
      out = [];
    let earned = 0;
    for (let i = 0; i < packed.length; i++) {
      if (packed[i] === packed[i + 1]) {
        out.push(packed[i] * 2);
        earned += packed[i] * 2;
        i++;
      } else out.push(packed[i]);
    }
    while (out.length < n) out.push(0);
    return { out, earned };
  }
  function press(k) {
    if (!"LRUD".includes(k)) return;
    const next = board.slice();
    let gain = 0;
    for (let i = 0; i < n; i++) {
      const ids = Array.from({ length: n }, (_, j) =>
        k === "L"
          ? i * n + j
          : k === "R"
            ? i * n + n - 1 - j
            : k === "U"
              ? j * n + i
              : (n - 1 - j) * n + i,
      );
      const row = line(ids.map((v) => board[v]));
      gain += row.earned;
      ids.forEach((v, j) => {
        next[v] = row.out[j];
      });
    }
    if (next.every((v, i) => v === board[i])) return;
    board = next;
    score += gain;
    showPoints(score);
    moves++;
    if (board.includes(32)) {
      end(true, "The 32 tile is forged", "铸成了 32 号块");
      return;
    }
    const empty = board.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);
    if (empty.length)
      board[empty[Math.floor(Math.random() * empty.length)]] =
        Math.random() < 0.16 ? 4 : 2;
    hint("Moves left: " + (50 - moves), "剩余步数：" + (50 - moves));
    const stuck = board.every(
      (v, i) =>
        v &&
        (!(i % 4 < 3) || v !== board[i + 1]) &&
        (i >= 12 || v !== board[i + 4]),
    );
    if (moves >= 50 || stuck) end(false, "The foundry is full", "本轮铸造结束");
  }
  function draw() {
    renderGrid(
      4,
      4,
      board.map((v) => ({
        v: v ? String(v) : "",
        t: v >= 8 ? "warm" : v ? "bright" : "dim",
      })),
    );
  }
  return { reset, press, draw };
}
