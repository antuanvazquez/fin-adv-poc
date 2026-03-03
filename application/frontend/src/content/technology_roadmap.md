# Technology Roadmap - Draft v0.1

This document covers the technical architecture, data systems, AI pipeline, and privacy infrastructure required to build the platform. It is separate from the business roadmap in `roadmap_and_risks.md`, which covers build phases, market strategy, and risk mitigations.

---

## 1. Platform architecture overview

### Design principles
- **Event-driven:** Every meaningful change (account balance update, new document upload, new message, consent change) produces an event that downstream systems can react to.
- **Multi-tenant with strict isolation:** Each advisor firm is a tenant. Data is logically (and where necessary, physically) isolated. Per-firm AI knowledge bases never cross tenant boundaries.
- **Real-time where it matters:** Account data, communication analysis, and life signal evaluation should operate in near-real-time (seconds to low minutes). Batch processing is acceptable for reporting, analytics, and learning corpus updates.
- **Encryption everywhere:** TLS 1.2+ in transit, AES-256 at rest, field-level encryption for the most sensitive data (SSN, account numbers).
- **Consent as infrastructure:** Consent is not an afterthought — it is a first-class data model with enforcement middleware that gates every data flow.

### High-level system diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client-Facing Layer                       │
│  White-label Portal  |  Mobile (future)  |  Email/SMS Ingestion │
└──────────────┬───────────────┬────────────────┬──────────────────┘
               │               │                │
               ▼               ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway                              │
│          Auth  |  Rate Limiting  |  Consent Middleware           │
└──────────────┬───────────────────────────────┬───────────────────┘
               │                               │
       ┌───────▼───────┐               ┌───────▼───────┐
       │  Core Services │               │  AI Services   │
       │  - Onboarding  │               │  - Comm Hub    │
       │  - CRM-lite    │               │  - Doc Intel   │
       │  - Planning    │               │  - Life Signals│
       │  - Messaging   │               │  - RAG Engine  │
       │  - Reporting   │               │  - Learning    │
       └───────┬───────┘               └───────┬───────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Event Bus                                │
