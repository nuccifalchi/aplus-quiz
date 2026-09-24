// Shared quiz data and logic used by every screen.
const Engine = (() => {
  const domains = QUIZ.domains.slice().sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  const allQuestions = domains.flatMap(d => d.questions.map(q => ({ ...q, domainId: d.id, domainName: d.name })));
  const byId = new Map(allQuestions.map(q => [q.id, q]));

  // Each domain lives on a physical part of the board (see CLAUDE.md).
  // cx/cy: zoom center in board coordinates. zoom: camera scale. focus: sharp radius.
  const PARTS = {
    mob:  { domain: "1.0", led: "BATT", name: "1.0 MOBILE DEVICES",         label: "MOBILE",          cx: 60,  cy: 858, zoom: 2.8, focus: 52 },
    net:  { domain: "2.0", led: "LAN",  name: "2.0 NETWORKING",             label: "NETWORKING",      cx: 88,  cy: 40,  zoom: 2.4, focus: 80 },
    hw:   { domain: "3.0", led: "CPU",  name: "3.0 HARDWARE",               label: "HARDWARE",        cx: 158, cy: 186, zoom: 2.2, focus: 96 },
    virt: { domain: "4.0", led: "DRAM", name: "4.0 VIRTUALIZATION & CLOUD", label: "VIRT & CLOUD",    cx: 294, cy: 440, zoom: 2.4, focus: 70 },
    ts:   { domain: "5.0", led: "BOOT", name: "5.0 TROUBLESHOOTING",        label: "TROUBLESHOOTING", cx: 352, cy: 318, zoom: 2.4, focus: 66 },
  };
  const PART_ORDER = ["mob", "net", "hw", "virt", "ts"];
  const partForDomain = id => PART_ORDER.find(k => PARTS[k].domain === id);

  // Short names for the 220-1201 sub-objectives, used in fine print.
  const OBJECTIVES = {
    "1.1": "Laptop hardware", "1.2": "Mobile accessories", "1.3": "Mobile network & MDM",
    "2.1": "Ports & protocols", "2.2": "Wireless tech", "2.3": "Networked services",
    "2.4": "DNS, DHCP, VLAN, VPN", "2.5": "Network hardware", "2.6": "SOHO & IP addressing",
    "2.7": "Connection types", "2.8": "Network tools",
    "3.1": "Displays", "3.2": "Cables & connectors", "3.3": "RAM", "3.4": "Storage & RAID",
    "3.5": "Boards, CPUs, cards", "3.6": "Power supplies", "3.7": "Printer setup", "3.8": "Printer maintenance",
    "4.1": "Virtualization", "4.2": "Cloud computing",
    "5.1": "Board, RAM, CPU, power", "5.2": "Drives & RAID", "5.3": "Video & displays",
    "5.4": "Mobile issues", "5.5": "Network issues", "5.6": "Printer issues",
  };

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

  function stats(questions) {
    let seen = 0, correct = 0, mastered = 0, attempted = 0;
    questions.forEach(q => {
      const s = Store.question(q.id);
      if (!s) return;
      attempted += 1;
      seen += s.seen;
      correct += s.correct;
      if (s.lastCorrect) mastered += 1;
    });
    return { seen, correct, mastered, attempted, total: questions.length, accuracy: seen ? pct(correct, seen) : null };
  }

  const domainById = id => domains.find(d => d.id === id);
  const questionsIn = id => allQuestions.filter(q => q.domainId === id);

  // Lowest accuracy among domains you've answered; null before any answers.
  function weakestDomain() {
    let worst = null;
    domains.forEach(d => {
      const s = stats(questionsIn(d.id));
      if (s.accuracy === null) return;
      if (!worst || s.accuracy < worst.accuracy) worst = { id: d.id, accuracy: s.accuracy };
    });
    return worst && worst.id;
  }

  // The sub-objective in a domain with the most room to improve.
  function weakestObjective(domainId) {
    const byObj = {};
    questionsIn(domainId).forEach(q => {
      const s = Store.question(q.id);
      const o = byObj[q.objective] || (byObj[q.objective] = { seen: 0, correct: 0 });
      if (s) { o.seen += s.seen; o.correct += s.correct; }
    });
    let worst = null;
    Object.keys(byObj).forEach(k => {
      const o = byObj[k];
      if (!o.seen || o.correct === o.seen) return;
      const acc = o.correct / o.seen;
      if (!worst || acc < worst.acc) worst = { id: k, acc };
    });
    return worst ? `${worst.id} ${OBJECTIVES[worst.id] || ""}`.trim() : null;
  }

  function weightedPick(pool, count) {
    const picked = [];
    pool = pool.slice();
    while (picked.length < count && pool.length) {
      const total = pool.reduce((sum, p) => sum + p.w, 0);
      let r = Math.random() * total;
      let i = 0;
      while (i < pool.length - 1 && (r -= pool[i].w) > 0) i++;
      picked.push(pool.splice(i, 1)[0].q);
    }
    return picked;
  }

  // Quick 10: spread across domains by exam weight, favouring missed and
  // never-seen questions so short sessions go where they help most.
  function pickQuick(count = 10) {
    return weightedPick(allQuestions.map(q => {
      const d = domainById(q.domainId);
      const s = Store.question(q.id);
      const priority = !s ? 2 : s.lastCorrect ? 1 : 3;
      return { q, w: (d.weight / d.questions.length) * priority };
    }), count);
  }

  // Practice within one set of questions, favouring missed, then unseen.
  function pickFrom(questions, count = 10) {
    return weightedPick(questions.map(q => {
      const s = Store.question(q.id);
      return { q, w: !s ? 2 : s.lastCorrect ? 1 : 3 };
    }), count);
  }

  // Exam: exact per-domain quotas by weight (largest remainder), no repeats.
  function pickExam(count) {
    const totalWeight = domains.reduce((s, d) => s + d.weight, 0);
    const quotas = domains.map(d => {
      const raw = (count * d.weight) / totalWeight;
      return { d, n: Math.min(Math.floor(raw), d.questions.length), rem: raw - Math.floor(raw) };
    });
    let left = count - quotas.reduce((s, x) => s + x.n, 0);
    quotas.slice().sort((a, b) => b.rem - a.rem).forEach(x => {
      if (left > 0 && x.n < x.d.questions.length) { x.n += 1; left -= 1; }
    });
    const picked = quotas.flatMap(x => shuffle(questionsIn(x.d.id)).slice(0, x.n));
    if (left > 0) {
      const used = new Set(picked.map(q => q.id));
      picked.push(...shuffle(allQuestions.filter(q => !used.has(q.id))).slice(0, left));
    }
    return shuffle(picked);
  }

  function daysUntil(isoDate) {
    const [y, m, d] = isoDate.split("-").map(Number);
    const target = new Date(y, m - 1, d);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((target - today) / 86400000);
  }

  return {
    domains, allQuestions, byId, PARTS, PART_ORDER, OBJECTIVES, partForDomain,
    esc, pct, answersOf, shuffle, isMissed, stats, domainById, questionsIn,
    weakestDomain, weakestObjective, pickQuick, pickFrom, pickExam, daysUntil,
  };
})();
