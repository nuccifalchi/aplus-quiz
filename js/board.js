// The home screen: a motherboard seen from above (see CLAUDE.md, Design System).
// Board coordinates are a fixed 390 x 960 design, scaled to the screen width.
const Board = (() => {
  const W = 390, H = 960, MAX_WIDTH = 480;
  const { PARTS, PART_ORDER, esc, stats, questionsIn } = Engine;
  const POST = { cx: 60, cy: 330, zoom: 2.4, focus: 70 };

  let home, stage, fit, cam, dof;
  let handlers = {};
  let focus = null;       // part key, "post", or null
  let blurAll = false;    // true while a card or receipt lies on the board
  let flash = null;       // run score briefly shown on the POST display

  // ---------- seven-segment POST display ----------

  const SEG = {
    a: "M5 2 H23 L20 6 H8Z", b: "M24 3 V20 L21 18 V7Z", c: "M24 24 V41 L21 37 V26Z",
    d: "M5 42 H23 L20 38 H8Z", e: "M4 24 V41 L7 37 V26Z", f: "M4 3 V20 L7 18 V7Z",
    g: "M6 22 L8 20 H20 L22 22 L20 24 H8Z",
  };
  const GLYPH = {
    0: "abcdef", 1: "bc", 2: "abged", 3: "abgcd", 4: "fgbc", 5: "afgcd", 6: "afgedc",
    7: "abc", 8: "abcdefg", 9: "abcdfg", "-": "g", H: "fbgec", I: "bc",
  };
  function digit(ch) {
    const on = GLYPH[ch] || "";
    const paths = Object.keys(SEG).map(s =>
      `<path d="${SEG[s]}" class="${on.includes(s) ? "seg-on" : "seg-off"}"></path>`).join("");
    return `<svg width="28" height="44" viewBox="0 0 28 44" aria-hidden="true">${paths}</svg>`;
  }
  function postText(value) {
    if (value === null || value === undefined) return "--";
    if (value >= 100) return "HI";
    return String(value).padStart(2, "0");
  }

  // ---------- static texture ----------

  function dust() {
    let seed = 11;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    let out = "";
    for (let i = 0; i < 80; i++) {
      const fins = i < 24;
      const x = fins ? 192 + rnd() * 196 : rnd() * W;
      const y = fins ? rnd() * 72 : rnd() * H;
      const s = 0.6 + rnd() * 1.4;
      out += `<span style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;width:${s.toFixed(1)}px;height:${s.toFixed(1)}px;opacity:${(0.12 + rnd() * 0.22).toFixed(2)}"></span>`;
    }
    return out;
  }
  const DUST = dust();

  const BASE_SVG = `
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
      <path d="M54 122 H68 M54 170 H68 M54 218 H68"></path>
      <path d="M112 78 V86 L118 92 M128 78 V90 M144 78 V86 L150 92"></path>
      <path d="M248 128 H256 M248 140 H256 M248 152 H256 M248 164 H256 M248 176 H256 M248 188 H256 M248 200 H256 M248 212 H256 M248 224 H256 M248 236 H256 M248 248 H256 M248 260 H256"></path>
      <path d="M150 280 V290 M214 280 V288 L220 294"></path>
      <path d="M318 92 V80 L326 72 H340"></path>
      <path d="M364 276 H372 L382 286 V486 M382 756 V790 L374 798"></path>
      <path d="M6 300 V486 M6 756 V800 L12 806"></path>
      <path d="M300 772 H318 L326 764"></path>
      <path d="M106 846 H116 M106 870 H116 M262 846 H272 M262 876 H272"></path>
      <path d="M100 930 H118 M200 930 H270 L278 922"></path>
    </g>
    <g fill="url(#gold)">
      <circle cx="118" cy="92" r="2.4"></circle><circle cx="150" cy="92" r="2.4"></circle><circle cx="220" cy="294" r="2.4"></circle>
      <circle cx="340" cy="72" r="2.4"></circle><circle cx="382" cy="486" r="2.4"></circle><circle cx="374" cy="798" r="2.4"></circle>
      <circle cx="6" cy="300" r="2.4"></circle><circle cx="12" cy="806" r="2.4"></circle><circle cx="326" cy="764" r="2.4"></circle>
      <circle cx="278" cy="922" r="2.4"></circle>
    </g>
    <g fill="#0c0c0c">
      <circle cx="118" cy="92" r=".9"></circle><circle cx="150" cy="92" r=".9"></circle><circle cx="220" cy="294" r=".9"></circle>
      <circle cx="340" cy="72" r=".9"></circle><circle cx="382" cy="486" r=".9"></circle><circle cx="374" cy="798" r=".9"></circle>
    </g>
    <g fill="url(#gold)" stroke="#6f5a33" stroke-width=".6">
      <circle cx="374" cy="88" r="7.5"></circle><circle cx="372" cy="784" r="7.5"></circle><circle cx="232" cy="946" r="7.5"></circle>
    </g>
    <g fill="#060606"><circle cx="374" cy="88" r="4"></circle><circle cx="372" cy="784" r="4"></circle><circle cx="232" cy="946" r="4"></circle></g>
    <g class="silk-lines">
      <rect x="10" y="100" width="48" height="140" rx="2"></rect>
      <rect x="12" y="492" width="366" height="262" rx="3"></rect>
      <circle cx="60" cy="858" r="42"></circle>
    </g>
    <g class="refdes">
      <text x="14" y="250">PHASE1</text><text x="256" y="87">DIMM</text>
      <text x="326" y="104">ATXPWR1</text><text x="16" y="762">PCIEX16_1</text><text x="104" y="818">BAT1</text>
      <text x="124" y="896">F_PANEL</text><text x="282" y="908">SATA6G_1  SATA6G_2</text>
      <text x="232" y="802">C221</text><text x="336" y="770">R47</text><text x="206" y="884">U14</text>
    </g>
  </svg>`;

  // ---------- live pieces ----------

  function partStats(key) {
    const p = PARTS[key];
    const s = stats(questionsIn(p.domain));
    const weak = Engine.weakestObjective(p.domain);
    return {
      s,
      lines: [
        s.accuracy === null ? "NOT STARTED YET" : `ACCURACY ${s.accuracy}% · ${s.total} Q`,
        `${s.mastered} OF ${s.total} MASTERED`,
        weak ? `WEAK: ${weak.toUpperCase()}` : (s.accuracy === null ? "WEAK: —" : "NO WEAK SPOTS"),
      ],
    };
  }

  function fine(key, extraClass = "") {
    const { lines } = partStats(key);
    return `<span class="fine ${extraClass}">
      <b>${esc(PARTS[key].name)}</b>
      ${lines.map(l => `<span>${esc(l)}</span>`).join("")}
      <span class="fine-cta">PRESS PART TO PRACTICE ›</span>
      <span>TAP OUTSIDE TO ZOOM OUT</span>
    </span>`;
  }

  function ledRows(weakKey) {
    return PART_ORDER.map(key => {
      const p = PARTS[key];
      const s = stats(questionsIn(p.domain));
      const lit = Math.round((10 * s.mastered) / s.total);
      const weak = key === weakKey;
      const segs = Array.from({ length: 10 }, (_, i) => `<span class="${i < lit ? "on" : ""}"></span>`).join("");
      const accText = s.accuracy === null ? "not started" : `accuracy ${s.accuracy} percent`;
      return `<button class="led-row" data-zoom="${key}" aria-label="${esc(p.name)}: ${s.mastered} of ${s.total} mastered, ${accText}${weak ? ", weakest domain" : ""}. Zoom in">
        <span class="dbg-led ${weak ? "fault" : ""}" data-led="${key}"></span>
        <span class="led-code">${p.led}</span>
        <span class="led-name">${esc(p.name)}</span>
        <span class="led-bar" aria-hidden="true">${segs}</span>
      </button>`;
    }).join("");
  }

  function tape(settings) {
    const days = Engine.daysUntil(settings.examDate);
    const [y, m, d] = settings.examDate.split("-").map(Number);
    const label = new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const sub = days > 1 ? `${days} days` : days === 1 ? "tomorrow!" : days === 0 ? "exam day. Good luck!" : "done. Nice work";
    return `<label class="tape exam-tape">
      <span class="marker big">Core 1 · ${esc(label)}</span>
      <span class="marker small">${esc(sub)}</span>
      <input class="tape-input" type="date" value="${esc(settings.examDate)}" aria-label="Exam date">
    </label>`;
  }

  function markup() {
    const settings = Store.settings();
    const weakId = Engine.weakestDomain();
    const weakKey = weakId ? Engine.partForDomain(weakId) : null;
    const overall = stats(Engine.allQuestions);
    const missed = Engine.allQuestions.filter(Engine.isMissed).length;
    const shown = flash !== null ? flash : overall.accuracy;
    const code = postText(shown);
    const pins = Array.from({ length: 24 }, () => "<span></span>").join("");
    const fpins = Array.from({ length: 10 }, (_, i) => `<span class="${i === 7 ? "empty" : ""}"></span>`).join("");

    return `
    ${BASE_SVG}

    <button class="part" data-zoom="net" data-part="net" aria-label="2.0 Networking. Zoom in" style="left:0;top:0;width:180px;height:80px">
      <span class="io-shield"></span>
      <span class="rj45"><span class="rj45-mouth"></span><span class="rj45-tab"></span></span>
      <span class="refdes-html" style="left:26px;top:52px">LAN1</span>
      <span class="sticker" style="left:92px;top:8px;width:78px">${fine("net", "on-paper")}</span>
    </button>
    <span class="silk label" style="left:16px;top:81px">NETWORKING</span>

    <div class="heatsink-vrm" aria-hidden="true"><span class="screw" style="left:8px;top:30px"></span><span class="screw" style="right:8px;top:30px"></span></div>
    ${tape(settings)}

    <div class="chokes" aria-hidden="true"><span>R22</span><span>R22</span><span>R22</span></div>

    <button class="part" data-zoom="hw" data-part="hw" aria-label="3.0 Hardware. Zoom in" style="left:56px;top:94px;width:196px;height:186px">
      <span class="lever"></span>
      <span class="socket"></span>
      <span class="load-plate"></span>
      <span class="ihs">
        <span class="etch-top"><span>X7K2-1201</span><svg width="7" height="7" viewBox="0 0 7 7" aria-hidden="true"><path d="M0 0 H7 L0 7Z"></path></svg></span>
        <span class="etch-title">HARDWARE</span>
        <span class="etch-sub">DOMAIN 3.0</span>
        ${fine("hw", "etched")}
      </span>
    </button>

    <button class="part" data-zoom="virt" data-part="virt" aria-label="4.0 Virtualization and Cloud Computing. Zoom in" style="left:250px;top:88px;width:92px;height:400px">
      <span class="dimm" style="left:6px"><span class="dimm-pins"></span></span>
      <span class="dimm" style="left:22px"><span class="stick"></span></span>
      <span class="dimm" style="left:38px"><span class="dimm-pins"></span></span>
      <span class="dimm" style="left:54px"><span class="stick"></span></span>
      <span class="silk label" style="left:2px;top:308px">VIRT &amp; CLOUD</span>
      <span style="position:absolute;left:2px;top:326px;width:88px">${fine("virt")}</span>
    </button>

    <button class="part" data-zoom="ts" data-part="ts" aria-label="5.0 Troubleshooting. Zoom in" style="left:320px;top:104px;width:70px;height:300px">
      <span class="atx24">${pins}</span>
      <span class="atx-latch"></span>
      <span class="silk label" style="left:2px;top:180px;line-height:1.15">TROUBLE-<br>SHOOTING</span>
      <span style="position:absolute;left:2px;top:212px;width:66px">${fine("ts")}</span>
    </button>

    <div class="controls">
      <button class="post" data-action="report" aria-label="Q-code display: ${shown === null ? "no score yet" : `score ${shown} percent`}. Open POST report">
        <span class="post-bezel ${flash !== null ? "flashing" : ""}">${digit(code[0])}${digit(code[1])}</span>
        <span class="silk small-label">Q-CODE<br>${flash !== null ? "LAST RUN %" : "SCORE %"}</span>
      </button>
      <button class="tact-wrap" data-action="start" aria-label="PWR: ${settings.examMode ? "start a timed exam" : "start Quick 10"}">
        <span class="tact"><span class="cap pwr"></span></span>
        <span class="silk small-label center">PWR<br><span class="thin">START</span></span>
      </button>
      <button class="tact-wrap" data-action="review" aria-label="RST: review ${missed} missed question${missed === 1 ? "" : "s"}" ${missed ? "" : "disabled"}>
        <span class="tact"><span class="cap rst"></span></span>
        <span class="silk small-label center">RST<br><span class="thin">REVIEW ${missed}</span></span>
      </button>
    </div>

    <div class="mode">
      <span class="silk b">MODE</span>
      <span class="silk">STUDY</span>
      <button class="slide" role="switch" aria-checked="${settings.examMode}" aria-label="Exam Mode" data-action="mode">
        <span class="slide-body"></span><span class="slide-knob ${settings.examMode ? "on" : ""}"></span>
      </button>
      <span class="silk">EXAM</span>
    </div>
    <div class="silk mode-caption">STUDY: QUICK 10 WITH FEEDBACK<br>EXAM: TIMED, FEEDBACK AT THE END</div>

    <div class="led-bank">
      <div class="led-head"><span>DEBUG LED</span><span>MASTERY</span></div>
      ${ledRows(weakKey)}
    </div>

    <div class="pcie" aria-hidden="true"><span class="pcie-pins" style="left:6px;width:48px"></span><span class="pcie-pins" style="left:62px;width:214px"></span><span class="pcie-latch"></span></div>
    ${settings.hintSeen ? "" : `<div class="tape hint-tape" aria-hidden="true"><span class="marker">Tap a part to study it · PWR = start</span></div>`}

    <button class="part" data-zoom="mob" data-part="mob" aria-label="1.0 Mobile Devices. Zoom in" style="left:14px;top:812px;width:92px;height:92px">
      <span class="bat-holder"></span>
      <span class="bat-clip"></span>
      <span class="coin">
        <span class="coin-title">+ CR2032</span>
        <span class="coin-sub">LITHIUM 3V</span>
        ${fine("mob", "on-coin")}
      </span>
    </button>
    <span class="silk label" style="left:22px;top:908px">MOBILE</span>

    <div class="board-name" aria-hidden="true">
      <span class="silk name">A+ CORE 1</span>
      <span class="silk">220-1201 · REV 1.0</span>
      <span class="silk">${Engine.allQuestions.length} QUESTIONS</span>
    </div>

    <div class="heatsink-chipset" aria-hidden="true"><span class="pushpin" style="left:6px;top:6px"></span><span class="pushpin" style="right:6px;bottom:6px"></span></div>
    <div class="warranty" aria-hidden="true">WARRANTY<br>VOID IF<br>REMOVED<br>№ 0412</div>
    <div class="fpanel" aria-hidden="true">${fpins}</div>
    <div class="sata" aria-hidden="true"><span></span><span></span></div>

    ${QUIZ.problems.length ? `<button class="tape problem-tape" data-action="report" aria-label="${QUIZ.problems.length} question${QUIZ.problems.length > 1 ? "s" : ""} skipped because of a typo. Open POST report for details"><span class="marker">${QUIZ.problems.length} Q skipped: typo · see report</span></button>` : ""}

    <div class="dust" aria-hidden="true">${DUST}</div>
    <div class="light" aria-hidden="true"></div>`;
  }

  // ---------- camera ----------

  function fitScale() {
    return Math.min(window.innerWidth, MAX_WIDTH) / W;
  }

  function layout() {
    const s0 = fitScale();
    stage.style.width = `${W * s0}px`;
    stage.style.height = `${H * s0}px`;
    fit.style.transform = `scale(${s0})`;
    applyCamera(false);
  }

  function applyCamera(animate = true) {
    const s0 = fitScale();
    const vw = window.innerWidth, vh = window.innerHeight;
    const offX = (vw - W * s0) / 2;
    const target = focus === "post" ? POST : focus ? PARTS[focus] : null;
    cam.classList.toggle("no-anim", !animate);
    home.classList.toggle("zoomed", !!focus);
    home.style.overflowY = focus ? "hidden" : "auto";
    if (!target) {
      cam.style.transform = "translate(0px, 0px) scale(1)";
      dof.classList.remove("on", "all");
      return;
    }
    const S = target.zoom;
    const st = home.scrollTop;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const tx = clamp((vw / 2 - offX) / s0 - S * target.cx, W - W * S, 0);
    const minTy = (st + vh) / s0 - S * H, maxTy = st / s0;
    const ty = clamp((vh * 0.42 + st) / s0 - S * target.cy, Math.min(minTy, maxTy), maxTy);
    cam.style.transform = `translate(${tx}px, ${ty}px) scale(${S})`;
    const fx = offX + s0 * (tx + S * target.cx);
    const fy = s0 * (ty + S * target.cy) - st;
    const r = target.focus * S * s0;
    const mask = blurAll ? "none" : `radial-gradient(circle at ${fx}px ${fy}px, transparent ${r}px, #000 ${r + 150}px)`;
    dof.style.webkitMaskImage = mask;
    dof.style.maskImage = mask;
    dof.classList.add("on");
    dof.classList.toggle("all", blurAll);
  }

  // ---------- events ----------

  function onClick(e) {
    if (focus && !blurAll) {
      e.preventDefault();
      // While zoomed, parts don't take taps directly (a disabled button would swallow
      // the tap), so decide by position. Keyboard clicks (detail 0) use the target.
      const part = focus !== "post" && cam.querySelector(`[data-part="${focus}"]`);
      let inPart = false;
      if (part && e.detail === 0) inPart = !!e.target.closest(`[data-part="${focus}"]`);
      else if (part) {
        const r = part.getBoundingClientRect();
        inPart = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      }
      if (inPart) handlers.practice(focus);
      else handlers.zoomOut();
      return;
    }
    if (blurAll) return;
    const zoom = e.target.closest("[data-zoom]");
    if (zoom) return handlers.zoom(zoom.dataset.zoom);
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
    const input = e.target.closest(".exam-tape") && fit.querySelector(".tape-input");
    if (input && !focus && typeof input.showPicker === "function") {
      try { input.showPicker(); e.preventDefault(); } catch (err) { /* picker opens natively */ }
    }
  }

  // ---------- public ----------

  function mount(root, h) {
    handlers = h;
    root.insertAdjacentHTML("beforeend", `
      <div id="home" class="home">
        <div class="stage"><div class="fit"><div class="cam"></div></div></div>
      </div>
      <div class="dof" aria-hidden="true"></div>`);
    home = root.querySelector("#home");
    stage = home.querySelector(".stage");
    fit = home.querySelector(".fit");
    cam = home.querySelector(".cam");
    dof = root.querySelector(":scope > .dof");
    stage.addEventListener("click", onClick);
    stage.addEventListener("click", onTapeClick, true);
    stage.addEventListener("change", onChange);
    window.addEventListener("resize", layout);
    refresh();
    layout();
  }

  function refresh() {
    const t = cam.style.transform;
    cam.innerHTML = markup();
    cam.style.transform = t;
  }

  return {
    mount,
    refresh,
    zoom(key, opts = {}) {
      focus = key;
      blurAll = !!opts.blurAll;
      applyCamera(true);
    },
    get focus() { return focus; },
    flashScore(value) {
      flash = value;
      refresh();
      setTimeout(() => { flash = null; refresh(); }, 4000);
    },
    pulseLed(key) {
      const led = cam.querySelector(`[data-led="${key}"]`);
      if (!led) return;
      led.classList.remove("pulse");
      void led.offsetWidth;
      led.classList.add("pulse");
    },
    markHintSeen() {
      if (!Store.settings().hintSeen) { Store.setSetting("hintSeen", true); refresh(); }
    },
    show(visible) { home.hidden = !visible; if (!visible) dof.classList.remove("on", "all"); },
  };
})();
