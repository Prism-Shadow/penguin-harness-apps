// The original game already has windowed mouse input. Use it when a browser
// denies pointer lock (including embedded or file-opened games), with working
// pause and resume controls for returning to the original settings screen.
(() => {
  let windowed;
  function enterWindowed(game) {
    windowed = game;
    game.qs.set("nolock", "1");
    game.locked = true;
  }
  window.penguinDeckPointer = async (game) => {
    if (game.touchMode || game.qs.has("nolock")) {
      game.locked = true;
      return;
    }
    const canvas = document.getElementById("c");
    if (document.pointerLockElement === canvas) return;
    try {
      await canvas.requestPointerLock({ unadjustedMovement: true });
    } catch (error) {
      if (error.name === "NotSupportedError") {
        try { await canvas.requestPointerLock(); return; } catch { /* Use windowed input. */ }
      }
      enterWindowed(game);
    }
  };
  function pauseWindowed() {
    if (windowed?.playing && !windowed.paused && !windowed.ended && !windowed.inLoadout) {
      windowed.locked = false;
      windowed.pause();
    }
  }
  window.addEventListener("keydown", (event) => {
    if (event.code === "Escape" && !event.repeat) pauseWindowed();
  });
  window.addEventListener("blur", pauseWindowed);
})();
