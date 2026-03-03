# Advisory Intelligence Platform — Requirements

## 1. Project intent

Build a modern B2B SaaS platform that serves as the **operating system for independent financial advisors**. The platform continuously ingests client data — from linked accounts, uploaded documents, and advisor-client communications across channels — and maintains a **living financial plan** that updates in real time as the client's situation evolves.

Core capabilities:
- **Client onboarding and ongoing data collection** — structured intake, account linking (bank, investment, insurance), document uploads, and continuous data sharing
- **Living financial plans** — plans that automatically reflect new data (balance changes, life events, document submissions) rather than static PDFs updated once a year
- **AI-powered communication hub** — monitors all advisor-client communication channels (in-platform, email, text), analyzes documents and questions clients share, and drafts advisor-approved responses
- **Proactive life signals** — alerts advisors and clients to upcoming financial risks (missed property maintenance, insurance renewals, contribution deadlines) before they become expensive problems
- **White-label client portals** — branded, secure portals advisors offer as a low-fee "entry tier" to attract prospects and convert them into full advisory relationships
- **Continuous learning** — the platform gets smarter over time as advisors document answers and knowledge, with strict consent-based governance for any shared learning across firms

The product is **supplemental** to advisory firms — it is not a robo-advisor and does not provide investment advice. The goal is to make advisors dramatically more effective: faster meeting prep, more informed conversations, proactive client management, and higher client-to-advisor ratios without sacrificing service quality.

## 2. Target customer (ICP)

### Primary
- Independent advisors and small RIA firms
- Roughly 10 to 200 client households
- Lean ops, needs automation and client experience improvements
- Will value: speed, simplicity, portal experience, reliable data aggregation, proactive intelligence, and auditability

### Secondary (later)
- Hybrid advisors (RIA + BD affiliation) and small teams at larger firms, depending on procurement constraints.

## 3. Regulatory positioning

### Our posture
- We are a **technology vendor** to advisory firms.
- We do **not** provide personalized investment advice to end clients.
- We focus on **security, privacy, audit trails**, and features that help advisors satisfy their own obligations.
- All AI-generated content requires **advisor approval** before reaching clients. The advisor is always the decision-maker; the platform is the assistant.

### Advisor and firm regulation (context)
- RIAs are regulated by the SEC (federal) or by state securities regulators, depending on AUM and other factors.
- Broker-dealers are regulated by FINRA and the SEC.
- Our product should be "compliance supportive" (logging, retention, permissioning), not "compliance as a registrant."

### Data and privacy regulations affecting our platform
- **HIPAA:** Applies only if we handle Protected Health Information (PHI) — actual medical records, health diagnoses, treatment data. Generic calendar-based health reminders ("schedule your annual checkup") that do not ingest or store PHI do **not** trigger HIPAA. If we later integrate with HSA providers or health data sources, we become a Business Associate and must execute BAAs. Recommendation: defer PHI handling to Phase 3+; keep early health signals generic.
- **CCPA / state privacy laws:** Applies because we handle consumer financial data for California residents (and residents of other states with similar laws). Requires: right to know what data we collect, right to delete, right to opt-out of sale/sharing of personal information, data minimization. Our consent-based learning system must honor these rights.
- **ECPA / wiretap laws (communication monitoring):** Monitoring advisor-client email and messaging requires consent. Federal law (ECPA) requires one-party consent; 11+ states require all-party consent. Mitigation: obtain explicit consent from both advisor and client at onboarding before any communication monitoring is enabled. Legal review required per-state before launch.
- **GLBA (Gramm-Leach-Bliley Act):** Financial institutions must protect consumer financial information. As a vendor to RIAs, we are subject to GLBA safeguards through contractual obligations (vendor agreements, data processing addenda).
- **Data anonymization for learning:** Any data entering the shared learning corpus must be provably de-identified per NIST guidelines. Consent revocation must propagate — if a client withdraws consent, their data must be purged from future training inputs.

## 4. Core product modules (MVP and baseline parity)

### 4.1 White-label Client Portal (Must-have)
- Per-advisor branding: logo, colors, domain/subdomain, onboarding emails
- Client dashboards:
  - Net worth / balance overview (real-time, fed by linked accounts and manual entries)
  - Goals and plan progress (living plan status, not static snapshots)
  - Proactive life signal alerts and action items
  - Documents and statements vault
  - Meeting summaries / action items
- Secure in-platform messaging (must-have for MVP — this is the foundation for the AI Communication Hub and for communication retention compliance)

### 4.2 Digital onboarding & data collection (Must-have)
- Configurable intake forms and questionnaires:
  - household profile, income, expenses, debts, assets, insurance, beneficiaries
  - risk tolerance questionnaire
  - goals intake (retirement, home, education, business, etc.)
- Client-initiated account linking:
  - bank accounts, investment/brokerage accounts, retirement accounts via aggregation APIs (Plaid, MX, Yodlee — exact providers TBD)
  - ongoing data sharing (not one-time — linked accounts continue feeding data into the living plan)
