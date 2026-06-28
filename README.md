# MIRRORNODE Parallax

Parallax is the public front-of-house surface for MIRRORNODE architectural intelligence.

It presents Parallax as a governed modeling surface for AI-native infrastructure: a way for operators to review declared system assumptions, dependency structure, resilience posture, and governance risk before those assumptions are trusted in production.

Live site:

- https://parallax.mirrornode.xyz

Interactive lab:

- https://parallax.mirrornode.xyz/lab

Revenue path:

- https://mirrornode.xyz/audit

## Current posture

Parallax is a modeling tool, not runtime monitoring.

It does not observe live systems, detect incidents, certify operational safety, or guarantee resilience outcomes. It maps declared inputs, public/design references, and operator-provided assumptions into a reviewable front-of-house model.

Current production boundary:

- Public static front-of-house surface at `/`
- Interactive declared-model lab at `/lab`
- Canonical domain: `https://parallax.mirrornode.xyz`
- Paid audit handoff: `https://mirrornode.xyz/audit`
- Optional GitHub/Linear adapter code exists, but adapter behavior depends on explicit credential configuration
- No legacy Vercel secret indirection should be added to `vercel.json`

## Repository layout

```text
index.html      Main public surface
lab/index.html  Interactive Parallax Lab surface
main.js         Front-end interactions
style.css       Visual system
vercel.json     Vercel routing and headers
api/            Optional drift/webhook adapter endpoints
rotan-q/        Included sub-surface artifact
.github/        Pull request template and CI workflow gate
```

## Governance checks

The GitHub Actions workflow `Parallax Front-of-House Gate` verifies that future changes preserve the launch-critical public posture:

- required static files exist at repo root
- `lab/index.html` exists for the launch route
- governance boundary copy remains visible
- optional GitHub/Linear adapter language does not imply active runtime monitoring
- public links preserve `https://parallax.mirrornode.xyz`
- launch links route to `/lab`
- revenue CTA points to `https://mirrornode.xyz/audit`
- old Vercel preview URLs are rejected
- legacy Vercel secret references are rejected
- `vercel.json` parses as valid JSON

## Local verification

```bash
git status --short
python -m json.tool vercel.json >/dev/null
grep -F 'Modeling tool — not runtime monitoring.' index.html
grep -F 'Modeling tool — not runtime monitoring.' lab/index.html
grep -F '/lab' index.html
grep -F 'https://mirrornode.xyz/audit' index.html
```

## Deployment

This repo is connected to the existing Vercel project:

- Vercel team: `inphase`
- Vercel project: `public`
- Production domain: `https://parallax.mirrornode.xyz`
- Launch route: `https://parallax.mirrornode.xyz/lab`

Deployments are handled by Vercel from `main`.

Manual production deploy, if needed:

```bash
vercel --prod
```

## Operator release rule

Do not merge changes that weaken the boundary between modeling and monitoring, remove the paid audit path, restore old Vercel preview links, reintroduce legacy Vercel secret references, or cause the public Launch Parallax Lab CTA to self-link back to `/`.

For revenue-facing changes, verify both:

1. `https://parallax.mirrornode.xyz` serves the expected public copy.
2. `https://parallax.mirrornode.xyz/lab` serves the interactive Parallax Lab surface.
3. `https://mirrornode.xyz/audit` remains reachable and creates a live Stripe Checkout session.
