# MIRRORNODE Public Front Door — Release Specification v1

Status: **Decision candidate — documentation only**  
Owner: Operator  
Implementation authority: **Not granted by this document**  
Production change: **None**

## 0. Product spine

The public release must preserve one product architecture:

> **Build KHEPRI for the Operator. Architect KHEPRI for many operators. Commercialize it through bounded specialist surfaces.**

Parallax is the public front-of-house projection of that architecture. It should let a first-time visitor understand, inspect, and verify MIRRORNODE's core claims without exposing the full Operator environment or requiring the visitor to learn internal vocabulary first.

The public experience is therefore not a simplified KHEPRI clone and not a conventional SaaS dashboard. It is a bounded explanatory and commercial surface built from the same principles: explicit state, visible relationships, evidence, gates, uncertainty, and progressive disclosure.

---

## 1. Public category and promise

### Category

**Agent control and assurance.**

Long-form description:

> MIRRORNODE helps operators understand what AI agents can access, what actions they can take, where approval is required, what effects occurred, and what evidence supports those conclusions.

### Primary public promise

> **Know what your AI agents can actually do.**

### Supporting trust line

> **Evidence first. Human-gated. Read-only first. Unknown stays unknown.**

### Terms not used as the primary headline

Do not lead with:

- AI governance consultancy
- distributed cognitive lattice
- agent council
- orchestration mythology
- KHEPRI
- ROTAN
- compliance platform
- autonomous AI

Those may exist deeper in the architecture or documentation, but they do not define the visitor's first problem.

---

## 2. Primary audiences

### A. Technical operator / founder

Typical environment:

- GitHub repositories
- cloud deployment
- coding or automation agents
- credentials and integrations
- CI/CD
- databases and operational tooling
- unclear approval boundaries

Primary question:

> What can these agents actually reach or change, and what proves it?

### B. Security / engineering lead

Primary questions:

- Where can an agent act without explicit approval?
- Which identities and integrations produce the largest control surface?
- Can an effect be reconstructed back to its actor, authority, and evidence?

### C. Advisor / partner / business-development visitor

Must be able to establish within two minutes:

1. the problem is concrete;
2. MIRRORNODE has working infrastructure and a defined method;
3. there is a bounded service that can be purchased;
4. the company does not overclaim what has not been established.

### D. Enterprise buyer — later-depth audience

Architecture should support enterprise security, procurement, governance, and audit review later without forcing enterprise language onto the first public interaction.

---

## 3. Existing route ownership

The existing repository contract already identifies Parallax as MIRRORNODE's public front-of-house and defines:

- `https://parallax.mirrornode.xyz/` — public front-of-house
- `https://parallax.mirrornode.xyz/lab` — interactive declared-model lab
- `https://mirrornode.xyz/audit` — paid audit handoff

v1 should preserve these route responsibilities rather than introduce a domain migration during the commercial launch.

### Required distinction

**Parallax models and explains.**  
It must not imply live monitoring when live observation has not been established.

**The audit service inspects a bounded customer environment.**  
It must not imply permission to modify that environment.

**KHEPRI operates at a deeper Operator boundary.**  
It is not exposed as an unrestricted public control plane.

---

# 4. Site map — release v1

## 4.1 `parallax.mirrornode.xyz/` — Front Door

Purpose: answer four questions in one scroll:

1. What problem does MIRRORNODE solve?
2. What does an authority path look like?
3. Why should I trust the method?
4. What can I do next?

### Page sequence

#### Movement 1 — Hero

Headline:

> **Know what your AI agents can actually do.**

Supporting copy:

> Map agents, identities, tools, resources, approvals, effects, and evidence across an AI-enabled environment.

Primary actions:

- **Explore an authority map** → `/lab`
- **Audit my environment** → `https://mirrornode.xyz/audit`

No third primary CTA.

#### Movement 2 — Visual problem statement

Show one simple traversable authority path:

`Agent → Identity → Tool → Resource → Action → Gate → Effect → Evidence`

The visitor should understand the relationship before reading detailed product copy.

#### Movement 3 — Why ordinary inventories are insufficient

Short distinction:

- knowing an agent exists is not knowing its identity;
- knowing an identity exists is not knowing its authority;
- knowing an action is possible is not proof that it executed;
- knowing something executed is not proof that it was authorized.

#### Movement 4 — Trust primitives

Four compact principles:

