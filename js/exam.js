// Exam Mode: a plain, neutral testing screen with no theme and no feedback until you submit.
const Exam = (() => {
  const { esc, pct, answersOf, shuffle, domains, questionsIn } = Engine;
  const FORMATS = { short: { count: 10, minutes: 10 }, full: { count: 90, minutes: 90 } };

  let el;
  let handlers = {};
  let exam = null;
  let timer = null;
  let view = "start";

  function mount(root, h) {
    handlers = h;
    root.insertAdjacentHTML("beforeend", `<div class="exam" hidden></div>`);
    el = root.querySelector(":scope > .exam");
    el.addEventListener("click", onClick);
    el.addEventListener("change", onChange);
  }

  const inProgress = () => !!exam && !exam.submitted;

  function open() {
    el.hidden = false;
    if (!exam) view = "start";
    render();
  }

  function close() {
    el.hidden = true;
    if (exam && exam.submitted) exam = null;
    view = "start";
  }

  function begin(format) {
    const f = FORMATS[format];
    exam = {
      format, count: f.count, minutes: f.minutes,
      items: Engine.pickExam(f.count).map(q => ({ q, order: shuffle(q.choices.map((_, i) => i)), picked: [], flagged: false })),
      index: 0,
      startedAt: Date.now(),
      endAt: Date.now() + f.minutes * 60000,
      submitted: false,
    };
    view = "question";
    clearInterval(timer);
    timer = setInterval(tick, 500);
    render();
  }

  // ---------- timer ----------

  function remaining() { return Math.max(0, exam.endAt - Date.now()); }
  function fmt(ms) {
    const s = Math.ceil(ms / 1000);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    const mm = String(m).padStart(2, "0"), ss = String(sec).padStart(2, "0");
    return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  }
  function tick() {
    if (!inProgress()) return clearInterval(timer);
    const left = remaining();
    const t = el.querySelector(".x-time");
    if (t) {
      t.textContent = fmt(left);
      t.classList.toggle("low", left < 5 * 60000);
    }
    if (left <= 0) submit(true);
  }

  // ---------- rendering ----------

  function topBar(title) {
    const time = inProgress()
      ? `<span class="x-timer" role="timer" aria-live="off">Time remaining <span class="x-time">${fmt(remaining())}</span></span>`
      : `<button class="x-link" data-act="exit">Close</button>`;
    return `<div class="x-top"><span class="x-title">${esc(title)}</span>${time}</div>`;
  }

  function render() {
    if (view === "start") return renderStart();
    if (view === "question") return renderQuestion();
    if (view === "review") return renderReview();
    return renderResults();
  }

  function renderStart() {
    el.innerHTML = `
      ${topBar("Practice exam")}
      <main class="x-body">
        <h1 class="x-h1">Exam Mode</h1>
        <p class="x-p">Timed, with no feedback until you submit. Questions are drawn by each domain's share of the exam, with no repeats.</p>
        <div class="x-options">
          <button class="x-option" data-act="begin" data-format="short"><b>10 questions</b><span>10 minutes</span></button>
          <button class="x-option" data-act="begin" data-format="full"><b>Full exam: 90 questions</b><span>90 minutes</span></button>
        </div>
        <p class="x-small">The real Core 1 exam has up to 90 questions in 90 minutes, including performance-based questions this app doesn't simulate. CompTIA reports a scaled score from 100 to 900, and 675 passes, so the percentage here is only a rough guide.</p>
        <p class="x-small">For instant feedback, flip the board's MODE switch back to STUDY.</p>
      </main>`;
    el.scrollTop = 0;
    const first = el.querySelector(".x-option");
    if (first) first.focus({ preventScroll: true });
  }

  function renderQuestion() {
    const item = exam.items[exam.index];
    const { q, order } = item;
    const multi = answersOf(q).length > 1;
    const type = multi ? "checkbox" : "radio";
    const total = exam.items.length;
    const choices = order.map((orig, pos) => `
      <label class="x-choice ${item.picked.includes(orig) ? "on" : ""}">
        <input type="${type}" name="x-q" value="${orig}" ${item.picked.includes(orig) ? "checked" : ""}>
        <span>${String.fromCharCode(65 + pos)}. ${esc(q.choices[orig])}</span>
      </label>`).join("");

    el.innerHTML = `
      ${topBar("Practice exam")}
      <div class="x-sub">
        <span>Question ${exam.index + 1} of ${total}</span>
        <label class="x-flag"><input type="checkbox" data-act="flag" ${item.flagged ? "checked" : ""}> Flag for review</label>
      </div>
      <main class="x-body">
        <p class="x-q">${esc(q.question)}</p>
        ${multi ? `<p class="x-choose">Choose ${answersOf(q).length}.</p>` : ""}
        <fieldset class="x-choices"><legend class="sr-only">Answer choices</legend>${choices}</fieldset>
      </main>
      <div class="x-bottom three">
        <button class="x-btn" data-act="prev" ${exam.index === 0 ? "disabled" : ""}>Previous</button>
        <button class="x-btn" data-act="review">Review</button>
        <button class="x-btn primary" data-act="${exam.index === total - 1 ? "review" : "next"}">${exam.index === total - 1 ? "Finish" : "Next"}</button>
      </div>`;
    el.scrollTop = 0;
  }

  function renderReview() {
    const unanswered = exam.items.filter(i => !i.picked.length).length;
    const flagged = exam.items.filter(i => i.flagged).length;
    const cells = exam.items.map((it, i) => {
      const state = [it.picked.length ? "answered" : "unanswered", it.flagged ? "flagged" : ""].filter(Boolean);
      return `<button class="x-cell ${state.join(" ")}" data-act="goto" data-i="${i}" aria-label="Question ${i + 1}, ${state.join(", ")}">${i + 1}${it.flagged ? FLAG : ""}</button>`;
    }).join("");

    el.innerHTML = `
      ${topBar("Practice exam")}
      <main class="x-body">
        <h1 class="x-h1">Review your answers</h1>
        <p class="x-p">Select a question to return to it. You can change answers until you submit.</p>
        <div class="x-legend">
          <span><i class="lg answered"></i>Answered</span>
          <span><i class="lg unanswered"></i>Unanswered</span>
          <span>${FLAG}Flagged</span>
        </div>
        <div class="x-grid">${cells}</div>
        <div class="x-stack">
          <button class="x-btn" data-act="first-flagged" ${flagged ? "" : "disabled"}>Review flagged (${flagged})</button>
          <button class="x-btn" data-act="first-unanswered" ${unanswered ? "" : "disabled"}>Review unanswered (${unanswered})</button>
        </div>
      </main>
      <div class="x-bottom">
        ${unanswered ? `<p class="x-warn">${unanswered} question${unanswered > 1 ? "s are" : " is"} unanswered. Unanswered questions are scored as incorrect.</p>` : ""}
        <button class="x-btn primary" data-act="submit">Submit exam</button>
      </div>`;
    el.scrollTop = 0;
  }

  function renderResults() {
    const r = exam.result;
    const rows = domains.map(d => {
      const its = exam.items.filter(i => i.q.domainId === d.id);
      if (!its.length) return "";
      const ok = its.filter(i => i.correct).length;
      return `<tr><td>${esc(d.name)}</td><td>${ok}/${its.length}</td><td>${pct(ok, its.length)}%</td></tr>`;
    }).join("");
    const misses = exam.items.filter(i => !i.correct).map(({ q, picked }) => `
      <details class="x-miss">
        <summary>${esc(q.question)}</summary>
        <p><b>Your answer:</b> ${picked.length ? picked.map(i => esc(q.choices[i])).join(", ") : "Unanswered"}</p>
        <p><b>Correct:</b> ${answersOf(q).map(i => esc(q.choices[i])).join(", ")}</p>
        ${q.explanation ? `<p>${esc(q.explanation)}</p>` : ""}
      </details>`).join("");

    el.innerHTML = `
      ${topBar("Exam results")}
      <main class="x-body">
        ${r.timedOut ? `<p class="x-notice">Time ran out, so the exam was submitted automatically.</p>` : ""}
        <p class="x-score">${r.score} / ${r.total}<span>${pct(r.score, r.total)}%</span></p>
        <p class="x-p">Time used: ${fmt(r.used)}. CompTIA's 100–900 scaled score isn't a straight percentage, so treat this as a rough guide.</p>
        <table class="x-table"><thead><tr><th>Domain</th><th>Correct</th><th></th></tr></thead><tbody>${rows}</tbody></table>
        ${misses ? `<h2 class="x-h2">Missed questions</h2>${misses}` : ""}
      </main>
      <div class="x-bottom"><button class="x-btn primary" data-act="exit">Back to board</button></div>`;
    el.scrollTop = 0;
  }

  const FLAG = `<svg class="x-flag-icon" width="12" height="14" viewBox="0 0 14 16" aria-hidden="true"><path d="M2 1V15M2 2H12L9.5 5.5L12 9H2"></path></svg>`;

  // ---------- actions ----------

  function submit(timedOut = false) {
    if (!inProgress()) return;
    clearInterval(timer);
    let score = 0;
    exam.items.forEach(it => {
      const right = answersOf(it.q);
      it.correct = it.picked.length === right.length && right.every(a => it.picked.includes(a));
      if (it.correct) score += 1;
      if (it.picked.length) Store.recordAnswer(it.q.id, it.correct);
    });
    exam.submitted = true;
    exam.result = { score, total: exam.items.length, used: Math.min(Date.now(), exam.endAt) - exam.startedAt, timedOut };
    Store.recordSession({ mode: "exam", label: `Exam, ${exam.items.length} Q`, score, total: exam.items.length });
    view = "results";
    render();
    handlers.submitted(pct(score, exam.items.length));
  }

  function go(i) {
    exam.index = Math.max(0, Math.min(exam.items.length - 1, i));
    view = "question";
    render();
  }

  function onClick(e) {
    const btn = e.target.closest("[data-act]");
    if (!btn || btn.disabled || btn.tagName === "INPUT") return;
    const a = btn.dataset.act;
    if (a === "begin") begin(btn.dataset.format);
    else if (a === "exit") handlers.exit();
    else if (a === "prev") go(exam.index - 1);
    else if (a === "next") go(exam.index + 1);
    else if (a === "review") { view = "review"; render(); }
    else if (a === "goto") go(Number(btn.dataset.i));
    else if (a === "first-flagged") go(exam.items.findIndex(i => i.flagged));
    else if (a === "first-unanswered") go(exam.items.findIndex(i => !i.picked.length));
    else if (a === "submit") {
      const unanswered = exam.items.filter(i => !i.picked.length).length;
      if (confirm(unanswered ? `Submit with ${unanswered} unanswered? They'll count as incorrect.` : "Submit your exam?")) submit(false);
    }
  }

  function onChange(e) {
    if (!inProgress() || view !== "question") return;
    const item = exam.items[exam.index];
    if (e.target.dataset.act === "flag") { item.flagged = e.target.checked; return; }
    if (e.target.name === "x-q") {
      const v = Number(e.target.value);
      if (e.target.type === "radio") item.picked = [v];
      else item.picked = e.target.checked ? [...item.picked, v] : item.picked.filter(x => x !== v);
      el.querySelectorAll(".x-choice").forEach(l => l.classList.toggle("on", l.querySelector("input").checked));
    }
  }

  function onKey(e) {
    if (el.hidden || view !== "question" || !inProgress()) return false;
    const key = e.key.toUpperCase();
    const item = exam.items[exam.index];
    let n = -1;
    if (/^[A-E]$/.test(key)) n = key.charCodeAt(0) - 65;
    if (n >= 0 && n < item.order.length) {
      const input = el.querySelectorAll('input[name="x-q"]')[n];
      input.checked = input.type === "radio" ? true : !input.checked;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }
    if (e.key === "ArrowRight") { go(exam.index + 1); return true; }
    if (e.key === "ArrowLeft") { go(exam.index - 1); return true; }
    return false;
  }

  return {
    mount, open, close, inProgress, onKey,
    abandon() { clearInterval(timer); exam = null; view = "start"; },
    // for tests: the questions in the current exam
    _ids: () => (exam ? exam.items.map(i => i.q.id) : []),
  };
})();
