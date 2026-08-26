/* Clove health tracker concepts — shared behaviours (lite build).
   Just the drag-to-scroll from the full prototype's app.js: the page pans
   vertically and any carousel pans horizontally, like touch on a phone. */
(function () {
  var active = false, dragged = false;
  var lastX = 0, lastY = 0, vx = 0, vy = 0, lastT = 0;
  var travel = 0; // total movement, a tap with a little jitter is NOT a drag
  var DRAG_THRESHOLD = 7;
  var rail = null, flick = null;
  var RAILS = ".rail, .g3-cards";

  document.addEventListener("dragstart", function (e) { e.preventDefault(); });

  document.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    cancelAnimationFrame(flick);
    active = true; dragged = false; travel = 0;
    lastX = e.clientX; lastY = e.clientY; lastT = e.timeStamp;
    vx = 0; vy = 0;
    rail = e.target.closest(RAILS);
    if (rail) rail.classList.add("dragging");
  });

  document.addEventListener("pointermove", function (e) {
    if (!active) return;
    var dx = e.clientX - lastX, dy = e.clientY - lastY;
    var dt = Math.max(1, e.timeStamp - lastT);
    vx = 0.8 * vx + 0.2 * (dx / dt);
    vy = 0.8 * vy + 0.2 * (dy / dt);
    lastX = e.clientX; lastY = e.clientY; lastT = e.timeStamp;
    travel += Math.abs(dx) + Math.abs(dy);
    if (travel <= DRAG_THRESHOLD) return; // still a tap, leave the click alone
    dragged = true;
    if (rail) rail.scrollLeft -= dx;
    window.scrollBy(0, -dy);
  });

  function release() {
    if (!active) return;
    active = false;
    var r = rail;
    if (r) r.classList.remove("dragging");
    rail = null;
    if (!dragged) return; // taps do not glide
    var t = performance.now();
    function glide(now) {
      var dt = now - t; t = now;
      vx *= Math.pow(0.995, dt); vy *= Math.pow(0.995, dt);
      if (Math.abs(vx) < 0.02 && Math.abs(vy) < 0.02) return;
      if (r) r.scrollLeft -= vx * dt;
      window.scrollBy(0, -vy * dt);
      flick = requestAnimationFrame(glide);
    }
    flick = requestAnimationFrame(glide);
  }
  document.addEventListener("pointerup", release);
  document.addEventListener("pointercancel", release);

  // A drag should not register as a tap on whatever it started over.
  document.addEventListener("click", function (e) {
    if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; }
  }, true);
})();
