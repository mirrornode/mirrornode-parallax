/* ═══════════════════════════════════════════════════════════
   MIRRORNODE — main.js
   Theme toggle · Scroll reveal · Mobile menu · Drift detector
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── Theme toggle ──────────────────────────────────────── */
(function initTheme() {
  const root = document.documentElement;
  const btn  = document.querySelector('[data-theme-toggle]');
  // Default: dark-first, matching Parallax command-center identity.
  // Respect the html[data-theme] already set, or fall back to dark.
  let theme = root.getAttribute('data-theme') || 'dark';
  root.setAttribute('data-theme', theme);

  const moonSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  const sunSVG  = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;

  if (btn) {
    btn.innerHTML = theme === 'dark' ? moonSVG : sunSVG;
    btn.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      btn.innerHTML = theme === 'dark' ? moonSVG : sunSVG;
    });
  }
})();

/* ─── Mobile menu ───────────────────────────────────────── */
(function initMobileMenu() {
  const toggle = document.querySelector('.nav-menu-toggle');
  const menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.getAttribute('aria-hidden') === 'false';
    menu.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
    toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    toggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ─── Scroll reveal ─────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger sibling reveals
          const siblings = [...entry.target.parentElement.querySelectorAll('[data-reveal]:not(.revealed)')];
          const idx = siblings.indexOf(entry.target);
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, Math.min(idx * 80, 300));
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach(el => obs.observe(el));
})();

/* ─── Smooth anchor scrolling ───────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ═══════════════════════════════════════════════════════════
   DRIFT DETECTOR — live GitHub + Linear integration
   ═══════════════════════════════════════════════════════════ */
