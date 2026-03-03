# Roadmap, Architecture Spikes, and Risk Register - Draft v0.2

## 1. Recommended build sequence (high level)

### Phase 0: Validation and POC (Week 1–4, defined by deliverables not calendar)

AI-assisted development means a functional POC can be deployed within days. The bottleneck is feedback cycles, not engineering.

- Deploy functional POC for insider testing (Alanna, Joe, select trusted advisors)
- ICP validation: 5 to 15 advisor discovery calls (small RIAs and fee-only planners)
- Incorporate feedback into MVP scope and priorities
- Entity formation and initial legal structure
- Define minimal "credible planning output" for MVP (1 to 2 templates)
- Integration strategy decision: aggregator-first vs custodian feeds vs imports
- Communication monitoring consent model: draft legal language for onboarding consent (aggregation, messaging, learning) — legal review required
- Compliance pre-assessment: confirm SOC 2 readiness path, CCPA applicability, ECPA consent model

### Phase 1: MVP Build (Months 2–4)
Goal: ship a production-ready platform advisors can use with real prospects/clients.

Deliverables:
- White-label client portal (branding, domain mapping optional, portal dashboards with real-time data where available)
- Digital onboarding (forms, doc upload, consents including communication monitoring and learning opt-in)
- Client-initiated account linking (Plaid/MX/Yodlee — at least one provider) with CSV/statement import fallback
- Secure in-platform messaging (must-have — foundation for AI Communication Hub and communication retention)
- Advisor workspace (CRM-lite, tasks, audit log, annual plan workflow, unified communication inbox)
- Reporting (plan summary PDF + annual review pack, generated from live data)
- Consent management infrastructure (granular per-client tracking: aggregation, communication monitoring, learning opt-in)
- Security baseline:
  - RBAC, MFA, encryption (TLS 1.2+ in transit, AES-256 at rest), audit logs
  - SOC 2 readiness controls and evidence collection (start day 1)

### Phase 2: Communication intelligence and automation
- External communication channel ingestion: email integration (inbound/outbound parsing, attachment extraction)
- AI Communication Hub:
  - document analysis (insurance docs, tax forms, statements) with plain-language summaries
  - question analysis in context of client's financial picture
  - draft response generation for advisor review and approval
  - advisor knowledge capture (documented answers, corrections feed the per-firm knowledge base)
- Proactive Life Signals Engine (financial signals first):
  - property maintenance, insurance renewal, contribution deadline, tax event reminders
  - large balance changes and unusual transaction patterns flagged for advisor review
  - signals sourced from linked accounts, document metadata, advisor rules, client preferences
- Account aggregation expansion: add 1st custodian API pathway plus CSV fallback
- Normalize accounts/holdings/transactions to a unified model powering the living plan
- Meeting workflow automation (agenda, notes, follow-ups auto-generated)
- Advisor analytics and conversion funnel inside the portal
- Shared learning corpus (Phase 2 start): anonymized, consent-gated document classification and common Q&A patterns

### Phase 3: Premium moat (AI-assisted ops + multi-custodian + compliance pack)
- Add 2nd and 3rd custodian/aggregation pathways
- AI-assisted planning workflows with human approval:
  - missing-data detection across the living plan
  - meeting summary drafts
  - annual plan narrative drafts from templates
  - next-best-action suggestions
  - living plan auto-updates flagged for advisor review
- Multi-channel communication monitoring: SMS/text integration
- Health and wellness life signals (pending HIPAA assessment):
  - generic calendar-based reminders (no PHI) if HIPAA analysis confirms safe path
  - PHI-based signals only after BAA framework and HIPAA compliance are in place
- Continuous learning expansion: fine-tuning on anonymized, consented data for domain-specific model improvements
- Compliance-support pack for small RIAs:
  - retention policy controls
  - export packages for audits
  - approvals and versioning
  - communications archive with immutable audit trail

## 2. Architecture spikes to plan early

### Data model and storage
- Data model: household, accounts, holdings, transactions, goals, plan artifacts, tasks, messages, documents, life signals, consent records
- Multi-tenant + white-label theming strategy
- Document storage and retrieval (encryption, retention-aware, classified by type)

### Real-time event processing
- Event-driven architecture: account balance changes, document uploads, new messages, and life signal triggers all feed into a central event bus
- Events trigger plan re-evaluation, signal rule matching, and advisor notification
- Design for near-real-time (seconds to minutes latency) rather than batch-only

