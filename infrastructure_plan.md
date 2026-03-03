# AWS Infrastructure Plan - Draft v0.1

This document defines the AWS infrastructure for the Financial Advisory Platform. It is adapted from a proven split-frontend/backend AWS architecture pattern and significantly enhanced for our requirements: multi-tenant isolation, event-driven processing, AI pipeline, communication ingestion, and SOC 2 / GLBA compliance from day 1.

All infrastructure is provisioned using **Terraform (Infrastructure as Code)** from the start. With AI-assisted development tools (Claude Opus 4.6 and peers), authoring Terraform modules, scaffolding services, and building CI/CD pipelines is 10-100x faster than traditional methods. We should exploit this by investing in proper IaC and automation from day 1 rather than taking shortcuts that create technical debt.

---

## 1. Architecture overview

### Design principles

| Principle | Implementation |
|---|---|
| Network isolation | Backend API, workers, and databases run in private subnets with no public IPs. Only the frontend ALB is internet-facing. |
| Defense in depth | WAF -> ALB -> Frontend (public) -> Internal ALB -> Core API (private) -> Database (private). Each layer is a security boundary. |
| Encrypt everything | TLS 1.2+ in transit (ACM certs on ALBs), AES-256 at rest (RDS, S3, Redis, EBS), field-level encryption via KMS for SSNs and account numbers. |
| Event-driven | Every meaningful change emits an event to EventBridge. Downstream workers (AI, communication, life signals) consume events via SQS queues. |
| Multi-tenant isolation | Logical isolation via tenant_id + Row-Level Security (RLS) in PostgreSQL. Per-tenant KMS keys for field-level encryption. Per-tenant vector DB namespaces. |
| Compliance from day 1 | CloudTrail, GuardDuty, WAF, Multi-AZ RDS, encrypted everything — not deferred to later phases. Required for SOC 2 and GLBA. |
| Container-first | Docker from day 1 on ECS Fargate. No server management. Same images run in dev, staging, and production. |
| Automate deploys | CI/CD via GitHub Actions from day 1. AI-assisted development means frequent deploys — manual deployment is not viable. |

### High-level architecture

```
                            ┌─────────────────────┐
                            │      INTERNET        │
                            └──────────┬──────────┘
                                       │
                                 [AWS WAF]
                                       │
                            ┌──────────▼──────────┐
                            │    Public ALB        │
                            │  (ACM SSL cert)      │
                            └──────────┬──────────┘
                                       │
                    ┌──────────────────────────────────┐
                    │         PUBLIC SUBNET (2 AZs)     │
                    │                                    │
                    │  ┌────────────┐  ┌────────────┐   │
                    │  │ Frontend   │  │ Frontend   │   │
                    │  │ Fargate    │  │ Fargate    │   │
                    │  │ (AZ-A)     │  │ (AZ-B)     │   │
                    │  └─────┬──────┘  └─────┬──────┘   │
                    │        └───────┬───────┘           │
                    │                │                    │
                    │         [NAT Gateway]               │
                    └────────────────┬───────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   Internal ALB      │
                          │   (private only)    │
                          └──────────┬──────────┘
                                     │
    ┌────────────────────────────────────────────────────────────┐
    │                  PRIVATE SUBNET (2 AZs)                     │
    │                                                              │
    │  ┌─────────────┐ ┌─────────────┐ ┌───────────────────────┐ │
    │  │ Core API    │ │ AI Worker   │ │ Communication Worker  │ │
    │  │ Fargate     │ │ Fargate     │ │ Fargate               │ │
    │  └──────┬──────┘ └──────┬──────┘ └───────────┬───────────┘ │
    │         │               │                     │              │
    │  ┌──────▼──────┐ ┌──────▼──────┐ ┌───────────▼───────────┐ │
    │  │ Event       │ │ Amazon      │ │ Amazon Comprehend     │ │
    │  │ Processor   │ │ Bedrock /   │ │ (PII Detection)       │ │
    │  │ Fargate     │ │ Anthropic   │ │                       │ │
    │  └──────┬──────┘ └─────────────┘ └───────────────────────┘ │
    │         │                                                    │
    │  ┌──────▼──────────────────────────────────────────────┐    │
    │  │              EventBridge + SQS Queues                │    │
    │  │  [AI Queue] [Comm Queue] [Signal Queue] [Consent]   │    │
    │  └─────────────────────┬───────────────────────────────┘    │
    │                        │                                     │
    │  ┌─────────────────────▼───────────────────────────────┐    │
    │  │                   DATA LAYER                         │    │
    │  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │    │
    │  │  │ RDS      │  │ ElastiC  │  │ S3 Buckets       │  │    │
    │  │  │ Postgres │  │ Redis    │  │ (docs, assets,   │  │    │
    │  │  │ Multi-AZ │  │          │  │  email, audit)   │  │    │
    │  │  │ +pgvector│  │          │  │                   │  │    │
    │  │  └──────────┘  └──────────┘  └──────────────────┘  │    │
    │  └─────────────────────────────────────────────────────┘    │
    └─────────────────────────────────────────────────────────────┘
```

