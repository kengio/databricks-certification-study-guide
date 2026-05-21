/* Adaptive practice quiz — vanilla JS, no dependencies, no build step.
 *
 * Loads a JSON question bank from practice/data/<cert>.json, lets the user
 * answer multiple-choice questions, tracks per-question attempts in
 * localStorage, and (in adaptive mode) weights question selection toward
 * never-seen + recently-wrong items.
 *
 * Storage shape (localStorage):
 *   {
 *     "dbx-practice-<cert>": {
 *       "<questionId>": {
 *         "attempts": [{ "ts": <epoch_ms>, "correct": <bool> }, ...],
 *         "lastSeen": <epoch_ms>
 *       },
 *       ...
 *     }
 *   }
 *
 * Note on XSS: this app never sets innerHTML with content derived from the
 * question bank. All dynamic rendering goes through renderMarkdown(), which
 * returns DOM nodes built via document.createElement + textContent.
 */

(() => {
  "use strict";

  const KNOWN_BANKS = [
    { cert: "data-engineer-associate", file: "data/data-engineer-associate.json" },
    { cert: "data-engineer-professional", file: "data/data-engineer-professional.json" },
    { cert: "data-analyst-associate", file: "data/data-analyst-associate.json" },
    { cert: "ml-associate", file: "data/ml-associate.json" },
    { cert: "ml-professional", file: "data/ml-professional.json" },
    { cert: "genai-engineer-associate", file: "data/genai-engineer-associate.json" },
  ];

  const STORAGE_PREFIX = "dbx-practice-";
  const THEME_KEY = "dbx-practice-theme";
  const THEMES = ["auto", "light", "dark"];
  const THEME_ICONS = { auto: "🖥️", light: "☀️", dark: "🌙" };
  const STATE = {
    bank: null,
    history: {},
    currentQ: null,
    currentChoice: null,
    sessionCorrect: 0,
    sessionTotal: 0,
    seenThisSession: new Set(),
    settings: {
      mode: "adaptive",
      domain: "",
      difficulty: "",
    },
    sequentialIndex: 0,
  };

  // --- DOM helpers ---------------------------------------------------------

  const $ = (sel) => document.querySelector(sel);

  const el = (tag, props = {}, ...children) => {
    const node = document.createElement(tag);
    for (const key of Object.keys(props)) {
      if (key === "dataset") {
        Object.assign(node.dataset, props.dataset);
      } else if (key === "style") {
        node.style.cssText = props.style;
      } else if (key === "className") {
        node.className = props.className;
      } else if (key.startsWith("on")) {
        node.addEventListener(key.slice(2).toLowerCase(), props[key]);
      } else if (key === "type" || key === "value" || key === "name" || key === "disabled" || key === "hidden") {
        node[key] = props[key];
      } else {
        node.setAttribute(key, props[key]);
      }
    }
    for (const child of children) {
      if (child == null) continue;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    }
    return node;
  };

  const clear = (node) => { while (node.firstChild) node.removeChild(node.firstChild); };

  function show(sectionId) {
    for (const id of ["setup", "quiz", "stats", "settings"]) {
      $("#" + id).hidden = id !== sectionId;
    }
  }

  // --- Safe markdown → DOM rendering --------------------------------------
  //
  // Supports inline code (`x`) and bold (**x**) and double-newline paragraph
  // breaks. Everything else is rendered as literal text. No innerHTML; all
  // construction via createElement + textContent so untrusted bytes cannot
  // become script tags or event handlers.

  const INLINE_TOKEN_RE = /(`[^`]+`|\*\*[^*]+\*\*)/g;

  function renderInline(s, container) {
    let pos = 0;
    for (const match of s.matchAll(INLINE_TOKEN_RE)) {
      if (match.index > pos) {
        container.appendChild(document.createTextNode(s.slice(pos, match.index)));
      }
      const tok = match[1];
      if (tok.startsWith("`")) {
        container.appendChild(el("code", {}, tok.slice(1, -1)));
      } else {
        container.appendChild(el("strong", {}, tok.slice(2, -2)));
      }
      pos = match.index + tok.length;
    }
    if (pos < s.length) {
      container.appendChild(document.createTextNode(s.slice(pos)));
    }
  }

  function renderMarkdown(s) {
    const frag = document.createDocumentFragment();
    const paragraphs = s.split(/\n\s*\n/);
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;
      const p = el("p");
      const lines = trimmed.split("\n");
      for (let i = 0; i < lines.length; i++) {
        renderInline(lines[i], p);
        if (i < lines.length - 1) p.appendChild(el("br"));
      }
      frag.appendChild(p);
    }
    return frag;
  }

  function renderInlineToFragment(s) {
    const frag = document.createDocumentFragment();
    renderInline(s, frag);
    return frag;
  }

  // --- Bank loading --------------------------------------------------------

  async function probeBanks() {
    const available = [];
    for (const b of KNOWN_BANKS) {
      try {
        const res = await fetch(b.file, { method: "HEAD" });
        if (res.ok) available.push(b);
      } catch (_) { /* file missing — skip */ }
    }
    return available;
  }

  async function loadBank(certInfo) {
    const res = await fetch(certInfo.file);
    if (!res.ok) throw new Error(`Failed to load ${certInfo.file}`);
    const data = await res.json();
    STATE.bank = data;
    STATE.history = loadHistory(data.cert);
    populateSettings();
    renderQuiz();
    show("quiz");
  }

  function renderSetup(available) {
    const setup = $("#setup");
    clear(setup);
    setup.appendChild(el("h2", {}, "Pick a question bank"));
    if (available.length === 0) {
      const p = el("p", {}, "No JSON banks found under practice/data/. Run ");
      p.appendChild(el("code", {}, "python3 practice/build.py"));
      p.appendChild(document.createTextNode(" first."));
      setup.appendChild(p);
      return;
    }
    const list = el("div", { className: "bank-list" });
    for (const b of available) {
      const button = el("button", { type: "button", className: "bank-card",
                                    onclick: () => loadBank(b) }, b.cert);
      fetch(b.file).then(r => r.json()).then(d => {
        clear(button);
        button.appendChild(el("strong", {}, d.certTitle || d.cert));
        button.appendChild(el("div", { className: "bank-meta" },
          `${d.questions.length} questions · ${d.domains.length} domains · blueprint ${d.blueprintVersion}`));
      }).catch(() => { /* keep fallback text */ });
      list.appendChild(button);
    }
    setup.appendChild(list);
  }

  // --- LocalStorage --------------------------------------------------------

  function loadHistory(cert) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + cert);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to parse history:", e);
      return {};
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_PREFIX + STATE.bank.cert, JSON.stringify(STATE.history));
    } catch (e) {
      console.warn("Failed to save history:", e);
    }
  }

  function recordAttempt(qid, correct) {
    const now = Date.now();
    if (!STATE.history[qid]) {
      STATE.history[qid] = { attempts: [], lastSeen: now };
    }
    STATE.history[qid].attempts.push({ ts: now, correct });
    STATE.history[qid].lastSeen = now;
    if (STATE.history[qid].attempts.length > 20) {
      STATE.history[qid].attempts = STATE.history[qid].attempts.slice(-20);
    }
    saveHistory();
  }

  // --- Question selection --------------------------------------------------

  function filteredQuestions() {
    let qs = STATE.bank.questions;
    if (STATE.settings.domain) qs = qs.filter(q => q.domain === STATE.settings.domain);
    if (STATE.settings.difficulty) qs = qs.filter(q => q.difficulty === STATE.settings.difficulty);
    return qs;
  }

  function questionWeight(q) {
    const s = STATE.history[q.id];
    if (!s || s.attempts.length === 0) return 10;
    const last = s.attempts[s.attempts.length - 1];
    const daysSince = (Date.now() - last.ts) / (1000 * 60 * 60 * 24);
    if (last.correct) {
      return Math.min(5, 0.5 + daysSince * 0.3);
    }
    return Math.max(3, 8 - daysSince * 0.3);
  }

  function pickNext() {
    const pool = filteredQuestions().filter(q => !STATE.seenThisSession.has(q.id));
    if (pool.length === 0) {
      STATE.seenThisSession.clear();
      return pickNext();
    }
    if (STATE.settings.mode === "sequential") {
      const all = filteredQuestions();
      if (all.length === 0) return null;
      const q = all[STATE.sequentialIndex % all.length];
      STATE.sequentialIndex++;
      STATE.seenThisSession.add(q.id);
      return q;
    }
    if (STATE.settings.mode === "random") {
      const q = pool[Math.floor(Math.random() * pool.length)];
      STATE.seenThisSession.add(q.id);
      return q;
    }
    const weights = pool.map(questionWeight);
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        STATE.seenThisSession.add(pool[i].id);
        return pool[i];
      }
    }
    const last = pool[pool.length - 1];
    STATE.seenThisSession.add(last.id);
    return last;
  }

  // --- Rendering -----------------------------------------------------------

  function renderQuiz() {
    const q = pickNext();
    if (!q) {
      $("#quiz-question").textContent = "No questions match your filters.";
      clear($("#quiz-choices"));
      return;
    }
    STATE.currentQ = q;
    STATE.currentChoice = null;

    $("#quiz-cert").textContent = STATE.bank.certTitle;
    $("#quiz-counter").textContent =
      `Q${STATE.seenThisSession.size} this session · ${STATE.sessionCorrect}/${STATE.sessionTotal} correct`;
    const domain = STATE.bank.domains.find(d => d.id === q.domain);
    $("#quiz-domain").textContent = domain ? domain.name : q.domain;
    const diff = $("#quiz-difficulty");
    diff.textContent = q.difficulty;
    diff.className = "difficulty " + q.difficulty;

    $("#quiz-title").textContent = q.title;

    const qBody = $("#quiz-question");
    clear(qBody);
    qBody.appendChild(renderMarkdown(q.question));

    const choices = $("#quiz-choices");
    clear(choices);
    for (const letter of ["A", "B", "C", "D"]) {
      const radio = el("input", { type: "radio", name: "choice", value: letter,
                                   onchange: () => {
                                     STATE.currentChoice = letter;
                                     $("#btn-submit").disabled = false;
                                   } });
      const choiceTextSpan = el("span");
      choiceTextSpan.appendChild(renderInlineToFragment(q.choices[letter]));
      const label = el("label", { dataset: { letter } },
        radio,
        el("span", { className: "choice-letter" }, letter + ")"),
        document.createTextNode(" "),
        choiceTextSpan);
      choices.appendChild(label);
    }

    $("#btn-submit").hidden = false;
    $("#btn-submit").disabled = true;
    $("#btn-next").hidden = true;
    $("#quiz-feedback").hidden = true;
    updateSessionBar();
  }

  function updateSessionBar() {
    const pct = STATE.sessionTotal === 0 ? 0
              : Math.round((STATE.sessionCorrect / STATE.sessionTotal) * 100);
    $("#session-stats").textContent =
      `Session: ${STATE.sessionCorrect} / ${STATE.sessionTotal} correct (${pct}%)`;

    const total = STATE.bank.questions.length;
    const attempted = Object.values(STATE.history)
                            .filter(s => s.attempts.length > 0).length;
    const correctAll = Object.values(STATE.history)
                             .filter(s => s.attempts.length > 0 && s.attempts[s.attempts.length-1].correct).length;
    $("#bank-stats").textContent =
      `Bank: ${attempted} / ${total} attempted · ${correctAll} currently correct on most-recent attempt`;
  }

  function submitAnswer() {
    if (!STATE.currentChoice) return;
    const q = STATE.currentQ;
    const correct = STATE.currentChoice === q.correctAnswer;
    recordAttempt(q.id, correct);
    STATE.sessionTotal++;
    if (correct) STATE.sessionCorrect++;

    for (const label of $("#quiz-choices").children) {
      const letter = label.dataset.letter;
      const radio = label.querySelector("input");
      radio.disabled = true;
      label.classList.add("disabled");
      if (letter === q.correctAnswer) label.classList.add("correct");
      else if (letter === STATE.currentChoice && !correct) label.classList.add("incorrect");
    }

    const fb = $("#quiz-feedback");
    fb.hidden = false;
    fb.className = correct ? "correct" : "incorrect";
    clear(fb);
    fb.appendChild(el("h4", {},
      correct ? "✓ Correct" : `✗ Incorrect — correct answer: ${q.correctAnswer}`));
    if (q.shortAnswer) {
      const p = el("p");
      p.appendChild(renderInlineToFragment(q.shortAnswer));
      fb.appendChild(p);
    }
    if (q.explanation) {
      fb.appendChild(renderMarkdown(q.explanation));
    }

    $("#btn-submit").hidden = true;
    $("#btn-next").hidden = false;
    updateSessionBar();
  }

  // --- Stats view ----------------------------------------------------------

  function renderStats() {
    const c = $("#stats-content");
    clear(c);

    const table = el("table");
    table.appendChild(el("thead", {}, el("tr", {},
      el("th", {}, "Domain"),
      el("th", { className: "numeric" }, "Total"),
      el("th", { className: "numeric" }, "Attempted"),
      el("th", { className: "numeric" }, "Currently correct"),
      el("th", { className: "numeric" }, "Accuracy"),
    )));
    const tbody = el("tbody");

    let totalAll = 0, attAll = 0, correctAll = 0;
    for (const d of STATE.bank.domains) {
      const qs = STATE.bank.questions.filter(q => q.domain === d.id);
      const att = qs.filter(q => (STATE.history[q.id]?.attempts.length || 0) > 0);
      const correct = att.filter(q => {
        const last = STATE.history[q.id].attempts.slice(-1)[0];
        return last && last.correct;
      });
      const pct = att.length === 0 ? "—" : Math.round((correct.length / att.length) * 100) + "%";
      tbody.appendChild(el("tr", {},
        el("td", {}, d.name),
        el("td", { className: "numeric" }, String(qs.length)),
        el("td", { className: "numeric" }, String(att.length)),
        el("td", { className: "numeric" }, String(correct.length)),
        el("td", { className: "numeric" }, pct),
      ));
      totalAll += qs.length;
      attAll += att.length;
      correctAll += correct.length;
    }
    const totalPct = attAll === 0 ? "—" : Math.round((correctAll / attAll) * 100) + "%";
    tbody.appendChild(el("tr", { style: "font-weight:600" },
      el("td", {}, "All domains"),
      el("td", { className: "numeric" }, String(totalAll)),
      el("td", { className: "numeric" }, String(attAll)),
      el("td", { className: "numeric" }, String(correctAll)),
      el("td", { className: "numeric" }, totalPct),
    ));
    table.appendChild(tbody);
    c.appendChild(table);

    const tough = STATE.bank.questions
      .map(q => ({ q, s: STATE.history[q.id] }))
      .filter(({ s }) => s && s.attempts.length > 0)
      .filter(({ s }) => !s.attempts[s.attempts.length-1].correct)
      .sort((a, b) => b.s.attempts.length - a.s.attempts.length)
      .slice(0, 5);
    if (tough.length > 0) {
      c.appendChild(el("h3", { style: "margin-top:1.5rem" }, "Questions you're working on"));
      const ul = el("ul");
      for (const { q, s } of tough) {
        ul.appendChild(el("li", {},
          `${q.title} — `,
          el("span", { className: "difficulty " + q.difficulty }, q.difficulty),
          ` (${s.attempts.length} attempts, latest wrong)`));
      }
      c.appendChild(ul);
    }
  }

  function exportProgress() {
    const payload = {
      cert: STATE.bank.cert,
      exportedAt: new Date().toISOString(),
      history: STATE.history,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dbx-practice-${STATE.bank.cert}-progress.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetHistory() {
    if (!confirm(`Reset all progress for "${STATE.bank.certTitle}"? This can't be undone.`)) return;
    STATE.history = {};
    STATE.seenThisSession.clear();
    STATE.sessionCorrect = 0;
    STATE.sessionTotal = 0;
    saveHistory();
    renderStats();
  }

  // --- Settings ------------------------------------------------------------

  function populateSettings() {
    const domainSel = $("#setting-domain");
    clear(domainSel);
    domainSel.appendChild(el("option", { value: "" }, "All domains"));
    for (const d of STATE.bank.domains) {
      domainSel.appendChild(el("option", { value: d.id },
        `${d.name} (${d.questionCount})`));
    }
    $("#setting-mode").value = STATE.settings.mode;
    $("#setting-domain").value = STATE.settings.domain;
    $("#setting-difficulty").value = STATE.settings.difficulty;
  }

  function applySettings() {
    STATE.settings.mode = $("#setting-mode").value;
    STATE.settings.domain = $("#setting-domain").value;
    STATE.settings.difficulty = $("#setting-difficulty").value;
    STATE.sequentialIndex = 0;
    STATE.seenThisSession.clear();
    renderQuiz();
    show("quiz");
  }

  // --- Theme toggle --------------------------------------------------------

  function loadTheme() {
    try {
      const t = localStorage.getItem(THEME_KEY);
      return THEMES.includes(t) ? t : "auto";
    } catch (_) { return "auto"; }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const iconNode = $("#btn-theme-icon");
    if (iconNode) iconNode.textContent = THEME_ICONS[theme];
  }

  function cycleTheme() {
    const current = loadTheme();
    const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
    try { localStorage.setItem(THEME_KEY, next); } catch (_) { /* ignore */ }
    applyTheme(next);
  }

  // --- Init ----------------------------------------------------------------

  function init() {
    // Apply persisted theme before anything renders so there's no flash
    applyTheme(loadTheme());

    $("#btn-submit").addEventListener("click", submitAnswer);
    $("#btn-next").addEventListener("click", renderQuiz);
    $("#btn-stats").addEventListener("click", () => { renderStats(); show("stats"); });
    $("#btn-stats-back").addEventListener("click", () => show("quiz"));
    $("#btn-export").addEventListener("click", exportProgress);
    $("#btn-reset").addEventListener("click", resetHistory);
    $("#btn-reset-top").addEventListener("click", resetHistory);
    $("#btn-settings").addEventListener("click", () => show("settings"));
    $("#btn-settings-cancel").addEventListener("click", () => show("quiz"));
    $("#btn-settings-apply").addEventListener("click", applySettings);
    $("#btn-exit").addEventListener("click", () => location.reload());
    $("#btn-theme").addEventListener("click", cycleTheme);

    probeBanks().then(renderSetup);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
