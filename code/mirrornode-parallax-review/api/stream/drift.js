/**
 * api/stream/drift.js — SSE stream endpoint
 *
 * Upgrades the connection to Server-Sent Events.
 * Clients connect here and receive push updates whenever a webhook fires
 * (GitHub push or Linear issue change). Also sends a heartbeat every 25s
 * to keep the connection alive through proxies.
 *
 * This uses Vercel KV (or a simple in-memory Map for single-instance dev)
 * to broadcast updates to all connected clients.
 *
 * Deploy: same serverless env as api/drift.js
 */

export const config = {
  runtime: 'edge',
};

// In-process SSE client registry (works per-instance; fine for low traffic)
// For multi-instance: replace with Vercel KV pub/sub or Upstash Redis streams
const clients = new Set();

export function broadcast(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  for (const controller of clients) {
    try {
      controller.enqueue(new TextEncoder().encode(msg));
    } catch {
      clients.delete(controller);
    }
  }
}

export default async function handler(req) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  clients.add(writer);

  // Send initial comment to confirm connection
  writer.write(encoder.encode(': connected\n\n'));

  // Heartbeat every 25s (prevents proxy timeouts)
  const heartbeat = setInterval(() => {
    writer.write(encoder.encode(': heartbeat\n\n')).catch(() => {
      clearInterval(heartbeat);
      clients.delete(writer);
    });
  }, 25_000);

  // Clean up when client disconnects
  req.signal.addEventListener('abort', () => {
    clearInterval(heartbeat);
    clients.delete(writer);
    writer.close().catch(() => {});
  });

  return new Response(readable, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // disable Nginx buffering
      'Access-Control-Allow-Origin': '*',
    },
  });
}
