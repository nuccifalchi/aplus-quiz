// Saves progress in this browser's localStorage. If storage is blocked
// (private mode, strict settings), everything still works for the current visit.
const Store = (() => {
  const KEY = "aplusQuiz.v1";
  const MAX_SESSIONS = 100;

  const empty = () => ({ version: 1, questions: {}, sessions: [] });

  let data = load();

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY));
      if (parsed && parsed.version === 1 && parsed.questions && Array.isArray(parsed.sessions)) {
        return parsed;
      }
    } catch (e) { /* fall through */ }
    return empty();
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  return {
    get: () => data,

    question: id => data.questions[id],

    recordAnswer(id, correct) {
      const q = data.questions[id] || { seen: 0, correct: 0 };
      q.seen += 1;
      if (correct) q.correct += 1;
      q.lastCorrect = correct;
      q.lastSeen = Date.now();
      data.questions[id] = q;
      save();
    },

    recordSession(session) {
      data.sessions.push({ date: Date.now(), ...session });
      if (data.sessions.length > MAX_SESSIONS) data.sessions = data.sessions.slice(-MAX_SESSIONS);
      save();
    },

    reset() {
      data = empty();
      save();
    },

    isAvailable() {
      try {
        const k = KEY + ".test";
        localStorage.setItem(k, "1");
        localStorage.removeItem(k);
        return true;
      } catch (e) {
        return false;
      }
    },
  };
})();
