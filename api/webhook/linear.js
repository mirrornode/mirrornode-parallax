/**
 * api/webhook/linear.js — Linear issue webhook handler
 *
 * Configure in Linear: Settings → API → Webhooks
 *   URL:    https://your-domain.com/api/webhook/linear
 *   Events: Issue Created, Issue Updated, Issue Removed
 *
 * When a Linear issue with label "architecture-drift" is created or resolved,
 * this handler validates the Linear HMAC signature and broadcasts an updated
 * drift payload to all connected SSE clients.
 *
 * Required env vars:
 *   LINEAR_WEBHOOK_SECRET  — Linear signing secret (from webhook settings)
 *   LINEAR_TOKEN           — to re-fetch the full issue list
 *   GITHUB_TOKEN           — to pull current manifest alongside
 *   LINEAR_DRIFT_LABEL     — label to watch (default: architecture-drift)
 */

import { broadcast } from '../stream/drift.js';

export const config = { runtime: 'edge' };

const DRIFT_LABEL = process.env.LINEAR_DRIFT_LABEL || 'architecture-drift';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const WEBHOOK_SECRET = process.env.LINEAR_WEBHOOK_SECRET;
  const LINEAR_TOKEN   = process.env.LINEAR_TOKEN;

  const rawBody = await req.text();

  // ── 1. Validate Linear signature ──────────────────────────
  if (WEBHOOK_SECRET) {
    const linearSig = req.headers.get('x-linear-signature') || '';
    const valid = await verifyLinearSignature(rawBody, linearSig, WEBHOOK_SECRET);
    if (!valid) {
      return new Response('Unauthorized — invalid Linear signature', { status: 401 });
    }
  }

  // ── 2. Parse payload ──────────────────────────────────────
  let payload;
  try { payload = JSON.parse(rawBody); } catch {
    return new Response('Bad Request', { status: 400 });
  }

  // Only act on issue events
  if (payload.type !== 'Issue') {
    return new Response(JSON.stringify({ ok: true, action: 'ignored', reason: 'Not an Issue event' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const labels = (payload.data?.labels || []).map(l => l.name);
  const isDriftIssue = labels.includes(DRIFT_LABEL);

  if (!isDriftIssue) {
    return new Response(JSON.stringify({ ok: true, action: 'ignored', reason: 'Not a drift-labelled issue' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── 3. Re-fetch and broadcast ─────────────────────────────
  try {
    const driftUrl = `${req.url.replace('/api/webhook/linear', '/api/drift')}`;
    const freshResp = await fetch(driftUrl);
    if (freshResp.ok) {
      const freshData = await freshResp.json();
      broadcast(freshData);
    }
  } catch (e) {
    console.error('[webhook/linear] Failed to broadcast:', e);
  }

  return new Response(JSON.stringify({
    ok: true,
    action: 'drift_scan_triggered',
    issueId: payload.data?.id,
    issueTitle: payload.data?.title,
    action: payload.action,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── Linear HMAC-SHA256 verification ─────────────────────
async function verifyLinearSignature(body, sigHeader, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  const computed = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
  // Linear sends the hex digest without a prefix
  return timingSafeEqual(computed, sigHeader.replace('sha256=', ''));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