### Communication ingestion pipeline
- In-platform messaging data model (Phase 1)
- Email parsing service: inbound/outbound capture, MIME parsing, attachment extraction, PII-aware routing (Phase 2)
- Message classification: question vs. document submission vs. general correspondence vs. actionable request
- Document intelligence: extraction, classification, key-field identification (insurance terms, policy numbers, dates, amounts)

### Consent management
- Per-client consent data model: separate grants for data aggregation, communication monitoring, and anonymous learning
- Enforcement layer: middleware that checks consent state before any data flows into monitored channels or learning pipelines
- Consent revocation propagation: when a client withdraws consent, all downstream systems purge or stop processing within defined SLA

### PII detection and anonymization pipeline
- Automated PII detection (entity recognition for names, SSNs, account numbers, addresses, dates of birth)
- De-identification pipeline that runs before any data enters the shared learning corpus
- Design for NIST SP 800-188 compliance
- Regular re-assessment: periodic audits of anonymization effectiveness

### RAG and knowledge architecture
- Per-firm knowledge base: advisor-curated answers, policies, corrected drafts — isolated per tenant
- Shared anonymized corpus: document templates, common Q&A patterns, financial terminology — consent-gated contributions only
- Retrieval pipeline: query the firm-specific knowledge first, fall back to shared corpus, never blend without isolation boundaries

### Audit logging
- Append-only log + queryable projections
- Every AI-generated artifact logged: input context, model version, output, advisor action (approved/edited/rejected)
- Communication retention: all messages stored immutably with timestamps and participant metadata

## 3. Primary risks and mitigations

### Risk A: Custodian/aggregation integration complexity
Mitigations:
- start with 1-2 integrations; keep CSV/statement imports as fallback
- design normalization layer early
- instrument refresh health and advisor-visible error resolution

### Risk B: Blurring into "investment advice"
Mitigations:
- keep AI features assistant-like; require advisor approval for all client-facing content
- avoid auto-recommendations of specific securities for end users
- present as planning ops + client experience tooling
- log every AI output with full traceability

### Risk C: Advisor adoption and switching costs
Mitigations:
- deliver portal-led entry tier (prospect journey) rather than asking them to replace their entire stack
- easy onboarding and imports
- integrate with the CRMs they already use

### Risk D: Security and trust expectations
Mitigations:
- publish a security page and due diligence pack early
- build SOC 2 controls from day 1
- implement MFA, RBAC, encryption, monitoring, incident response playbooks

### Risk E: Communication monitoring legal exposure
Federal ECPA and state wiretap laws vary. 11+ states require all-party consent for electronic communication monitoring.
Mitigations:
- obtain explicit written consent from both advisor and client during onboarding before any communication monitoring is enabled
- consent language reviewed by legal counsel
- per-state legal review before launch in each jurisdiction
- ability to disable external channel monitoring per-client or per-state if required

### Risk F: HIPAA trigger from health-related features
If the platform ingests Protected Health Information (PHI) — health records, diagnoses, HSA transaction details — it becomes a HIPAA Business Associate.
Mitigations:
- Phase 1–2: use only generic, calendar-based health reminders that do not ingest or store PHI
- Phase 3+: dedicated HIPAA compliance assessment before any health data integration
- If PHI handling is required: execute Business Associate Agreements, implement HIPAA technical safeguards (AES-256 encryption, access controls, audit trails, breach notification procedures)

### Risk G: Continuous learning data governance
Consent revocation must propagate to all learning data. If a client withdraws consent, their data must be purged from the shared corpus.
Mitigations:
- design anonymization pipeline to be provably non-reversible (cannot re-identify from anonymized data)
- maintain audit trail of consent state (granted, revoked, when, by whom)
- never store raw PII in the shared learning corpus
- regular third-party audits of de-identification effectiveness
- legal review of anonymization approach against CCPA, NIST, and emerging state privacy laws

### Risk H: AI output liability
AI-generated content that reaches clients could create liability if it contains errors or crosses into advice territory.
Mitigations:
- mandatory advisor approval before any AI-generated content reaches a client
- clear disclaimers attached to all AI-assisted outputs
- full audit trail: input data, model version, raw output, advisor edits, final approved version
- periodic human review of AI output quality and accuracy

## 4. Useful additional artifacts to create next
- Product one-pager (value prop, ICP, pricing bands)
- User journeys:
  - prospect -> portal -> upgrade -> advised client
  - annual review workflow
  - client sends document -> AI analyzes -> advisor approves response
  - life signal triggers -> advisor notified -> client alerted
- Integration map: CRM, calendar, e-sign, aggregation, email, reporting
- Data dictionary and event schema for audit logging
- Consent flow wireframes (onboarding consent capture, settings page for clients to manage consent)