- **Evidence first** — claims have support states.
- **Human-gated** — consequential approval remains explicit.
- **Read-only first** — inspection does not imply mutation authority.
- **Unknown stays unknown** — ambiguity is not silently upgraded into fact.

#### Movement 5 — Proof

Introduce the **MIRRORNODE Reference Environment** self-audit.

Public promise:

> We subject our own agent-enabled environment to the same method we sell.

Do not publish quantitative findings until the self-audit is actually completed and sanitized.

Provide one representative trace only when supported by evidence.

#### Movement 6 — Commercial engagement

Two offers only at launch:

1. **Structural Scan** — bounded, fixed-price entry.
2. **Agent Authority Audit** — deeper scope, authority-path focused.

Do not headline a pricing grid above the explanation and proof.

#### Movement 7 — Go deeper

Links to:

- Parallax Lab
- methodology
- evidence states
- security/access posture
- technical reference

---

## 4.2 `parallax.mirrornode.xyz/lab` — Interactive Authority Model

Purpose: let the visitor learn the method by interacting with a representative model before sharing data or buying anything.

### First-load behavior

Do **not** open with a blank chatbot.

Open with an orientation choice:

> **What are you trying to understand?**

Options:

- What can an AI agent access?
- Where can an agent act without approval?
- Which integrations create the most exposure?
- Can an action be reconstructed after it happened?
- Show me how evidence confidence works.
- I want to understand the MIRRORNODE method.

### Interaction depth

#### Ambient

Show only:

- nodes
- relationships
- gates
- evidence state
- boundaries
- direction of traversal

Minimal prose.

#### Focused

Selecting a node or path reveals:

- actor / identity
- integration or tool
- resource
- action
- gate
- effect
- evidence state

#### Explicit

A further expansion reveals:

- methodology note
- field definition
- version
- source/reference
- limitations

The user chooses depth. Complexity is available, not compulsory.

### Model boundary

The lab must visibly state when data is illustrative, declared, fixture-based, modeled, or otherwise not live-observed.

No animation or visual treatment may imply authorization merely because a path is visually connected.

---

## 4.3 `parallax.mirrornode.xyz/reference` — Documentation Projection

New route candidate for v1 implementation.

Purpose: replace the conventional documentation dump with progressive technical depth.

### Top-level reference entries

- **Authority Paths**
- **Evidence States**
- **Proposal vs. Execution**
- **Identity vs. Provider vs. Presence**
- **Approval Gates**
- **Effect Reconstruction**
- **Audit Scope and Limitations**
- **Security and Access**

### Documentation depths

Each topic should provide:

1. **Learn** — plain language.
2. **Inspect** — architecture and relationships.
3. **Reference** — schema, method, contract, or canonical technical material.

No requirement for a new page per topic at first. v1 may implement `/reference` as a single expandable projection surface.

---

## 4.4 `parallax.mirrornode.xyz/security` — Trust and Access Boundary

New route candidate.

Purpose: answer the questions a careful customer should ask before granting any access.

Required public statements:

- minimum access necessary;
- read-only-first posture;
- customer must be authorized to provide material;
- audit access does not authorize remediation or mutation;
- temporary access is scope- and time-bounded;
- no silent permission expansion;
- no production credentials or end-user datasets requested by default;
- retained material and retention periods are explicitly disclosed;
- inability to establish a claim results in UNKNOWN rather than an inferred result.

Do not advertise certifications that MIRRORNODE has not obtained.

---

## 4.5 `mirrornode.xyz/audit` — Commercial Entry

The existing route currently hands off to the Osiris audit surface. Release v1 should make this the commercial intake boundary, not a duplicate marketing homepage.

### Required first question

> **What are you trying to establish?**

Options:

- what agents can access;
- where agents can act;
- approval gaps;
- credential/integration exposure;
- reconstructibility after execution;
- general structural orientation.

### Required environment sizing questions

Ask only enough to determine fit:

- repositories
- environments
- material principals/agents
- integrations/tool surfaces
- approximate authority paths

Do not request credentials during initial orientation.

### Recommended service ladder

#### Offer 1 — Structural Scan

Purpose: answer **What is here and where should I look first?**

Launch candidate:

- fixed price: **$149**
- passive/read-only
- one bounded environment
- compact structural map
- prioritized findings
- short turnaround

The exact scope caps and delivery terms must match the canonical service contract before public copy changes.

