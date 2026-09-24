// The home screen: a motherboard seen from above (see CLAUDE.md, Design System).
// It's a menu: tap a part to fly into that domain's page. The design is a fixed
// 390 x 844 board, scaled to fit the screen.
const Board = (() => {
  const W = 390, H = 844, MAX_WIDTH = 480;
  const { PARTS, PART_ORDER, esc, stats, questionsIn } = Engine;
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let home, stage, fit, cam, dof, fade;
  let handlers = {};
  let flash = null;          // last run's score, briefly shown on the POST display
  let flashTimer = null;
  let busy = false;          // a transition is running
  let pulseTimer = null;
  let booting = false;
  let bootTimers = [];

  // ---------- seven-segment POST display ----------

  const SEG = {
    a: "M5 2 H23 L20 6 H8Z", b: "M24 3 V20 L21 18 V7Z", c: "M24 24 V41 L21 37 V26Z",
    d: "M5 42 H23 L20 38 H8Z", e: "M4 24 V41 L7 37 V26Z", f: "M4 3 V20 L7 18 V7Z",
    g: "M6 22 L8 20 H20 L22 22 L20 24 H8Z",
  };
  const GLYPH = {
    0: "abcdef", 1: "bc", 2: "abged", 3: "abgcd", 4: "fgbc", 5: "afgcd", 6: "afgedc",
    7: "abc", 8: "abcdefg", 9: "abcdfg", "-": "g", H: "fbgec", I: "bc",
    A: "abcefg", b: "cdefg", C: "adef", d: "bcdeg", E: "adefg", F: "aefg",
  };
  const digit = ch => `<svg width="28" height="44" viewBox="0 0 28 44" aria-hidden="true">${
    Object.keys(SEG).map(s => `<path d="${SEG[s]}" class="${(GLYPH[ch] || "").includes(s) ? "seg-on" : "seg-off"}"></path>`).join("")}</svg>`;
  const postText = v => (v === null || v === undefined ? "--" : v >= 100 ? "HI" : String(v).padStart(2, "0"));

  // ---------- part art (also reused, scaled up, on each part's page) ----------

  const ART = {
    net: { w: 184, h: 92, html: `
      <span class="io-shield"></span>
      <span class="rj45"><span class="rj45-mouth"></span><span class="rj45-tab"></span><span class="rj45-led l"></span><span class="rj45-led r"></span></span>
      <span class="usb" style="left:98px;top:14px"></span><span class="usb" style="left:98px;top:50px"></span>
      <span class="qc">QC<br>PASS</span>` },
    hw: { w: 224, h: 232, html: `
      <span class="lever"></span>
      <span class="socket"></span>
      <span class="load-plate"></span>
      <span class="ihs">
        <span class="etch-top"><span>X7K2-1201</span><svg width="8" height="8" viewBox="0 0 7 7" aria-hidden="true"><path d="M0 0 H7 L0 7Z"></path></svg></span>
        <span class="etch-title">HARDWARE</span>
        <span class="etch-sub">DOMAIN 3.0</span>
        <span class="etch-fine">LGA · 220-1201 · E1 · MADE FOR STUDY</span>
      </span>` },
    virt: { w: 76, h: 270, html: [0, 1, 2, 3].map(i => `
      <span class="dimm" style="left:${4 + i * 18}px">${i % 2 ? `<span class="stick"></span>` : `<span class="dimm-pins"></span>`}</span>`).join("") },
    ts: { w: 50, h: 186, html: `
      <span class="atx24">${"<span></span>".repeat(24)}</span>
      <span class="atx-latch"></span>` },
    mob: { w: 104, h: 100, html: `
      <span class="bat-holder"></span>
      <span class="bat-clip"></span>
      <span class="coin"><span class="coin-title">+ CR2032</span><span class="coin-sub">LITHIUM 3V</span></span>` },
  };

  // Where each part and its silkscreen label sit on the board (button box, art offset, label offset).
  const PLACE = {
    net:  { box: [0, 0, 184, 124],   art: [0, 0],   label: [16, 100], lines: ["2.0 NETWORKING"] },
    hw:   { box: [20, 130, 226, 262], art: [0, 2],   label: [14, 240], lines: ["3.0 HARDWARE"] },
    virt: { box: [252, 130, 80, 336], art: [2, 2],   label: [4, 280],  lines: ["4.0", "VIRT &", "CLOUD"] },
    ts:   { box: [326, 136, 64, 256], art: [8, 4],   label: [2, 200],  lines: ["5.0", "TROUBLE-", "SHOOTING"] },
    mob:  { box: [18, 436, 124, 140], art: [6, 4],   label: [6, 112],  lines: ["1.0 MOBILE"] },
  };

  function ledState(key, weakKey) {
    if (key === weakKey) return "fault";
    const s = stats(questionsIn(PARTS[key].domain));
    return s.total && s.mastered / s.total >= 0.7 ? "ok" : "";
  }

  function partButton(key, weakKey) {
    const p = PARTS[key], pl = PLACE[key], art = ART[key];
    const [x, y, w, h] = pl.box;
    const s = stats(questionsIn(p.domain));
    const state = ledState(key, weakKey);
    const status = s.accuracy === null ? "not started" : `accuracy ${s.accuracy} percent, ${s.mastered} of ${s.total} mastered`;
    return `<button class="part" data-part="${key}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"
        aria-label="${esc(p.name)}: ${status}${state === "fault" ? ", weakest domain" : ""}. Open">
      <span class="art" style="left:${pl.art[0]}px;top:${pl.art[1]}px;width:${art.w}px;height:${art.h}px">${art.html}</span>
      <span class="plabel" style="left:${pl.label[0]}px;top:${pl.label[1]}px"><span class="dbg-led ${state}" data-led="${key}"></span>${pl.lines.map(esc).join("<br>")}</span>
    </button>`;
  }

  // ---------- static texture ----------

  const DUST = (() => {
    let seed = 11;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    let out = "";
    for (let i = 0; i < 70; i++) {
      const fins = i < 22;
      const x = fins ? 202 + rnd() * 186 : rnd() * W;
      const y = fins ? rnd() * 82 : rnd() * H;
      const s = 0.6 + rnd() * 1.4;
      out += `<span style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;width:${s.toFixed(1)}px;height:${s.toFixed(1)}px;opacity:${(0.12 + rnd() * 0.22).toFixed(2)}"></span>`;
    }
    return out;
  })();

  // Copper buses in the free channels between parts. Light pulses run along these.
  const BUS = {
    net:  "M244 124 H26 L16 114 V100",
    hw:   "M10 640 V430 L20 420 H244",
    virt: "M250 420 V140 L260 130 H300",
    ts:   "M300 630 H380 L388 622 V120 L380 112 H360",
    mob:  "M150 588 V630 H30 L20 620 V580",
  };

  const PCB = `
  <svg class="pcb" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <defs>
      <filter id="soldermask" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"></feTurbulence>
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.055 0"></feColorMatrix>
      </filter>
      <radialGradient id="gold" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#e9d197"></stop><stop offset="1" stop-color="#a8864a"></stop></radialGradient>
    </defs>
    <rect width="${W}" height="${H}" filter="url(#soldermask)"></rect>
    <g class="traces">
      ${Object.values(BUS).map(d => `<path d="${d}"></path>`).join("")}
      <path d="M244 136 H252 M244 148 H252 M244 160 H252 M244 172 H252 M244 184 H252 M244 196 H252 M244 208 H252 M244 220 H252 M244 232 H252 M244 244 H252"></path>
      <path d="M100 92 V104 M120 92 V110 L128 118"></path>
      <path d="M226 630 V650 M330 630 V650"></path>
    </g>
    <g class="pulses">
      ${PART_ORDER.map(k => `<path data-bus="${k}" d="${BUS[k]}" pathLength="100"></path>`).join("")}
    </g>
    <g fill="url(#gold)">
      <circle cx="16" cy="100" r="2.6"></circle><circle cx="244" cy="124" r="2.6"></circle><circle cx="244" cy="420" r="2.6"></circle>
      <circle cx="10" cy="640" r="2.6"></circle><circle cx="300" cy="130" r="2.6"></circle><circle cx="360" cy="112" r="2.6"></circle>
      <circle cx="300" cy="630" r="2.6"></circle><circle cx="150" cy="588" r="2.6"></circle><circle cx="20" cy="580" r="2.6"></circle>
      <circle cx="128" cy="118" r="2.2"></circle><circle cx="226" cy="650" r="2.2"></circle><circle cx="330" cy="650" r="2.2"></circle>
    </g>
    <g fill="#0c0c0c">
      <circle cx="16" cy="100" r="1"></circle><circle cx="244" cy="124" r="1"></circle><circle cx="244" cy="420" r="1"></circle>
      <circle cx="10" cy="640" r="1"></circle><circle cx="300" cy="130" r="1"></circle><circle cx="360" cy="112" r="1"></circle>
    </g>
    <g fill="url(#gold)" stroke="#6f5a33" stroke-width=".6">
      <circle cx="372" cy="96" r="7.5"></circle><circle cx="372" cy="418" r="7.5"></circle><circle cx="20" cy="826" r="7.5"></circle><circle cx="372" cy="826" r="7.5"></circle>
    </g>
    <g fill="#060606"><circle cx="372" cy="96" r="4"></circle><circle cx="372" cy="418" r="4"></circle><circle cx="20" cy="826" r="4"></circle><circle cx="372" cy="826" r="4"></circle></g>
    <g class="refdes">
      <text x="58" y="128">CPU1</text><text x="262" y="126">DIMM_A1 A2 B1 B2</text><text x="334" y="132">ATXPWR1</text>
      <text x="112" y="440">BAT1</text><text x="24" y="646">Q_CODE</text><text x="244" y="560">C221</text><text x="190" y="612">U14</text>
    </g>
  </svg>`;

  function markup() {
    const settings = Store.settings();
    const weakId = Engine.weakestDomain();
    const weakKey = weakId ? Engine.partForDomain(weakId) : null;
    const overall = stats(Engine.allQuestions);
    const missed = Engine.allQuestions.filter(Engine.isMissed).length;
    const shown = flash !== null ? flash : overall.accuracy;
    const code = postText(shown);
    const days = Engine.daysUntil(settings.examDate);
    const [y, m, d] = settings.examDate.split("-").map(Number);
    const dateLabel = new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const countdown = days > 1 ? `${days} days` : days === 1 ? "tomorrow!" : days === 0 ? "exam day. Good luck!" : "done. Nice work";
    const exam = settings.examMode;

    return `
    ${PCB}

    <div class="heatsink-vrm" aria-hidden="true"><span class="screw" style="left:8px;top:36px"></span><span class="screw" style="right:8px;top:36px"></span></div>
    <label class="tape exam-tape">
      <span class="marker big">Core 1 · ${esc(dateLabel)}</span>
      <span class="marker small">${esc(countdown)}</span>
      <input class="tape-input" type="date" value="${esc(settings.examDate)}" aria-label="Exam date">
    </label>

    ${PART_ORDER.map(k => partButton(k, weakKey)).join("")}

    <div class="board-name" aria-hidden="true">
      <span class="silk name">A+ CORE 1</span>
      <span class="silk">220-1201 · REV 2.0</span>
      <span class="silk">${Engine.allQuestions.length} QUESTIONS</span>
    </div>
    <div class="heatsink-chipset" aria-hidden="true"><span class="pushpin" style="left:6px;top:6px"></span><span class="pushpin" style="right:6px;bottom:6px"></span></div>
    <div class="warranty" aria-hidden="true">WARRANTY<br>VOID IF<br>REMOVED<br>№ 0412</div>

    ${settings.hintSeen ? "" : `<div class="tape hint-tape" aria-hidden="true"><span class="marker">Tap a part to study it</span></div>`}
    ${QUIZ.problems.length ? `<button class="tape problem-tape" data-action="report" aria-label="${QUIZ.problems.length} question${QUIZ.problems.length > 1 ? "s" : ""} skipped because of a typo. Open POST report for details"><span class="marker">${QUIZ.problems.length} Q skipped: typo · see report</span></button>` : ""}

    <div class="controls">
      <button class="post" data-action="report" aria-label="Q-code display: ${shown === null ? "no score yet" : `score ${shown} percent`}. Open POST report">
        <span class="post-bezel ${flash !== null ? "flashing" : ""}">${digit(code[0])}${digit(code[1])}</span>
        <span class="silk small-label">${flash !== null ? "LAST RUN %" : "SCORE %"}</span>
      </button>
      <button class="tact-wrap" data-action="start" aria-label="PWR: ${exam ? "start a timed exam" : "start Quick 10"}">
        <span class="tact"><span class="cap pwr"></span></span>
        <span class="silk small-label center">PWR<br><span class="thin">${exam ? "START EXAM" : "QUICK 10"}</span></span>
      </button>
      <button class="tact-wrap" data-action="review" aria-label="RST: review ${missed} missed question${missed === 1 ? "" : "s"}" ${missed ? "" : "disabled"}>
        <span class="tact"><span class="cap rst"></span></span>
        <span class="silk small-label center">RST<br><span class="thin">REVIEW ${missed}</span></span>
      </button>
    </div>

    <div class="mode">
      <span class="silk b">MODE</span>
      <span class="silk">STUDY</span>
      <button class="slide" role="switch" aria-checked="${exam}" aria-label="Exam Mode" data-action="mode">
        <span class="slide-body"></span><span class="slide-knob ${exam ? "on" : ""}"></span>
      </button>
      <span class="silk">EXAM</span>
    </div>

    <div class="dust" aria-hidden="true">${DUST}</div>
    <div class="light" aria-hidden="true"></div>`;
  }

  // ---------- layout ----------

  function scale() {
    const byWidth = Math.min(window.innerWidth, MAX_WIDTH) / W;
    const byHeight = window.innerHeight / H;
    return Math.max(Math.min(byWidth, byHeight), Math.min(byWidth, 0.72));
  }

  function layout() {
    const s0 = scale();
    stage.style.width = `${W * s0}px`;
    stage.style.height = `${H * s0}px`;
    fit.style.transform = `scale(${s0})`;
  }

  // ---------- life: pulses along the copper, and the power-on sequence ----------

  function pulse(key) {
    const path = cam.querySelector(`.pulses [data-bus="${key}"]`);
    if (!path || reduced()) return;
    path.classList.remove("go");
    void path.getBoundingClientRect();
    path.classList.add("go");
  }

  function startIdle() {
    clearInterval(pulseTimer);
    if (reduced()) return;
    pulseTimer = setInterval(() => {
      if (home.hidden || busy || booting || document.hidden) return;
      const weakId = Engine.weakestDomain();
      const key = weakId && Math.random() < 0.6 ? Engine.partForDomain(weakId) : PART_ORDER[Math.floor(Math.random() * PART_ORDER.length)];
      pulse(key);
    }, 5200);
  }

  function setPost(text) {
    const bezel = cam.querySelector(".post-bezel");
    if (bezel) bezel.innerHTML = digit(text[0]) + digit(text[1]);
  }

  function boot() {
    let seen = false;
    try { seen = sessionStorage.getItem("aplusQuiz.booted") === "1"; sessionStorage.setItem("aplusQuiz.booted", "1"); } catch (e) { /* ignore */ }
    if (seen || reduced()) return;
    booting = true;
    stage.classList.add("booting");
    const codes = ["00", "19", "A2", "b4", "d5", "C1", "88"];
    codes.forEach((c, i) => bootTimers.push(setTimeout(() => setPost(c), i * 170)));
    PART_ORDER.forEach((k, i) => bootTimers.push(setTimeout(() => {
      const led = cam.querySelector(`[data-led="${k}"]`);
      if (led) led.classList.add("lamp");
      pulse(k);
    }, 260 + i * 190)));
    bootTimers.push(setTimeout(endBoot, 1600));
    home.addEventListener("pointerdown", endBoot, { once: true });
  }

  function endBoot() {
    if (!booting) return;
    booting = false;
    bootTimers.forEach(clearTimeout);
    bootTimers = [];
    stage.classList.remove("booting");
    refresh();
  }

  // ---------- transitions ----------

  // Fly the camera into a part, then resolve (the router shows the part page).
  function enterPart(key) {
    return new Promise(resolve => {
      const p = PARTS[key];
      if (!p || reduced()) return resolve();
      busy = true;
      const btn = cam.querySelector(`[data-part="${key}"]`);
      if (btn) btn.classList.add("pressed");
      pulse(key);
      setTimeout(() => {
        const S = 3.2;
        cam.classList.add("flying");
        cam.style.transform = `translate(${W / 2 - S * p.cx}px, ${H / 2 - S * p.cy}px) scale(${S})`;
        dof.classList.add("on", "all");
        fade.classList.add("on");
      }, 110);
      setTimeout(() => { busy = false; resolve(); }, 560);
    });
  }

  // Coming back from a part page: start zoomed on the part, then pull back.
  function exitPart(key) {
    const p = PARTS[key];
    if (!p || reduced()) return reset();
    const S = 3.2;
    cam.classList.add("no-anim");
    cam.style.transform = `translate(${W / 2 - S * p.cx}px, ${H / 2 - S * p.cy}px) scale(${S})`;
    dof.classList.add("on", "all", "no-anim");
    fade.classList.add("on", "no-anim");
    void cam.getBoundingClientRect();
    requestAnimationFrame(() => {
      cam.classList.remove("no-anim");
      dof.classList.remove("no-anim");
      fade.classList.remove("no-anim");
      cam.classList.add("flying");
      reset();
    });
  }

  function reset() {
    cam.style.transform = "translate(0px, 0px) scale(1)";
    dof.classList.remove("on", "all");
    fade.classList.remove("on");
    cam.querySelectorAll(".pressed").forEach(b => b.classList.remove("pressed"));
    setTimeout(() => cam.classList.remove("flying"), 700);
  }

  // ---------- events ----------

  function onClick(e) {
    if (busy) return;
    if (booting) endBoot();
    const part = e.target.closest("[data-part]");
    if (part) return handlers.part(part.dataset.part);
    const act = e.target.closest("[data-action]");
    if (!act || act.disabled) return;
    const a = act.dataset.action;
    if (a === "start") handlers.start();
    else if (a === "review") handlers.review();
    else if (a === "report") handlers.report();
    else if (a === "mode") {
      Store.setSetting("examMode", !Store.settings().examMode);
      refresh();
    }
  }

  function onChange(e) {
    if (e.target.classList.contains("tape-input") && e.target.value) {
      Store.setSetting("examDate", e.target.value);
      refresh();
    }
  }

  function onTapeClick(e) {
    const input = e.target.closest(".exam-tape") && cam.querySelector(".tape-input");
    if (input && typeof input.showPicker === "function") {
      try { input.showPicker(); e.preventDefault(); } catch (err) { /* the picker opens natively */ }
    }
  }

  // ---------- public ----------

  function mount(root, h) {
    handlers = h;
    root.insertAdjacentHTML("beforeend", `
      <div id="home" class="home">
        <div class="stage"><div class="fit"><div class="cam"></div></div></div>
      </div>
      <div class="dof" aria-hidden="true"></div>
      <div class="fade" aria-hidden="true"></div>`);
    home = root.querySelector("#home");
    stage = home.querySelector(".stage");
    fit = home.querySelector(".fit");
    cam = home.querySelector(".cam");
    dof = root.querySelector(":scope > .dof");
    fade = root.querySelector(":scope > .fade");
    stage.addEventListener("click", onClick);
    stage.addEventListener("click", onTapeClick, true);
    stage.addEventListener("change", onChange);
    window.addEventListener("resize", layout);
    refresh();
    layout();
    startIdle();
  }

  function refresh() {
    if (booting) return;
    cam.innerHTML = markup();
  }

  return {
    mount, refresh, boot, enterPart, exitPart,
    reset,
    art: key => ART[key],
    flashScore(value) {
      flash = value;
      refresh();
      clearTimeout(flashTimer);
      flashTimer = setTimeout(() => { flash = null; refresh(); }, 4000);
    },
    clearFlash() {
      clearTimeout(flashTimer);
      flash = null;
    },
    markHintSeen() {
      if (!Store.settings().hintSeen) { Store.setSetting("hintSeen", true); refresh(); }
    },
    show(visible) {
      home.hidden = !visible;
      if (!visible) { dof.classList.remove("on", "all"); fade.classList.remove("on"); }
    },
    get busy() { return busy; },
  };
})();