**Key security feature:** The Core API, all workers, the database, Redis, and all queues run in private subnets with no public IPs. They are unreachable from the internet. Only the frontend Fargate tasks sit behind the public ALB. Even if the frontend is compromised, the backend is behind a network boundary that cannot be traversed from the public internet.

---

## 2. MVP infrastructure components

### Network

| # | Component | Purpose | MVP Configuration | Est. Monthly Cost |
|---|---|---|---|---|
| 1 | VPC | Network isolation | 1 VPC, 10.0.0.0/16, 2 AZs | $0 |
| 2 | Public subnets | Frontend ALB + NAT | 2 subnets (one per AZ) | $0 |
| 3 | Private subnets | All backend services, DB, Redis | 2 subnets (one per AZ) | $0 |
| 4 | Internet Gateway | Public internet access for ALB | 1 | $0 |
| 5 | NAT Gateway | Outbound internet for private subnet (API calls to Plaid, Bedrock, etc.) | 1 (single AZ for MVP; 2 for HA in Phase 2) | $32 |
| 6 | Public ALB | Frontend traffic + SSL termination | Internet-facing, WAF-protected | $18 |
| 7 | Internal ALB | Frontend -> Core API traffic | Private only, not internet-accessible | $18 |
| 8 | AWS WAF | Application-layer security | Managed rules: SQL injection, XSS, rate limiting, bot control | $15-25 |

### Compute (ECS Fargate)

| # | Service | Purpose | MVP Configuration | Est. Monthly Cost |
|---|---|---|---|---|
| 9 | ECS Cluster | Container orchestration | 1 Fargate cluster | $0 (pay per task) |
| 10 | Frontend Service | Next.js SSR, serves UI, handles OAuth flow | 0.5 vCPU / 1GB RAM, desired: 2, min: 1, max: 4 | $30-60 |
| 11 | Core API Service | Business logic, DB access, consent enforcement, aggregation API calls | 1 vCPU / 2GB RAM, desired: 2, min: 1, max: 4 | $60-120 |
| 12 | AI Worker Service | Document analysis, response drafting, RAG queries, plan re-evaluation | 1 vCPU / 2GB RAM, desired: 1, min: 0, max: 4 (scales with queue depth) | $30-60 |
| 13 | Communication Worker | Email parsing, MIME processing, message classification, PII scanning | 0.5 vCPU / 1GB RAM, desired: 1, min: 0, max: 2 | $15-30 |
| 14 | Event Processor | Life signal rule evaluation, consent propagation, plan update triggers | 0.5 vCPU / 1GB RAM, desired: 1, min: 0, max: 2 | $15-30 |
| 15 | ECR | Docker image registry | 5 repositories (one per service) | $5 |

### Data

| # | Component | Purpose | MVP Configuration | Est. Monthly Cost |
|---|---|---|---|---|
| 16 | RDS PostgreSQL | Primary database (with pgvector extension for RAG embeddings) | db.t3.medium (2 vCPU, 4GB RAM), 50GB gp3, Multi-AZ, encryption on, automated backups 14-day retention, deletion protection on | $80-120 |
| 17 | ElastiCache Redis | Session management, consent state cache, real-time dashboard data, rate limiting | cache.t3.micro (single node for MVP; cluster mode in Phase 2) | $15-25 |
| 18 | S3 — Documents | Client documents, uploaded files, email attachments | Encrypted (SSE-S3), versioned, lifecycle policy for archival | $5-10 |
| 19 | S3 — Static Assets | Frontend static files (if not served from Fargate directly) | CloudFront-ready (add CDN in Phase 2) | $1-2 |
| 20 | S3 — Audit Exports | Compliance export packages, SOC 2 evidence | Encrypted, write-once policy | $1 |
| 21 | S3 — Email Ingest | SES inbound email landing bucket (Phase 2) | Encrypted, Lambda trigger on object creation | $1 |

