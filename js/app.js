// Router: ties the board, the paper cards, and Exam Mode together.
// Routes live in the URL hash so the phone's Back gesture works:
//   #/            the board          #/part/<key>  zoomed on a part
//   #/card        study card         #/report      POST report receipt
//   #/exam        Exam Mode
(() => {
  const root = document.getElementById("app");
  const { PARTS, partForDomain, questionsIn } = Engine;

  let route = null;
  let zoomedFromHome = false;
  let pendingFlash = null;

  const parse = () => {
    const h = location.hash.replace(/^#\/?/, "");
    const [name, arg] = h.split("/");
    return { name: name || "home", arg };
  };
  const go = hash => { if (location.hash !== hash) location.hash = hash; else render(); };
  const replace = hash => { history.replaceState(null, "", hash); render(); };

  function startStudy(mode, questions, label) {
    Board.markHintSeen();
    if (Card.start(mode, questions, label)) go("#/card");
  }

  Board.mount(root, {
    zoom(key) {
      Board.markHintSeen();
      zoomedFromHome = true;
      go(`#/part/${key}`);
    },
    zoomOut() {
      if (zoomedFromHome) history.back();
      else replace("#/");
    },
    practice(key) {
      const p = PARTS[key];
      startStudy("domain", Engine.pickFrom(questionsIn(p.domain), 10), `Practice: ${Engine.domainById(p.domain).name}`);
    },
    start() {
      if (Store.settings().examMode) { Board.markHintSeen(); go("#/exam"); }
      else startStudy("quick", Engine.pickQuick(10), "Quick 10");
    },
    review() {
      startStudy("missed", Engine.allQuestions.filter(Engine.isMissed), "Review missed");
    },
    report() { go("#/report"); },
  });

  Card.mount(root, {
    exit() { go("#/"); },
    finished(score) { pendingFlash = score; },
    missed(key) { Board.pulseLed(key); },
    focusDomain(id) { Board.zoom(partForDomain(id), { blurAll: true }); },
    restart() { Board.zoom(partForDomain(Card.currentDomain()), { blurAll: true }); Card.renderCard(); },
  });

  Exam.mount(root, {
    exit() { go("#/"); },
    submitted(score) { pendingFlash = score; },
  });

  function render() {
    const next = parse();

    // Leaving an exam in progress loses it, so ask first.
    if (route && route.name === "exam" && next.name !== "exam" && Exam.inProgress()) {
      if (!confirm("Leave the exam? Your answers so far won't be scored.")) {
        history.replaceState(null, "", "#/exam");
        return;
      }
      Exam.abandon();
    }
    if (route && route.name === "card" && next.name !== "card") Card.endSession();
    route = next;

    if (next.name === "exam") {
      Card.close();
      Board.show(false);
      Exam.open();
      return;
    }
    Exam.close();
    Board.show(true);

    if (next.name === "card") {
      if (!Card.hasSession()) return replace("#/");
      Board.zoom(partForDomain(Card.currentDomain()), { blurAll: true });
      Card.renderCard();
      return;
    }
    if (next.name === "report") {
      Board.zoom("post", { blurAll: true });
      Card.renderReceipt();
      return;
    }

    Card.close();
    Board.refresh();
    if (next.name === "part" && PARTS[next.arg]) {
      Board.zoom(next.arg);
      return;
    }
    if (next.name !== "home") return replace("#/");
    zoomedFromHome = false;
    Board.zoom(null);
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
      if (route.name === "part") { e.preventDefault(); return zoomedFromHome ? history.back() : replace("#/"); }
      if (route.name === "card" || route.name === "report") { e.preventDefault(); return go("#/"); }
      return;
    }
    if (route.name === "card" && Card.onKey(e)) e.preventDefault();
    else if (route.name === "exam" && Exam.onKey(e)) e.preventDefault();
  });

  render();
})();
