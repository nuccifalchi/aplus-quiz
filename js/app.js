// A+ Core 1 quiz: screens, quiz engine, and stats.
(() => {
  const QUICK_COUNT = 10;
  const app = document.getElementById("app");
  const domains = QUIZ.domains.slice().sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  const allQuestions = domains.flatMap(d => d.questions.map(q => ({ ...q, domainId: d.id, domainName: d.name })));
  const byId = new Map(allQuestions.map(q => [q.id, q]));

  let quiz = null; // the session in progress

  // ---------- helpers ----------

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
  const answersOf = q => (Array.isArray(q.answer) ? q.answer : [q.answer]);

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function isMissed(q) {
    const s = Store.question(q.id);
    return !!s && s.lastCorrect === false;
  }

  function domainStats(questions) {
    let seen = 0, correct = 0, mastered = 0, attempted = 0;
    questions.forEach(q => {
      const s = Store.question(q.id);
      if (!s) return;
      attempted += 1;
      seen += s.seen;
      correct += s.correct;
      if (s.lastCorrect) mastered += 1;
    });
    return { seen, correct, mastered, attempted, total: questions.length };
  }

  function render(html, focusSel) {
    app.innerHTML = html;
    window.scrollTo(0, 0);
    const el = focusSel && app.querySelector(focusSel);
    if (el) el.focus({ preventScroll: true });
  }

  // ---------- picking questions ----------

  // Quick 10: spread across domains by exam weight, favouring missed and
  // never-seen questions so short sessions go where they help most.
  function pickQuick() {
    const pool = allQuestions.map(q => {
      const d = domains.find(x => x.id === q.domainId);
      const s = Store.question(q.id);
      const priority = !s ? 2 : s.lastCorrect ? 1 : 3;
      return { q, w: (d.weight / d.questions.length) * priority };
    });
    const picked = [];
    while (picked.length < QUICK_COUNT && pool.length) {
      const total = pool.reduce((sum, p) => sum + p.w, 0);
      let r = Math.random() * total;
      let i = 0;
      while (i < pool.length - 1 && (r -= pool[i].w) > 0) i++;
      picked.push(pool.splice(i, 1)[0].q);
    }
    return picked;
  }

  // ---------- quiz engine ----------

  function startQuiz(mode, questions, label) {
    if (!questions.length) return showHome();
    quiz = {
      mode, label,
      items: shuffle(questions).map(q => {
        const order = shuffle(q.choices.map((_, i) => i)); // shuffled position -> original index
        return { q, order, picked: [], done: false, correct: false };
      }),
      index: 0,
    };
    showQuestion();
  }

  function showQuestion() {
    const item = quiz.items[quiz.index];
    const { q, order } = item;
    const multi = answersOf(q).length > 1;
    const total = quiz.items.length;
    const right = answersOf(q);

    const choices = order.map((orig, pos) => {
      let cls = "choice";
      let mark = "";
      if (item.done) {
        if (right.includes(orig)) { cls += " is-right"; mark = "✓"; }
        else if (item.picked.includes(orig)) { cls += " is-wrong"; mark = "✕"; }
        else cls += " is-dim";
      } else if (item.picked.includes(orig)) {
        cls += " is-picked";
      }
      return `<button class="${cls}" data-orig="${orig}" ${item.done ? "disabled" : ""}
          aria-pressed="${item.picked.includes(orig)}">
        <span class="choice-key">${String.fromCharCode(65 + pos)}</span>
        <span class="choice-text">${esc(q.choices[orig])}</span>
        <span class="choice-mark" aria-hidden="true">${mark}</span>
      </button>`;
    }).join("");

    const feedback = item.done ? `
      <div class="feedback ${item.correct ? "good" : "bad"}" role="status">
        <strong>${item.correct ? "Correct!" : "Not quite."}</strong>
        ${q.explanation ? `<p>${esc(q.explanation)}</p>` : ""}
      </div>` : "";

    const last = quiz.index === total - 1;
    let action;
    if (item.done) action = `<button class="btn primary" id="next">${last ? "See results" : "Next question"}</button>`;
    else if (multi) action = `<button class="btn primary" id="submit" ${item.picked.length ? "" : "disabled"}>Check answer</button>`;
    else action = "";

    render(`
      <div class="quiz-top">
        <button class="icon-btn" id="quit" aria-label="Quit to home">✕</button>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${quiz.index + 1}">
          <div class="progress-fill" style="width:${pct(quiz.index + (item.done ? 1 : 0), total)}%"></div>
        </div>
        <span class="progress-count">${quiz.index + 1}/${total}</span>
      </div>
      <p class="eyebrow">${esc(q.domainName)}${q.objective ? ` · Obj ${esc(q.objective)}` : ""}</p>
      <h2 class="question">${esc(q.question)}</h2>
      ${multi ? `<p class="hint">Choose ${right.length}.</p>` : ""}
      <div class="choices">${choices}</div>
      ${feedback}
      <div class="bottom-bar">${action}</div>
    `, item.done ? "#next" : null);

    app.querySelectorAll(".choice:not([disabled])").forEach(btn =>
      btn.addEventListener("click", () => pick(Number(btn.dataset.orig))));
    const next = document.getElementById("next");
    if (next) next.addEventListener("click", advance);
    const submit = document.getElementById("submit");
    if (submit) submit.addEventListener("click", check);
    document.getElementById("quit").addEventListener("click", () => {
      const answered = quiz.items.some(i => i.done);
      if (!answered || confirm("Quit this quiz? Answers so far are already saved.")) { quiz = null; showHome(); }
    });
  }

  function pick(orig) {
    const item = quiz.items[quiz.index];
    if (item.done) return;
    const need = answersOf(item.q).length;
    if (need === 1) {
      item.picked = [orig];
      return check();
    }
    item.picked = item.picked.includes(orig)
      ? item.picked.filter(x => x !== orig)
      : [...item.picked, orig].slice(-need);
    showQuestion();
  }

  function check() {
    const item = quiz.items[quiz.index];
    if (item.done || !item.picked.length) return;
    const right = answersOf(item.q);
    item.correct = right.length === item.picked.length && right.every(a => item.picked.includes(a));
    item.done = true;
    Store.recordAnswer(item.q.id, item.correct);
    showQuestion();
  }

  function advance() {
    if (quiz.index < quiz.items.length - 1) {
      quiz.index += 1;
      showQuestion();
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    const score = quiz.items.filter(i => i.correct).length;
    const total = quiz.items.length;
    Store.recordSession({ mode: quiz.mode, label: quiz.label, score, total });
    const misses = quiz.items.filter(i => !i.correct);
    const p = pct(score, total);
    const msg = p === 100 ? "Perfect round!" : p >= 80 ? "Nice work!" : p >= 60 ? "Getting there." : "Keep at it.";

    const missList = misses.map(({ q, picked }) => `
      <li class="miss">
        <p class="miss-q">${esc(q.question)}</p>
        <p class="miss-yours">You: ${picked.map(i => esc(q.choices[i])).join(", ")}</p>
        <p class="miss-right">Answer: ${answersOf(q).map(i => esc(q.choices[i])).join(", ")}</p>
        ${q.explanation ? `<p class="miss-exp">${esc(q.explanation)}</p>` : ""}
      </li>`).join("");

    const retry = misses.map(i => i.q);
    render(`
      <div class="results-hero">
        <p class="eyebrow">${esc(quiz.label)}</p>
        <div class="score-ring" style="--p:${p}">
          <span class="score-num">${score}<small>/${total}</small></span>
        </div>
        <h2>${msg}</h2>
      </div>
      <div class="actions">
        ${misses.length ? `<button class="btn primary" id="retry">Retry the ${misses.length} missed</button>` : ""}
        <button class="btn ${misses.length ? "" : "primary"}" id="home">Home</button>
      </div>
      ${misses.length ? `<h3 class="section-title">Review your misses</h3><ol class="miss-list">${missList}</ol>` : ""}
    `, "#retry, #home");
    const retryBtn = document.getElementById("retry");
    if (retryBtn) retryBtn.addEventListener("click", () => startQuiz("retry", retry, "Retry missed"));
    document.getElementById("home").addEventListener("click", showHome);
    quiz = null;
  }

  // ---------- home ----------

  function showHome() {
    quiz = null;
    const missed = allQuestions.filter(isMissed);
    const overall = domainStats(allQuestions);

    const domainRows = domains.map(d => {
      const s = domainStats(d.questions);
      const acc = s.seen ? `${pct(s.correct, s.seen)}%` : "New";
      return `<button class="domain" data-domain="${esc(d.id)}">
        <span class="domain-main">
          <span class="domain-name">${esc(d.name)}</span>
          <span class="domain-meta">${d.questions.length} questions · ${d.weight}% of exam</span>
          <span class="bar"><span class="bar-fill" style="width:${pct(s.mastered, s.total)}%"></span></span>
        </span>
        <span class="domain-acc ${s.seen ? "" : "muted"}">${acc}</span>
      </button>`;
    }).join("");

    const problems = QUIZ.problems.length ? `
      <details class="notice">
        <summary>${QUIZ.problems.length} question${QUIZ.problems.length > 1 ? "s were" : " was"} skipped because of a typo</summary>
        <ul>${QUIZ.problems.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
      </details>` : "";

    const storageWarn = Store.isAvailable() ? "" :
      `<p class="notice">This browser is blocking storage, so progress won't be saved after you close the page.</p>`;

    render(`
      <header class="home-head">
        <h1>A+ Core 1</h1>
        <p class="sub">220-1201 practice · ${allQuestions.length} questions</p>
      </header>
      ${problems}${storageWarn}
      <button class="hero-btn" id="quick" ${allQuestions.length ? "" : "disabled"}>
        <span class="hero-title">Quick 10</span>
        <span class="hero-sub">A short mixed round, weighted like the real exam</span>
      </button>
      <div class="row-2">
        <button class="tile" id="missed" ${missed.length ? "" : "disabled"}>
          <span class="tile-num">${missed.length}</span>
          <span class="tile-label">Review missed</span>
        </button>
        <button class="tile" id="stats">
          <span class="tile-num">${overall.seen ? pct(overall.correct, overall.seen) + "%" : "—"}</span>
          <span class="tile-label">Your stats</span>
        </button>
      </div>
      <h3 class="section-title">Practice by domain</h3>
      <div class="domains">${domainRows}</div>
    `);

    document.getElementById("quick").addEventListener("click", () => startQuiz("quick", pickQuick(), "Quick 10"));
    document.getElementById("missed").addEventListener("click", () => startQuiz("missed", missed, "Review missed"));
    document.getElementById("stats").addEventListener("click", showStats);
    app.querySelectorAll(".domain").forEach(btn => btn.addEventListener("click", () => {
      const d = domains.find(x => x.id === btn.dataset.domain);
      startQuiz("domain", d.questions.map(q => byId.get(q.id)), d.name);
    }));
  }

  // ---------- stats ----------

  function showStats() {
    const overall = domainStats(allQuestions);
    const sessions = Store.get().sessions;

    const rows = domains.map(d => {
      const s = domainStats(d.questions);
      return `<li class="stat-row">
        <div class="stat-head">
          <span>${esc(d.name)}</span>
          <strong>${s.seen ? pct(s.correct, s.seen) + "%" : "—"}</strong>
        </div>
        <span class="bar"><span class="bar-fill" style="width:${pct(s.mastered, s.total)}%"></span></span>
        <span class="stat-meta">${s.mastered}/${s.total} answered right last time · ${s.attempted} tried</span>
      </li>`;
    }).join("");

    const recent = sessions.slice(-8).reverse().map(s => `
      <li class="session">
        <span>${esc(s.label || s.mode)}</span>
        <span class="muted">${new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
        <strong>${s.score}/${s.total}</strong>
      </li>`).join("");

    render(`
      <div class="quiz-top">
        <button class="icon-btn" id="back" aria-label="Back to home">←</button>
        <h2 class="top-title">Your stats</h2>
      </div>
      <div class="row-3">
        <div class="tile static"><span class="tile-num">${overall.seen ? pct(overall.correct, overall.seen) + "%" : "—"}</span><span class="tile-label">Accuracy</span></div>
        <div class="tile static"><span class="tile-num">${overall.seen}</span><span class="tile-label">Answers</span></div>
        <div class="tile static"><span class="tile-num">${sessions.length}</span><span class="tile-label">Quizzes</span></div>
      </div>
      <h3 class="section-title">By domain</h3>
      <ul class="stat-list">${rows}</ul>
      <p class="muted small">Bars show questions you got right the last time you saw them.</p>
      ${recent ? `<h3 class="section-title">Recent quizzes</h3><ul class="session-list">${recent}</ul>` : ""}
      <div class="actions">
        <button class="btn danger" id="reset">Reset all progress</button>
      </div>
    `);
    document.getElementById("back").addEventListener("click", showHome);
    document.getElementById("reset").addEventListener("click", () => {
      if (confirm("Erase all scores and missed questions on this device? This can't be undone.")) {
        Store.reset();
        showHome();
      }
    });
  }

  // ---------- keyboard shortcuts (desktop) ----------

  document.addEventListener("keydown", e => {
    if (!quiz || e.metaKey || e.ctrlKey || e.altKey) return;
    const item = quiz.items[quiz.index];
    const n = e.key.toUpperCase().charCodeAt(0) - 65;
    if (!item.done && e.key.length === 1 && n >= 0 && n < item.order.length) {
      pick(item.order[n]);
    } else if (!item.done && /^[1-9]$/.test(e.key) && Number(e.key) <= item.order.length) {
      pick(item.order[Number(e.key) - 1]);
    } else if (e.key === "Enter" && !item.done && answersOf(item.q).length > 1) {
      check();
    }
  });

  showHome();
})();
