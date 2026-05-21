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

  // Bump on every deploy that changes app.js / data/*.json. Appended to
  // bank-JSON fetch URLs so browsers don't serve stale banks after a deploy.
  const APP_VERSION = "35";

  // Per-cert confetti palette. Pulled from the same gradients used on
  // the cert picker cards (--gradient in styles.css) so the burst feels
  // tied to "the cert you're studying", not a generic celebration. White
  // is always included as a contrast accent.
  const CERT_PALETTES = {
    "data-engineer-associate":    ["#FF4F2C", "#FFAB1F", "#FFD27A", "#FF7A4F", "#FFFFFF"],
    "data-engineer-professional": ["#6366F1", "#4F46E5", "#8B5CF6", "#A78BFA", "#FFFFFF"],
    "data-analyst-associate":     ["#10B981", "#14B8A6", "#34D399", "#5EEAD4", "#FFFFFF"],
    "ml-associate":               ["#A855F7", "#EC4899", "#C084FC", "#F472B6", "#FFFFFF"],
    "ml-professional":            ["#F59E0B", "#DC2626", "#FBBF24", "#FB923C", "#FFFFFF"],
    "genai-engineer-associate":   ["#06B6D4", "#3B82F6", "#22D3EE", "#60A5FA", "#FFFFFF"],
  };

  // Title patterns that are placeholder fallbacks (mock-exam questions whose
  // source heading is `## Question N *(Difficulty)*` with no real title text).
  // We suppress these in the post-submit "Topic" line so it doesn't read
  // "Topic: Question 5" — useless context.
  const FALLBACK_TITLE_RE = /^Question \d+(\.\d+)?$/i;

  // Bank groups render as labelled sections in the picker.
  const CERTS = [
    "data-engineer-associate",
    "data-engineer-professional",
    "data-analyst-associate",
    "ml-associate",
    "ml-professional",
    "genai-engineer-associate",
  ];
  const KNOWN_BANKS = [
    ...CERTS.map(c => ({ cert: c, file: `data/${c}.json`, group: "practice" })),
    ...CERTS.map(c => ({ cert: `${c}-mock-1`, file: `data/${c}-mock-1.json`, group: "mock" })),
    ...CERTS.map(c => ({ cert: `${c}-mock-2`, file: `data/${c}-mock-2.json`, group: "mock" })),
  ];
  const GROUP_LABELS = {
    practice: "Practice questions — drill by topic, adaptive selector",
    mock: "Mock exams — full-length, exam-feel sets",
  };

  const STORAGE_PREFIX = "dbx-practice-";
  const SESSION_HISTORY_PREFIX = "dbx-practice-sessions-";   // per-bank completed-session log
  const SESSION_HISTORY_CAP = 50;                             // ring-buffer cap per bank
  const THEME_KEY = "dbx-practice-theme";
  const TIMER_KEY = "dbx-practice-timer-minutes";
  const PASS_THRESHOLD = 70;                                  // % to pass a Databricks mock exam
  const THEMES = ["auto", "light", "dark"];
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
    certBanks: null,
    streak: 0,
    bestStreak: 0,     // highest streak achieved this session — for the summary card
    timerMinutes: 0,   // 0 = no timer; >0 = exam timer total length in minutes
    timerEnd: null,    // absolute epoch ms when the timer expires, or null
    timerExpired: false,
    sessionStart: null,    // epoch ms when this session of answering began
    sessionElapsed: null,  // frozen elapsed-ms snapshot at completion time
    summarySaved: false,   // guard so the completed-session record is written exactly once
    timerPaused: false,    // true while the user has the timer on hold
    pausedRemainingMs: null,  // ms left on the exam timer when pause started
    totalPausedMs: 0,      // accumulated pause time (subtracted from elapsed for summary)
    pauseStart: null,      // epoch ms when the current pause began
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
    for (const id of ["setup", "quiz", "stats", "settings", "summary"]) {
      $("#" + id).hidden = id !== sectionId;
    }
    // Sticky bottom actionbar + masthead quiz-meta-strip belong to the quiz
    // section only; hide them everywhere else.
    const inQuiz = sectionId === "quiz";
    const actionbar = $("#actionbar");
    const metaStrip = $("#quiz-meta-strip");
    if (actionbar) actionbar.hidden = !inQuiz;
    if (metaStrip) metaStrip.hidden = !inQuiz;
    document.body.classList.toggle("quiz-active", inQuiz);
    syncActionbarHeight();
  }

  // Keep `--actionbar-h` CSS var in sync with the actionbar's actual
  // rendered height. The actionbar wraps onto multiple rows when content
  // doesn't fit; if we hard-coded padding-bottom on main, the last
  // explanation line would get hidden under the bar.
  function syncActionbarHeight() {
    const ab = $("#actionbar");
    if (!ab || ab.hidden) {
      document.body.style.removeProperty("--actionbar-h");
      return;
    }
    const h = ab.getBoundingClientRect().height;
    if (h > 0) {
      document.body.style.setProperty("--actionbar-h", h + "px");
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

  const FENCE_OPEN_RE = /^\s*```(\w*)\s*$/;
  const FENCE_CLOSE_RE = /^\s*```\s*$/;
  const PRISM_KNOWN_LANGS = new Set(["python", "sql", "scala", "javascript", "json", "bash"]);

  function renderMarkdown(s) {
    const frag = document.createDocumentFragment();
    const lines = s.split("\n");
    let buffer = [];
    const pendingHighlights = [];  // <code> nodes to syntax-highlight after insertion

    const flushParagraphs = () => {
      let para = [];
      const emit = () => {
        if (para.length === 0) return;
        const p = el("p");
        for (let j = 0; j < para.length; j++) {
          renderInline(para[j], p);
          if (j < para.length - 1) p.appendChild(el("br"));
        }
        frag.appendChild(p);
        para = [];
      };
      for (const ln of buffer) {
        if (ln.trim() === "") emit();
        else para.push(ln);
      }
      emit();
      buffer = [];
    };

    let i = 0;
    while (i < lines.length) {
      const fence = lines[i].match(FENCE_OPEN_RE);
      if (fence) {
        flushParagraphs();
        const lang = (fence[1] || "").toLowerCase();
        const codeLines = [];
        i++;
        while (i < lines.length && !FENCE_CLOSE_RE.test(lines[i])) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++;  // skip closing fence

        const code = el("code");
        code.textContent = codeLines.join("\n");
        if (lang && PRISM_KNOWN_LANGS.has(lang)) {
          code.className = "language-" + lang;
          pendingHighlights.push(code);
        }
        const pre = el("pre");
        if (lang && PRISM_KNOWN_LANGS.has(lang)) {
          pre.className = "language-" + lang;
        }
        pre.appendChild(code);
        frag.appendChild(pre);
        continue;
      }
      buffer.push(lines[i]);
      i++;
    }
    flushParagraphs();

    // Run Prism.highlightElement after each code block is in the fragment.
    // Prism reads textContent on the node, so the node needs to exist (it does,
    // inside the fragment) but doesn't need to be in the live DOM yet.
    if (window.Prism && pendingHighlights.length) {
      for (const code of pendingHighlights) {
        try { window.Prism.highlightElement(code); }
        catch (_) { /* Prism failure shouldn't break the quiz */ }
      }
    }
    return frag;
  }

  function renderInlineToFragment(s) {
    const frag = document.createDocumentFragment();
    renderInline(s, frag);
    return frag;
  }

  // --- Bank loading --------------------------------------------------------

  function bustedUrl(file) {
    return file + (file.includes("?") ? "&" : "?") + "v=" + APP_VERSION;
  }

  async function loadAllBankMetadata() {
    // Fetch every known bank's JSON in parallel; group by sourceCert.
    // Returns Map<certId, [{bank, data}, ...]> preserving CERTS order.
    const results = await Promise.all(KNOWN_BANKS.map(async (b) => {
      try {
        const res = await fetch(bustedUrl(b.file), { cache: "no-cache" });
        if (!res.ok) return null;
        const data = await res.json();
        return { bank: b, data };
      } catch (_) { return null; }
    }));
    const byCert = new Map();
    for (const c of CERTS) byCert.set(c, []);
    for (const r of results) {
      if (!r) continue;
      const sourceCert = r.data.sourceCert || r.data.cert;
      if (byCert.has(sourceCert)) byCert.get(sourceCert).push(r);
    }
    // Drop certs with no available banks
    for (const c of CERTS) {
      if (byCert.get(c).length === 0) byCert.delete(c);
    }
    return byCert;
  }

  async function loadBank(certInfo) {
    const res = await fetch(bustedUrl(certInfo.file), { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to load ${certInfo.file}`);
    const data = await res.json();
    STATE.bank = data;
    STATE.history = loadHistory(data.cert);
    // Fresh session bookkeeping every time we enter a bank — needed for
    // the summary screen (elapsed time + average per Q + best streak).
    STATE.sessionCorrect = 0;
    STATE.sessionTotal = 0;
    STATE.seenThisSession.clear();
    STATE.streak = 0;
    STATE.bestStreak = 0;
    STATE.sessionStart = null;
    STATE.sessionElapsed = null;
    STATE.summarySaved = false;
    if (STATE.timerMinutes > 0) {
      startTimer(STATE.timerMinutes);    // also sets sessionStart
      updateClockAndTimer();
    }
    populateSettings();
    renderQuiz();
    show("quiz");
  }

  function bankTypeLabel(item) {
    if (item.data.kind === "mock") {
      const m = item.data.certTitle.match(/—\s*(Mock Exam \d+)/i);
      return m ? m[1] : "Mock Exam";
    }
    return "Practice questions";
  }

  function bankTypeSubtitle(item) {
    return item.data.kind === "mock"
      ? "full-length · all domains"
      : "drill by topic · adaptive";
  }

  // --- Step 1: certification picker ----------------------------------------

  function renderCertPicker(certBanks) {
    const setup = $("#setup");
    clear(setup);

    setup.appendChild(el("p", { className: "eyebrow" }, "Practice quiz"));
    setup.appendChild(el("h2", {}, "Pick a certification"));
    setup.appendChild(el("p", { className: "lead" },
      "Drill by topic, take a full-length mock exam, or resume where you left off. " +
      "Progress is stored locally — nothing leaves your browser."));

    if (certBanks.size === 0) {
      const p = el("p", {}, "No JSON banks found under practice/data/. Run ");
      p.appendChild(el("code", {}, "python3 practice/build.py"));
      p.appendChild(document.createTextNode(" first."));
      setup.appendChild(p);
      return;
    }

    const list = el("div", { className: "cert-list" });
    for (const [certKey, items] of certBanks) {
      // Use the practice bank for cert metadata; fall back to first available
      const practice = items.find(it => it.data.kind !== "mock") || items[0];
      const title = practice.data.certTitle.replace(/\s*—\s*Mock Exam \d+$/i, "");
      const blueprint = practice.data.blueprintVersion;
      const totalQ = items.reduce((sum, it) => sum + it.data.questions.length, 0);
      const bankCount = items.length;
      const mockCount = items.filter(it => it.data.kind === "mock").length;

      // data-cert is the key: it activates the per-cert gradient defined
      // in styles.css (.cert-card[data-cert="..."] { --gradient: ... }).
      // Without this, every card defaulted to the orange/yellow fallback.
      const card = el("button", { type: "button", className: "cert-card",
                                  dataset: { cert: certKey },
                                  onclick: () => renderBankPicker(certKey, items) });
      card.appendChild(el("span", { className: "cert-card-arrow",
                                    "aria-hidden": "true" }, "→"));
      card.appendChild(el("strong", {}, title));

      // Big-numeral stat: the headline number is "total questions",
      // which is the metric the user actually cares about at this step.
      const stats = el("div", { className: "cert-card-stats" });
      stats.appendChild(el("span", { className: "stat-num" }, String(totalQ)));
      stats.appendChild(el("span", { className: "stat-label" },
        `questions across\n${bankCount} bank${bankCount !== 1 ? "s" : ""}`));
      card.appendChild(stats);

      card.appendChild(el("div", { className: "cert-card-meta" },
        mockCount > 0
          ? `Practice + ${mockCount} mock exam${mockCount !== 1 ? "s" : ""}`
          : "Practice bank"));
      card.appendChild(el("div", { className: "cert-card-blueprint" },
        `Blueprint ${blueprint}`));
      list.appendChild(card);
    }
    setup.appendChild(list);
  }

  // --- Step 2: bank picker (per cert) --------------------------------------

  function renderBankPicker(certKey, items) {
    const setup = $("#setup");
    clear(setup);

    const practice = items.find(it => it.data.kind !== "mock") || items[0];
    const title = practice.data.certTitle.replace(/\s*—\s*Mock Exam \d+$/i, "");

    setup.appendChild(el("button", { type: "button", className: "back-button",
                                     onclick: () => renderCertPicker(STATE.certBanks) },
      "← All certifications"));
    setup.appendChild(el("h2", {}, title));
    setup.appendChild(el("p", { className: "cert-subtitle" },
      `Blueprint ${practice.data.blueprintVersion}`));

    // Sort items: practice first, then mock-1, then mock-2
    const sorted = [...items].sort((a, b) => {
      const order = it => it.data.kind === "mock" ? (it.data.cert.endsWith("-mock-2") ? 2 : 1) : 0;
      return order(a) - order(b);
    });

    const list = el("div", { className: "bank-list" });
    for (const it of sorted) {
      const card = el("button", { type: "button", className: "bank-card",
                                  onclick: () => loadBank(it.bank) });
      card.appendChild(el("strong", {}, bankTypeLabel(it)));
      card.appendChild(el("div", { className: "bank-meta" },
        `${it.data.questions.length} questions · ${it.data.domains.length} domains`));
      card.appendChild(el("div", { className: "bank-purpose" },
        bankTypeSubtitle(it)));
      list.appendChild(card);
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
    // Bank-complete short-circuit: if the user has visited every question
    // in the (filtered) bank and answered at least one, show the summary
    // screen instead of looping back to the start.
    if (isSessionComplete()) {
      renderSummary();
      show("summary");
      return;
    }
    const q = pickNext();
    if (!q) {
      $("#quiz-question").textContent = "No questions match your filters.";
      clear($("#quiz-choices"));
      return;
    }
    STATE.currentQ = q;
    STATE.currentChoice = null;
    // Defensive: blur any leftover focus from the previous question so
    // a residual :focus-within / :hover style doesn't carry over to a
    // choice in the new question (which would look like a stuck selection).
    if (document.activeElement
        && document.activeElement !== document.body
        && typeof document.activeElement.blur === "function") {
      try { document.activeElement.blur(); } catch (_) { /* no-op */ }
    }
    // Re-trigger the slide-in animation on every render. The Q-header
    // (counter + difficulty) animates alongside the card so the whole
    // row reads as one unit arriving from the right.
    for (const sel of [".question-header", ".question-card"]) {
      const node = document.querySelector(sel);
      if (!node) continue;
      node.classList.remove("slide-in");
      void node.offsetWidth;   // force reflow so animation restarts
      node.classList.add("slide-in");
    }

    $("#quiz-cert").textContent = STATE.bank.certTitle;
    $("#quiz-counter").textContent =
      `Q${STATE.seenThisSession.size} this session · ${STATE.sessionCorrect}/${STATE.sessionTotal} correct`;
    // Faded "Q.N" watermark in the card's top-right (decoration only).
    const watermark = $("#quiz-watermark");
    if (watermark) {
      watermark.textContent = "Q." + STATE.seenThisSession.size;
    }
    const domain = STATE.bank.domains.find(d => d.id === q.domain);
    $("#quiz-domain").textContent = domain ? domain.name : q.domain;
    const diff = $("#quiz-difficulty");
    diff.textContent = q.difficulty;
    diff.className = "difficulty " + q.difficulty;

    // Note: question title is intentionally NOT rendered on the quiz card —
    // many titles paraphrase the answer and would give it away. The title is
    // still used in Stats → "Questions you're working on" and in the feedback
    // panel shown after the user submits.

    const qBody = $("#quiz-question");
    clear(qBody);
    qBody.appendChild(renderMarkdown(q.question));

    const choices = $("#quiz-choices");
    clear(choices);
    for (const letter of ["A", "B", "C", "D"]) {
      const num = LETTER_TO_NUM[letter];
      const radio = el("input", { type: "radio", name: "choice", value: letter,
                                   onchange: () => {
                                     STATE.currentChoice = letter;
                                     $("#btn-submit").disabled = false;
                                   } });
      const choiceTextSpan = el("span", { className: "choice-text" });
      choiceTextSpan.appendChild(renderInlineToFragment(q.choices[letter]));
      const label = el("label", { dataset: { letter } },
        radio,
        el("span", { className: "choice-letter" }, num),
        choiceTextSpan);
      choices.appendChild(label);
    }

    $("#btn-submit").hidden = false;
    $("#btn-submit").disabled = true;
    $("#btn-skip").hidden = false;
    $("#btn-next").hidden = true;
    $("#quiz-feedback").hidden = true;
    const preHint = $("#kbd-hint-pre"), postHint = $("#kbd-hint-post");
    if (preHint) preHint.hidden = false;
    if (postHint) postHint.hidden = true;
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

  function showStreakToast(n) {
    const existing = document.querySelector(".streak-toast");
    if (existing) existing.remove();
    const toast = el("div", { className: "streak-toast" },
      el("span", { className: "streak-num" }, String(n)),
      "in a row · keep going");
    document.body.appendChild(toast);
    // Force reflow then trigger animation
    void toast.offsetWidth;
    toast.classList.add("show");
    setTimeout(() => toast.remove(), 1800);
  }

  function showFloatPlus(label) {
    const plus = el("span", { className: "float-plus" }, "+1");
    label.style.position = label.style.position || "relative";
    label.appendChild(plus);
    setTimeout(() => plus.remove(), 1200);
  }

  // Zero-dependency confetti burst — 40 particles in random colors, each
  // following a parabolic arc with rotation. Origin is the centre of the
  // chosen correct-answer label so the burst feels like it comes from that
  // row. Auto-skipped when prefers-reduced-motion: reduce is set.
  function fireConfetti(originEl) {
    if (window.matchMedia
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const rect = originEl.getBoundingClientRect();
    const ox = rect.left + rect.width / 2;
    const oy = rect.top + rect.height / 2;

    // Pick the palette for the cert the user is currently studying so
    // the burst reads as "the cert's colours celebrating", not a
    // generic candy-mix.
    const sourceCert = (STATE.bank && (STATE.bank.sourceCert || STATE.bank.cert)) || "";
    const baseCert = sourceCert.replace(/-mock-\d+$/i, "");
    const colors = CERT_PALETTES[baseCert] || [
      "#FF4F2C", "#FFAB1F", "#10B981", "#14B8A6",
      "#3B82F6", "#6366F1", "#A855F7", "#EC4899",
      "#F59E0B", "#FFFFFF",
    ];
    const N = 40;
    const container = document.createElement("div");
    container.className = "confetti-container";

    for (let i = 0; i < N; i++) {
      const p = document.createElement("span");
      p.className = "confetti-particle";

      // Mostly-upward initial direction with wide horizontal spread
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
      const speed = 160 + Math.random() * 200;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      // Midpoint of parabola (apex)
      const midDx = dx * 0.65;
      const midDy = dy * 0.85;
      // Final position: initial horizontal + gravity fall
      const endDx = dx;
      const endDy = dy + 380 + Math.random() * 220;
      const rot = (Math.random() - 0.5) * 720;

      p.style.left = ox + "px";
      p.style.top = oy + "px";
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      // Vary particle shape so it doesn't all look identical
      if (Math.random() < 0.3) {
        p.style.borderRadius = "50%";
        p.style.width = "8px"; p.style.height = "8px";
      }
      p.style.setProperty("--mid-dx", midDx + "px");
      p.style.setProperty("--mid-dy", midDy + "px");
      p.style.setProperty("--end-dx", endDx + "px");
      p.style.setProperty("--end-dy", endDy + "px");
      p.style.setProperty("--rot", rot + "deg");
      p.style.animationDelay = (Math.random() * 80) + "ms";

      container.appendChild(p);
    }

    document.body.appendChild(container);
    setTimeout(() => container.remove(), 2000);
  }

  function submitAnswer() {
    if (!STATE.currentChoice) return;
    const q = STATE.currentQ;
    const correct = STATE.currentChoice === q.correctAnswer;
    recordAttempt(q.id, correct);
    STATE.sessionTotal++;
    if (correct) {
      STATE.sessionCorrect++;
      STATE.streak++;
      if (STATE.streak > STATE.bestStreak) STATE.bestStreak = STATE.streak;
    } else {
      STATE.streak = 0;
    }

    let correctLabel = null;
    for (const label of $("#quiz-choices").children) {
      const letter = label.dataset.letter;
      const radio = label.querySelector("input");
      radio.disabled = true;
      label.classList.add("disabled");
      if (letter === q.correctAnswer) {
        label.classList.add("correct");
        correctLabel = label;
      } else if (letter === STATE.currentChoice && !correct) {
        label.classList.add("incorrect");
      }
    }

    // Card-level flash + optional rewards
    const card = document.querySelector(".question-card");
    if (card) {
      card.classList.remove("flash-correct", "flash-incorrect");
      void card.offsetWidth;  // restart animation
      card.classList.add(correct ? "flash-correct" : "flash-incorrect");
      setTimeout(() => card.classList.remove("flash-correct", "flash-incorrect"), 700);
    }
    if (correct && correctLabel) {
      showFloatPlus(correctLabel);
      fireConfetti(correctLabel);
      // Toast at 3, 5, 7, 10, every 5 thereafter
      if (STATE.streak === 3 || STATE.streak === 5 || STATE.streak === 7
          || STATE.streak === 10 || (STATE.streak > 10 && STATE.streak % 5 === 0)) {
        showStreakToast(STATE.streak);
      }
    }

    const fb = $("#quiz-feedback");
    fb.hidden = false;
    fb.className = correct ? "correct" : "incorrect";
    clear(fb);
    const correctNum = LETTER_TO_NUM[q.correctAnswer] || q.correctAnswer;
    fb.appendChild(el("h4", {},
      correct ? "✓ Correct" : `✗ Incorrect · Correct answer: ${correctNum}`));
    // Suppress the Topic line when the title is a placeholder fallback
    // ("Question 5") — the running head already shows the domain, which is
    // the meaningful context for mock-exam questions.
    if (q.title && !FALLBACK_TITLE_RE.test(q.title)) {
      fb.appendChild(el("p", { className: "fb-topic" },
        "Topic — ", q.title));
    }
    if (q.shortAnswer) {
      const p = el("p", { className: "fb-short" });
      p.appendChild(renderInlineToFragment(q.shortAnswer));
      fb.appendChild(p);
    }
    if (q.explanation) {
      fb.appendChild(renderMarkdown(q.explanation));
    }

    $("#btn-submit").hidden = true;
    $("#btn-skip").hidden = true;
    $("#btn-next").hidden = false;
    const preHint = $("#kbd-hint-pre"), postHint = $("#kbd-hint-post");
    if (preHint) preHint.hidden = true;
    if (postHint) postHint.hidden = false;
    updateSessionBar();
  }

  // Skip — moves to the next question without recording an attempt.
  // The question is added to seenThisSession so it doesn't immediately repeat,
  // but in adaptive mode it'll come back in a future session.
  function skipQuestion() {
    // Don't double-fire if already past submit
    if ($("#btn-next").hidden === false) return;
    renderQuiz();
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

    // Past attempts on this bank — clickable rows reopen each summary
    const past = loadSessionHistory(STATE.bank.cert).slice().reverse();
    if (past.length > 0) {
      const headRow = el("div", { className: "stats-history-head" });
      headRow.appendChild(el("h3", { style: "margin:2rem 0 0.75rem" },
        `Past attempts (${past.length})`));
      headRow.appendChild(el("button", { type: "button", className: "link danger",
        onclick: () => clearSessionHistoryConfirm(STATE.bank.cert) }, "Clear history"));
      c.appendChild(headRow);
      c.appendChild(renderAttemptList(past));
    }
  }

  async function clearSessionHistoryConfirm(certKey) {
    const ok = await customConfirm({
      title: "Clear attempt history?",
      message: `This removes every saved completed-session record for this bank. Your in-progress per-question history isn't affected.`,
      confirmLabel: "Clear history",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!ok) return;
    clearSessionHistoryForCert(certKey);
    renderStats();
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

  async function resetHistory() {
    const ok = await customConfirm({
      title: "Reset all progress?",
      message: `This erases your saved attempts and accuracy for “${STATE.bank.certTitle}”. This can't be undone — but the questions themselves stay available.`,
      confirmLabel: "Reset progress",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!ok) return;
    STATE.history = {};
    STATE.seenThisSession.clear();
    STATE.sessionCorrect = 0;
    STATE.sessionTotal = 0;
    saveHistory();
    renderStats();
  }

  // --- Session summary + history ------------------------------------------
  //
  // When the user has visited every question in the (filtered) bank and
  // answered at least one, renderQuiz redirects to the summary screen
  // instead of looping back. The summary screen:
  //   • shows overall score + per-domain breakdown + weak-area callout
  //   • includes time stats ONLY when a timer was running
  //   • persists a record of the completed attempt to localStorage so the
  //     user can compare attempts over time
  //   • lets the user export the attempt as a printable HTML report or CSV
  //
  // Each bank keeps its own ring buffer of completed sessions under
  // `dbx-practice-sessions-<cert>` (cap = SESSION_HISTORY_CAP).

  function isSessionComplete() {
    const total = filteredQuestions().length;
    if (total === 0) return false;
    return STATE.seenThisSession.size >= total && STATE.sessionTotal > 0;
  }

  function loadSessionHistory(certKey) {
    try {
      const raw = localStorage.getItem(SESSION_HISTORY_PREFIX + certKey);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (_) { return []; }
  }

  function saveSessionRecord(record) {
    try {
      const list = loadSessionHistory(record.cert);
      list.push(record);
      while (list.length > SESSION_HISTORY_CAP) list.shift();
      localStorage.setItem(SESSION_HISTORY_PREFIX + record.cert, JSON.stringify(list));
    } catch (e) { console.warn("Failed to save session record:", e); }
  }

  function clearSessionHistoryForCert(certKey) {
    try { localStorage.removeItem(SESSION_HISTORY_PREFIX + certKey); }
    catch (_) { /* ignore */ }
  }

  function buildSessionRecord() {
    const pct = STATE.sessionTotal === 0 ? 0
              : Math.round((STATE.sessionCorrect / STATE.sessionTotal) * 100);
    const isMock = STATE.bank.kind === "mock";
    const domains = STATE.bank.domains.map(d => {
      const qs = STATE.bank.questions.filter(q => q.domain === d.id);
      const answered = qs.filter(q =>
        STATE.seenThisSession.has(q.id)
        && (STATE.history[q.id]?.attempts.length || 0) > 0);
      const correct = answered.filter(q => {
        const last = STATE.history[q.id].attempts.slice(-1)[0];
        return last && last.correct;
      });
      return {
        id: d.id,
        name: d.name,
        total: answered.length,
        correct: correct.length,
        pct: answered.length === 0 ? null
           : Math.round((correct.length / answered.length) * 100),
      };
    });
    return {
      id: Date.now(),
      ts: Date.now(),
      cert: STATE.bank.cert,
      certTitle: STATE.bank.certTitle,
      isMock,
      total: STATE.sessionTotal,
      correct: STATE.sessionCorrect,
      pct,
      durationMs: STATE.sessionElapsed,
      avgPerQMs: STATE.sessionElapsed && STATE.sessionTotal > 0
                ? Math.round(STATE.sessionElapsed / STATE.sessionTotal) : null,
      bestStreak: STATE.bestStreak,
      passed: isMock ? pct >= PASS_THRESHOLD : null,
      threshold: isMock ? PASS_THRESHOLD : null,
      domains,
    };
  }

  function formatDuration(ms) {
    if (!Number.isFinite(ms) || ms < 0) return "—";
    const totalSec = Math.round(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    }
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function formatDateTime(ts) {
    const d = new Date(ts);
    const date = d.toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "2-digit",
    });
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    return { date, time, full: date + " · " + time };
  }

  // Toneband for a percentage. Used for verdict text + meter colors.
  function toneFor(pct) {
    if (pct == null) return "muted";
    if (pct >= 90) return "great";
    if (pct >= 80) return "good";
    if (pct >= PASS_THRESHOLD) return "good";
    if (pct >= 60) return "warn";
    if (pct >= 40) return "warn";
    return "weak";
  }

  function getVerdict(record) {
    const pct = record.pct;
    if (record.isMock) {
      return {
        title: record.passed ? "PASS" : "BELOW PASSING",
        sub: `Passing threshold: ${record.threshold}%`,
        tone: record.passed ? "good" : "weak",
      };
    }
    if (pct === 100) return { title: "Perfect score", sub: "Every question correct", tone: "great" };
    if (pct >= 90)   return { title: "Excellent",      sub: "Mastery level",          tone: "great" };
    if (pct >= 80)   return { title: "Great work",     sub: "Strong understanding",   tone: "good"  };
    if (pct >= 70)   return { title: "Solid",          sub: "Above the typical bar",  tone: "good"  };
    if (pct >= 60)   return { title: "Getting close",  sub: "Review your weak areas", tone: "warn"  };
    if (pct >= 40)   return { title: "Keep practicing", sub: "Focus on the gaps below", tone: "warn"  };
    return                  { title: "More practice needed", sub: "Start with the weakest module", tone: "weak"  };
  }

  // Weak areas = domains attempted with pct strictly below 70% (the
  // Databricks passing line), sorted by pct ascending so the most
  // urgent gap is first. "Not attempted" domains are excluded.
  function getWeakDomains(domains) {
    return domains
      .filter(d => d.pct != null && d.pct < PASS_THRESHOLD)
      .sort((a, b) => a.pct - b.pct);
  }

  function metricBlock(label, value, sub) {
    const node = el("div", { className: "summary-metric" });
    node.appendChild(el("div", { className: "summary-metric-label" }, label));
    node.appendChild(el("div", { className: "summary-metric-value" }, value));
    if (sub) node.appendChild(el("div", { className: "summary-metric-sub" }, sub));
    return node;
  }

  // record:    a session record. If omitted, builds from current STATE +
  //            persists it (live mode).
  // opts.past: true → render in "viewing past attempt" mode (different
  //            action buttons; no confetti).
  function renderSummary(record, opts) {
    opts = opts || {};
    let data;
    if (record) {
      data = record;
    } else {
      // Freeze elapsed time at completion. Subtract paused time so the
      // figure reflects effort, not wall-clock.
      if (STATE.sessionElapsed == null && STATE.sessionStart != null) {
        STATE.sessionElapsed = Math.max(0,
          Date.now() - STATE.sessionStart - (STATE.totalPausedMs || 0));
      }
      data = buildSessionRecord();
      if (!STATE.summarySaved) {
        saveSessionRecord(data);
        STATE.summarySaved = true;
      }
      // Stop the running timer — the session is over
      STATE.timerEnd = null;
      STATE.timerPaused = false;
      const ov = $("#pause-overlay");
      if (ov) ov.hidden = true;
      document.body.classList.remove("timer-paused");
      updateClockAndTimer();
    }
    const isPast = !!opts.past;

    const summary = $("#summary");
    clear(summary);

    summary.appendChild(el("p", { className: "eyebrow" },
      isPast ? "Past attempt" : "Session complete"));
    summary.appendChild(el("h2", {}, data.certTitle));
    const ts = formatDateTime(data.ts);
    summary.appendChild(el("p", { className: "summary-timestamp" }, ts.full));

    // ---- Hero: big number + verdict ----
    const hero = el("div", { className: "summary-hero", dataset: { tone: toneFor(data.pct) } });
    const numWrap = el("div", { className: "summary-num-wrap" });
    numWrap.appendChild(el("span", { className: "summary-num" }, String(data.pct)));
    numWrap.appendChild(el("span", { className: "summary-num-pct" }, "%"));
    hero.appendChild(numWrap);

    const heroMeta = el("div", { className: "summary-hero-meta" });
    heroMeta.appendChild(el("div", { className: "summary-fraction" },
      `${data.correct} / ${data.total} correct`));
    const verdict = getVerdict(data);
    heroMeta.appendChild(el("div", { className: "summary-verdict",
                                      dataset: { tone: verdict.tone } },
      verdict.title));
    heroMeta.appendChild(el("div", { className: "summary-verdict-sub" }, verdict.sub));
    hero.appendChild(heroMeta);
    summary.appendChild(hero);

    // ---- Weak-area callout ----
    const weak = getWeakDomains(data.domains);
    if (weak.length > 0) {
      const callout = el("div", { className: "summary-callout weak" });
      callout.appendChild(el("div", { className: "summary-callout-title" },
        weak.length === 1 ? "Focus next on this module"
                          : `Focus next on these ${weak.length} modules`));
      const ul = el("ul", { className: "summary-callout-list" });
      for (const d of weak.slice(0, 4)) {
        ul.appendChild(el("li", {},
          el("span", { className: "wk-name" }, d.name),
          el("span", { className: "wk-pct" }, `${d.correct}/${d.total} · ${d.pct}%`)));
      }
      callout.appendChild(ul);
      summary.appendChild(callout);
    }

    // ---- Per-domain breakdown ----
    summary.appendChild(el("h3", { className: "summary-section-title" }, "By module"));
    const domainList = el("div", { className: "summary-domains" });
    for (const d of data.domains) {
      const row = el("div", { className: "summary-domain-row" });
      const head = el("div", { className: "summary-domain-head" });
      head.appendChild(el("span", { className: "summary-domain-name" }, d.name));
      head.appendChild(el("span", { className: "summary-domain-stat" },
        d.total === 0 ? "Not attempted" : `${d.correct}/${d.total} · ${d.pct}%`));
      row.appendChild(head);

      const meter = el("div", { className: "summary-meter" });
      if (d.total > 0) {
        meter.appendChild(el("div", { className: "summary-meter-fill",
                                       dataset: { tone: toneFor(d.pct) },
                                       style: `width: ${d.pct}%` }));
      }
      row.appendChild(meter);
      domainList.appendChild(row);
    }
    summary.appendChild(domainList);

    // ---- Stats grid (time only when timer was used; best streak always) ----
    const gridItems = [];
    if (data.durationMs != null) {
      gridItems.push(metricBlock("Total time", formatDuration(data.durationMs)));
      gridItems.push(metricBlock("Average / question", formatDuration(data.avgPerQMs)));
    }
    if (data.bestStreak > 0) {
      gridItems.push(metricBlock("Best streak", String(data.bestStreak), "correct in a row"));
    }
    if (gridItems.length > 0) {
      summary.appendChild(el("h3", { className: "summary-section-title" },
        data.durationMs != null ? "Time & streak" : "Streak"));
      const grid = el("div", { className: "summary-stats-grid" });
      gridItems.forEach(node => grid.appendChild(node));
      summary.appendChild(grid);
    }

    // ---- Past attempts (only on live summary; comparing to history) ----
    if (!isPast) {
      const history = loadSessionHistory(data.cert);
      // Don't include the just-saved record (it's already the hero)
      const previous = history.filter(r => r.id !== data.id).slice(-6).reverse();
      if (previous.length > 0) {
        summary.appendChild(el("h3", { className: "summary-section-title" }, "Past attempts"));
        summary.appendChild(renderAttemptList(previous, { compact: true }));
      }
    }

    // ---- Actions ----
    const actions = el("div", { className: "summary-actions" });
    if (isPast) {
      actions.appendChild(el("button", { type: "button", className: "primary",
        onclick: () => { renderStats(); show("stats"); } }, "← Back to history"));
    } else {
      actions.appendChild(el("button", { type: "button", className: "primary",
        onclick: () => {
          resetSessionState();
          if (STATE.timerMinutes > 0) startTimer(STATE.timerMinutes);
          renderQuiz();
          show("quiz");
        }
      }, "Try again"));
    }
    actions.appendChild(el("button", { type: "button", className: "ghost",
      onclick: () => { renderStats(); show("stats"); } }, "Detailed stats"));
    actions.appendChild(el("button", { type: "button", className: "ghost",
      onclick: () => goToBankPickerForCurrentCert() }, "Switch bank"));
    summary.appendChild(actions);

    // ---- Export bar ----
    const exportBar = el("div", { className: "summary-export" });
    exportBar.appendChild(el("span", { className: "summary-export-label" },
      "Export this summary —"));
    exportBar.appendChild(el("button", { type: "button", className: "link",
      onclick: () => exportSummaryAsHTML(data) }, "HTML"));
    exportBar.appendChild(el("button", { type: "button", className: "link",
      onclick: () => exportSummaryAsCSV(data) }, "CSV"));
    summary.appendChild(exportBar);

    // ---- Confetti on high scores (live summaries only) ----
    if (!isPast && data.pct >= 80) {
      setTimeout(() => {
        const num = summary.querySelector(".summary-num-wrap");
        if (num) fireConfetti(num);
      }, 280);
    }

    // Scroll to top so the hero is in view
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // --- Attempt history list (rendered into summary + stats) ---------------

  function renderAttemptList(records, opts) {
    opts = opts || {};
    const list = el("div", { className: "attempt-list" });
    for (const r of records) {
      const ts = formatDateTime(r.ts);
      // Rich aria-label so screen readers announce the full row context in
      // one phrase instead of reading each cell separately ("85 percent")
      // → ("View attempt from 21 May 2026 at 14:35, scored 85 percent,
      //    38 of 45 correct, took 24 minutes 15 seconds, passed").
      const parts = [
        `View attempt from ${ts.date} at ${ts.time}`,
        `scored ${r.pct} percent`,
        `${r.correct} of ${r.total} correct`,
      ];
      if (r.durationMs != null) parts.push(`took ${formatDuration(r.durationMs)}`);
      if (r.isMock) parts.push(r.passed ? "passed" : "below passing threshold");
      const row = el("button", { type: "button", className: "attempt-row",
                                  "aria-label": parts.join(", "),
                                  onclick: () => { renderSummary(r, { past: true }); show("summary"); } });
      row.appendChild(el("span", { className: "attempt-when" },
        el("span", { className: "attempt-date" }, ts.date),
        el("span", { className: "attempt-time" }, ts.time)));
      row.appendChild(el("span", { className: "attempt-pct", dataset: { tone: toneFor(r.pct) } },
        r.pct + "%"));
      row.appendChild(el("span", { className: "attempt-fraction" },
        `${r.correct}/${r.total}`));
      if (r.durationMs != null) {
        row.appendChild(el("span", { className: "attempt-duration" },
          formatDuration(r.durationMs)));
      } else {
        row.appendChild(el("span", { className: "attempt-duration muted" }, "—"));
      }
      if (r.isMock) {
        row.appendChild(el("span", { className: "attempt-verdict",
                                      dataset: { tone: r.passed ? "good" : "weak" } },
          r.passed ? "PASS" : "BELOW"));
      } else if (!opts.compact) {
        row.appendChild(el("span", { className: "attempt-verdict muted" }, "practice"));
      } else {
        row.appendChild(el("span"));
      }
      row.appendChild(el("span", { className: "attempt-arrow", "aria-hidden": "true" }, "→"));
      list.appendChild(row);
    }
    return list;
  }

  // --- Export: HTML + CSV --------------------------------------------------

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Plain-text escape for embedding inside an HTML export. NOT used for
  // building DOM nodes anywhere — only for writing the standalone HTML file.
  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function exportSummaryAsHTML(record) {
    const ts = formatDateTime(record.ts);
    const verdict = getVerdict(record);
    const weak = getWeakDomains(record.domains);
    const safeName = record.cert.replace(/[^a-z0-9-]/gi, "");
    const stamp = new Date(record.ts).toISOString().replace(/[:.]/g, "-").slice(0, 16);

    const domainRowsHtml = record.domains.map(d => {
      const pct = d.total === 0 ? "—" : d.pct + "%";
      const stat = d.total === 0 ? "Not attempted" : `${d.correct}/${d.total} · ${pct}`;
      const width = d.total === 0 ? 0 : d.pct;
      const tone = toneFor(d.pct);
      return `
        <tr>
          <td class="dn">${escapeHtml(d.name)}</td>
          <td class="ds">${escapeHtml(stat)}</td>
          <td class="db"><div class="bar"><div class="bf tone-${tone}" style="width:${width}%"></div></div></td>
        </tr>`;
    }).join("");

    const weakHtml = weak.length === 0 ? "" : `
      <div class="callout">
        <h3>Focus areas</h3>
        <ul>${weak.slice(0, 4).map(d =>
          `<li><strong>${escapeHtml(d.name)}</strong> — ${d.correct}/${d.total} · ${d.pct}%</li>`).join("")}</ul>
      </div>`;

    const timeRowsHtml = record.durationMs == null ? "" : `
      <tr><th>Total time</th><td>${escapeHtml(formatDuration(record.durationMs))}</td></tr>
      <tr><th>Average / question</th><td>${escapeHtml(formatDuration(record.avgPerQMs))}</td></tr>`;
    const streakRow = record.bestStreak > 0
      ? `<tr><th>Best streak</th><td>${record.bestStreak} correct in a row</td></tr>` : "";

    const passLine = record.isMock
      ? `<p class="threshold">Passing threshold: ${record.threshold}%</p>` : "";

    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${escapeHtml(record.certTitle)} — ${escapeHtml(ts.full)}</title>
<style>
  :root { --fg:#18181B; --muted:#52525B; --hairline:#E5E5E2; --bg:#FAFAF7; --surface:#fff;
          --good:#14532D; --warn:#92400E; --weak:#991B1B; --great:#065F46; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
         background: var(--bg); color: var(--fg); margin: 0; padding: 2.5rem 1.5rem; font-size: 15px; line-height: 1.55; }
  main { max-width: 720px; margin: 0 auto; }
  .eyebrow { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 11px; font-weight: 600;
             letter-spacing: 0.12em; text-transform: uppercase; color: var(--weak); margin: 0 0 0.6rem; }
  h1 { font-size: 2rem; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 0.3rem; line-height: 1.1; }
  .when { color: var(--muted); font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 12px; letter-spacing: 0.04em; margin: 0 0 2rem; }
  .hero { background: var(--surface); border: 1px solid var(--hairline); border-radius: 12px;
          padding: 2rem; display: flex; align-items: center; gap: 2rem; margin-bottom: 1.5rem; }
  .hero .pct { font-size: 5rem; font-weight: 600; line-height: 1; letter-spacing: -0.04em; font-variant-numeric: tabular-nums; }
  .hero .pct.tone-great { color: var(--great); } .hero .pct.tone-good { color: var(--good); }
  .hero .pct.tone-warn { color: var(--warn); }   .hero .pct.tone-weak { color: var(--weak); }
  .hero .pct::after { content: "%"; font-size: 1.5rem; color: var(--muted); font-weight: 500; margin-left: 0.1em; }
  .hero .meta .fraction { font-size: 1.25rem; font-weight: 500; margin-bottom: 0.4rem; }
  .hero .meta .verdict { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 0.85rem; font-weight: 600;
                          letter-spacing: 0.08em; text-transform: uppercase; }
  .hero .meta .verdict.tone-good { color: var(--good); } .hero .meta .verdict.tone-weak { color: var(--weak); }
  .hero .meta .verdict.tone-great { color: var(--great); } .hero .meta .verdict.tone-warn { color: var(--warn); }
  .threshold { font-family: ui-monospace, "SF Mono", Menlo, monospace; color: var(--muted); font-size: 0.8rem; margin: 0.3rem 0 0; }
  .callout { background: rgba(185,28,28,0.06); border: 1px solid rgba(185,28,28,0.25); border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; }
  .callout h3 { margin: 0 0 0.5rem; font-size: 0.9rem; color: var(--weak); font-weight: 600; letter-spacing: -0.005em; }
  .callout ul { margin: 0; padding-left: 1.1rem; } .callout li { margin: 0.2rem 0; }
  h2 { font-size: 0.85rem; font-family: ui-monospace, "SF Mono", Menlo, monospace; font-weight: 600;
       letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin: 2rem 0 0.85rem; }
  table.domains { width: 100%; border-collapse: collapse; background: var(--surface); border: 1px solid var(--hairline); border-radius: 10px; overflow: hidden; }
  table.domains td { padding: 0.7rem 0.9rem; border-top: 1px solid var(--hairline); vertical-align: middle; }
  table.domains tr:first-child td { border-top: 0; }
  td.dn { font-weight: 500; width: 40%; } td.ds { color: var(--muted); font-family: ui-monospace, monospace; font-size: 0.82rem; width: 22%; }
  td.db { width: 38%; }
  .bar { background: var(--hairline); height: 6px; border-radius: 99px; overflow: hidden; }
  .bf { height: 100%; border-radius: 99px; }
  .bf.tone-great { background: var(--great); } .bf.tone-good { background: var(--good); }
  .bf.tone-warn  { background: var(--warn);  } .bf.tone-weak { background: var(--weak); }
  table.stats { width: 100%; border-collapse: collapse; background: var(--surface); border: 1px solid var(--hairline); border-radius: 10px; overflow: hidden; }
  table.stats th, table.stats td { padding: 0.7rem 0.9rem; text-align: left; border-top: 1px solid var(--hairline); }
  table.stats tr:first-child th, table.stats tr:first-child td { border-top: 0; }
  table.stats th { font-weight: 500; color: var(--muted); font-size: 0.85rem; width: 40%; }
  table.stats td { font-variant-numeric: tabular-nums; }
  .footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--hairline); color: var(--muted); font-size: 0.75rem; font-family: ui-monospace, monospace; }
  @media print { body { padding: 1rem; } .hero, table.domains, table.stats { box-shadow: none; } }
</style></head>
<body><main>
  <p class="eyebrow">${record.isMock ? "Mock exam" : "Practice"} · attempt summary</p>
  <h1>${escapeHtml(record.certTitle)}</h1>
  <p class="when">Completed ${escapeHtml(ts.full)}</p>

  <div class="hero">
    <div class="pct tone-${toneFor(record.pct)}">${record.pct}</div>
    <div class="meta">
      <div class="fraction">${record.correct} / ${record.total} correct</div>
      <div class="verdict tone-${verdict.tone}">${escapeHtml(verdict.title)}</div>
      ${passLine}
    </div>
  </div>

  ${weakHtml}

  <h2>By module</h2>
  <table class="domains"><tbody>${domainRowsHtml}</tbody></table>

  ${timeRowsHtml || streakRow ? `<h2>Stats</h2><table class="stats"><tbody>${timeRowsHtml}${streakRow}</tbody></table>` : ""}

  <p class="footer">Exported from Databricks Certification Practice — a study aid, not the official exam.</p>
</main></body></html>`;

    downloadBlob(new Blob([html], { type: "text/html;charset=utf-8" }),
      `dbx-${safeName}-${stamp}.html`);
  }

  function exportSummaryAsCSV(record) {
    const ts = formatDateTime(record.ts);
    const safeName = record.cert.replace(/[^a-z0-9-]/gi, "");
    const stamp = new Date(record.ts).toISOString().replace(/[:.]/g, "-").slice(0, 16);

    const q = (v) => {
      const s = String(v == null ? "" : v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = [];
    rows.push(["Field", "Value"].join(","));
    rows.push(["Certification", record.certTitle].map(q).join(","));
    rows.push(["Type", record.isMock ? "Mock exam" : "Practice"].map(q).join(","));
    rows.push(["Completed", ts.full].map(q).join(","));
    rows.push(["Score (%)", record.pct].map(q).join(","));
    rows.push(["Correct", record.correct].map(q).join(","));
    rows.push(["Total questions", record.total].map(q).join(","));
    if (record.isMock) {
      rows.push(["Passing threshold (%)", record.threshold].map(q).join(","));
      rows.push(["Verdict", record.passed ? "PASS" : "BELOW PASSING"].map(q).join(","));
    }
    if (record.durationMs != null) {
      rows.push(["Total time", formatDuration(record.durationMs)].map(q).join(","));
      rows.push(["Average per question", formatDuration(record.avgPerQMs)].map(q).join(","));
    }
    if (record.bestStreak > 0) {
      rows.push(["Best streak", record.bestStreak].map(q).join(","));
    }
    rows.push("");
    rows.push(["Module", "Correct", "Total", "Percentage"].join(","));
    for (const d of record.domains) {
      rows.push([
        d.name,
        d.correct,
        d.total,
        d.total === 0 ? "" : d.pct,
      ].map(q).join(","));
    }
    downloadBlob(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }),
      `dbx-${safeName}-${stamp}.csv`);
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
    $("#setting-timer").value = String(STATE.timerMinutes || 0);
  }

  function applySettings() {
    STATE.settings.mode = $("#setting-mode").value;
    STATE.settings.domain = $("#setting-domain").value;
    STATE.settings.difficulty = $("#setting-difficulty").value;
    const tmin = parseInt($("#setting-timer").value, 10) || 0;
    if (tmin !== STATE.timerMinutes || tmin > 0) {
      saveTimerMinutes(tmin);
      startTimer(tmin);
      updateClockAndTimer();
    }
    STATE.sequentialIndex = 0;
    STATE.seenThisSession.clear();
    renderQuiz();
    show("quiz");
  }

  // --- Clock + timer -------------------------------------------------------

  function loadTimerMinutes() {
    try {
      const v = parseInt(localStorage.getItem(TIMER_KEY) || "0", 10);
      return Number.isFinite(v) && v >= 0 ? v : 0;
    } catch (_) { return 0; }
  }

  function saveTimerMinutes(min) {
    try { localStorage.setItem(TIMER_KEY, String(min)); } catch (_) { /* no-op */ }
  }

  function startTimer(minutes) {
    STATE.timerMinutes = minutes;
    STATE.timerExpired = false;
    STATE.timerEnd = minutes > 0 ? Date.now() + minutes * 60 * 1000 : null;
    // Session clock is only meaningful when there's an exam timer running.
    // In free-practice mode we deliberately don't track time — see the
    // summary screen, which hides the time stats when sessionStart is null.
    STATE.sessionStart = minutes > 0 ? Date.now() : null;
    STATE.sessionElapsed = null;
    STATE.timerPaused = false;
    STATE.pausedRemainingMs = null;
    STATE.totalPausedMs = 0;
    STATE.pauseStart = null;
  }

  // --- Pause / resume the exam timer --------------------------------------
  //
  // Pausing freezes the countdown, blurs the screen behind a Resume overlay
  // so the user can step away without losing their seat, and accumulates
  // the off-clock time in STATE.totalPausedMs so the summary's "Total time"
  // accurately reflects effort (not wall-clock).

  function pauseTimer() {
    if (STATE.timerPaused || !STATE.timerEnd || STATE.timerExpired) return;
    STATE.pausedRemainingMs = Math.max(0, STATE.timerEnd - Date.now());
    STATE.pauseStart = Date.now();
    STATE.timerPaused = true;
    STATE.timerEnd = null;
    const ov = $("#pause-overlay");
    if (ov) ov.hidden = false;
    document.body.classList.add("timer-paused");
    updateClockAndTimer();
    // Move focus to the Resume button so Enter/Space resumes immediately.
    const r = $("#btn-resume");
    if (r) setTimeout(() => r.focus({ preventScroll: true }), 0);
  }

  function resumeTimer() {
    if (!STATE.timerPaused) return;
    const remain = STATE.pausedRemainingMs || 0;
    STATE.totalPausedMs += STATE.pauseStart ? (Date.now() - STATE.pauseStart) : 0;
    STATE.pauseStart = null;
    STATE.pausedRemainingMs = null;
    STATE.timerPaused = false;
    STATE.timerEnd = remain > 0 ? Date.now() + remain : null;
    const ov = $("#pause-overlay");
    if (ov) ov.hidden = true;
    document.body.classList.remove("timer-paused");
    updateClockAndTimer();
  }

  function toggleTimerPause() {
    if (STATE.timerPaused) resumeTimer();
    else pauseTimer();
  }

  function hasActiveSession() {
    // A completed session that's already been written to history isn't
    // "active" anymore — the user is on the summary screen and shouldn't
    // be asked to confirm leaving. Likewise an expired timer means the
    // exam is over.
    if (STATE.summarySaved) return false;
    if (STATE.timerExpired) return false;
    return STATE.sessionTotal > 0 || STATE.timerEnd != null || STATE.timerPaused;
  }

  function resetSessionState() {
    STATE.sessionCorrect = 0;
    STATE.sessionTotal = 0;
    STATE.seenThisSession.clear();
    STATE.streak = 0;
    STATE.bestStreak = 0;
    STATE.timerEnd = null;
    STATE.timerExpired = false;
    STATE.sessionStart = null;
    STATE.sessionElapsed = null;
    STATE.summarySaved = false;
    STATE.timerPaused = false;
    STATE.pausedRemainingMs = null;
    STATE.totalPausedMs = 0;
    STATE.pauseStart = null;
    const ov = $("#pause-overlay");
    if (ov) ov.hidden = true;
    document.body.classList.remove("timer-paused");
    updateClockAndTimer();
  }

  async function confirmLeaveExam(destination) {
    if (hasActiveSession()) {
      const ok = await customConfirm({
        title: STATE.timerEnd ? "Stop timed exam?" : "Leave this session?",
        message: STATE.timerEnd
          ? "Your timer will reset and the session-level stats will be cleared. Your long-term saved history isn't affected."
          : "Your session-level stats (correct/total) will reset. Your long-term saved history isn't affected.",
        confirmLabel: STATE.timerEnd ? "Stop & leave" : "Leave",
        cancelLabel: "Keep going",
        danger: true,
      });
      if (!ok) return false;
    }
    resetSessionState();
    destination();
    return true;
  }

  function goToCertPicker() {
    if (STATE.certBanks) {
      renderCertPicker(STATE.certBanks);
      show("setup");
    } else {
      location.reload();
    }
  }

  function goToBankPickerForCurrentCert() {
    if (!STATE.bank || !STATE.certBanks) { goToCertPicker(); return; }
    const sourceCert = STATE.bank.sourceCert || STATE.bank.cert;
    const items = STATE.certBanks.get(sourceCert);
    if (items) {
      renderBankPicker(sourceCert, items);
      show("setup");
    } else {
      goToCertPicker();
    }
  }

  function confirmBackToCertPicker() {
    confirmLeaveExam(goToCertPicker);
  }
  function confirmBackToBankPicker() {
    confirmLeaveExam(goToBankPickerForCurrentCert);
  }

  function showTimerExpiredToast() {
    const existing = document.querySelector(".streak-toast");
    if (existing) existing.remove();
    const toast = el("div", { className: "streak-toast" },
      el("span", { className: "streak-num",
                   style: "background:var(--negative);color:#fff" }, "Time's up"),
      " · review your stats or keep going");
    document.body.appendChild(toast);
    void toast.offsetWidth;
    toast.classList.add("show");
    setTimeout(() => toast.remove(), 3200);
  }

  function updateClockAndTimer() {
    // Wall clock
    const clockEl = $("#quiz-clock");
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString([], {
        hour: "2-digit", minute: "2-digit", hour12: false,
      });
    }
    // Timer
    const timerEl = $("#quiz-timer");
    if (!timerEl) return;
    const valueEl = timerEl.querySelector(".timer-value");
    const setValue = (text) => { if (valueEl) valueEl.textContent = text; };
    if (STATE.timerExpired) {
      setValue("00:00");
      timerEl.classList.add("expired");
      timerEl.classList.remove("warning", "paused");
      timerEl.hidden = false;
      return;
    }
    if (STATE.timerPaused) {
      const remain = STATE.pausedRemainingMs || 0;
      const m = Math.floor(remain / 60000);
      const s = Math.floor((remain % 60000) / 1000);
      setValue(String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0"));
      timerEl.classList.add("paused");
      timerEl.classList.remove("warning", "expired");
      timerEl.hidden = false;
      return;
    }
    if (!STATE.timerEnd) {
      timerEl.hidden = true;
      timerEl.classList.remove("warning", "expired", "paused");
      return;
    }
    const remainMs = Math.max(0, STATE.timerEnd - Date.now());
    const totalSec = Math.floor(remainMs / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    setValue(String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0"));
    timerEl.hidden = false;
    timerEl.classList.remove("paused");
    timerEl.classList.toggle("warning",
      remainMs > 0 && remainMs <= 5 * 60 * 1000);
    if (remainMs === 0) {
      STATE.timerExpired = true;
      timerEl.classList.add("expired");
      timerEl.classList.remove("warning");
      showTimerExpiredToast();
    }
  }

  // --- Custom confirm modal -----------------------------------------------
  //
  // Replaces window.confirm() with a theme-aware dialog. Returns a Promise
  // that resolves to true (confirmed) or false (cancelled, ESC, or
  // backdrop-click). Focus is trapped between the two buttons and restored
  // to the trigger element when the dialog closes.
  //
  // Usage:
  //   const ok = await customConfirm({ title, message, confirmLabel,
  //                                    cancelLabel, danger });

  function customConfirm({
    title = "Confirm",
    message = "",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    danger = false,
  } = {}) {
    return new Promise((resolve) => {
      const backdrop = $("#modal-backdrop");
      const dialog   = backdrop.querySelector(".modal");
      const titleEl  = $("#modal-title");
      const msgEl    = $("#modal-message");
      const okBtn    = $("#modal-confirm");
      const cancelBtn = $("#modal-cancel");

      titleEl.textContent  = title;
      msgEl.textContent    = message;
      okBtn.textContent    = confirmLabel;
      cancelBtn.textContent = cancelLabel;
      okBtn.classList.toggle("danger", !!danger);

      const prevFocus = document.activeElement;

      const cleanup = (result) => {
        backdrop.hidden = true;
        okBtn.removeEventListener("click", onOk);
        cancelBtn.removeEventListener("click", onCancel);
        backdrop.removeEventListener("mousedown", onBackdropDown);
        document.removeEventListener("keydown", onKey, true);
        if (prevFocus && typeof prevFocus.focus === "function"
            && document.body.contains(prevFocus)) {
          try { prevFocus.focus({ preventScroll: true }); } catch (_) { /* no-op */ }
        }
        resolve(result);
      };
      const onOk     = () => cleanup(true);
      const onCancel = () => cleanup(false);
      // Use mousedown (not click) on backdrop so a drag-release outside the
      // dialog doesn't fire onCancel mid-text-selection.
      const onBackdropDown = (e) => { if (e.target === backdrop) cleanup(false); };
      const onKey = (e) => {
        if (e.key === "Escape") {
          e.preventDefault(); e.stopPropagation();
          cleanup(false);
        } else if (e.key === "Enter") {
          // Enter activates whichever button is focused; default = Confirm
          if (document.activeElement === cancelBtn) return;
          e.preventDefault(); e.stopPropagation();
          cleanup(true);
        } else if (e.key === "Tab") {
          // Trap focus between Cancel and Confirm
          const next = e.shiftKey
            ? (document.activeElement === cancelBtn ? okBtn : cancelBtn)
            : (document.activeElement === okBtn     ? cancelBtn : okBtn);
          e.preventDefault();
          next.focus({ preventScroll: true });
        }
      };

      okBtn.addEventListener("click", onOk);
      cancelBtn.addEventListener("click", onCancel);
      backdrop.addEventListener("mousedown", onBackdropDown);
      // Capture phase so modal swallows keys before the global quiz handler
      document.addEventListener("keydown", onKey, true);

      backdrop.hidden = false;
      // Defer focus so the appear animation doesn't snap; preventScroll so
      // the page doesn't jump.
      setTimeout(() => okBtn.focus({ preventScroll: true }), 0);
    });
  }

  // Is a confirmation modal currently visible? Used to gate global quiz
  // keyboard shortcuts so they don't leak through to the underlying screen.
  function modalIsOpen() {
    const m = document.getElementById("modal-backdrop");
    return !!(m && !m.hidden);
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
    const labelNode = $("#btn-theme-label");
    if (labelNode) {
      labelNode.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    }
  }

  function cycleTheme() {
    const current = loadTheme();
    const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
    try { localStorage.setItem(THEME_KEY, next); } catch (_) { /* ignore */ }
    applyTheme(next);
  }

  // --- Init ----------------------------------------------------------------

  // UI shows 1-4 but data uses A-D (matches source markdown). These maps
  // bridge the two consistently throughout the quiz UI + keyboard handler.
  const NUM_TO_LETTER = { "1": "A", "2": "B", "3": "C", "4": "D" };
  const LETTER_TO_NUM = { "A": "1", "B": "2", "C": "3", "D": "4" };

  function handleKeydown(ev) {
    // Only react when the quiz section is visible
    if ($("#quiz").hidden) return;
    // Don't process quiz shortcuts while a confirm modal is up — the
    // modal owns its own keyboard handler (ESC/Enter/Tab) registered
    // in capture phase, but a "1"/"2"/etc keypress would otherwise
    // bubble through and select an answer in the background quiz.
    if (modalIsOpen()) return;
    // P key toggles pause — works whether the bar is paused or not.
    if ((ev.key === "p" || ev.key === "P") && STATE.timerMinutes > 0
        && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      ev.preventDefault();
      toggleTimerPause();
      return;
    }
    // Esc + Enter + Space resume from a paused state; ignore all other
    // shortcuts while the screen is on hold.
    if (STATE.timerPaused) {
      if (ev.key === "Escape" || ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        resumeTimer();
      }
      return;
    }
    // Ignore when the user is typing in a real input. Radios + checkboxes
    // are explicitly NOT excluded — we still want Space/Enter/arrows to work
    // when focus is on a choice's radio (which is normal after ↑/↓ or click).
    if (ev.target.matches
        && ev.target.matches("input:not([type=radio]):not([type=checkbox]), textarea, select")) {
      return;
    }
    // Ignore when a modifier key is held (let browser shortcuts pass through)
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;

    const key = ev.key.toLowerCase();
    // Choice keys: 1/2/3/4 (primary) + a/b/c/d (alias)
    const letter = NUM_TO_LETTER[key]
                 || { "a": "A", "b": "B", "c": "C", "d": "D" }[key];

    if (letter) {
      // After submit (btn-next visible): ignore choice keys
      const submitted = !$("#btn-next").hidden;
      if (submitted) return;
      const radio = document.querySelector(
        `fieldset#quiz-choices input[value="${letter}"]`);
      if (radio && !radio.disabled) {
        radio.checked = true;
        radio.dispatchEvent(new Event("change", { bubbles: true }));
        ev.preventDefault();
      }
      return;
    }
    const submitted = !$("#btn-next").hidden;

    // ↑ / ↓ — cycle through choices (only meaningful before submit).
    // Move both `checked` AND keyboard focus so the visible focus ring on
    // the choice label stays in sync with which radio is selected.
    if ((ev.key === "ArrowUp" || ev.key === "ArrowDown") && !submitted) {
      const letters = ["A", "B", "C", "D"];
      const currentIdx = letters.indexOf(STATE.currentChoice);
      const delta = ev.key === "ArrowDown" ? 1 : -1;
      const nextIdx = currentIdx === -1
        ? (ev.key === "ArrowDown" ? 0 : 3)        // no selection → top/bottom
        : (currentIdx + delta + 4) % 4;            // wrap around
      const radio = document.querySelector(
        `fieldset#quiz-choices input[value="${letters[nextIdx]}"]`);
      if (radio && !radio.disabled) {
        radio.checked = true;
        radio.focus({ preventScroll: false });   // <-- this is the fix
        radio.dispatchEvent(new Event("change", { bubbles: true }));
      }
      ev.preventDefault();
      return;
    }

    // Enter / Space — primary action (submit before answer, next after)
    if (ev.key === "Enter" || ev.key === " ") {
      if (submitted) {
        $("#btn-next").click();
      } else if (!$("#btn-submit").disabled && !$("#btn-submit").hidden) {
        $("#btn-submit").click();
      }
      ev.preventDefault();
      return;
    }
    // Right arrow / N — explicitly next, only after submit
    if ((ev.key === "ArrowRight" || key === "n") && submitted) {
      $("#btn-next").click();
      ev.preventDefault();
      return;
    }
    // S — skip, only before submit
    if (key === "s" && !submitted) {
      skipQuestion();
      ev.preventDefault();
    }
  }

  function init() {
    // Apply persisted theme before anything renders so there's no flash
    applyTheme(loadTheme());

    $("#btn-submit").addEventListener("click", submitAnswer);
    $("#btn-skip").addEventListener("click", skipQuestion);
    $("#btn-next").addEventListener("click", renderQuiz);
    $("#btn-stats").addEventListener("click", () => { renderStats(); show("stats"); });
    $("#btn-stats-back").addEventListener("click", () => show("quiz"));
    $("#btn-export").addEventListener("click", exportProgress);
    $("#btn-reset").addEventListener("click", resetHistory);
    $("#btn-reset-top").addEventListener("click", resetHistory);
    $("#btn-settings").addEventListener("click", () => show("settings"));
    $("#btn-settings-cancel").addEventListener("click", () => show("quiz"));
    const cancel2 = $("#btn-settings-cancel-2");
    if (cancel2) cancel2.addEventListener("click", () => show("quiz"));
    $("#btn-settings-apply").addEventListener("click", applySettings);
    $("#btn-exit").addEventListener("click", () => {
      if (STATE.certBanks) renderCertPicker(STATE.certBanks);
      else location.reload();
      show("setup");
    });

    // Masthead links:
    //   DBX Practice brand → step 1 (all certifications)
    //   cert name (e.g. "DATA ENGINEER ASSOCIATE") → step 2 (bank
    //     picker for that specific cert)
    // Both confirm() before leaving an in-progress session/timer.
    const brandLink = $("#brand-link");
    if (brandLink) brandLink.addEventListener("click", confirmBackToCertPicker);
    const certLink = $("#quiz-cert");
    if (certLink) certLink.addEventListener("click", confirmBackToBankPicker);
    $("#btn-theme").addEventListener("click", cycleTheme);

    // Timer pill → pause when active; pause overlay button → resume.
    const timerBtn = $("#quiz-timer");
    if (timerBtn) timerBtn.addEventListener("click", () => {
      if (!STATE.timerEnd && !STATE.timerPaused) return;  // no-op when no exam timer
      if (STATE.timerExpired) return;
      toggleTimerPause();
    });
    const resumeBtn = $("#btn-resume");
    if (resumeBtn) resumeBtn.addEventListener("click", resumeTimer);
    const pauseBackdrop = $("#pause-overlay");
    if (pauseBackdrop) pauseBackdrop.addEventListener("mousedown", (e) => {
      if (e.target === pauseBackdrop) resumeTimer();
    });

    document.addEventListener("keydown", handleKeydown);

    // Load timer preference + start the clock interval. The clock pill
    // updates every second whether a timer is active or not.
    STATE.timerMinutes = loadTimerMinutes();
    updateClockAndTimer();
    setInterval(updateClockAndTimer, 1000);

    // Observe actionbar height — content wrapping (kbd hint long/short,
    // viewport resize, etc.) changes how many rows the actionbar uses.
    const actionbar = $("#actionbar");
    if (actionbar && typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => syncActionbarHeight());
      ro.observe(actionbar);
    }
    window.addEventListener("resize", syncActionbarHeight);

    loadAllBankMetadata().then(certBanks => {
      STATE.certBanks = certBanks;
      renderCertPicker(certBanks);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
