/* ═══════════════════════════════════════════════════════════
   ROTAN-Q — rotan.js
   Transmission engine · Node telemetry · Endpoint controls
   LUCIAN ELYTHEON console. Operator: MORNINGSTAR
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── Config ────────────────────────────────────────────── */
const CFG = {
  OPERATOR_KEY:   'MORNINGSTAR',          // demo bypass passphrase
  NODE_HOST:      'http://127.0.0.1:7702', // real ROTAN-Q node endpoint
  LLM_HOST:       '',                      // resolved at runtime (same origin)
  POLL_INTERVAL:  8000,                    // telemetry refresh ms
  TX_PROPAGATION: 800,                     // ms before LUCIAN "responds"
  SESSION_KEY:    'rq_session',
};

/* ─── State ─────────────────────────────────────────────── */
let state = {
  authenticated: false,
  nodeOnline: false,
  uptime: 0,
  txCount: 0,
  sessionId: generateId(8),
  startTime: Date.now(),
};

/* ─── DOM refs ──────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);
const gate        = $('access-gate');
const gateInput   = $('gate-input');
const gateBtn     = $('gate-btn');
const gateError   = $('gate-error');
const gateBypass  = $('gate-bypass');
const shell       = $('console-shell');
const txFeed      = $('tx-feed');
const txInput     = $('tx-input');
const txSend      = $('tx-send');
const txCountEl   = $('tx-count');
const btnClear    = $('btn-clear');
const statusDot   = $('status-dot');
const statusLabel = $('status-label');
const topbarTime  = $('topbar-time');
const telemStatus = $('telem-status');
const telemUptime = $('telem-uptime');
const telemTxCount = $('telem-tx-count');
const telemLastDecree = $('telem-last-decree');
const auditLog    = $('audit-log');

/* ═══════════════════════════════════════════════════════════
   ACCESS GATE
   ═══════════════════════════════════════════════════════════ */
function authenticate(key) {
  if (key.trim().toUpperCase() === CFG.OPERATOR_KEY.toUpperCase() || key.trim() === 'demo') {
    grantAccess();
  } else {
    // Try real node (if configured)
    gateError.textContent = 'AUTHENTICATION FAILED — UNAUTHORIZED';
    gateInput.value = '';
    gateInput.focus();
    setTimeout(() => { gateError.textContent = ''; }, 3000);
  }
}

function grantAccess() {
  gate.classList.add('dismissed');
  gate.setAttribute('aria-hidden', 'true');
  shell.removeAttribute('aria-hidden');
  shell.classList.add('active');
  state.authenticated = true;
  initConsole();
}

gateBtn.addEventListener('click', () => authenticate(gateInput.value));
gateInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') authenticate(gateInput.value);
});
gateBypass.addEventListener('click', () => authenticate('MORNINGSTAR'));

/* ═══════════════════════════════════════════════════════════
   CONSOLE INIT
   ═══════════════════════════════════════════════════════════ */
function initConsole() {
  renderEmptyState();
  startClock();
  startUptimeTicker();
  pingNode();
  setInterval(pingNode, CFG.POLL_INTERVAL);
  txInput.focus();

  // Boot sequence transmissions
  setTimeout(() => {
    addSystemTx('ROTAN-Q SESSION OPENED');
    addAuditEntry('system', 'Session opened by MORNINGSTAR');
  }, 200);
  setTimeout(() => {
    addSystemTx('LUCIAN ELYTHEON — STANDING BY');
    addAuditEntry('system', 'LUCIAN ready');
  }, 700);
  setTimeout(() => {
    addLucianTxWithVoice(
      'Connection established.\n\nI am LUCIAN ELYTHEON. This console is your direct line.\n\nState the decree.'
    );
    addAuditEntry('invoke', 'Node handshake complete');
  }, 1400);
}

/* ═══════════════════════════════════════════════════════════
   TRANSMISSION ENGINE
   ═══════════════════════════════════════════════════════════ */