#### Offer 2 — Agent Authority Audit

Purpose: answer **Who can actually do what, through which identity and integration, under what gate, with what evidence?**

Launch posture:

- scope-first
- bounded authority paths
- evidence state per material claim/edge
- impact/consequence considered separately from evidence confidence
- price determined by frozen scope until a validated fixed tier exists

#### Later — Control Surface / KHEPRI specialist projection

Inquiry only. Do not sell an unrestricted control plane before the implementation, operating, and support boundaries are mature.

---

# 5. Visual grammar

The public system should use a small stable grammar that can later scale into Audit View and KHEPRI.

## Node

A thing that exists:

- agent
- human
- identity
- provider/account
- integration/tool
- repository/resource
- environment
- runtime

## Vector

A possible or observed relationship or transition.

A vector does not imply permission.

## Gate

A condition or authority transition required before an effect may occur.

## Boundary

A meaningful separation:

- identity
- security
- organization
- environment
- provider
- scope

## Effect

A state change that actually occurred or is explicitly modeled as hypothetical.

Observed effects and modeled effects must be visually distinguishable.

## Evidence marker

Shows the support state for the associated claim.

## Unknown

UNKNOWN must be a visible first-class state, not empty UI and not an error condition by default.

---

# 6. Public evidence vocabulary

Release v1 public vocabulary:

### VERIFIED

Direct evidence establishes the material claim.

### PARTIALLY VERIFIED

Part of the claim is established while a material part remains unresolved.

### CLAIMED

The claim was reported or documented but has not been independently established to the required standard.

### UNKNOWN

Available evidence does not establish the answer.

### NOT APPLICABLE

Use only when the claim genuinely does not apply.

### Rule

Evidence confidence and impact are separate dimensions. A VERIFIED low-impact relationship is not automatically more important than an UNKNOWN high-consequence path.

---

# 7. Public assistant interaction contract

The assistant is introduced **after context is selected**, not before.

### It may

- explain MIRRORNODE;
- guide the visitor through a model;
- explain evidence states;
- help define a bounded audit scope;
- interpret a sanitized example;
- prepare intake information.

### It may not imply that it can

- access a visitor's environment without an explicit connection or supplied material;
- authorize execution;
- expand its own permissions;
- modify a customer system under an audit engagement;
- turn missing evidence into fact;
- certify compliance or safety without a defined certification basis.

### Example contextual introduction

After the visitor selects **Where can an agent act without approval?**:

> I can help map that by tracing each relevant agent through identity, integration, resource, available action, approval gate, effect, and evidence. You can explore a representative model first or define a bounded scope for your environment.

---

# 8. MIRRORNODE Reference Environment — proof artifact

This should become the central public proof object.

## Rule

MIRRORNODE is audited using the same bounded method offered commercially.

## Public artifact should show

- sanitized topology;
- representative actors and identities;
- integrations;
- resources;
- gates;
- effects where safely publishable;
- evidence states;
- unresolved areas explicitly retained as UNKNOWN;
- method version and audit date.

## It should not show

- secrets;
- credential identifiers that create security exposure;
- private source unnecessarily;
- internal personal data;
- invented statistics;
- implied certification.

## Strongest demonstration

Allow a user to traverse at least one path forward and backward:

`intent → actor → identity → integration → resource → action → gate → effect → evidence`

and

`effect → execution path → gate/authority → evidence → initiating task/origin`

The public visualization demonstrates reconstructibility rather than merely describing it.

---

# 9. Brand hierarchy — decision candidate

## Public company/system

**MIRRORNODE**

## Evidence / audit function

**Osiris**

Commercial names may therefore be:

- **Osiris Structural Scan**
- **Osiris Agent Authority Audit**

## Public visualization

**Parallax**

## Deep Operator environment

**KHEPRI**

## MOPCON

Treat as Operator-console lineage / implementation surface, not a competing public product category.

### Required cleanup if approved

The existing paid audit page still exposes older `Seraphyth Dynamics` branding and the earlier generic one-pass audit positioning. Before release, public brand and commercial scope should be reconciled so a visitor does not encounter MIRRORNODE → Parallax → Seraphyth Dynamics as three unexplained companies/products.

No cleanup is authorized by this specification alone.

---

# 10. Copy hierarchy

## Level 1 — first-time visitor

> **Know what your AI agents can actually do.**

