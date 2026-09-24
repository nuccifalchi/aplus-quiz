// A part's own page: a macro close-up of the part on the board, then a paper
// datasheet listing the domain's objectives. Pick one to start its questions.
const Part = (() => {
  const { PARTS, esc, stats, questionsIn, objectivesIn, questionsForObjective, shuffle } = Engine;

  // Close-up framing: how much to magnify each part in the hero.
  const ZOOM = { net: 1.8, hw: 1.08, virt: 0.88, ts: 1.25, mob: 2 };
  const HERO_H = 250;

  let el;
  let handlers = {};
  let key = null;

  function mount(root, h) {
    handlers = h;
    root.insertAdjacentHTML("beforeend", `<div class="partpage" hidden></div>`);
    el = root.querySelector(":scope > .partpage");
    el.addEventListener("click", onClick);
  }

  function bar(mastered, total) {
    const lit = total ? Math.round((10 * mastered) / total) : 0;
    return Array.from({ length: 10 }, (_, i) => `<span class="${i < lit ? "on" : ""}"></span>`).join("");
  }

  function open(k) {
    key = k;
    const p = PARTS[k];
    const d = Engine.domainById(p.domain);
    const art = Board.art(k);
    const z = ZOOM[k];
    const s = stats(questionsIn(p.domain));
    const missed = questionsIn(p.domain).filter(Engine.isMissed).length;
    const weakId = Engine.weakestDomain();
    const weakObj = (Engine.weakestObjective(p.domain) || "").split(" ")[0];
    const ledClass = weakId === p.domain ? "fault" : s.total && s.mastered / s.total >= 0.7 ? "ok" : "";

    const rows = objectivesIn(p.domain).map(o => {
      if (!o.total) {
        return `<li><div class="obj empty"><span class="obj-id">${esc(o.id)}</span><span class="obj-main"><span class="obj-name">${esc(o.name)}</span><span class="obj-meta">No questions yet</span></span></div></li>`;
      }
      const meta = o.accuracy === null
        ? `${o.total} question${o.total > 1 ? "s" : ""} · new`
        : `${o.mastered}/${o.total} mastered · ${o.accuracy}%`;
      return `<li><button class="obj" data-obj="${esc(o.id)}" aria-label="${esc(o.id)} ${esc(o.name)}: ${esc(meta)}${o.id === weakObj ? ", weakest" : ""}. Start">
        <span class="obj-id">${esc(o.id)}</span>
        <span class="obj-main">
          <span class="obj-name">${esc(o.name)}${o.id === weakObj ? ` <span class="obj-tag">Weakest</span>` : ""}</span>
          <span class="obj-meta"><span class="obj-bar" aria-hidden="true">${bar(o.mastered, o.total)}</span><span>${esc(meta)}</span></span>
        </span>
        <span class="obj-go" aria-hidden="true">›</span>
      </button></li>`;
    }).join("");

    el.hidden = false;
    el.innerHTML = `
      <section class="hero" style="height:${HERO_H}px" aria-label="${esc(p.name)} close-up">
        <svg class="hero-pcb" width="100%" height="100%" aria-hidden="true">
          <defs><filter id="heromask" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"></feTurbulence><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0"></feColorMatrix></filter></defs>
          <rect width="100%" height="100%" filter="url(#heromask)"></rect>
          <g class="traces"><path d="M0 40 H60 L74 54 V90"></path><path d="M0 210 H40 L56 194 H90"></path></g>
          <g class="traces" transform="translate(300 0)"><path d="M90 30 H40 L28 42 V120"></path><path d="M90 200 H30 L18 212 V250"></path></g>
        </svg>
        <div class="hero-art" style="width:${art.w}px;height:${art.h}px;transform:translate(-50%, -50%) scale(${z})">${art.html}</div>
        <div class="hero-light" aria-hidden="true"></div>
        <button class="hero-back" data-act="back">‹ Board</button>
      </section>
      <div class="hero-meta">
        <p class="hero-ref"><span class="dbg-led ${ledClass}"></span>${esc(p.ref)} · DEBUG LED ${esc(p.led)}</p>
        <h1 class="hero-title">${esc(d.name)}</h1>
        <p class="hero-stats">
          <span><b>${d.weight}%</b> of exam</span>
          <span><b>${s.accuracy === null ? "--" : s.accuracy + "%"}</b> accuracy</span>
          <span><b>${s.mastered}/${s.total}</b> mastered</span>
        </p>
      </div>
      <article class="paper datasheet" aria-label="${esc(d.name)} datasheet">
        <header class="card-head">
          <span class="kind">Datasheet · ${esc(p.ref)}</span>
          <span class="no">${esc(p.domain)}</span>
        </header>
        <div class="ds-actions">
          <button class="tab" data-act="all">Practice all ${esc(p.domain)} ›</button>
          <button class="tab quiet" data-act="missed" ${missed ? "" : "disabled"}>Review missed in ${esc(p.domain)} (${missed})</button>
        </div>
        <h2 class="section">Objectives</h2>
        <ol class="objs">${rows}</ol>
        <p class="ds-foot">Mastered = right the last time you saw it.</p>
      </article>`;
    el.scrollTop = 0;
  }

  function close() {
    el.hidden = true;
    el.innerHTML = "";
    key = null;
  }

  function onClick(e) {
    const btn = e.target.closest("[data-act], [data-obj]");
    if (!btn || btn.disabled || !key) return;
    const p = PARTS[key];
    const d = Engine.domainById(p.domain);
    if (btn.dataset.obj) {
      const id = btn.dataset.obj;
      handlers.study("objective", shuffle(questionsForObjective(id)).slice(0, 10), `${id} ${Engine.OBJECTIVES[id] || ""}`.trim());
    } else if (btn.dataset.act === "back") handlers.back();
    else if (btn.dataset.act === "all") handlers.study("domain", Engine.pickFrom(questionsIn(p.domain), 10), `Practice: ${d.name}`);
    else if (btn.dataset.act === "missed") handlers.study("missed", questionsIn(p.domain).filter(Engine.isMissed), `Review missed: ${d.name}`);
  }

  return { mount, open, close, get key() { return key; } };
})();
