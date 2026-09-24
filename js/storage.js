// Saves progress in this browser's localStorage. If storage is blocked
// (private mode, strict settings), everything still works for the current visit.
const Store = (() => {
  const KEY = "aplusQuiz.v1";
  const MAX_SESSIONS = 100;

  const DEFAULT_SETTINGS = { examDate: "2026-11-07", examMode: false, hintSeen: false };

  const empty = () => ({ version: 1, questions: {}, sessions: [], settings: { ...DEFAULT_SETTINGS } });

  let data = load();

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY));
      if (parsed && parsed.version === 1 && parsed.questions && Array.isArray(parsed.sessions)) {
        parsed.settings = { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) };
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

    settings: () => data.settings,

    setSetting(key, value) {
      data.settings[key] = value;
      save();
    },

    // Clears scores and missed questions; keeps settings like the exam date.
    reset() {
      const settings = data.settings;
      data = empty();
      data.settings = settings;
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