- E-sign acknowledgements/consents (can integrate with DocuSign/HelloSign later)
- Document upload capture (W-2, statements, policies, IDs)
- Consent capture: data aggregation consent, communication monitoring consent, anonymous learning opt-in (all separate, granular consents)
- Advisor-side review queue and completeness scoring

### 4.3 Advisor workspace (Must-have)
- Client/household CRM-lite:
  - contacts, household structure, roles, notes, tags, segmentation
  - tasks and reminders
- Timeline / audit log:
  - who changed what, when, and why (notes + artifacts)
- Annual planning workflow:
  - templated plan outline
  - plan updates, review cadence, checklist
- Communication inbox:
  - unified view of all client communications (in-platform messages + ingested external channels)
  - AI-generated summaries and draft responses flagged for advisor review
  - approve / edit / reject workflow for AI drafts

### 4.4 Reporting & deliverables (Baseline parity)
- PDF/Shareable deliverables:
  - plan summary (generated from the living plan, not manually assembled)
  - goal progress report
  - annual review package
- Export to common CRMs (later: Wealthbox/Redtail/Salesforce) via CSV/API

## 5. Premium / differentiating modules (Roadmap, but design now)

### 5.1 Data aggregation and custodian connectivity (High-value, hard)
Goal: pull balances/holdings/transactions (investment accounts and bank accounts) into the platform to power the living financial plan.

MVP approach:
- Start with **2 to 3 major custodian/aggregation pathways** (exact choices TBD).
- Use a pragmatic ingestion strategy:
  - aggregator API (preferred) and/or custodian file feeds
  - fallbacks: CSV import + statement upload + manual mapping

Key requirements:
- Normalization layer (accounts, holdings, transactions, positions)
- Real-time or near-real-time refresh (event-driven where possible, scheduled polling as fallback)
- Error handling and reconciliation UI for advisors
- Every data change triggers re-evaluation of plan status and life signal rules

### 5.2 Workflow automation (High-value)
- Meeting workflow: agenda templates, meeting notes capture, action items
- Auto-generated follow-ups and tasks based on plan deltas and life events
- Reminders for annual review, contribution checks, insurance review, estate update checks

### 5.3 "Conversion engine" for entry-tier portal users (High-value)
- Lead funnel controls:
  - prospect portal mode (limited features)
  - prompts and nudges to schedule consult / upgrade
- Advisor analytics:
  - engagement scoring (logins, task completion, doc uploads)
  - conversion pipeline stages

### 5.4 Compliance-support features (High-value)
- Append-only audit logs for key events
- Data retention controls and export for audits
- Permissioning (RBAC): owner, advisor, assistant, compliance officer
- Communications retention: all advisor-client messages (in-platform and ingested external) stored with timestamps and immutable audit trail
- Document retention hooks

### 5.5 AI Communication Hub (High-value, differentiating)

The platform monitors all advisor-client communication channels and acts as an intelligent assistant that helps advisors respond faster and more thoroughly.

**Communication ingestion:**
- In-platform secure messaging (Phase 1 — foundation)
- Email integration: inbound/outbound email parsing, attachment extraction (Phase 2)
- SMS/text monitoring (Phase 3)

**AI-powered analysis and response:**
- When a client sends a document (insurance explanation of benefits, tax form, brokerage statement, legal document, etc.), the AI:
  - extracts key information and classifies the document
  - generates a plain-language summary of what it means for the client's financial situation
  - drafts a response for the advisor to review
- When a client asks a question ("What does this insurance document mean?", "Should I roll over my 401k?"), the AI:
  - analyzes the question in context of the client's full financial picture
  - drafts a response grounded in the advisor's documented knowledge and past answers
  - flags anything that approaches investment advice territory for extra advisor scrutiny
- Advisor reviews, edits if needed, approves, and sends — nothing reaches the client without human approval

**Advisor knowledge capture:**
- Advisors can document standard answers, policies, and guidance that the AI uses for future drafts
- Corrections to AI drafts feed back into the per-firm knowledge base
- Over time, the AI becomes increasingly aligned with each advisor's voice, style, and advisory philosophy

### 5.6 Proactive Life Signals Engine (High-value, differentiating)

The platform monitors all available data streams and proactively surfaces risks, opportunities, and reminders that help clients avoid financial surprises.

**Financial life signals (Phase 2):**
- Property maintenance reminders (based on property ownership data and standard maintenance schedules) to avoid unexpected major expenses
- Insurance renewal and coverage gap alerts
- Tax-related deadlines (contribution limits, estimated tax payments, RMD deadlines)
- Large balance changes or unusual transaction patterns flagged for advisor review
- Contribution deadline reminders (IRA, HSA, 529)
- Estate document expiration or review cadence reminders