> Map agents, identities, tools, resources, approvals, effects, and evidence.

## Level 2 — technically interested visitor

> Agent identity, authority, action, approval, execution, and evidence are separate states. MIRRORNODE maps the relationships rather than assuming they are equivalent.

## Level 3 — specialist

Expose method, schemas, evidence definitions, contracts, versioning, limitations, and sanitized proof.

Do not force Level 3 vocabulary into Level 1 copy.

---

# 11. Explicit non-goals for release v1

Do not make launch dependent on:

- full KHEPRI implementation;
- live runtime/deployment monitoring in Parallax;
- autonomous remediation;
- broad enterprise compliance claims;
- a large customer portal;
- every internal governance document being public;
- exposing the complete agent topology;
- a generalized chatbot homepage;
- additional price tiers without validated fulfillment data;
- a full site/domain migration.

Release the smallest coherent truth.

---

# 12. Release gates

## Gate A — Business activation

Before accepting paid work, complete the chosen business formation/licensing/payment-account sequence and confirm the entity/brand used in checkout and service terms.

## Gate B — Commercial contract

Lock:

- service name;
- price or pricing rule;
- scope caps;
- turnaround trigger;
- access requirements;
- data handling;
- cancellation/refund boundary;
- deliverable;
- clarification/remediation boundary.

## Gate C — Public proof

Complete and sanitize the MIRRORNODE Reference Environment audit.

No invented proof metrics.

## Gate D — Front door implementation

Implement:

- hero/message hierarchy;
- authority-path visual;
- trust primitives;
- proof entry;
- commercial CTA;
- orientation-first lab behavior.

## Gate E — Trust/reference

Publish:

- methodology;
- evidence states;
- security/access posture;
- limitations;
- privacy/terms/contact as required for commercial operation.

## Gate F — Specialist expansion

Only after the initial commercial loop is working:

- Audit View;
- Security/Authority View;
- Runtime/Delivery View;
- deeper KHEPRI projections.

---

# 13. Launch acceptance criteria

A release candidate is ready for Operator review only if all are true:

1. A stranger can state the problem MIRRORNODE solves after reading the first screen.
2. The first screen contains no unsupported security or compliance claim.
3. `/lab` visibly distinguishes modeled/declared state from live observation.
4. The authority-path visual does not imply that connectivity equals authorization.
5. UNKNOWN is visible as a legitimate result.
6. The visitor can reach the paid audit path from both `/` and `/lab`.
7. Audit scope is explained before credentials or sensitive material are requested.
8. The public service identity is not split across unexplained MIRRORNODE / Seraphyth / Osiris branding.
9. The Reference Environment uses real sanitized evidence rather than illustrative metrics presented as fact.
10. A user can reach plain-language explanation, technical inspection, and reference detail without being forced through all three.
11. Mobile use remains understandable without requiring a desktop topology view.
12. Accessibility semantics do not depend on color, animation, hover, or visual position alone.
13. Production release does not weaken Parallax's existing modeling-vs-monitoring boundary.
14. Paid delivery terms match the actual service contract and checkout.
15. Operator approval is explicit before production deployment.

---

# 14. Decisions to freeze before implementation

The following are the final launch decisions this specification asks the Operator to make:

1. **Category:** Agent control and assurance.
2. **Headline:** Know what your AI agents can actually do.
3. **Trust line:** Evidence first. Human-gated. Read-only first. Unknown stays unknown.
4. **Front door:** Parallax remains the public front-of-house for v1.
5. **Commercial entry:** `mirrornode.xyz/audit` remains the paid-service boundary.
6. **Entry offer:** Structural Scan remains the $149 fixed-price entry offer, subject to final service-contract reconciliation.
7. **Primary audit:** Agent Authority Audit is scope-first and deeper than the Structural Scan.
8. **Proof:** MIRRORNODE becomes its own first public reference audit.
9. **Brand:** MIRRORNODE is the public company/system brand; Osiris names the audit/assurance function; Parallax names the public visualization; KHEPRI names the deep Operator environment.
10. **Interaction:** orientation before conversation; simple first, depth on demand.
11. **Release posture:** public modeling and evidence first; no unsupported monitoring, certification, or autonomous-control claims.
12. **Commercial progression:** Understand → Map → Control → Operate.

Once these are frozen, implementation can be cut into small reviewable slices without reopening the product identity on every PR.