### Eventing and queues

| # | Component | Purpose | MVP Configuration | Est. Monthly Cost |
|---|---|---|---|---|
| 22 | EventBridge | Central event bus for all platform events | Default bus + custom rules for routing | $1-5 |
| 23 | SQS — AI Processing | Async queue for AI inference jobs (document analysis, response drafting) | Standard queue, 14-day retention, DLQ attached | $1-2 |
| 24 | SQS — Communication | Async queue for email/message processing | Standard queue, DLQ attached | $1 |
| 25 | SQS — Life Signals | Async queue for signal rule evaluation | Standard queue, DLQ attached | $1 |
| 26 | SQS — Dead Letter Queues | Failed message capture for debugging | 3 DLQs (one per processing queue) | $0 |

### AI and intelligence

| # | Component | Purpose | MVP Configuration | Est. Monthly Cost |
|---|---|---|---|---|
| 27 | Amazon Bedrock | LLM access for document analysis, response drafting, plan narratives | Claude (via Bedrock) or direct Anthropic API; evaluate during build | $50-200 (usage) |
| 28 | Amazon Comprehend | PII detection on communications and documents before learning corpus | PII entity detection API calls | $10-30 (usage) |
| 29 | pgvector (in RDS) | Vector similarity search for RAG | pgvector extension enabled in RDS PostgreSQL; per-tenant namespace via tenant_id | $0 (included in RDS) |

### Authentication and authorization

| # | Component | Purpose | MVP Configuration | Est. Monthly Cost |
|---|---|---|---|---|
| 30 | Amazon Cognito | Authentication, MFA, OAuth | 1 user pool (advisors + clients), MFA enabled, custom domain for white-label login | $0 (free tier up to 50K MAUs) |
| 31 | IAM Roles | Service-level access control | 1 role per ECS service + 1 for Lambda (email ingest); scoped to least privilege | $0 |

### Communication

| # | Component | Purpose | MVP Configuration | Est. Monthly Cost |
|---|---|---|---|---|
| 32 | Amazon SES | Outbound email (advisor-approved responses, notifications) | Production access, DKIM/SPF/DMARC per advisor domain | $1-5 |
| 33 | SES Receipt Rule + S3 + Lambda | Inbound email ingestion (Phase 2) | SES receives email -> S3 -> Lambda triggers Communication Worker | $1-5 (Phase 2) |

### Compliance and observability

| # | Component | Purpose | MVP Configuration | Est. Monthly Cost |
|---|---|---|---|---|
| 34 | CloudTrail | API audit logging (SOC 2 requirement) | Enabled for all regions, S3 delivery, management events | $5 |
| 35 | GuardDuty | Threat detection (SOC 2 requirement) | Enabled for all accounts/regions | $20-30 |
| 36 | CloudWatch Logs | Application logging, structured with correlation IDs | Log groups per service, 30-day retention (archive to S3 after) | $15-25 |
| 37 | CloudWatch Metrics | API latency, queue depth, error rates, consent check pass/fail | Custom metrics + dashboards | $5-10 |
| 38 | CloudWatch Alarms | Alerting on critical path failures | Alarms -> SNS -> PagerDuty/email for: API errors, queue depth, DB connections, aggregation failures | $2-5 |
| 39 | KMS | Encryption key management | 1 key per tenant for field-level encryption (SSN, account numbers); AWS-managed keys for RDS/S3 default encryption | $5-15 |
| 40 | Secrets Manager | Credentials and API keys | DB credentials, Plaid API keys, Anthropic API key, SES credentials, Cognito secrets | $5 |

### DNS and SSL

| # | Component | Purpose | MVP Configuration | Est. Monthly Cost |
|---|---|---|---|---|
| 41 | Route 53 | DNS management | Hosted zone + records; wildcard support for white-label subdomains | $1-2 |
| 42 | ACM | SSL/TLS certificates | Wildcard cert for *.platform-domain.com + per-advisor custom domain support | $0 |