**Health and wellness signals (Phase 3+ — pending HIPAA analysis):**
- Generic calendar-based reminders: "Schedule your annual physical to stay ahead of potential medical expenses"
- These do NOT require ingesting PHI if they are preference-based (client sets their own reminder) or calendar-based (annual cadence)
- If we later integrate with health data sources (HSA transaction data, wellness platforms), HIPAA Business Associate requirements apply — defer until Phase 3+ with dedicated compliance assessment

**Signal sources:**
- Linked account transaction patterns and balance changes
- Calendar events and advisor-configured rule schedules
- Client-provided preferences and life details from onboarding
- Document metadata (policy expiration dates, renewal terms extracted by AI)
- Advisor-defined custom rules per client or segment

### 5.7 Continuous Learning System (High-value, hard, defensible moat)

The platform improves over time by learning from advisor interactions, documented knowledge, and (with consent) anonymized client data patterns.

**Per-firm knowledge (always active, no cross-firm sharing):**
- Advisor-curated knowledge base: documented answers, firm policies, standard guidance, corrected AI drafts
- RAG (retrieval-augmented generation): AI retrieves relevant firm-specific knowledge when drafting responses or generating plan narratives
- Isolated per-firm — one firm's knowledge never leaks to another

**Shared learning corpus (strictly opt-in, anonymized):**
- Clients who consent: their data contributes to an anonymized corpus that improves the platform's general financial intelligence (common document types, typical questions, pattern recognition)
- Clients who do NOT consent: their data is strictly excluded — never enters the shared corpus, never used for model improvement beyond their own advisor's firm
- Technical approach:
  - PII detection and stripping pipeline runs before any data enters the shared corpus
  - De-identification follows NIST SP 800-188 guidelines
  - Consent state tracked per-client with full audit trail
  - Consent revocation triggers purge from future training inputs
  - Phase 1: RAG with advisor knowledge base only (no shared learning)
  - Phase 2: shared anonymized corpus for document classification and common Q&A patterns
  - Phase 3: fine-tuning on anonymized, consented data for domain-specific model improvements

### 5.8 AI-assisted planning features (High-value, hard)
- Not "advice" generation. Focus on:
  - summarization of client data and meeting notes
  - detecting missing data and inconsistencies in the living plan
  - drafting annual plan narrative from advisor-approved templates
  - next-best action suggestions (human-approved)
  - living plan auto-updates when new data arrives (flagged for advisor review before publishing to client)
- Guardrails: disclaimers, approval workflow, full traceability of every AI-generated artifact

## 6. Non-functional requirements (NFRs)

### 6.1 Security and privacy (Must-have)
- SOC 2 Type II readiness path (controls and evidence from day 1)
- Encryption:
  - in transit (TLS 1.2+)
  - at rest (AES-256)
- RBAC + least privilege
- MFA for advisors (and optional for clients)
- Secure session management, rate limiting, WAF
- Secrets management and key rotation
- Vendor risk management for third parties

### 6.2 Reliability
- Backups, DR plan, RTO/RPO targets defined
- Monitoring/alerting for data ingestion, communication pipelines, and portal availability

### 6.3 Data governance
- Data lineage and provenance for imported/aggregated accounts
- Client consent capture and management (aggregation, communication monitoring, learning opt-in — tracked separately)
- Deletion/retention policies aligned with advisor needs and CCPA/state privacy requirements
- Consent revocation propagation across all subsystems

### 6.4 PII detection and anonymization (Must-have for learning system)
- Automated PII detection pipeline for all data before it enters the shared learning corpus
- De-identification that meets NIST SP 800-188 standards
- Audit trail for what data entered the corpus, when, and under which consent grant
- Regular re-assessment of de-identification effectiveness

### 6.5 Communication channel security (Must-have for AI Communication Hub)
- Email parsing infrastructure: secure ingestion, attachment extraction, encryption at every stage
- Message classification and routing (client question vs. document vs. general correspondence)
- Retention-compliant storage for all ingested communications (immutable, timestamped)
- Consent verification before any external channel monitoring is activated per-client

## 7. MVP scope recommendation (what "good" looks like)

**MVP = White-label portal + digital onboarding + advisor workspace + secure messaging + basic reporting + limited aggregation (or import)**
- Portal works end-to-end for a new prospect/client
- Secure in-platform messaging is live from day 1 (foundation for communication hub)
- Advisor can push an annual plan summary and tasks
- Data entry is minimized via structured forms; account linking and aggregation can be phased in with imports as fallback
- Consent capture infrastructure is in place from day 1 (even if learning and external channel monitoring come later)

## 8. Explicit "not required" for MVP (unless business strategy changes)
- Direct-to-consumer robo advice offering
- Marketplace for advisors (can be phase 2 after B2B traction)
- Direct trade execution across custodians
- External communication channel monitoring (Phase 2)
- Shared learning corpus (Phase 2+)
- Health/wellness signals requiring PHI (Phase 3+)
