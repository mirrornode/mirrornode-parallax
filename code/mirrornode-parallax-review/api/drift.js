/**
 * api/drift.js — MIRRORNODE drift detector proxy
 *
 * Vercel Edge / Node.js serverless function.
 * Fetches declared architecture from GitHub and open drift tickets from Linear.
 * Returns a normalised JSON payload for the landing page drift widget.
 *
 * Required env vars:
 *   GITHUB_TOKEN  — GitHub PAT or App token (repo read / contents)
 *   LINEAR_TOKEN  — Linear personal API token (issues:read)
 *   GITHUB_OWNER  — org or user (default: INPhase-Resplendence-Cognition)
 *   GITHUB_REPO   — repo name (default: infra-declaration)
 *   GITHUB_PATH   — path to architecture manifest (default: HEAD:architecture.yaml)
 *   LINEAR_DRIFT_LABEL — Linear label name for drift tickets (default: architecture-drift)
 *
 * Endpoints served:
 *   GET /api/drift         → JSON payload (polling)
 *   GET /api/stream/drift  → SSE stream (see api/stream/drift.js)
 *   POST /api/webhook/github → GitHub push webhook
 *   POST /api/webhook/linear → Linear issue webhook
 */

export const config = {
  runtime: 'edge', // Vercel Edge Runtime — remove if using Node.js Lambda
};

// ─── Constants ────────────────────────────────────────────
const GITHUB_API  = 'https://api.github.com/graphql';
const LINEAR_API  = 'https://api.linear.app/graphql';
const CACHE_TTL   = 10; // seconds — short cache to reduce GH/Linear calls

// ─── GraphQL queries ──────────────────────────────────────
const GH_QUERY = `
  query($owner: String!, $repo: String!, $path: String!) {
    repository(owner: $owner, name: $repo) {
      object(expression: $path) {
        ... on Blob { text }
      }
      defaultBranchRef { name }
    }
    rateLimit { remaining resetAt }
  }
`;

const LINEAR_QUERY = (label) => `
  query {
    issues(
      filter: {
        labels: { name: { eq: "${label}" } }
        state: { type: { neq: "completed" } }
      }
    ) {
      nodes {
        id
        title
        state { name type }
        updatedAt
        url
        assignee { name }
        priority
      }
    }
  }
`;

// ─── Severity helper ──────────────────────────────────────
function linearPriorityToSeverity(priority) {
  // Linear priorities: 0=no priority, 1=urgent, 2=high, 3=medium, 4=low
  if (priority === 1) return 'error';
  if (priority === 2) return 'warn';
  return 'info';
}

// ─── Main handler ──────────────────────────────────────────
export default async function handler(req) {
  // CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  const GITHUB_TOKEN  = process.env.GITHUB_TOKEN;
  const LINEAR_TOKEN  = process.env.LINEAR_TOKEN;
  const OWNER         = process.env.GITHUB_OWNER || 'INPhase-Resplendence-Cognition';
  const REPO          = process.env.GITHUB_REPO  || 'infra-declaration';
  const FILE_PATH     = process.env.GITHUB_PATH  || 'HEAD:architecture.yaml';
  const DRIFT_LABEL   = process.env.LINEAR_DRIFT_LABEL || 'architecture-drift';

  // Guard: both tokens required
  if (!GITHUB_TOKEN || !LINEAR_TOKEN) {
    return errorResponse(503, 'GITHUB_TOKEN and LINEAR_TOKEN env vars not set. Deploy the proxy with secrets configured.');
  }

  try {
    // Parallel fetch from GitHub GraphQL + Linear GraphQL
    const [ghResult, linearResult] = await Promise.allSettled([
      fetch(GITHUB_API, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MIRRORNODE-DriftDetector/1.0',
          'X-Github-Next-Global-ID': '1',
        },
        body: JSON.stringify({
          query: GH_QUERY,
          variables: { owner: OWNER, repo: REPO, path: FILE_PATH },
        }),
      }),
      fetch(LINEAR_API, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LINEAR_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: LINEAR_QUERY(DRIFT_LABEL) }),
      }),
    ]);

    // Parse GitHub
    let declaredArchitecture = '';
    let ghError = null;
    let ghRateLimit = null;
    if (ghResult.status === 'fulfilled' && ghResult.value.ok) {
      const ghData = await ghResult.value.json();
      declaredArchitecture = ghData?.data?.repository?.object?.text || '';
      ghRateLimit = ghData?.data?.rateLimit || null;
      if (ghData.errors) ghError = ghData.errors.map(e => e.message).join('; ');
    } else {
      ghError = ghResult.reason?.message || 'GitHub fetch failed';
    }

    // Parse Linear
    let driftIssues = [];
    let linearError = null;
    if (linearResult.status === 'fulfilled' && linearResult.value.ok) {
      const linearData = await linearResult.value.json();
      driftIssues = (linearData?.data?.issues?.nodes || []).map(i => ({
        id: i.id,
        title: i.title,
        state: i.state?.name || 'Unknown',
        stateType: i.state?.type || '',
        updatedAt: i.updatedAt,
        url: i.url,
        assignee: i.assignee?.name || null,
        severity: linearPriorityToSeverity(i.priority),
        priority: i.priority,
      }));
      if (linearData.errors) linearError = linearData.errors.map(e => e.message).join('; ');
    } else {
      linearError = linearResult.reason?.message || 'Linear fetch failed';
    }

    // Build normalised findings from GitHub (static analysis of declared manifest)
    // This is where you'd call a real parser; here we do lightweight heuristics
    const findings = analyseManifest(declaredArchitecture);

    const payload = {
      declaredArchitecture,
      driftIssues,
      findings,
      meta: {
        owner: OWNER,
        repo: REPO,
        filePath: FILE_PATH,
        driftLabel: DRIFT_LABEL,
        ghError,
        linearError,
        ghRateLimit,
      },
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `no-store, s-maxage=${CACHE_TTL}`,
        ...corsHeaders(),
      },
    });

  } catch (err) {
    return errorResponse(500, err.message || 'Internal error in drift proxy');
  }
}

// ─── Manifest analyser (extend with real YAML/JSON parser) ─
function analyseManifest(raw) {
  if (!raw) return [];
  const findings = [];

  // Heuristic: check for required top-level keys
  const required = ['provider', 'regions', 'agents', 'storage', 'recovery'];
  required.forEach(key => {
    if (!raw.includes(key + ':') && !raw.includes(`"${key}"`)) {
      findings.push({
        title: `Missing declaration: "${key}" not found in architecture manifest`,
        meta: `architecture.yaml · required top-level key`,
        severity: 'warn',
        category: 'iac',
        tag: 'IaC',
      });
    }
  });

  // Heuristic: check for runbook references
  if (!raw.includes('runbook')) {
    findings.push({
      title: 'No runbook references in declared architecture',
      meta: 'architecture.yaml · recommended: link runbook paths for each lane',
      severity: 'info',
      category: 'runbook',
      tag: 'Runbook',
    });
  }

  return findings;
}

// ─── Helpers ──────────────────────────────────────────────
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function errorResponse(status, message) {
  return new Response(JSON.stringify({ error: message, timestamp: new Date().toISOString() }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}
