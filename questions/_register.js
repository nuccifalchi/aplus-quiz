// Question bank registry. Each file in this folder calls QUIZ.register({...})
// with one domain's questions. Load this file before any question file.
window.QUIZ = {
  domains: [],   // [{ id, name, weight, questions }]
  problems: [],  // messages about questions that were skipped

  register(data) {
    const name = data && data.domain;
    if (!name || !Array.isArray(data.questions)) {
      this.problems.push("A question file is missing \"domain\" or \"questions\".");
      return;
    }
    const seenIds = new Set(this.domains.flatMap(d => d.questions.map(q => q.id)));
    const good = [];
    data.questions.forEach((q, i) => {
      const err = checkQuestion(q, seenIds);
      if (err) {
        this.problems.push(`${name}, question #${i + 1}${q && q.id ? ` (${q.id})` : ""}: ${err}`);
      } else {
        seenIds.add(q.id);
        good.push(q);
      }
    });
    this.domains.push({
      id: name.split(" ")[0],          // "2.0"
      name,
      weight: Number(data.weight) || 1,
      questions: good,
    });
  },
};

function checkQuestion(q, seenIds) {
  if (!q || typeof q !== "object") return "not an object";
  if (!q.id) return "missing \"id\"";
  if (seenIds.has(q.id)) return `duplicate id "${q.id}"`;
  if (!q.question) return "missing \"question\"";
  if (!Array.isArray(q.choices) || q.choices.length < 2) return "needs at least 2 \"choices\"";
  const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
  if (!answers.length || answers.some(a => !Number.isInteger(a) || a < 0 || a >= q.choices.length)) {
    return "\"answer\" must be a choice number from 0 to " + (q.choices.length - 1);
  }
  return null;
}