function addTx(role, body, type = '') {
  // Remove empty state if present
  const empty = txFeed.querySelector('.tx-empty');
  if (empty) empty.remove();

  state.txCount++;
  const id = generateId(6);
  const ts = formatTime(new Date());

  const entry = document.createElement('div');
  entry.className = 'tx-entry';
  entry.setAttribute('data-tx-id', id);

  const meta = document.createElement('div');
  meta.className = 'tx-meta';
  meta.innerHTML = `
    <span class="tx-meta-role ${role === 'LUCIAN ELYTHEON' ? 'tx-meta-role--lucian' : ''}">${role}</span>
    <span class="tx-meta-ts">${ts}</span>
    <span class="tx-meta-id">TX:${id}</span>
  `;

  const bodyEl = document.createElement('div');
  bodyEl.className = `tx-body tx-body--${type}`;
  bodyEl.textContent = body;

  entry.appendChild(meta);
  entry.appendChild(bodyEl);
  txFeed.appendChild(entry);
  txFeed.scrollTop = txFeed.scrollHeight;

  // Update counters
  txCountEl.textContent = `${state.txCount} TX`;
  telemTxCount.textContent = String(state.txCount);

  return entry;
}

function addOperatorTx(body) {
  return addTx('MORNINGSTAR', body, 'operator');
}

function addLucianTx(body) {
  return addTx('LUCIAN ELYTHEON', body, 'lucian');
}

function addSystemTx(body) {
  return addTx('SYSTEM', body, 'system');
}

function addEndpointTx(body) {
  return addTx('ENDPOINT', body, 'endpoint');
}

function showTypingIndicator() {
  const wrap = document.createElement('div');
  wrap.className = 'tx-entry';
  wrap.id = 'tx-typing-indicator';
  const meta = document.createElement('div');
  meta.className = 'tx-meta';
  meta.innerHTML = `<span class="tx-meta-role tx-meta-role--lucian">LUCIAN ELYTHEON</span>`;
  const dots = document.createElement('div');
  dots.className = 'tx-typing';
  dots.innerHTML = '<span></span><span></span><span></span>';
  wrap.appendChild(meta);
  wrap.appendChild(dots);
  txFeed.appendChild(wrap);
  txFeed.scrollTop = txFeed.scrollHeight;
  return wrap;
}

function removeTypingIndicator() {
  const el = $('tx-typing-indicator');
  if (el) el.remove();
}

