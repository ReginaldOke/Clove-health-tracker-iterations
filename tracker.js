/* Shared core for the three health-tracker concepts: the goal dressing
   (META), the per-goal week of dinner slots (localStorage), the recipe
   picker modal, the goal sheet and the week chart. Each concept page owns
   only its rendering; state is shared, so dinners you tick in one concept
   are still ticked in the next. */
(function () {
  var G = window.CloveGoals;
  var R = "assets/img/recipes/";
  var TOTAL = 5;

  var META = {
    Iron: {
      flavor: "iron-rich",
      prov: "Added from your voice note",
      recipes: [
        { t: "Short rib in red wine", img: R + "short-ribs.webp", time: "3 hrs" },
        { t: "Sunday beef stew", img: R + "beef-stew.webp", time: "2 hrs 30" },
        { t: "Braised greens & lemon", img: R + "greens.webp", time: "40 min" },
        { t: "Beans in olive oil", img: R + "white-beans.webp", time: "20 min" },
      ],
      slots: [
        { img: R + "kale-caesar.webp", t: "Kale Caesar salad", done: true },
        { img: R + "greens.webp", t: "Braised greens & lemon", done: true },
        null, null, null,
      ],
    },
    Protein: {
      flavor: "high-protein",
      prov: "Added from your TikTok import",
      recipes: [
        { t: "Short rib in red wine", img: R + "short-ribs.webp", time: "3 hrs" },
        { t: "Chicken bake", img: R + "chicken-bake.webp", time: "45 min" },
        { t: "Drumsticks", img: R + "drumsticks.webp", time: "50 min" },
        { t: "Roast chicken", img: R + "roast-chicken.webp", time: "1 hr 20" },
      ],
      slots: [
        { img: R + "roast-chicken.webp", t: "Roast chicken", done: true },
        { img: R + "kale-caesar.webp", t: "Kale Caesar salad", done: true },
        { img: R + "white-beans.webp", t: "Beans in olive oil", done: true },
        null, null,
      ],
    },
    Energy: {
      flavor: "energising",
      prov: "Suggested by Clove",
      recipes: [
        { t: "Crispy rice bowl", img: R + "rice-bowl.webp", time: "30 min" },
        { t: "Charred broccoli", img: R + "charred-broccoli.webp", time: "35 min" },
        { t: "Lettuce cups", img: R + "lettuce-cups.webp", time: "15 min" },
        { t: "Weeknight stir fry", img: R + "stirfry.webp", time: "20 min" },
      ],
      slots: [
        { img: R + "grain-bowl.webp", t: "Grain bowl", done: true },
        { img: R + "stirfry.webp", t: "Weeknight stir fry", done: true },
        { img: R + "cauliflower-bowl.webp", t: "Cauliflower bowl", done: true },
        { img: R + "fish-tomato.webp", t: "Fish in tomato", done: true },
        null,
      ],
    },
  };
  function metaFor(label) {
    return META[label] || {
      flavor: label.toLowerCase() + "-friendly",
      prov: "Set from your kitchen profile",
      recipes: META.Iron.recipes,
      slots: [null, null, null, null, null],
    };
  }

  /* ---- per-goal dinner slots, shared by all three concepts ---- */
  var SKEY = "cloveGoals2V2";
  var state = (function () {
    try { var s = JSON.parse(localStorage.getItem(SKEY) || "null"); if (s && s.goals) return s; } catch (e) {}
    return { goals: {} };
  })();
  function slotsFor(label) {
    if (!state.goals[label]) state.goals[label] = metaFor(label).slots.map(function (s) { return s && Object.assign({}, s); });
    return state.goals[label];
  }
  function saveState() { localStorage.setItem(SKEY, JSON.stringify(state)); }
  function doneCount(label) { return slotsFor(label).filter(function (s) { return s && s.done; }).length; }
  /* dinners, not milligrams: each ticked dinner is worth ~19% of the ring */
  function pctFor(label) { return Math.min(0.96, 0.19 * doneCount(label)); }
  function slides() {
    return G.rings().map(function (r) {
      return { label: r.label, pct: pctFor(r.label), color: r.color, track: r.track, ring: r };
    });
  }

  var T = window.Tracker = {
    TOTAL: TOTAL,
    META: META,
    metaFor: metaFor,
    slotsFor: slotsFor,
    saveState: saveState,
    doneCount: doneCount,
    pctFor: pctFor,
    slides: slides,
    LIVE_PLAN: "https://reginaldoke.github.io/Reg-Clove-Design-Challenge/plan.html?ask=1",
    /* pages assign this: () => the goal the page is showing right now */
    cur: function () { return slides()[0]; },
    onAdd: null, /* pages assign: function (slotIndex) {} */
  };

  /* a finished week gets one quiet celebration per goal per visit */
  T.maybeCelebrate = function (label) {
    if (doneCount(label) < TOTAL) return false;
    var k = "c-celebrated-" + label;
    if (sessionStorage.getItem(k)) return true;
    sessionStorage.setItem(k, "1");
    setTimeout(function () {
      CloveMemory.toast("Health goal: " + label + " week complete", "", { goal: true });
    }, 600);
    return true;
  };

  /* ---- recipe picker modal (CardRecipe, Figma 28275:52775) ---- */
  var modal = document.getElementById("g2Modal");
  T.openModal = function () {
    var s = T.cur(), m = metaFor(s.label), slots = slotsFor(s.label);
    var f = m.flavor;
    document.getElementById("g2ModalH").textContent = f.charAt(0).toUpperCase() + f.slice(1) + " dinners";
    document.getElementById("g2Rgrid").innerHTML = m.recipes.map(function (r, i) {
      var added = slots.some(function (x) { return x && x.t === r.t; });
      return '<button class="g2-rcard' + (added ? " added" : "") + '" data-i="' + i + '" style="--d:' + (i * 60) + 'ms">' +
        '<span class="g2-rcard__img"><img src="' + r.img + '" alt="" />' +
        '<span class="g2-rcard__time' + (added ? " in" : "") + '">' + (added ? "In your week ✓" : r.time) + "</span></span>" +
        '<span class="g2-rcard__t">' + r.t + "</span>" +
        '<span class="g2-rcard__src"><span class="g2-rcard__ava"><img src="assets/icons/clove-kale.svg" alt="" /></span>Clove kitchen</span></button>';
    }).join("");
    modal.hidden = false;
    void modal.offsetWidth;
    modal.classList.add("show");
  };
  T.closeModal = function () {
    modal.classList.remove("show");
    setTimeout(function () { modal.hidden = true; }, 480);
  };
  document.getElementById("g2ModalScrim").addEventListener("click", T.closeModal);
  document.getElementById("g2Rgrid").addEventListener("click", function (e) {
    var btn = e.target.closest(".g2-rcard");
    if (!btn || btn.classList.contains("added")) return;
    var s = T.cur(), slots = slotsFor(s.label);
    var r = metaFor(s.label).recipes[Number(btn.dataset.i)];
    var free = slots.indexOf(null);
    if (free === -1) return;
    slots[free] = { img: r.img, t: r.t, done: false };
    saveState();
    T.closeModal();
    if (T.onAdd) T.onAdd(free);
    setTimeout(function () {
      CloveMemory.toast("Added to your week: " + r.t, "Tick it off once you cook it", { goal: true });
    }, 420);
  });

  /* ---- goal sheet ("What are you working on?") ---- */
  var sheet = document.getElementById("glSheet");
  T.bindSheet = function (render) {
    function openSheet() {
      var opts = document.getElementById("glOpts");
      opts.innerHTML = G.OPTIONS.map(function (o) {
        var have = G.has(o.id);
        return '<button class="gl-opt' + (have ? " have" : "") + '" data-id="' + o.id + '"' + (have ? " disabled" : "") + '><span class="e">' + o.emoji + '</span><span class="l">' + o.label + "</span>" +
          (have ? '<span class="have-tag">Already tracking</span>' : '<span class="s">' + o.sub + "</span>") + "</button>";
      }).join("");
      sheet.hidden = false;
      void sheet.offsetWidth;
      sheet.classList.add("show");
      opts.querySelectorAll(".gl-opt:not(.have)").forEach(function (b) {
        b.addEventListener("click", function () {
          b.classList.add("on");
          var id = b.dataset.id;
          setTimeout(function () {
            closeSheet();
            G.add(id);
            var g = G.LIB[id];
            setTimeout(function () {
              render(true);
              CloveMemory.toast(g.toast, "Added to your health goals · Clove will cook toward it", { goal: true });
            }, 380);
          }, 260);
        });
      });
    }
    function closeSheet() {
      sheet.classList.remove("show");
      setTimeout(function () { sheet.hidden = true; }, 480);
    }
    document.getElementById("glScrim").addEventListener("click", closeSheet);
    document.getElementById("glEdit").addEventListener("click", openSheet);
  };

  /* ---- pink nudge → the meal-planning flow in the full prototype ---- */
  T.bindNudge = function () {
    document.getElementById("glPlan").addEventListener("click", function () {
      window.open(T.LIVE_PLAN, "_blank");
    });
  };

  /* ---- week chart (concepts 1 and 2), dinner-driven ---- */
  T.drawWeek = function (s) {
    var r = s.ring;
    var svg = document.getElementById("glChart");
    if (!svg) return;
    var goalN = r.goalN || parseFloat(String(r.goal).replace(/[^\d.]/g, "")) || 1;
    var nowN = goalN * s.pct;
    var unit = r.unit || String(r.goal).replace(/[\d.,\s]/g, "");
    var weekPct = [0.31, 0.35, 0.28, 0, 0, 0, 0];
    var W = Math.round(svg.clientWidth) || 320, H = Math.round(svg.clientHeight) || 84, PAD = 8, run = 0, cum = [];
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    weekPct.forEach(function (p, i) { run += i === 3 ? nowN : p * goalN; cum.push(run); });
    var weekGoal = goalN * 7;
    var x = function (i) { return (i / 6) * W; };
    var y = function (v) { return H - PAD - Math.min(1, v / weekGoal) * (H - PAD * 2); };
    var pts = [{ x: 0, y: H - PAD }].concat(cum.slice(0, 4).map(function (v, i) { return { x: x(i), y: y(v) }; }));
    var d = pts.map(function (p, i) {
      if (!i) return "M" + p.x.toFixed(1) + " " + p.y.toFixed(1);
      var q = pts[i - 1], cx = (q.x + p.x) / 2;
      return "C" + cx.toFixed(1) + " " + q.y.toFixed(1) + " " + cx.toFixed(1) + " " + p.y.toFixed(1) + " " + p.x.toFixed(1) + " " + p.y.toFixed(1);
    }).join(" ");
    var last = pts[pts.length - 1];
    var lg = (G.GRADS[r.color] || [r.color, r.color]);
    lg = [lg[0], lg[1]];
    svg.innerHTML =
      '<defs><linearGradient id="cum" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + lg[1] + '" stop-opacity="0.26"/><stop offset="100%" stop-color="' + lg[1] + '" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="lineG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="' + lg[0] + '"/><stop offset="100%" stop-color="' + lg[1] + '"/></linearGradient></defs>' +
      '<line x1="0" y1="8" x2="' + W + '" y2="8" stroke="#e6e2d6" stroke-width="1.5" stroke-dasharray="3 5"/>' +
      '<path d="M0 ' + (H - PAD) + " L" + W + " " + PAD + '" fill="none" stroke="#ddd9cb" stroke-width="1.5" stroke-dasharray="4 5" stroke-linecap="round"/>' +
      '<path d="' + d + " L" + last.x.toFixed(1) + " " + (H - PAD) + ' L0 ' + (H - PAD) + ' Z" fill="url(#cum)"/>' +
      '<path class="gl-line" d="' + d + '" fill="none" stroke="url(#lineG)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="' + last.x.toFixed(1) + '" cy="' + last.y.toFixed(1) + '" r="9" fill="' + lg[1] + '" opacity="0.16"/>' +
      '<circle cx="' + last.x.toFixed(1) + '" cy="' + last.y.toFixed(1) + '" r="4.5" fill="' + lg[1] + '" stroke="#fff" stroke-width="2.5"/>';
    var fmt = function (n) { return (Math.round(n * 10) / 10).toLocaleString(); };
    document.getElementById("glWeekTot").textContent = fmt(cum[3]) + unit;
    document.getElementById("glWeekGoal").textContent = fmt(weekGoal) + unit;
    document.getElementById("g2WeekLbl").textContent = r.label + " this week";
    var line = svg.querySelector(".gl-line");
    var len = line.getTotalLength();
    line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
    line.getBoundingClientRect();
    line.style.transition = "stroke-dashoffset 1.1s cubic-bezier(.35,.9,.35,1) .15s";
    line.style.strokeDashoffset = 0;
  };

  // the tracker is never empty
  if (!G.primary()) G.add("iron");
})();
