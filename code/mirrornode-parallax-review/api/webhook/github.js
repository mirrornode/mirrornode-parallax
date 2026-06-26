/**
 * api/webhook/github.js — GitHub push webhook handler
 *
 * Configure this URL as a webhook in your GitHub repo:
 *   Payload URL:  https://your-domain.com/api/webhook/github
 *   Content type: application/json
 *   Secret:       GITHUB_WEBHOOK_SECRET (env var)
 *   Events:       Push, Pull request
 *
 * When architecture.yaml changes, this handler:
 *   1. Validates the HMAC-SHA256 signature (X-Hub-Signature-256)
 *   2. Fetches the fresh architecture manifest from GitHub
 *   3. Runs the manifest analyser
 *   4. Broadcasts the update to all SSE clients via broadcast()
 *
 * Required env vars:
 *   GITHUB_TOKEN           — repo read access
 *   GITHUB_WEBHOOK_SECRET  — matches the GitHub webhook config
 *   LINEAR_TOKEN           — to pull current drift issues alongside
 */

import { broadcast } from '../stream/drift.js';

export const config = { runtime: 'edge' };

const ARCHITECTURE_PATHS = new Set([
  'architecture.yaml', 'architecture.yml', 'architecture.json',
  'infra/architecture.yaml', 'docs/architecture.yaml',
]);

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
  const GITHUB_TOKEN   = process.env.GITHUB_TOKEN;
  const LINEAR_TOKEN   = process.env.LINEAR_TOKEN;

  // ── 1. Validate HMAC-SHA256 signature ────────────────────
  const sig256 = req.headers.get('x-hub-signature-256') || '';
  const body   = await req.text();

  if (WEBHOOK_SECRET) {
    const valid = await verifyGitHubSignature(body, sig256, WEBHOOK_SECRET);
    if (!valid) {
      return new Response('Unauthorized — invalid signature', { status: 401 });
    }
  }

  // ── 2. Parse payload ──────────────────────────────────────
  let payload;
  try { payload = JSON.parse(body); } catch {
    return new Response('Bad Request — invalid JSON', { status: 400 });
  }

  // Only act on pushes to relevant files
  const changedFiles = [
    ...(payload.commits || []).flatMap(c => [
      ...(c.added || []),
      ...(c.modified || []),
    ]),
  ];

  const architectureChanged = changedFiles.some(f =>
    ARCHITECTURE_PATHS.has(f) || f.endsWith('architecture.yaml') || f.endsWith('architecture.yml')
  );

  if (!architectureChanged) {
    return new Response(JSON.stringify({ ok: true, action: 'ignored', reason: 'No architecture files changed' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── 3. Fetch fresh data and broadcast ────────────────────
  if (GITHUB_TOKEN && LINEAR_TOKEN) {
    try {
      // Re-use the drift proxy logic by calling the /api/drift handler
      const driftUrl = `${req.url.replace('/api/webhook/github', '/api/drift')}`;
      const freshResp = await fetch(driftUrl);
      if (freshResp.ok) {
        const freshData = await freshResp.json();
        broadcast(freshData);
      }
    } catch (e) {
      console.error('[webhook/github] Failed to broadcast drift update:', e);
    }
  }

  return new Response(JSON.stringify({
    ok: true,
    action: 'drift_scan_triggered',
    filesChanged: changedFiles.filter(f => ARCHITECTURE_PATHS.has(f)),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── HMAC-SHA256 verification ─────────────────────────────
async function verifyGitHubSignature(body, sigHeader, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  const computed = 'sha256=' + Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
  return timingSafeEqual(computed, sigHeader);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
