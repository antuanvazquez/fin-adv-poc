# Background: Meeting with Financial Advisors (Alanna & Joe) - Notes (Draft v0.2)

## Founding partnership
- **Antuan** — founding partner, serial entrepreneur with prior tech company founding experience. Builder-operator who covers the AI stack (agent design, evals, reliability), the trust stack (cloud security, SOC 2 readiness), and the data/integration layer that makes the product sticky. Pattern recognition from LegalTech and FinTech-adjacent regulated environments. Leads product, architecture, and technical build.
- **Alanna** — founding partner, active financial advisor. Relatively early in career but highly experienced and top-tier. Her active practice brings real-time industry insight and serves as built-in product validation — we build with a live advisor lens from day one, as if we had a customer onboard to shape the product.
- **Joe** — founding partner, retired financial advisor. Outstanding sales expertise and a proven ability to open doors. Brings extensive industry experience, institutional knowledge, relationships, and credibility.

## High-level outcome
The three partners are building a **Financial Advisory SaaS** together.

## Product intent discussed
A SaaS platform that augments advisors' ability to service clients by streamlining:
- Data collection and processing
- Strategy development and yearly plans
- Ongoing servicing workflows

Target is primarily independent advisors (approx. 10 to 200 client households), with the intent to avoid the most restrictive broker-dealer style regulation and focus on RIA-style advisory workflows where possible.

## Key strategic model options discussed
### Option A: Advisor-first (B2B SaaS)
- White-label, customizable client plan portals that advisors can offer to clients at a low fee.
- Advisors can use the portal as a "tiered entry gate" to attract prospects and convert them to higher-paying advisory relationships.
- The platform provides workflow automation and planning support for the advisor.

### Option B: Direct-to-consumer (D2C) + marketplace
- Offer consumer-facing advisory SaaS directly.
- Add "human-in-the-loop" upgrade: clients can find and engage a real advisor via a marketplace.
- Concern: more competitive and harder trust/distribution problem vs B2B.

## Current constraint noted
- Relationships may be anchored inside large corporate firms, which can limit immediate leverage of network for early distribution unless they leave their roles.
- Therefore, early traction may need to rely on:
  - credibility and domain expertise
  - product-led growth, content, partnerships, and outbound to independent advisors

## Main directional conclusion so far
The safer starting point is **advisor-first (B2B)**:
- clearer value proposition
- lower consumer trust burden
- better wedge for iterative expansion
- option to add marketplace later once advisor base exists

## Technical/compliance threads raised
- Custodian integration is high-value and hard.
- Security expectations: SOC 2 (often pursued via tools like Vanta/Drata) is a common baseline expectation.
- As a SaaS vendor, we likely do not need to be "SEC/FINRA compliant" as registrants, but must deliver strong security and build compliance-support features that help advisors with their obligations.

## Pricing signal
Alanna stated she would pay **at least $5,000/month** for a platform matching the vision discussed. This is significant context as a founding partner expressing confidence in the value of what we are building — and is consistent with market benchmarks (small-to-mid RIAs in the $100M–$2B AUM range spend $2,000–$12,500/month on tech per industry research).

## Expanded product vision (from follow-up discussions)
The initial meeting focused on planning workflows and portals. Subsequent discussions expanded the vision significantly:

- **Living financial plan:** The platform continuously ingests new data (linked accounts, uploaded documents, advisor-client communications) and keeps the financial plan current in real time — not a static PDF updated once a year.
- **AI Communication Hub:** The platform monitors all advisor-client communication channels (in-platform messaging, email, text). When a client sends a document or question, AI analyzes it, summarizes the key information, and drafts a response for the advisor to approve before sending. Nothing reaches the client without human approval.
- **Proactive life signals:** The platform proactively alerts advisors and clients to financial risks before they become problems — property maintenance reminders, insurance renewals, contribution deadlines, unusual balance changes. Health-related reminders (annual checkups) are deferred until HIPAA implications are assessed.
- **Continuous learning:** Advisors document answers and knowledge that the AI learns from over time. Clients who consent contribute anonymized data to a shared learning corpus that makes the platform smarter for everyone. Clients who do not consent are strictly excluded.
- **Account connectivity:** Clients link their bank accounts, investment accounts, and other financial accounts directly through the platform, enabling ongoing data sharing rather than one-time intake.

These capabilities are documented in detail in `requirements.md` (v0.2), `roadmap_and_risks.md` (v0.2), and `technology_roadmap.md`.