(function initDriftDetector() {
  const POLL_INTERVAL  = 30_000; // ms — polling fallback
  const ENDPOINT       = '/api/drift';
  const STREAM_ENDPOINT = '/api/stream/drift';

  // DOM refs
  const statusIcon    = document.getElementById('drift-status-icon');
  const statusHeading = document.getElementById('drift-status-heading');
  const statusSub     = document.getElementById('drift-status-sub');
  const statusTs      = document.getElementById('drift-status-ts');
  const findingsList  = document.getElementById('drift-findings-list');
  const liveDot       = document.getElementById('drift-live-dot');

  if (!statusIcon) return; // Widget not present on this page

  /* ─── Helpers ─────────────────────────────────────────── */
  function formatTs(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function setStatusIcon(state) {
    // state: 'loading' | 'ok' | 'warn' | 'error'
    const icons = {
      loading: `<svg class="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>`,
      ok:      `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      warn:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      error:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    };
    statusIcon.innerHTML = icons[state] || icons.loading;
    statusIcon.className = `drift-status-icon drift-status-icon--${state}`;
    // Style icon color via parent class SVG stroke
    const colorMap = { loading: 'var(--color-text-muted)', ok: 'var(--color-ok)', warn: 'var(--color-warn)', error: 'var(--color-error)' };
    statusIcon.style.color = colorMap[state] || '';
  }

  function renderFindings(findings) {
    if (!findingsList) return;
    if (!findings || !findings.length) {
      findingsList.innerHTML = `
        <li class="drift-finding">
          <span class="drift-finding-dot drift-finding-dot--info" aria-hidden="true"></span>
          <div class="drift-finding-body">
            <div class="drift-finding-title">No drift findings — declared architecture matches observed state</div>
            <div class="drift-finding-meta">All IaC, dependencies, runbooks, and Linear risks are in sync</div>
          </div>
        </li>`;
      return;
    }

    findingsList.innerHTML = findings.map(f => {
      const tagClass = f.category ? `drift-finding-tag--${f.category}` : 'drift-finding-tag--dep';
      const dotClass = f.severity === 'error' ? 'drift-finding-dot--error'
                     : f.severity === 'warn'  ? 'drift-finding-dot--warn'
                     : 'drift-finding-dot--info';
      const url = f.url ? `href="${f.url}" target="_blank" rel="noopener"` : '';
      return `
        <li class="drift-finding">
          <span class="drift-finding-dot ${dotClass}" aria-hidden="true"></span>
          <div class="drift-finding-body">
            <div class="drift-finding-title">${url ? `<a ${url} style="color:inherit;text-decoration:underline;text-underline-offset:2px">${f.title}</a>` : f.title}</div>
            <div class="drift-finding-meta">${f.meta || ''}</div>
          </div>
          ${f.tag ? `<span class="drift-finding-tag ${tagClass}">${f.tag}</span>` : ''}
        </li>`;
    }).join('');
  }

  function renderPayload(data) {
    const issues = data.driftIssues || [];
    const findings = data.findings || [];

    // Merge Linear issues into findings display
    const linearFindings = issues.map(i => ({
      title: i.title,
      meta: `Linear · ${i.state} · updated ${new Date(i.updatedAt).toLocaleDateString()}`,
      severity: 'warn',
      category: 'linear',
      tag: 'Linear',
      url: i.url || null,
    }));

    const allFindings = [...findings, ...linearFindings];
    const hasDrift = allFindings.length > 0;

    if (hasDrift) {
      setStatusIcon('warn');
      if (statusHeading) statusHeading.textContent = `${allFindings.length} drift finding${allFindings.length !== 1 ? 's' : ''} detected`;
      if (statusSub) statusSub.textContent = 'Declared architecture diverges from observed state in GitHub / Linear';
    } else {
      setStatusIcon('ok');
      if (statusHeading) statusHeading.textContent = 'Architecture in sync';
      if (statusSub) statusSub.textContent = 'No drift detected — declared model matches GitHub, Linear, and deployment state';
    }

    if (statusTs) statusTs.textContent = data.timestamp ? `Updated ${formatTs(data.timestamp)}` : '';
    renderFindings(allFindings);
  }

  /* ─── Demo/fallback payload (used when /api/drift isn't wired) ─ */
  function getDemoPayload() {
    return {
      timestamp: new Date().toISOString(),
      driftIssues: [],
      findings: [
        { title: 'Governance runbook review pending update', meta: 'Connected evidence source · governance runbook review pending', severity: 'warn', category: 'runbook', tag: 'Runbook' },
        { title: 'Pinecone index dependency not declared in architecture.yaml', meta: 'GitHub · infra-declaration/architecture.yaml · missing vector-store lane', severity: 'error', category: 'dep', tag: 'Dep' },
        { title: 'Supabase replica region us-west-2 not in IaC', meta: 'GitHub · terraform/supabase.tf · observed in deploy but not declared', severity: 'error', category: 'iac', tag: 'IaC' },
      ],
    };
  }

  /* ─── Fetch (polling) ─────────────────────────────────── */
  async function fetchDrift() {
    try {
      const resp = await fetch(ENDPOINT, { cache: 'no-store' });
      if (resp.status === 404 || resp.status === 0) {
        // API not deployed yet — render demo payload
        renderPayload(getDemoPayload());
        return;
      }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      renderPayload(data);
    } catch (err) {
      console.warn('[drift] fetch error, showing demo payload:', err);
      renderPayload(getDemoPayload());
    }
  }

  /* ─── SSE stream (preferred when server supports it) ──── */
  function trySSE() {
    if (typeof EventSource === 'undefined') return false;
    try {
      const es = new EventSource(STREAM_ENDPOINT);
      let connected = false;
      es.onopen = () => { connected = true; };
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          renderPayload(data);
        } catch {}
      };
      es.onerror = () => {
        es.close();
        // Fall back to polling
        startPolling();
      };
      // If no SSE within 3s, fall back to polling
      setTimeout(() => { if (!connected) { es.close(); startPolling(); } }, 3000);
      return true;
    } catch {
      return false;
    }
  }

  function startPolling() {
    fetchDrift(); // immediate
    setInterval(fetchDrift, POLL_INTERVAL);
  }

  /* ─── Boot ────────────────────────────────────────────── */
  // Show loading state first
  setStatusIcon('loading');
  if (statusHeading) statusHeading.textContent = 'Connecting to GitHub & Linear…';
  if (statusSub) statusSub.textContent = 'Fetching declared architecture and open drift issues';

  // Attempt SSE first, fall back to polling
  if (!trySSE()) startPolling();

})();