│     Account changes | Documents | Messages | Signals | Consent  │
└──────────────┬──────────────┬──────────────┬─────────────────────┘
               │              │              │
       ┌───────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
       │ Data Store    │ │ Doc Store│ │ Audit Log   │
       │ (relational)  │ │ (object) │ │ (append-only│
       └──────────────┘ └──────────┘ └─────────────┘
```

---

## 2. Data pipeline architecture

### Account aggregation and connectivity
- **Aggregation providers (evaluate):** Plaid, MX, Yodlee, Finicity. Select based on coverage of custodians our ICP uses, reliability, cost, and data granularity.
- **Data flow:** Client authorizes account link -> aggregation API provides initial pull -> platform normalizes to internal schema -> ongoing refreshes (webhook-driven or polled on schedule)
- **Normalization layer:** All external account data is mapped to a canonical schema: accounts, holdings, positions, transactions, balances. This layer insulates the rest of the platform from provider-specific formats.
- **Fallback path:** CSV upload + statement upload + AI-assisted extraction (OCR + document intelligence) for custodians without API coverage.
- **Event emission:** Every balance change, new transaction, or account status change emits an event that triggers plan re-evaluation and life signal rule matching.

### Communication ingestion pipeline

#### Phase 1: In-platform messaging
- Secure messaging built into the portal. Messages stored encrypted, timestamped, tied to client/advisor/household.
- Every message emits an event for the AI Communication Hub to process.

#### Phase 2: Email integration
- **Inbound:** Dedicated per-advisor email addresses (or forwarding rules) route advisor-client email to the platform.
- **Processing:** MIME parsing -> attachment extraction -> body text extraction -> PII-aware routing.
- **Outbound:** Advisor-approved responses sent via the platform's email infrastructure (DKIM/SPF/DMARC configured per advisor domain for deliverability).
- **Consent gate:** Email monitoring is only activated for clients who have given explicit written consent. The consent middleware blocks processing for non-consented clients.

#### Phase 3: SMS/text
- Integration with SMS gateway (Twilio or equivalent).
- Same consent gate and processing pipeline as email.

### Document intelligence pipeline
- **Intake:** Documents arrive via upload, email attachment, or in-platform message.
- **Classification:** AI classifies document type (insurance EOB, tax return, brokerage statement, legal document, policy document, correspondence, etc.).
- **Extraction:** Key fields extracted based on document type (policy numbers, dates, amounts, terms, beneficiaries, coverage details).
- **Summarization:** Plain-language summary generated for advisor review.
- **Indexing:** Extracted data feeds into the client's living plan (e.g., insurance coverage details update the insurance section of the plan; a new brokerage statement updates holdings).

---

## 3. AI architecture

### AI Communication Hub

#### Request flow
1. Client sends a message or document (in-platform, email, or text)
2. Communication ingestion pipeline processes and classifies the input
3. AI Communication Hub receives the classified input + full client context (living plan, household data, recent communications, advisor knowledge base)
4. Hub generates:
   - Document summary (if applicable)
   - Impact assessment (how this changes the client's financial picture)
   - Draft response for the advisor
   - Confidence score and flags (e.g., "this may cross into advice territory — review carefully")
5. Draft appears in advisor's communication inbox with approve / edit / reject controls
6. Advisor action is logged (input, output, edits, final version, timestamp)

#### Model selection considerations
- Use the best available LLM for document analysis and response drafting (evaluate: Claude, GPT-4, Gemini, or domain-specific fine-tunes)
- Prioritize models that support structured output, function calling, and long context windows (client plans can be large)
- Evaluate self-hosted vs. API-based tradeoffs: API is faster to ship, self-hosted gives more control over data residency
- All client data sent to external model APIs must be covered by a data processing agreement (DPA) with the provider that prohibits training on our data

### RAG (Retrieval-Augmented Generation) Engine

#### Per-firm knowledge base (private, isolated)
- Advisor-curated knowledge: documented answers, firm policies, standard guidance, corrected AI drafts, FAQ entries
- Storage: vector database (evaluate: Pinecone, Weaviate, pgvector) with strict tenant isolation
- Retrieval: when drafting a response, the RAG engine queries the firm's knowledge base first for relevant prior answers, policies, and guidance
- Feedback loop: every time an advisor edits an AI draft, the correction is offered back as a candidate for the knowledge base ("Save this as a standard answer?")

#### Shared anonymized corpus (consent-gated)
- Contains: anonymized document templates, common question patterns, financial terminology mappings, general advisory patterns
- Contributions: only from clients who have opted in, after PII stripping
- Retrieval: used as a fallback when per-firm knowledge has no relevant match
- Isolation: the shared corpus never contains firm-identifiable or client-identifiable information

### Proactive Life Signals Engine

#### Architecture
- **Rule engine:** A configurable rule evaluation system that processes events from the event bus against a library of signal rules.
- **Rule types:**
  - Time-based: annual checkup reminders, insurance renewal dates, contribution deadlines, estate document review cadence
  - Transaction-based: large withdrawals, unusual spending patterns, recurring payment changes, missed expected deposits
  - Data-derived: coverage gaps detected from insurance documents, allocation drift from portfolio data, goal progress falling behind projections
  - Advisor-configured: custom rules per client or segment (e.g., "alert me if this client's cash balance drops below $50K")
- **Signal delivery:** Signals surface in the advisor workspace and (if configured) in the client portal. Advisor can suppress, snooze, or escalate signals per-client.
- **Learning:** Over time, track which signals advisors act on vs. dismiss to improve relevance scoring.

---

## 4. Continuous learning system

### Phase 1: Per-firm RAG only (MVP through early Phase 2)
- AI responses are grounded in the individual firm's knowledge base
- No cross-firm data sharing
- Advisor corrections feed back into their own knowledge base
- This is safe, private, and delivers value immediately

### Phase 2: Shared anonymized corpus (mid Phase 2)
- Introduce the opt-in shared corpus for document classification and common Q&A patterns
- PII stripping pipeline must be operational and audited before this phase begins
- Contribution flow:
  1. Client has active opt-in consent for anonymous data sharing
  2. A document or Q&A interaction is identified as a candidate for the shared corpus
  3. PII detection pipeline strips all identifying information (names, SSNs, account numbers, addresses, dates of birth, firm names)
  4. De-identified data is reviewed by automated quality checks (no residual PII, sufficient generalizability)
  5. Approved data enters the shared corpus with metadata: source consent ID, timestamp, category, anonymization audit trail
  6. If the client later revokes consent, their contribution ID is flagged and excluded from future retrieval (data is already anonymized and non-reversible, but the contribution is marked inactive)

### Phase 3: Fine-tuning (late Phase 3+)
- Evaluate fine-tuning a domain-specific model on the anonymized corpus for improved financial document understanding and advisory language
- Requires: large enough corpus, validated anonymization, legal review of training data rights
- Alternative to fine-tuning: few-shot prompting with curated examples from the corpus (lower risk, faster iteration)

### Consent management infrastructure

#### Data model
- `consent_grants` table: client_id, consent_type (aggregation | communication_monitoring | learning_opt_in), granted_at, revoked_at, grant_method (onboarding_form | settings_page | API), ip_address, user_agent
- Consent types are independent — a client can consent to aggregation but not to learning, or to in-platform messaging monitoring but not email
- Every consent change emits an event to the event bus

#### Enforcement
- Middleware layer checks consent state before any data flows into a consent-gated subsystem
- Communication ingestion pipeline: checks communication_monitoring consent before processing external channels
- Learning pipeline: checks learning_opt_in consent before any data enters the PII stripping pipeline
- Consent checks are logged in the audit trail

#### Revocation propagation
- When a client revokes consent, the event triggers:
  - Communication monitoring: stop processing that client's external communications within defined SLA
  - Learning corpus: flag the client's contributions as inactive (they are already anonymized and non-reversible, but no longer served in retrieval results)
  - Audit log: record the revocation timestamp, propagation actions taken, and completion confirmation

---

## 5. Privacy and anonymization pipeline

### PII detection
- Automated entity recognition for: names, Social Security numbers, account numbers, routing numbers, addresses, phone numbers, email addresses, dates of birth, employer names, firm names
- Implementation options: purpose-built PII detection service (evaluate: Private AI, Microsoft Presidio, AWS Comprehend PII, or custom NER model)
- Run on all data before it enters the shared learning corpus
- Run on all data before it is sent to external AI model APIs (defense in depth — even if the model provider has a DPA)

### De-identification approach
- Follow NIST SP 800-188 de-identification guidelines
- Techniques: entity redaction, generalization (e.g., exact age -> age band, exact balance -> balance range), pseudonymization where full redaction would destroy analytical value
- Validate de-identification: automated re-identification risk assessment before any anonymized record enters the shared corpus
- Periodic manual audits of anonymization quality (quarterly or per-release, whichever is more frequent)

### Data retention and deletion
- Client data: retained per advisor's configured retention policy (aligned with SEC books-and-records rules — typically 5+ years for communications, 6+ years for financial records)
- Shared corpus contributions: retained indefinitely once anonymized (cannot be re-identified). Flagged as inactive upon consent revocation.
- Audit logs: retained indefinitely (append-only, immutable)
- Client deletion requests (CCPA/state privacy): delete or anonymize all identifiable client data within 45 days. Anonymized corpus contributions that cannot be re-identified are excluded from deletion scope per CCPA safe harbor for de-identified data.

---

## 6. Infrastructure and operations

The full AWS infrastructure plan — including architecture diagrams, service definitions, security model, cost estimates, CI/CD pipeline, Terraform module structure, and phased enhancements — is documented in `infrastructure_plan.md`.

Key decisions already made:
- **Cloud provider:** AWS (team familiarity, broadest compliance coverage, Bedrock for managed LLM access)
- **Compute:** ECS Fargate (5 services: frontend, core API, AI worker, communication worker, event processor)
- **Database:** RDS PostgreSQL Multi-AZ with pgvector for RAG embeddings
- **IaC:** Terraform with per-environment module composition
- **CI/CD:** GitHub Actions with automated security scanning and deployment to ECS

AI-assisted development (Claude Opus 4.6 and peers) makes Terraform authoring, service scaffolding, and CI/CD setup 10-100x faster. We invest in proper infrastructure automation from day 1.

### Multi-tenancy
- Logical tenant isolation via `tenant_id` + PostgreSQL Row-Level Security (RLS) on all tables
- Per-tenant KMS keys for field-level encryption (SSN, account numbers)
- Per-tenant vector DB namespaces (via tenant_id filtering in pgvector)
- White-label theming: tenant-specific branding (logo, colors, fonts, domain) loaded at login and cached client-side

### Observability
- Structured logging with correlation IDs across all ECS services (CloudWatch Logs)
- Metrics: API latency, queue depth, aggregation refresh health, AI response times, consent check pass/fail rates, signal delivery rates (CloudWatch Metrics)
- Alerting: CloudWatch Alarms -> SNS -> PagerDuty for critical path failures
- Dashboards: per-tenant health view for support, platform-wide health for ops

### Security operations
- WAF on public ALB from day 1 (managed rules for SQLi, XSS, rate limiting, bot control)
- CloudTrail and GuardDuty enabled from day 1 (SOC 2 requirement)
- Penetration testing: annual third-party assessment (required for SOC 2)
- Vulnerability scanning: Trivy (container images) and tfsec (Terraform) in CI/CD pipeline
- Incident response: documented playbook, tested quarterly
- Access controls: developer access to production data is strictly limited, audited, and requires justification

---

## 7. Technical decisions

Decisions marked with **(decided)** are confirmed in `infrastructure_plan.md`. Decisions marked with **(evaluate)** require hands-on evaluation during Phase 0/1.

| Decision | Choice | Status | Notes |
|---|---|---|---|
| Cloud provider | AWS | **(decided)** | Team familiarity, broadest compliance coverage, Bedrock for managed LLM access |
| Compute | ECS Fargate | **(decided)** | Multi-service architecture; eliminates server management; simpler than EKS at our scale |
| Primary database | RDS PostgreSQL (Multi-AZ) | **(decided)** | Battle-tested, pgvector for RAG, RLS for tenant isolation |
| Vector search | pgvector in RDS | **(decided for MVP)** | Avoids separate vector DB dependency; evaluate Pinecone/Weaviate if performance requires it |
| Event bus | AWS EventBridge | **(decided)** | Serverless, simple rule routing to SQS; can migrate to MSK (Kafka) if volume requires it |
| Cache | ElastiCache Redis | **(decided)** | Sessions, consent cache, real-time data |
| Auth | Amazon Cognito | **(decided for MVP)** | MFA built-in, free tier; evaluate Auth0 if white-label customization is insufficient |
| IaC | Terraform | **(decided)** | Module ecosystem, team familiarity, AI-assisted authoring |
| CI/CD | GitHub Actions | **(decided)** | Integrated with GitHub, simple YAML workflows |
| LLM provider | Bedrock (Claude) + direct Anthropic API | **(decided)** | Bedrock for AWS-native; direct API for latest models; DPA covers both |
| PII detection | Amazon Comprehend | **(decided for MVP)** | AWS-native, no data leaves AWS boundary; evaluate Presidio if accuracy on financial docs is insufficient |
| Email | AWS SES (outbound + inbound) | **(decided)** | Per-advisor DKIM/SPF/DMARC; receipt rules for inbound |
| Aggregation provider | Plaid, MX, Yodlee, Finicity | **(evaluate)** | Coverage of custodians our ICP uses is the primary criterion |
