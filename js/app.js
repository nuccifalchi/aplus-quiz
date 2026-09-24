// Router: ties the board, part pages, paper cards, and Exam Mode together.
// Routes live in the URL hash so the phone's Back gesture works:
//   #/              the board (home)
//   #/part/<key>    a part's page: close-up + objectives datasheet
//   #/card          study card          #/report   POST report receipt
//   #/exam          Exam Mode
(() => {
  const root = document.getElementById("app");
  const { PARTS } = Engine;

  let route = null;
  let pendingFlash = null;
  // True when we pushed the current screen from the previous one, so "back"
  // can use history.back() and the phone's history stays tidy.
  const pushed = { part: false, card: false, report: false };

  const parse = () => {
    const h = location.hash.replace(/^#\/?/, "");
    const [name, arg] = h.split("/");
    return { name: name || "home", arg };
  };
  const go = hash => { if (location.hash !== hash) location.hash = hash; else render(); };
  const replace = hash => { history.replaceState(null, "", hash); render(); };
  const leave = (name, fallback = "#/") => { if (pushed[name]) history.back(); else replace(fallback); };

  function startStudy(mode, questions, label) {
    Board.markHintSeen();
    if (Card.start(mode, questions, label)) { pushed.card = true; go("#/card"); }
  }

  Board.mount(root, {
    part(key) {
      Board.markHintSeen();
      Board.enterPart(key).then(() => { pushed.part = true; go(`#/part/${key}`); });
    },
    start() {
      if (Store.settings().examMode) { Board.markHintSeen(); go("#/exam"); }
      else startStudy("quick", Engine.pickQuick(10), "Quick 10");
    },
    review() {
      startStudy("missed", Engine.allQuestions.filter(Engine.isMissed), "Review missed");
    },
    report() { pushed.report = true; go("#/report"); },
  });

  Part.mount(root, {
    back() { leave("part"); },
    study(mode, questions, label) { startStudy(mode, questions, label); },
  });

  Card.mount(root, {
    exit() { leave(route.name === "report" ? "report" : "card"); },
    finished(score) { pendingFlash = score; },
    restart() { Card.renderCard(); },
    reset() { pendingFlash = null; Board.clearFlash(); },
  });

  Exam.mount(root, {
    exit() { go("#/"); },
    submitted(score) { pendingFlash = score; },
  });

  function render() {
    const next = parse();
    const prev = route;

    // Leaving an exam in progress loses it, so ask first.
    if (prev && prev.name === "exam" && next.name !== "exam" && Exam.inProgress()) {
      if (!confirm("Leave the exam? Your answers so far won't be scored.")) {
        history.replaceState(null, "", "#/exam");
        return;
      }
      Exam.abandon();
    }
    if (prev && prev.name === "card" && next.name !== "card") { Card.endSession(); pushed.card = false; }
    if (prev && prev.name === "report" && next.name !== "report") pushed.report = false;
    if (prev && prev.name === "part" && next.name !== "part" && next.name !== "card") pushed.part = false;
    route = next;

    if (next.name !== "exam") Exam.close();
    if (next.name !== "part") Part.close();
    if (next.name !== "card" && next.name !== "report") Card.close();

    if (next.name === "exam") { Board.show(false); Exam.open(); return; }

    if (next.name === "card") {
      if (!Card.hasSession()) return replace("#/");
      Board.show(false);
      Card.renderCard();
      return;
    }
    if (next.name === "report") { Board.show(false); Card.renderReceipt(); return; }

    if (next.name === "part") {
      if (!PARTS[next.arg]) return replace("#/");
      Board.show(false);
      Part.open(next.arg);
      return;
    }

    if (next.name !== "home") return replace("#/");
    Board.show(true);
    Board.refresh();
    if (prev && prev.name === "part" && PARTS[prev.arg]) Board.exitPart(prev.arg);
    else Board.reset();
    if (pendingFlash !== null) { Board.flashScore(pendingFlash); pendingFlash = null; }
  }

  if (!location.hash) history.replaceState(null, "", "#/");
  window.addEventListener("hashchange", render);
  window.addEventListener("beforeunload", e => {
    if (Exam.inProgress()) { e.preventDefault(); e.returnValue = ""; }
  });

  document.addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Escape") {
      if (route.name === "part") { e.preventDefault(); return leave("part"); }
      if (route.name === "card") { e.preventDefault(); return leave("card"); }
      if (route.name === "report") { e.preventDefault(); return leave("report"); }
      return;
    }
    if (route.name === "card" && Card.onKey(e)) e.preventDefault();
    else if (route.name === "exam" && Exam.onKey(e)) e.preventDefault();
  });

  render();
  if (route.name === "home") Board.boot();
})();