---

## 3. Security architecture

### Network isolation

```
┌─────────────────────────────────────────────────────────────────┐
│  INTERNET can reach:                                             │
│  ┌──────────────────────────────────────────┐                   │
│  │  Public ALB (behind WAF)                  │                   │
│  │  → Frontend Fargate tasks only            │                   │
│  └──────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                     [Internal ALB - NOT public]
                              │
┌─────────────────────────────────────────────────────────────────┐
│  INTERNET cannot reach:                                          │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  │ Core API  │ │ AI Worker │ │ Comm      │ │ Event     │       │
│  │ Fargate   │ │ Fargate   │ │ Worker    │ │ Processor │       │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐                     │
│  │ RDS       │ │ Redis     │ │ SQS/EB    │                     │
│  │ PostgreSQL│ │           │ │ Queues    │                     │
│  └───────────┘ └───────────┘ └───────────┘                     │
│                                                                  │
│  All private subnet. No public IPs. Network-isolated.           │
└─────────────────────────────────────────────────────────────────┘
```

### Encryption strategy

| Layer | Method | Key management |
|---|---|---|
| In transit (external) | TLS 1.2+ via ACM certs on ALBs | AWS-managed (ACM) |
| In transit (internal) | TLS between services via service mesh or ALB | AWS-managed |
| At rest (RDS) | AES-256 | AWS-managed KMS key |
| At rest (S3) | SSE-S3 (AES-256) | AWS-managed; customer-managed KMS for audit bucket |
| At rest (Redis) | At-rest encryption enabled | AWS-managed KMS key |
| At rest (EBS/Fargate) | Encrypted by default | AWS-managed |
| Field-level (SSN, account #) | Application-level AES-256 encryption before DB write | Per-tenant KMS customer-managed key |
| Secrets | Secrets Manager | AWS-managed KMS key with automatic rotation |

### IAM roles (least privilege)

| Role | Can access | Cannot access |
|---|---|---|
| frontend-task-role | Internal ALB (to reach Core API), S3 static assets, Cognito | RDS, Redis, SQS, EventBridge, Bedrock, Comprehend |
| core-api-task-role | RDS, Redis, S3, EventBridge (publish), Cognito, Plaid (via NAT), KMS (field-level encryption), Secrets Manager | Bedrock, Comprehend (accessed by AI/Comm workers only) |
| ai-worker-task-role | RDS (read), SQS (AI queue consume), Bedrock, KMS (decrypt for context), S3 (read documents) | Redis, EventBridge (publish only via Core API), Comprehend |
| comm-worker-task-role | SQS (Comm queue consume), S3 (read email/docs), Comprehend (PII detection), SES (send), RDS (read/write messages) | Bedrock, Redis, EventBridge |
| event-processor-task-role | SQS (Signal queue consume), RDS (read), EventBridge (read), SNS (notify) | Bedrock, Comprehend, S3, Redis |
| email-ingest-lambda-role | S3 (read email bucket), SQS (publish to Comm queue) | Everything else |

### Security groups

| Security Group | Inbound | Outbound |
|---|---|---|
| public-alb-sg | 443 from 0.0.0.0/0 (HTTPS only, WAF-filtered) | Frontend Fargate SG |
| frontend-sg | From public-alb-sg on container port | Internal ALB SG |
| internal-alb-sg | From frontend-sg | Core API SG |
| core-api-sg | From internal-alb-sg on container port | RDS SG, Redis SG, NAT (outbound to Plaid, etc.) |
| worker-sg | No inbound (pull from SQS only) | RDS SG, NAT (outbound to Bedrock, Comprehend, SES) |
| rds-sg | From core-api-sg and worker-sg on 5432 | None (no outbound) |
| redis-sg | From core-api-sg on 6379 | None |

---

## 4. ECS Fargate service definitions

### Frontend Service
- **Image:** `platform-frontend:latest` (Next.js SSR)
- **Subnet:** Public (behind Public ALB)
- **Task size:** 0.5 vCPU / 1 GB RAM
- **Scaling:** min 1, max 4, target: 70% CPU
- **Health check:** `/api/health` on container port
- **Connects to:** Internal ALB (to reach Core API), Cognito (OAuth redirect)
- **Serves:** White-label portal UI, onboarding flows, client dashboards, advisor workspace

### Core API Service
- **Image:** `platform-core-api:latest` (Node.js or Python)
- **Subnet:** Private (behind Internal ALB)
- **Task size:** 1 vCPU / 2 GB RAM
- **Scaling:** min 1, max 4, target: 70% CPU
- **Health check:** `/health` on container port
- **Connects to:** RDS PostgreSQL, ElastiCache Redis, S3 (documents), EventBridge (publish events), Cognito (token validation), Plaid/MX API (via NAT), KMS (field-level encryption), Secrets Manager
- **Responsibilities:** All business logic, RBAC enforcement, consent middleware, multi-tenant query filtering, REST/GraphQL API for frontend, webhook receivers for Plaid/aggregation callbacks

### AI Worker Service
- **Image:** `platform-ai-worker:latest`
- **Subnet:** Private (no ALB; pulls from SQS)
- **Task size:** 1 vCPU / 2 GB RAM
- **Scaling:** min 0, max 4, target: SQS queue depth (scale to 0 when idle)
- **Connects to:** SQS AI queue (consume), RDS (read client context + write results), S3 (read documents), Bedrock/Anthropic API (via NAT), KMS (decrypt client data for context)
- **Responsibilities:** Document analysis and summarization, response draft generation, RAG retrieval (pgvector queries), plan narrative generation, confidence scoring, advice-territory flagging

### Communication Worker
- **Image:** `platform-comm-worker:latest`
- **Subnet:** Private (no ALB; pulls from SQS)
- **Task size:** 0.5 vCPU / 1 GB RAM
- **Scaling:** min 0, max 2, target: SQS queue depth
- **Connects to:** SQS Communication queue (consume), S3 (read inbound emails/attachments), Comprehend (PII detection), SES (send approved responses), RDS (write messages/classifications)
- **Responsibilities:** Email MIME parsing, attachment extraction, message classification (question vs. document vs. correspondence), PII scanning before data enters learning pipeline, consent state verification

### Event Processor
- **Image:** `platform-event-processor:latest`
- **Subnet:** Private (no ALB; pulls from SQS)
- **Task size:** 0.5 vCPU / 1 GB RAM
- **Scaling:** min 0, max 2, target: SQS queue depth
- **Connects to:** SQS Signal queue (consume), RDS (read account data, plan state, signal rules), SNS (send notifications to advisors)
- **Responsibilities:** Life signal rule evaluation (time-based, transaction-based, data-derived, advisor-configured), consent revocation propagation, plan re-evaluation triggers, advisor notification dispatch

---

## 5. Data architecture

### PostgreSQL schema strategy

**Multi-tenant isolation:**
- Every table includes a `tenant_id` column
- Row-Level Security (RLS) policies enforce tenant isolation at the database level — queries physically cannot return data from other tenants even if application code has a bug
- Connection pooling via PgBouncer (sidecar container or RDS Proxy)

**pgvector for RAG:**
- `embeddings` table: `id, tenant_id, content_hash, embedding vector(1536), metadata jsonb, created_at`
- Per-tenant namespace enforced via RLS (same as all tables)
- Cosine similarity search for retrieval: `SELECT * FROM embeddings WHERE tenant_id = $1 ORDER BY embedding <=> $2 LIMIT 10`
- Shared anonymized corpus stored in a separate schema with its own access controls

**Core tables (simplified):**

```
households          (tenant_id, household_id, name, metadata)
clients             (tenant_id, client_id, household_id, name_encrypted, ssn_encrypted, ...)
accounts            (tenant_id, account_id, client_id, provider, type, balance, last_refresh)
holdings            (tenant_id, holding_id, account_id, symbol, quantity, value)
transactions        (tenant_id, txn_id, account_id, date, amount, category, description)
goals               (tenant_id, goal_id, household_id, type, target, current, status)
plan_artifacts      (tenant_id, artifact_id, household_id, type, content, version)
messages            (tenant_id, message_id, sender, recipient, channel, body_encrypted, ...)
documents           (tenant_id, document_id, client_id, s3_key, classification, extracted_data)
tasks               (tenant_id, task_id, advisor_id, client_id, description, status, due_date)
signals             (tenant_id, signal_id, client_id, type, severity, status, triggered_at)
consent_grants      (tenant_id, client_id, consent_type, granted_at, revoked_at, method)
audit_log           (tenant_id, event_id, actor, action, target, detail, timestamp)  -- append-only
ai_outputs          (tenant_id, output_id, input_context_hash, model, raw_output, advisor_action, ...)
embeddings          (tenant_id, embedding_id, content_hash, vector, metadata, created_at)
```

### ElastiCache Redis usage

| Use case | Key pattern | TTL |
|---|---|---|
| Session management | `session:{session_id}` | 24 hours |
| Consent state cache | `consent:{tenant_id}:{client_id}:{type}` | 5 minutes (short TTL; source of truth is DB) |
| Real-time dashboard data | `dashboard:{tenant_id}:{client_id}` | 1 minute |
| Rate limiting | `ratelimit:{tenant_id}:{endpoint}:{window}` | Per window |
| Feature flags | `flags:{tenant_id}` | 10 minutes |

### S3 bucket structure

| Bucket | Purpose | Encryption | Access | Lifecycle |
|---|---|---|---|---|
| `{env}-platform-documents` | Client documents, uploads | SSE-S3 (AES-256) | Core API + AI Worker + Comm Worker | Archive to Glacier after 2 years |
| `{env}-platform-email-ingest` | Inbound email landing | SSE-S3 | SES receipt rule (write), Lambda (read), Comm Worker (read) | Delete after 30 days (processed into documents bucket) |
| `{env}-platform-static` | Frontend static assets | SSE-S3 | CloudFront (Phase 2) or direct | None |
| `{env}-platform-audit` | Compliance exports, SOC 2 evidence, CloudTrail logs | SSE-KMS (customer-managed) | Write-only from services; read-only for compliance role | Retain 7 years |
| `{env}-platform-deployments` | Terraform state, deployment artifacts | SSE-S3 | CI/CD pipeline only | None |

---

## 6. CI/CD pipeline

### Deployment flow

```
Code push (GitHub)
  → GitHub Actions triggered
    → Lint + unit tests
    → Security scan (Trivy for container images, tfsec for Terraform)
    → Build Docker images (5 services)
    → Push to ECR
    → Terraform plan (for infra changes)
    → Deploy to ECS (rolling update)
    → Smoke tests against staging
    → Manual approval gate for production
    → Deploy to production ECS
    → Post-deploy health check
```

### GitHub Actions workflow structure

```
.github/workflows/
  ci.yml              # Lint, test, scan on every PR
  deploy-staging.yml  # Auto-deploy to staging on merge to main
  deploy-prod.yml     # Manual trigger with approval gate
  terraform.yml       # Infra changes (plan on PR, apply on merge)
```

### Container image repositories (ECR)

| Repository | Image | Build trigger |
|---|---|---|
| `platform-frontend` | Next.js SSR app | Changes in `frontend/` |
| `platform-core-api` | Node.js or Python API | Changes in `api/` |
| `platform-ai-worker` | AI inference worker | Changes in `workers/ai/` |
| `platform-comm-worker` | Communication processor | Changes in `workers/comm/` |
| `platform-event-processor` | Event/signal processor | Changes in `workers/events/` |

### Deployment strategy

- **Staging:** Auto-deploy on merge to `main`. Rolling update with health check.
- **Production:** Manual trigger after staging validation. Rolling update. Automatic rollback if health check fails within 5 minutes.
- **Rollback:** ECS supports instant rollback to previous task definition. One command.

---

## 7. Cost estimate (MVP)

| Category | Component | Monthly Est. |
|---|---|---|
| **Network** | NAT Gateway (1) | $32 |
| | Public ALB | $18 |
| | Internal ALB | $18 |
| | WAF (managed rules) | $20 |
| **Compute** | Frontend Fargate (2 tasks avg) | $45 |
| | Core API Fargate (2 tasks avg) | $90 |
| | AI Worker Fargate (1 task avg) | $45 |
| | Communication Worker (1 task avg) | $22 |
| | Event Processor (1 task avg) | $22 |
| | ECR (5 repos) | $5 |
| **Data** | RDS PostgreSQL (db.t3.medium, Multi-AZ) | $100 |
| | ElastiCache Redis (cache.t3.micro) | $20 |
| | S3 (all buckets, ~50GB) | $8 |
| **AI** | Bedrock / Anthropic API (usage-based) | $50-200 |
| | Comprehend PII detection (usage-based) | $10-30 |
| **Eventing** | EventBridge + SQS | $5 |
| **Auth** | Cognito | $0 |
| **Communication** | SES | $3 |
| **Compliance** | CloudTrail | $5 |
| | GuardDuty | $25 |
| | CloudWatch (logs + metrics + alarms) | $25 |
| | KMS (per-tenant keys) | $10 |
| | Secrets Manager | $5 |
| **DNS/SSL** | Route 53 + ACM | $1 |
| **TOTAL** | | **$585-855/mo** |

**Comparison to reference architecture:** The reference was ~$120-130/mo for a simpler app without compliance requirements. Our ~$585-855/mo delta is driven by: Multi-AZ RDS (+$50), WAF (+$20), CloudTrail/GuardDuty (+$30), Redis (+$20), AI services (+$60-230), additional Fargate workers (+$90), and per-tenant KMS (+$10). Every addition is required by our compliance posture or core product functionality.

**AI costs are usage-based and will scale.** At low volume (MVP, <100 clients), Bedrock/Anthropic costs will be at the low end (~$50/mo). As usage grows, this becomes the largest variable cost — but it directly correlates with value delivered.

---

## 8. Phased enhancements

### Phase 2: Communication intelligence and scale (~+$150-300/mo)

| Enhancement | Benefit | Added Cost |
|---|---|---|
| 2nd NAT Gateway | Network redundancy (HA) | +$32 |
| CloudFront CDN | Faster static asset delivery, reduced ALB load | +$15-25 |
| SES Inbound + Lambda | Email ingestion pipeline for AI Communication Hub | +$10-20 |
| Larger RDS instance | db.t3.large (more connections, more pgvector queries) | +$50-80 |
| ElastiCache cluster mode | Redis HA with automatic failover | +$20-40 |
| SNS/Pinpoint (SMS) | Text message channel for life signals and communication monitoring | +$10-20 |
| Dedicated vector DB evaluation | Evaluate Pinecone/Weaviate if pgvector becomes a bottleneck at scale | $0 (evaluation) |

### Phase 3: Premium moat and enterprise (~+$200-500/mo)

| Enhancement | Benefit | Added Cost |
|---|---|---|
| Aurora Serverless | Separate analytics/reporting database (no load on primary RDS) | +$50-100 |
| Amazon Macie | Automated PII/sensitive data discovery across S3 buckets | +$15-25 |
| PrivateLink | Private connectivity to Plaid/aggregation APIs (removes NAT dependency for sensitive data) | +$30-50 |
| Multi-region pilot | DR readiness, data residency options | +$100-200 (doubles core infra) |
| Fine-tuning infrastructure | SageMaker for model training on anonymized corpus | +$50-100 (usage) |
| Larger Fargate tasks | 2 vCPU / 4GB for AI Worker as inference complexity grows | +$30-60 |

### Enterprise / compliance hardening (~+$100-200/mo)

| Enhancement | Benefit | Added Cost |
|---|---|---|
| AWS Config | Configuration compliance monitoring and drift detection | +$10 |
| AWS Config Rules | Automated compliance checks (encryption enabled, public access blocked, etc.) | +$5-15 |
| Cross-region backups | Disaster recovery for RDS, S3, and critical data | +$20-40 |
| AWS Backup | Centralized backup management with compliance policies | +$10-20 |
| VPN / Direct Connect | Secure connectivity for on-prem advisor integrations | +$50-100 |
| AWS Organizations + SCPs | Multi-account strategy (separate accounts for prod, staging, audit) | +$0 (governance overhead) |
| SOC 2 evidence automation | Vanta/Drata integration with AWS for continuous evidence collection | +$800-2000/mo (Vanta/Drata subscription, not AWS cost) |

---

## 9. Environment strategy

| Environment | Purpose | Infrastructure | Cost multiplier |
|---|---|---|---|
| **Development** | Local development + shared dev services | RDS (single AZ, db.t3.micro), Redis (single node), minimal Fargate (1 task per service), no WAF/GuardDuty | ~0.3x prod |
| **Staging** | Pre-production validation, SOC 2 change management evidence | Mirrors production topology (Multi-AZ, WAF, etc.) but smaller task sizes and fewer replicas | ~0.6x prod |
| **Production** | Live advisor and client traffic | Full specification as described in this document | 1x |

**Why staging from the start:** SOC 2 requires evidence of change management processes — changes tested in a staging environment before production deployment. The reference architecture deferred staging, but we cannot.

**Total cost across environments (MVP):** ~$585 (prod) + ~$350 (staging) + ~$175 (dev) = **~$1,100/mo** for all environments.

---

## 10. Terraform module structure

```
terraform/
  modules/
    networking/           # VPC, subnets, NAT, IGW, route tables
    alb/                  # ALB configurations (public + internal)
    ecs-cluster/          # ECS cluster, capacity providers
    ecs-service/          # Reusable module per service (task def, service, scaling)
    rds/                  # PostgreSQL, parameter groups, subnet groups
    elasticache/          # Redis configuration
    s3/                   # Bucket definitions with encryption and lifecycle
    eventbridge/          # Event bus, rules, targets
    sqs/                  # Queue definitions with DLQs
    cognito/              # User pool, app clients, identity providers
    ses/                  # Email configuration, receipt rules
    waf/                  # WAF web ACL, managed rules
    kms/                  # Per-tenant encryption keys
    iam/                  # Roles and policies per service
    monitoring/           # CloudWatch log groups, metrics, alarms
    security/             # GuardDuty, CloudTrail, security groups
  environments/
    dev/
      main.tf             # Dev-specific overrides (smaller instances, single AZ)
      terraform.tfvars
    staging/
      main.tf             # Mirrors prod topology with reduced capacity
      terraform.tfvars
    prod/
      main.tf             # Full production specification
      terraform.tfvars
  global/
    route53.tf            # DNS (shared across environments)
    acm.tf                # SSL certificates
    ecr.tf                # Container registries (shared)
    iam-cicd.tf           # CI/CD pipeline IAM roles
```

**Module reuse:** Each environment composes the same modules with different variables (instance sizes, replica counts, feature flags). Adding a new environment is a variable file, not a rewrite.

**State management:** Terraform state stored in S3 with DynamoDB locking. Separate state file per environment. State bucket uses versioning and encryption.

**AI-assisted development note:** With Claude Opus 4.6, generating and iterating on these Terraform modules is fast. The investment in proper module structure pays for itself immediately because the AI can work with well-structured modules much more effectively than with a monolithic configuration. Expect the full Terraform codebase for MVP to be authored in days, not weeks.

---

## 11. Decisions confirmed

| Decision | Choice | Rationale |
|---|---|---|
| Cloud provider | **AWS** | Team familiarity (reference architecture), broadest compliance certification coverage, Bedrock for managed LLM access, most aggregation providers support AWS |
| Compute | **ECS Fargate** | Multi-service architecture requires container orchestration; Fargate eliminates server management; simpler than EKS for our scale |
| Database | **RDS PostgreSQL + pgvector** | Battle-tested, pgvector keeps RAG in one database, Multi-AZ for HA, RLS for tenant isolation |
| Event bus | **EventBridge** | AWS-native, serverless, simple rule routing to SQS; can migrate to MSK (Kafka) if volume requires it |
| Cache | **ElastiCache Redis** | Session management, consent caching, real-time data; critical for performance and consent enforcement |
| Vector search | **pgvector (MVP)** | Avoids a separate vector DB dependency; evaluate dedicated (Pinecone, Weaviate) if search performance becomes a bottleneck |
| Auth | **Cognito** | MFA built-in, free tier generous, custom UI for white-label; evaluate Auth0 if white-label customization is insufficient |
| IaC | **Terraform** | Team familiarity, broad AWS coverage, module ecosystem; AI-assisted authoring makes it fast |
| CI/CD | **GitHub Actions** | Free for public repos, generous minutes for private; integrated with GitHub; simple YAML workflows |
| LLM | **Bedrock (Claude) + direct Anthropic API** | Bedrock for AWS-native integration; direct API for Claude-specific features and latest model access; DPA covers both |
| PII detection | **Amazon Comprehend** | AWS-native, no data leaves AWS boundary; evaluate Presidio if accuracy on financial documents is insufficient |