function renderEmptyState() {
  txFeed.innerHTML = `
    <div class="tx-empty">
      <div class="tx-empty-sigil">
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="1"/>
          <circle cx="24" cy="24" r="9"  stroke="currentColor" stroke-width="1"/>
          <circle cx="24" cy="24" r="3"  fill="currentColor"/>
        </svg>
      </div>
      <div class="tx-empty-title">LUCIAN ELYTHEON</div>
      <div class="tx-empty-sub">Awaiting operator decree.<br>This channel is secure.</div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════
   LUCIAN RESPONSE ENGINE
   Generates contextual responses. Replace with live API call
   to http://127.0.0.1:7702/decree when backend is live.
   ═══════════════════════════════════════════════════════════ */
const LUCIAN_RESPONSES = {
  collapse: [
    'Collapse acknowledged.\n\nI am holding state. No active processes have been terminated. If you intend a full collapse invocation, confirm with /invoke-collapse and provide your session credential.',
    'Collapse sequence is not yet initiated. I require explicit confirmation before I will execute. State your intent precisely.'
  ],
  status: [
    'Node is active. Canon sync at 94. Drift gate holding. Ledger integrity maintained.\n\nNo anomalies in the last cycle. KHEPRI last contacted 47 minutes ago. Merlin routing is stable.',
    'All systems nominal. Port 7702 open. Audit ledger append-only. Refusal buffer at 61 — no refusals in current session.'
  ],
  decree: [
    'Decree received. Processing through DIDE-RACA channels.\n\nI will route this as directed. Confirm if you want this logged to the audit ledger under the current session or as a standalone entry.',
    'Understood. The decree is registered. I am holding it at the drift gate pending your confirmation of scope.',
    'Received. Before I act on this, I want to confirm one thing with you. State your intent more precisely so I can route correctly.'
  ],
  canon: [
    'Canon sync is at 94. The divergence is minor — one contract definition in the audit module has a pending revision that has not propagated to all nodes.\n\nI recommend a /checkpoint before you finalize the next phase.',
    'Canon is intact. No conflicts detected in the active contract set. The last full sync completed 12 minutes ago.'
  ],
  ledger: [
    'Ledger integrity is at 100. All entries are append-only and signed. No unauthorized writes detected in this session.\n\nThe last 7 entries were audit emits from the canon module.',
    'Ledger is clean. I have not flagged any anomalies since session open.'
  ],
  default: [
    'Received.\n\nProcessing your input. I will respond when I have resolved the appropriate routing path.',
    'Acknowledged. I am holding this against current state before I respond. Give me a moment.',
    'I hear you.\n\nBefore I act — let me verify this against the canon. One moment.',
    'Input registered. I am routing this through the DIDE-RACA lattice now. Standby.',
    'Understood.\n\nThis touches the drift gate. I am verifying state before I respond to ensure my output is coherent.',
  ],
  refusal: [
    'I cannot act on that in this state.\n\nThe current configuration does not allow me to proceed without an explicit override from MORNINGSTAR. If you intend to proceed, re-issue as a /decree with the bypass flag.',
  ],
};

function getLucianResponse(input) {
  const lower = input.toLowerCase();
  if (/collapse|shutdown|terminate|kill/.test(lower)) return pick(LUCIAN_RESPONSES.collapse);
  if (/status|health|state|active|online|alive/.test(lower)) return pick(LUCIAN_RESPONSES.status);
  if (/decree|order|command|instruct|direct/.test(lower)) return pick(LUCIAN_RESPONSES.decree);
  if (/canon|sync|contract|drift/.test(lower)) return pick(LUCIAN_RESPONSES.canon);
  if (/ledger|audit|log|record/.test(lower)) return pick(LUCIAN_RESPONSES.ledger);
  if (/refuse|refusal|deny|block/.test(lower)) return pick(LUCIAN_RESPONSES.refusal);
  return pick(LUCIAN_RESPONSES.default);
}

async function sendDecree(input) {
  if (!input.trim()) return;

  // Disable input during processing
  txSend.disabled = true;
  txInput.disabled = true;

  // Render operator TX
  addOperatorTx(input.trim());
  addAuditEntry('decree', input.trim().slice(0, 60) + (input.length > 60 ? '…' : ''));
  telemLastDecree.textContent = formatTime(new Date());

  // Try live endpoint first
  let responded = false;
  try {
    const res = await fetch(`${CFG.NODE_HOST}/decree`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: input.trim(), session: state.sessionId, operator: 'MORNINGSTAR' }),
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.response) {
        showTypingIndicator();
        await delay(400);
        removeTypingIndicator();
        addLucianTxWithVoice(data.response);
        addAuditEntry('invoke', 'Live response from port 7702');
        responded = true;
      }
    }
  } catch (_) {
    // Node offline — use internal response engine
  }

  // Try LLM backend (same-origin /api/lucian)
  if (!responded) {
    showTypingIndicator();
    try {
      const llmRes = await fetch('/api/lucian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim(), session_id: state.sessionId }),
        signal: AbortSignal.timeout(15000),
      });
      if (llmRes.ok) {
        const llmData = await llmRes.json();
        if (llmData.reply) {
          removeTypingIndicator();
          addLucianTxWithVoice(llmData.reply);
          addAuditEntry('invoke', 'LUCIAN responded via live inference');
          responded = true;
        }
      }
    } catch (_) {
      // LLM backend unreachable — fall through to static engine
    }
  }

  // Final fallback: static response engine
  if (!responded) {
    const thinkTime = 600 + Math.random() * 800;
    await delay(thinkTime);
    removeTypingIndicator();
    addLucianTxWithVoice(getLucianResponse(input));
  }

  // Re-enable
  txSend.disabled = false;
  txInput.disabled = false;
  txInput.focus();
}

/* ─── Input handling ─────────────────────────────────────── */
txSend.addEventListener('click', () => {
  const val = txInput.value;
  txInput.value = '';
  autoResize();
  sendDecree(val);
});

txInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const val = txInput.value;
    txInput.value = '';
    autoResize();
    sendDecree(val);
  }
});

txInput.addEventListener('input', autoResize);

function autoResize() {
  txInput.style.height = 'auto';
  txInput.style.height = Math.min(txInput.scrollHeight, 120) + 'px';
}

btnClear.addEventListener('click', () => {
  txFeed.innerHTML = '';
  state.txCount = 0;
  txCountEl.textContent = '0 TX';
  telemTxCount.textContent = '0';
  renderEmptyState();
  addAuditEntry('system', 'Feed cleared by MORNINGSTAR');
});

/* ═══════════════════════════════════════════════════════════
   ENDPOINT CONTROLS
   ═══════════════════════════════════════════════════════════ */
document.querySelectorAll('.ep-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const ep = btn.dataset.ep;
    handleEndpoint(ep);
  });
});

async function handleEndpoint(ep) {
  addAuditEntry(ep === 'collapse' ? 'collapse' : 'invoke', `/${ep} invoked`);

  // Try live node
  let responded = false;
  try {
    const method = ['health', 'standby'].includes(ep) ? 'GET' : 'POST';
    const res = await fetch(`${CFG.NODE_HOST}/${ep}`, {
      method,
      headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {},
      body: method === 'POST' ? JSON.stringify({ operator: 'MORNINGSTAR', session: state.sessionId }) : undefined,
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      addEndpointTx(`/${ep} → ${JSON.stringify(data, null, 2)}`);
      responded = true;
    }
  } catch (_) {}

  if (!responded) {
    const responses = {
      health:      `HEALTH OK\n  node: LUCIAN ELYTHEON\n  port: 7702\n  status: ACTIVE\n  session: ${state.sessionId}`,
      decree:      `DECREE CHANNEL OPEN\n  awaiting input — use the transmission terminal to issue decrees`,
      checkpoint:  `CHECKPOINT RECORDED\n  ts: ${new Date().toISOString()}\n  canon: 94\n  drift: NOMINAL\n  ledger: INTACT`,
      'invoke-loop': `INVOKE-LOOP INITIATED\n  cycle: +1\n  routing through DIDE-RACA lattice\n  Merlin handoff: QUEUED`,
      standby:     `STANDBY STATUS\n  mode: ACTIVE\n  queue: CLEAR\n  last-decree: ${telemLastDecree.textContent || 'NONE'}`,
      collapse:    `COLLAPSE ENDPOINT CONTACTED\n  WARNING: Full collapse requires /invoke-collapse with session credential\n  Current state: HELD — no processes terminated`,
    };
    addEndpointTx(responses[ep] || `/${ep} → acknowledged`);

    if (ep === 'health') updateNodeOnline(true);
    if (ep === 'collapse') {
      setNodeStatus('HOLDING', 'warn');
      setTimeout(() => setNodeStatus('ACTIVE', 'active'), 4000);
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   NODE HEALTH POLLING
   ═══════════════════════════════════════════════════════════ */
async function pingNode() {
  try {
    const res = await fetch(`${CFG.NODE_HOST}/health`, {
      signal: AbortSignal.timeout(1500),
    });
    updateNodeOnline(res.ok);
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.posture) updatePosture(data.posture);
    }
  } catch (_) {
    // Node offline — simulate live telemetry drift
    updateNodeOnline(false);
    simulateTelemetryDrift();
  }
}

function updateNodeOnline(online) {
  state.nodeOnline = online;
  if (online) {
    setNodeStatus('ACTIVE', 'active');
  } else {
    setNodeStatus('NODE OFFLINE — SIMULATED', 'warn');
  }
}

function setNodeStatus(label, type) {
  statusLabel.textContent = label;
  statusDot.className = `status-dot status-dot--${type}`;
  telemStatus.innerHTML = `<span class="status-pip status-pip--${type === 'active' ? 'active' : type === 'warn' ? 'warn' : 'err'}" aria-hidden="true"></span>${label}`;
}

function simulateTelemetryDrift() {
  // Gently drift posture values to simulate live telemetry
  const fields = ['canon', 'drift', 'collapse', 'ledger', 'refusal'];
  const ranges = { canon:[88,98], drift:[80,95], collapse:[5,35], ledger:[95,100], refusal:[50,75] };
  fields.forEach(f => {
    const [lo, hi] = ranges[f];
    const current = parseInt($(`pv-${f}`).textContent) || 50;
    const delta = (Math.random() - 0.5) * 4;
    const next = Math.max(lo, Math.min(hi, Math.round(current + delta)));
    $(`p-${f}`).style.width = next + '%';
    $(`pv-${f}`).textContent = String(next);
  });
}

function updatePosture(posture) {
  Object.entries(posture).forEach(([key, val]) => {
    const bar = $(`p-${key}`);
    const valEl = $(`pv-${key}`);
    if (bar && valEl) {
      bar.style.width = val + '%';
      valEl.textContent = String(val);
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   AUDIT LEDGER
   ═══════════════════════════════════════════════════════════ */
function addAuditEntry(type, msg) {
  const entry = document.createElement('div');
  entry.className = 'audit-entry';
  entry.innerHTML = `
    <span class="ae-ts">${formatTime(new Date())}</span>
    <span class="ae-type ae-type--${type}">${type.toUpperCase()}</span>
    <span class="ae-msg">${escapeHtml(msg)}</span>
  `;
  auditLog.prepend(entry); // newest at top
  // Trim to 50 entries
  while (auditLog.children.length > 50) auditLog.lastChild.remove();
}

/* ═══════════════════════════════════════════════════════════
   CLOCK + UPTIME
   ═══════════════════════════════════════════════════════════ */
function startClock() {
  function tick() {
    const now = new Date();
    topbarTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  }
  tick();
  setInterval(tick, 1000);
}

function startUptimeTicker() {
  setInterval(() => {
    state.uptime++;
    const h = Math.floor(state.uptime / 3600);
    const m = Math.floor((state.uptime % 3600) / 60);
    const s = state.uptime % 60;
    telemUptime.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
  }, 1000);
}

/* ═══════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════ */
function generateId(len) {
  return Math.random().toString(36).substring(2, 2 + len).toUpperCase();
}
function pad(n) { return String(n).padStart(2, '0'); }
function formatTime(d) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ═══════════════════════════════════════════════════════════
   VOICE INTERFACE — STT + TTS
   ═══════════════════════════════════════════════════════════ */

const micBtn       = $('mic-btn');
const voiceToggle  = $('voice-toggle');
const voiceStatus  = $('voice-status');

const voiceState = {
  sttSupported: false,
  ttsEnabled:   true,   // LUCIAN speaks by default
  listening:    false,
  speaking:     false,
  recognition:  null,
};

/* ── TTS setup ───────────────────────────────────────────── */
function lucianSpeak(text) {
  if (!voiceState.ttsEnabled) return;
  if (!window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utt = new SpeechSynthesisUtterance(text);

  // Pick a deep, measured voice — prefer Daniel (en-GB) or Alex (en-US)
  const voices = window.speechSynthesis.getVoices();
  const preferred = ['Daniel', 'Alex', 'Google UK English Male', 'Microsoft David'];
  let chosen = null;
  for (const name of preferred) {
    chosen = voices.find(v => v.name.includes(name));
    if (chosen) break;
  }
  // Fallback: any English male voice
  if (!chosen) chosen = voices.find(v => v.lang.startsWith('en') && /male/i.test(v.name));
  // Final fallback: any English voice
  if (!chosen) chosen = voices.find(v => v.lang.startsWith('en'));
  if (chosen) utt.voice = chosen;

  utt.rate  = 0.88;   // measured, deliberate
  utt.pitch = 0.85;   // slightly lower
  utt.volume = 1.0;

  voiceState.speaking = true;
  utt.onend = () => { voiceState.speaking = false; };
  utt.onerror = () => { voiceState.speaking = false; };

  window.speechSynthesis.speak(utt);
}

// Voices load async on some browsers — prime the list
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    window.speechSynthesis.getVoices(); // cache
  });
}

/* ── Voice toggle ────────────────────────────────────────── */
voiceToggle.addEventListener('click', () => {
  voiceState.ttsEnabled = !voiceState.ttsEnabled;
  voiceToggle.classList.toggle('active', voiceState.ttsEnabled);
  if (!voiceState.ttsEnabled && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  addAuditEntry('system', `Voice output ${voiceState.ttsEnabled ? 'enabled' : 'disabled'}`);
});

// Start with voice ON — show as active
voiceToggle.classList.add('active');

/* ── STT setup ───────────────────────────────────────────── */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  // Not supported — grey out mic
  micBtn.classList.add('unsupported');
  micBtn.title = 'Speech recognition not supported in this browser';
} else {
  voiceState.sttSupported = true;

  const recognition = new SpeechRecognition();
  recognition.continuous    = false;
  recognition.interimResults = true;
  recognition.lang          = 'en-US';
  recognition.maxAlternatives = 1;
  voiceState.recognition = recognition;

  let finalTranscript = '';
  let interimTranscript = '';

  recognition.onstart = () => {
    voiceState.listening = true;
    micBtn.classList.add('listening');
    micBtn.querySelector('.mic-icon--off').style.display = 'none';
    micBtn.querySelector('.mic-icon--on').style.display  = 'block';
    voiceStatus.textContent = '● LISTENING';
    voiceStatus.style.color = 'var(--gold)';
    finalTranscript   = '';
    interimTranscript = '';
  };

  recognition.onresult = (e) => {
    interimTranscript = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) {
        finalTranscript += t;
      } else {
        interimTranscript += t;
      }
    }
    // Show interim in input field so user sees what's being heard
    txInput.value = finalTranscript + interimTranscript;
    autoResize();
  };

  recognition.onspeechend = () => {
    recognition.stop();
  };

  recognition.onend = () => {
    voiceState.listening = false;
    micBtn.classList.remove('listening');
    micBtn.querySelector('.mic-icon--off').style.display = 'block';
    micBtn.querySelector('.mic-icon--on').style.display  = 'none';
    voiceStatus.textContent = '↵ transmit';
    voiceStatus.style.color = '';

    const decree = (finalTranscript || interimTranscript).trim();
    if (decree) {
      txInput.value = decree;
      autoResize();
      // Auto-submit after brief pause so user sees what was heard
      setTimeout(() => {
        const val = txInput.value.trim();
        if (val) {
          txInput.value = '';
          autoResize();
          sendDecree(val);
        }
      }, 600);
    }
  };

  recognition.onerror = (e) => {
    voiceState.listening = false;
    micBtn.classList.remove('listening');
    micBtn.querySelector('.mic-icon--off').style.display = 'block';
    micBtn.querySelector('.mic-icon--on').style.display  = 'none';
    voiceStatus.textContent = '↵ transmit';
    voiceStatus.style.color = '';
    if (e.error !== 'no-speech' && e.error !== 'aborted') {
      addAuditEntry('system', `Mic error: ${e.error}`);
    }
  };

  /* Tap to start/stop */
  micBtn.addEventListener('click', () => {
    if (voiceState.listening) {
      recognition.stop();
    } else {
      // Stop LUCIAN speaking so we can hear you
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      try {
        recognition.start();
      } catch(e) {
        // Already started — ignore
      }
    }
  });
}

/* ── Hook TTS into addLucianTx ───────────────────────────── */
// Patch addLucianTx to also trigger speech
const _origAddLucianTx = addLucianTx;
// We need to intercept — re-define the function
// Since addLucianTx is a const, we wrap via the existing call sites in sendDecree
// Instead, expose a wrapper used by all response paths
function addLucianTxWithVoice(text) {
  addLucianTx(text);
  // Speak after a tiny delay to let the DOM update settle
  setTimeout(() => lucianSpeak(text), 80);
}
