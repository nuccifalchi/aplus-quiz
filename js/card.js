// Paper that lies on the board: the inspection card (study questions), the
// inspection report (results), and the POST report receipt (stats).
const Card = (() => {
  const { esc, pct, answersOf, shuffle, PARTS, PART_ORDER, OBJECTIVES, stats, questionsIn } = Engine;

  let sheet;
  let handlers = {};
  let session = null;   // study session in progress
  let view = null;      // "card" | "report" | "receipt"

  const TICK = `<svg class="tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12.5 C5 14 7 16.5 9 18.8 C12 13 15.5 8 20.5 3.8"></path></svg>`;
  const CROSS = `<svg class="tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5 C9 9 14 14 19.5 19.5 M19 4.5 C14 9.5 10 14 4.5 19.5"></path></svg>`;
  const CIRCLE = `<svg class="pencil-circle" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path d="M7 21 C4 9 38 3 60 4 C84 5 99 12 96 23 C93 35 58 39 38 37 C17 35 4 29 9 16"></path></svg>`;

  function mount(root, h) {
    handlers = h;
    root.insertAdjacentHTML("beforeend", `<div class="sheet" hidden></div>`);
    sheet = root.querySelector(":scope > .sheet");
    sheet.addEventListener("click", onClick);
  }

  function show(html, focusSel) {
    sheet.hidden = false;
    sheet.innerHTML = html;
    sheet.scrollTop = 0;
    const el = focusSel && sheet.querySelector(focusSel);
    if (el) el.focus({ preventScroll: true });
  }

  function close() {
    view = null;
    sheet.hidden = true;
    sheet.innerHTML = "";
  }

  // ---------- study session ----------

  function start(mode, questions, label) {
    if (!questions.length) return false;
    session = {
      mode, label,
      items: shuffle(questions).map(q => ({ q, order: shuffle(q.choices.map((_, i) => i)), picked: [], done: false, correct: false })),
      index: 0,
      finished: false,
    };
    return true;
  }

  const hasSession = () => !!session;
  const current = () => session && session.items[session.index];

  function renderCard() {
    if (!session) return;
    if (session.finished) return renderReport();
    view = "card";
    const item = current();
    const { q, order } = item;
    const right = answersOf(q);
    const multi = right.length > 1;
    const total = session.items.length;
    const last = session.index === total - 1;
    const obj = q.objective ? ` · OBJ ${q.objective} ${OBJECTIVES[q.objective] ? "· " + OBJECTIVES[q.objective] : ""}` : "";

    const boxes = session.items.map((it, i) => {
      const cls = it.done ? (it.correct ? "done" : "done miss") : i === session.index ? "now" : "";
      return `<span class="${cls}">${it.done && !it.correct ? CROSS : ""}</span>`;
    }).join("");

    const choices = order.map((orig, pos) => {
      const picked = item.picked.includes(orig);
      const isRight = right.includes(orig);
      const circled = item.done && isRight && !item.correct;
      const state = item.done ? (isRight ? "right" : picked ? "wrong" : "other") : picked ? "picked" : "";
      return `<li><button class="choice ${state}" data-orig="${orig}" ${item.done ? "disabled" : ""} aria-pressed="${picked}">
        <span class="box">${picked ? TICK : ""}</span>
        <span class="letter">${String.fromCharCode(65 + pos)}</span>
        <span class="text">${esc(q.choices[orig])}${circled ? CIRCLE : ""}</span>
      </button></li>`;
    }).join("");

    let tab;
    if (item.done) tab = `<button class="tab" data-act="next">${last ? "See report ›" : "Next card ›"}</button>`;
    else if (multi) tab = `<button class="tab" data-act="check" ${item.picked.length ? "" : "disabled"}>Check ›</button>`;
    else tab = `<span class="tab-note">Tap an answer to check it</span>`;

    show(`
      <article class="paper card" aria-label="Inspection card ${session.index + 1} of ${total}">
        <header class="card-head">
          <button class="back" data-act="exit">‹ Board</button>
          <span class="kind">Inspection card</span>
          <span class="no">No. ${String(session.index + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}</span>
        </header>
        <div class="meta">${esc(q.domainName.toUpperCase())}${esc(obj.toUpperCase())}</div>
        <div class="boxes" aria-hidden="true">${boxes}</div>
        <div class="q-wrap">
          <h2 class="question">${esc(q.question)}</h2>
          ${multi ? `<p class="hint">Choose ${right.length}.</p>` : ""}
          ${item.done ? `<div class="stamp ${item.correct ? "pass" : "fail"}" role="status">${item.correct ? "Pass" : "Fail"}</div>` : ""}
        </div>
        <ol class="choices">${choices}</ol>
        ${item.done && q.explanation ? `<p class="note"><b>Note</b> ${esc(q.explanation)}</p>` : ""}
        <div class="tearoff">${tab}</div>
      </article>`, item.done ? '[data-act="next"]' : null);
  }

  function pick(orig) {
    const item = current();
    if (!item || item.done) return;
    const need = answersOf(item.q).length;
    if (need === 1) {
      item.picked = [orig];
      return check();
    }
    item.picked = item.picked.includes(orig)
      ? item.picked.filter(x => x !== orig)
      : [...item.picked, orig].slice(-need);
    renderCard();
  }

  function check() {
    const item = current();
    if (!item || item.done || !item.picked.length) return;
    const right = answersOf(item.q);
    item.correct = right.length === item.picked.length && right.every(a => item.picked.includes(a));
    item.done = true;
    Store.recordAnswer(item.q.id, item.correct);
    if (!item.correct) handlers.missed(Engine.partForDomain(item.q.domainId));
    renderCard();
  }

  function next() {
    if (!session) return;
    if (session.index < session.items.length - 1) {
      session.index += 1;
      handlers.focusDomain(current().q.domainId);
      renderCard();
    } else {
      finish();
    }
  }

  function finish() {
    const score = session.items.filter(i => i.correct).length;
    const total = session.items.length;
    Store.recordSession({ mode: session.mode, label: session.label, score, total });
    session.finished = true;
    handlers.finished(pct(score, total));
    renderReport();
  }

  // ---------- inspection report ----------

  function renderReport() {
    view = "report";
    const items = session.items;
    const score = items.filter(i => i.correct).length;
    const total = items.length;
    const misses = items.filter(i => !i.correct);
    const list = misses.map(({ q, picked }) => `
      <li>
        <p class="rq">${esc(q.question)}</p>
        <p class="yours">You: ${picked.map(i => esc(q.choices[i])).join(", ") || "—"}</p>
        <p class="answer"><span>Answer: ${answersOf(q).map(i => esc(q.choices[i])).join(", ")}</span></p>
        ${q.explanation ? `<p class="why">${esc(q.explanation)}</p>` : ""}
      </li>`).join("");

    show(`
      <article class="paper card report" aria-label="Inspection report">
        <header class="card-head">
          <button class="back" data-act="exit">‹ Board</button>
          <span class="kind">Inspection report</span>
          <span class="no">${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
        </header>
        <div class="meta">${esc(session.label.toUpperCase())}</div>
        <div class="score-row">
          <div class="stamp score" role="status" aria-label="Score ${score} of ${total}">${score}/${total}</div>
          <p class="score-pct">${pct(score, total)}%<span>${score === total ? "Clean run. Every card passed." : `${misses.length} card${misses.length > 1 ? "s" : ""} to review below.`}</span></p>
        </div>
        ${misses.length ? `<h3 class="section">Failed cards</h3><ol class="misses">${list}</ol>` : ""}
        <div class="tearoff two">
          ${misses.length ? `<button class="tab" data-act="retry">Retry ${misses.length} missed ›</button>` : ""}
          <button class="tab ${misses.length ? "quiet" : ""}" data-act="exit">Back to board</button>
        </div>
      </article>`, '[data-act="retry"], [data-act="exit"]');
  }

  // ---------- POST report receipt ----------

  function renderReceipt() {
    view = "receipt";
    const all = stats(Engine.allQuestions);
    const data = Store.get();
    const settings = Store.settings();
    const days = Engine.daysUntil(settings.examDate);
    const weakId = Engine.weakestDomain();
    const line = "- - - - - - - - - - - - - - - - - - - -";

    const domainsTxt = PART_ORDER.map(key => {
      const p = PARTS[key];
      const s = stats(questionsIn(p.domain));
      const lit = Math.round((10 * s.mastered) / s.total);
      const bar = "▮".repeat(lit) + "▯".repeat(10 - lit);
      const weak = p.domain === weakId;
      return `<li>
        <span class="r-row"><b>${esc(p.name)}</b></span>
        <span class="r-row"><span>ACC ${s.accuracy === null ? "--" : s.accuracy + "%"} · MAST ${s.mastered}/${s.total}</span><span aria-hidden="true">${bar}</span></span>
        ${weak ? `<span class="r-row weak">&lt;&lt; WEAKEST. START HERE</span>` : ""}
      </li>`;
    }).join("");

    const runs = data.sessions.slice(-8).reverse().map(s => `
      <li class="r-row"><span>${new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${esc((s.label || s.mode).toUpperCase())}</span><span>${s.score}/${s.total}</span></li>`).join("");

    show(`
      <article class="receipt" aria-label="POST report">
        <p class="r-title">POST REPORT</p>
        <p class="r-center">A+ CORE 1 · 220-1201<br>${new Date().toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
        <p class="r-rule" aria-hidden="true">${line}</p>
        <p class="r-row"><span>OVERALL ACCURACY</span><b>${all.accuracy === null ? "--" : all.accuracy + "%"}</b></p>
        <p class="r-row"><span>ANSWERS LOGGED</span><b>${all.seen}</b></p>
        <p class="r-row"><span>MASTERED</span><b>${all.mastered}/${all.total}</b></p>
        <p class="r-row"><span>RUNS</span><b>${data.sessions.length}</b></p>
        <p class="r-row"><span>EXAM DATE</span><b>${days >= 0 ? `${days} DAY${days === 1 ? "" : "S"}` : "PAST"}</b></p>
        <p class="r-rule" aria-hidden="true">${line}</p>
        <p class="r-head">BY DOMAIN</p>
        <ul class="r-list">${domainsTxt}</ul>
        ${runs ? `<p class="r-rule" aria-hidden="true">${line}</p><p class="r-head">RECENT RUNS</p><ul class="r-list">${runs}</ul>` : ""}
        <p class="r-rule" aria-hidden="true">${line}</p>
        ${QUIZ.problems.length ? `<p class="r-head">SKIPPED: FIX IN questions/</p><ul class="r-list">${QUIZ.problems.map(x => `<li>${esc(x)}</li>`).join("")}</ul><p class="r-rule" aria-hidden="true">${line}</p>` : ""}
        <p class="r-center small">MASTERED = RIGHT THE LAST TIME YOU SAW IT</p>
        <div class="r-actions">
          <button class="tab" data-act="exit">Back to board</button>
          <button class="tab quiet danger" data-act="reset">Reset all progress</button>
        </div>
      </article>`, '[data-act="exit"]');
  }

  // ---------- input ----------

  function onClick(e) {
    const choice = e.target.closest(".choice");
    if (choice && !choice.disabled) return pick(Number(choice.dataset.orig));
    const act = e.target.closest("[data-act]");
    if (!act || act.disabled) return;
    const a = act.dataset.act;
    if (a === "next") next();
    else if (a === "check") check();
    else if (a === "exit") handlers.exit();
    else if (a === "retry") {
      const misses = session.items.filter(i => !i.correct).map(i => i.q);
      start("retry", misses, "Retry missed");
      handlers.restart();
    } else if (a === "reset") {
      if (confirm("Erase all scores and missed questions on this device? Your exam date stays. This can't be undone.")) {
        Store.reset();
        handlers.exit();
      }
    }
  }

  function onKey(e) {
    if (view !== "card" || !session) return false;
    const item = current();
    if (!item) return false;
    const key = e.key.toUpperCase();
    let n = -1;
    if (/^[A-E]$/.test(key)) n = key.charCodeAt(0) - 65;
    else if (/^[1-5]$/.test(key)) n = Number(key) - 1;
    if (n >= 0 && !item.done && n < item.order.length) { pick(item.order[n]); return true; }
    if (e.key === "Enter" && !item.done && answersOf(item.q).length > 1) { check(); return true; }
    return false;
  }

  return {
    mount, start, hasSession, renderCard, renderReceipt, onKey, close,
    currentDomain: () => (current() ? current().q.domainId : null),
    endSession() { session = null; },
    get view() { return view; },
  };
})();
