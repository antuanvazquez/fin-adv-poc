# Compliance Research: Certifications and Regulatory Landscape

**Prepared:** February 28, 2026

This document maps every compliance certification, regulation, and legal requirement relevant to operating a SaaS platform that handles consumer financial data, monitors advisor-client communications, and operates a consent-based AI learning system serving RIA firms.

---

## Summary: What we need and when

| Regulation / Certification | Applies to us? | When to address | Effort |
|---|---|---|---|
| **SOC 2 Type II** | Yes — table stakes for selling to RIAs | Day 1 (controls); audit by end of Year 1 | HIGH |
| **GLBA Safeguards Rule** | Yes — we process consumer financial data on behalf of RIAs | Day 1 (contractual + technical safeguards) | MEDIUM |
| **CCPA / CPRA** | Yes — if we have California consumers (likely from early adoption) | Day 1 (privacy infrastructure); full compliance before scale | HIGH |
| **ECPA / state wiretap laws** | Yes — communication monitoring requires consent | Before launching email/text monitoring (Phase 2) | MEDIUM |
| **SEC/FINRA registration** | No — we are a technology vendor, not a registrant | N/A (but must not drift into advice) | LOW |
| **HIPAA** | Not yet — only if we handle Protected Health Information | Phase 3+ (if we integrate health data sources) | HIGH (if triggered) |
| **State privacy laws (beyond CA)** | Likely — CO, CT, VA, TX, and others have active privacy laws | Monitor and address as we expand to those states | MEDIUM |
| **Data anonymization standards** | Yes — required for the shared learning corpus | Before launching shared learning (Phase 2) | HIGH |

---

## 1. SOC 2 Type II

### What it is
SOC 2 (Service Organization Control 2) is an auditing framework developed by the AICPA that evaluates a service organization's controls related to security, availability, processing integrity, confidentiality, and privacy. Type II means the auditor evaluates whether controls were effectively operating over a period of time (typically 6-12 months), not just designed properly (Type I).

### Why we need it
SOC 2 Type II is the **de facto standard** for any SaaS vendor selling into financial services. Every RIA doing due diligence on a technology vendor will ask for a SOC 2 report. FusionIQ, Pebble Finance, SmartRIA, and InvestiFi all achieved SOC 2 Type II in 2024-2025 — this is table stakes, not a differentiator.

### What it requires
- Formal information security policies and procedures
- Access controls (RBAC, MFA, least privilege)
- Encryption (TLS 1.2+ in transit, AES-256 at rest)
- Change management and code review processes
- Vulnerability management and penetration testing (annual)
- Incident response plan (documented, tested)
- Vendor risk management program
- Employee security training
- Monitoring and alerting
- Business continuity and disaster recovery plans
- Evidence collection for all of the above, continuously

### How to pursue it
- **Tooling:** Vanta or Drata for automated evidence collection and control monitoring. Both integrate with cloud providers, code repos, HR systems, and identity providers to continuously validate compliance.
- **Timeline:** Start controls and evidence collection from day 1 of development. Engage an auditor for Type I after ~3 months of evidence. Type II after ~6-12 months of sustained operation.
- **Cost:** Vanta/Drata: ~$10K-$25K/year. Type II audit: ~$20K-$50K for a small company. Total Year 1: ~$30K-$75K.

### Sources
- [FusionIQ SOC 2 Type II announcement, 2024](https://fusioniq.io/news-releases/fusioniq-achieves-soc-2-type-ii-compliance-reinforcing-commitment-to-data-security/)
- [Pebble Finance SOC 2 Type II, August 2025](https://www.globenewswire.com/news-release/2025/08/11/3131130/0/en/Pebble-Finance-Successfully-Achieves-SOC-2-Type-II-Compliance.html)
- [SmartRIA Security & Trust](https://smart-ria.com/security-trust/)

---

## 2. GLBA Safeguards Rule

### What it is
The Gramm-Leach-Bliley Act (GLBA) Safeguards Rule (16 CFR Part 314), enforced by the FTC, requires financial institutions — including technology vendors that process consumer financial data — to develop and maintain a comprehensive written Information Security Program protecting customer nonpublic personal information (NPI).

### Why it applies to us
As a SaaS vendor that processes consumer financial data on behalf of RIA firms, we fall under the GLBA as a service provider. RIAs are required to select vendors that maintain appropriate safeguards and to enforce this through contractual obligations. We must meet those expectations.

### What it requires
- **Written Information Security Program** covering: risk assessment, safeguard design and testing, ongoing monitoring and adjustment
- **Designated Qualified Individual** responsible for the security program
- **Risk assessments** identifying threats to NPI in each operational area
- **Technical safeguards:** encryption, access controls, MFA, secure development practices
- **Vendor management:** we must impose safeguards on our own subprocessors (cloud providers, aggregation APIs, LLM providers)
- **Incident response and breach notification:** report breaches involving unencrypted NPI affecting 500+ consumers to the FTC
- **Employee training** on information security

### How to address it
- Significant overlap with SOC 2 — if we build SOC 2 controls from day 1, GLBA compliance follows naturally
- The main additive requirement is the **written Information Security Program** and the **Qualified Individual** designation
- Contractual: include GLBA-aligned data processing addenda in our agreements with RIA customers

### Sources
- [FTC GLBA Safeguards Rule text](https://www.ftc.gov/system/files/ftc_gov/pdf/p145407_safeguards_rule.pdf)
- [Vumetric — GLBA Compliance Guide 2025](https://www.vumetric.com/compliance/glba/)
- [Prevalent — GLBA Safeguards Rule overview](https://www.prevalent.net/compliance/gramm-leach-bliley-act-safeguards-rule/)

---

## 3. CCPA / CPRA (California Consumer Privacy Act / California Privacy Rights Act)

### What it is
California's comprehensive consumer privacy law granting residents rights over their personal information. CPRA (effective 2023, with ongoing amendments through 2026) significantly expanded the original CCPA.

### Why it applies to us
We will handle personal financial information for California residents (virtually certain given California's population). Even before hitting revenue thresholds, building privacy infrastructure early is critical — retrofitting is far more expensive than designing for privacy from the start.

### Current requirements (as of January 1, 2026)
- **Right to know:** Consumers can request all personal data collected, now extending back to January 2022 or earlier if retained
- **Right to delete:** Consumers can request deletion of their personal information (within 45 days)
- **Right to opt-out:** Of sale or sharing of personal information, and of Automated Decision-Making Technology (ADMT)
- **Right to correct:** Inaccurate personal information
- **Right to limit:** Use of sensitive personal information
- **Global Privacy Control (GPC):** Must detect and honor browser-level opt-out signals
- **Privacy policy requirements:** Must disclose data categories, sources, purposes, retention periods, ADMT uses, and all consumer rights
- **No dark patterns:** Consent mechanisms must be clear, not manipulative

### Specific impact on our platform
- **Learning system:** The opt-in consent model for anonymous data sharing must be clearly separate from other consents. Opting out of learning must be frictionless.
- **ADMT:** Our AI-powered features (communication analysis, life signals, response drafting) may qualify as Automated Decision-Making Technology. We need to:
  - Provide access to information about ADMT methodology
  - Allow consumers to opt out of ADMT-based processing
  - Conduct risk assessments for ADMT use (required January 1, 2026; attestations due April 1, 2028)
- **Deletion requests:** Must propagate across all systems — core data, document store, communication archive, learning corpus contributions. De-identified data in the shared corpus is exempt under the CCPA safe harbor for de-identified information.

### Phased enforcement timeline
- January 1, 2026: ADMT risk assessments required
- April 1, 2028: Cybersecurity audit attestations required (for companies with $100M+ revenue)
- April 1, 2030: Cybersecurity audit attestations for companies under $50M revenue

### Sources
- [Secure Privacy — CCPA Requirements 2026 Complete Guide](https://secureprivacy.ai/blog/ccpa-requirements-2026-complete-compliance-guide)
- [JD Supra — CCPA 2026 What Companies Need to Know](https://www.jdsupra.com/legalnews/ccpa-2026-what-companies-need-to-know-6779693/)
- [Promise Legal — CCPA/CPRA Compliance for Startups 2025](https://www.promise.legal/startup-legal-guide/compliance/ccpa-guide)

---

## 4. ECPA / State Wiretap Laws (Communication Monitoring)

### What it is
The Electronic Communications Privacy Act (ECPA, 18 U.S.C. §§ 2510-2522) is the federal law governing interception and monitoring of electronic communications. State wiretap laws layer additional requirements on top.

### Why it applies to us
Our AI Communication Hub monitors advisor-client communications across channels (in-platform messaging, email, text). This constitutes interception/monitoring of electronic communications.

### Federal requirement
- ECPA requires **one-party consent** — at least one party to the communication must consent to the monitoring.
- Since the advisor is a party and consents through our terms of service, federal law is satisfied.

### State requirements (the complication)
11+ states require **all-party consent** — ALL participants in a communication must consent to monitoring:
- California, Connecticut, Delaware, Florida, Illinois, Maryland, Massachusetts, Michigan, Montana, New Hampshire, Oregon, Pennsylvania, Vermont, Washington

If a client in one of these states communicates with an advisor through our platform, **both** the advisor and the client must have consented before we can monitor that communication.

### How to address it
- **Blanket consent at onboarding:** During client onboarding, include explicit consent to communication monitoring as a separate, clearly worded consent item. This must be:
  - Separate from other consents (not buried in a general TOS)
  - Specific about what is monitored (in-platform messages, email if linked, text if linked)
  - Clear about the purpose (AI analysis to help the advisor respond faster and more thoroughly)
  - Revocable at any time through the client's settings
- **Per-state legal review:** Before launching external channel monitoring (Phase 2), get legal counsel to review our consent language against each state's specific requirements.
- **Enforcement:** The consent middleware must block AI analysis of communications for any client who has not consented or has revoked consent. This is a hard block, not a soft preference.

### Sources
- [ECPA, 18 U.S.C. §§ 2510-2522](https://www.law.cornell.edu/uscode/text/18/part-I/chapter-119)
- [FPA Journal — Compliance Risks of Generative AI in Financial Planning, May 2025](https://www.financialplanningassociation.org/learning/publications/journal/MAY25-compliance-risks-using-generative-ai-financial-planning-practice-OPEN)

---

## 5. SEC / FINRA Registration

### Our position
We are a **technology vendor**, not a registered investment adviser or broker-dealer. We do not:
- Provide personalized investment advice to end clients
- Recommend specific securities or investment strategies
- Execute trades on behalf of clients
- Receive transaction-based compensation

Therefore, SEC/FINRA registration is **not required**.

### Where the line is
The critical boundary: our AI must never generate content that constitutes "investment advice" as defined by the Investment Advisers Act of 1940. Specifically:
- AI drafts responses, but the **advisor** (a registered person) reviews, approves, and sends them
- AI never autonomously communicates investment recommendations to clients
- AI-generated content carries disclaimers and traceability
- We present as a **planning operations and client experience tool**, not an advice engine

### Risk mitigation
- Require human advisor approval for all client-facing AI outputs
- Log every AI output with full audit trail (input, model, output, advisor action)
- Periodic legal review of AI output samples to ensure no drift into advice territory
- Clear marketing and positioning: we are a technology platform, not an advisor

### Sources
- [Investment Advisers Act of 1940](https://www.sec.gov/about/laws/iaa40.pdf)
- [SEC — AI Washing enforcement actions against Delphia and Global Predictions](https://www.financial-planning.com/news/ai-use-tops-advisor-compliance-headaches-for-first-time)

---

## 6. HIPAA (Health Insurance Portability and Accountability Act)

### When it applies
HIPAA applies when an entity handles **Protected Health Information (PHI)** — individually identifiable health information relating to physical or mental health conditions, healthcare services, or payment for healthcare.

### Our current exposure
- **Phase 1-2: No HIPAA exposure.** Generic calendar-based reminders ("schedule your annual physical") that do not ingest, store, or transmit actual health records are **not PHI**. They are preference-based or calendar-based alerts.
- **Phase 3+ (potential):** If we integrate with:
  - HSA (Health Savings Account) providers and ingest HSA transaction details
  - Wellness platforms that share health data
  - Insurance claim data that includes diagnosis codes
  Then we become a **Business Associate** under HIPAA.

### What HIPAA requires (if triggered)
- **Business Associate Agreement (BAA):** Must execute a BAA with any Covered Entity (health plan, healthcare provider) whose data we process
- **Administrative safeguards:** Designated Privacy and Security Officers, workforce training, incident response plan
- **Technical safeguards:** AES-256 encryption at rest, TLS 1.2+ in transit, access controls with audit logging, tamper-evident audit logs that do not contain raw PHI
- **Physical safeguards:** Hardened infrastructure, segmented networks
- **Breach notification:** Notify affected individuals within 60 days; notify HHS if 500+ individuals affected
- **Documentation retention:** 6 years for all HIPAA-related documentation
- **Risk assessments:** Regular, documented risk assessments (not one-time)

### Recommendation
**Defer PHI handling to Phase 3+.** Keep health-related features in Phases 1-2 as generic reminders only. Before adding any health data integration:
1. Conduct a formal HIPAA applicability assessment with healthcare compliance counsel
2. If PHI handling is confirmed, budget 3-6 months for HIPAA compliance implementation
3. Execute BAAs with all relevant parties
4. Implement HIPAA-specific technical controls (which overlap significantly with SOC 2 but have additional requirements around PHI-specific access logging and breach notification)

### Sources
- [Sprinto — HIPAA for Fintech: PHI Protection & Compliance Guide 2025](https://sprinto.com/blog/hipaa-for-fintech/)
- [CyberSierra — HIPAA Compliance Checklist for SaaS 2026](https://cybersierra.co/blog/hipaa-compliance-checklist-saas/)

---

## 7. Data Anonymization Standards (for Continuous Learning System)

### Why this matters
Our continuous learning system collects data from consenting clients, anonymizes it, and uses it to improve the platform's financial intelligence. The anonymization must be robust enough that:
1. Re-identification is not feasible
2. The anonymized data qualifies for de-identified data exemptions under CCPA and other privacy laws
3. Advisors and clients trust that the process is sound

### Standards and frameworks
- **NIST SP 800-188 (De-Identifying Government Datasets):** The most widely referenced US standard for de-identification. Covers: suppression, generalization, noise addition, and data swapping techniques. Includes guidance on measuring re-identification risk.
- **CCPA de-identified data safe harbor:** CCPA exempts de-identified data from consumer rights (deletion, access, opt-out) IF the business:
  - Has implemented technical safeguards that prohibit re-identification
  - Has implemented business processes that prevent re-identification
  - Has implemented business processes to prevent inadvertent release
  - Makes no attempt to re-identify the information
- **k-anonymity:** Ensures that every record in the dataset is indistinguishable from at least k-1 other records with respect to quasi-identifiers. Minimum k=5 is a common threshold.
- **Differential privacy:** Mathematical framework for adding calibrated noise to data or query results to prevent identification of any individual record. Useful for aggregate statistics derived from the learning corpus.

### Implementation approach
1. **PII detection:** Run automated NER (Named Entity Recognition) on all data before it enters the anonymization pipeline. Detect: names, SSNs, account numbers, routing numbers, addresses, phone numbers, emails, DOBs, employer names, firm names.
2. **Entity redaction/generalization:** Replace identified PII with generalized tokens (e.g., "John Smith, age 52, $1.2M portfolio" becomes "[CLIENT], age band 50-55, portfolio band $1M-$1.5M").
3. **Re-identification risk assessment:** Automated check on every anonymized record before it enters the shared corpus. Flag records where quasi-identifiers (age band + state + portfolio size + account types) might uniquely identify someone.
4. **Periodic audit:** Quarterly manual review of a sample of anonymized records by a qualified data privacy analyst.

### Sources
- [NIST SP 800-188 — De-Identifying Government Datasets](https://csrc.nist.gov/pubs/sp/800/188/final)
- [Private AI — De-identification for LLMs](https://www.private-ai.com/en/solutions/llms)
- [CCPA de-identified data provisions](https://secureprivacy.ai/blog/ccpa-requirements-2026-complete-compliance-guide)

---

## 8. Other state privacy laws to monitor

Several states have enacted comprehensive privacy laws modeled on CCPA or the EU's GDPR. These apply if we have consumers in those states:

| State | Law | Effective | Key notes |
|---|---|---|---|
| Colorado | CPA | July 2023 | Universal opt-out mechanism required |
| Connecticut | CTDPA | July 2023 | Similar to CPA; consent for sensitive data |
| Virginia | VCDPA | January 2023 | Narrower than CCPA; no private right of action |
| Texas | TDPSA | July 2024 | Broad applicability; no revenue threshold |
| Oregon | OCPA | July 2024 | Includes nonprofit coverage |
| Montana | MCDPA | October 2024 | Low population threshold (50K consumers) |
| Delaware | DPDPA | January 2025 | Broad; includes consumer health data |
| Iowa, Indiana, Tennessee, others | Various | 2025-2026 | Ongoing wave of state privacy legislation |

### Practical approach
- Build privacy infrastructure once (consent management, deletion pipeline, privacy policy framework) and parameterize it per-state.
- Monitor new state laws quarterly. The trend is accelerating — a federal privacy law may eventually preempt state laws, but as of early 2026, no federal law has passed.
- Consider engaging a privacy compliance service (TrustArc, OneTrust, or similar) as the state count grows beyond 5-6.

---

## 9. Compliance roadmap summary

### Day 1 (start of development)
- SOC 2 controls and evidence collection (Vanta/Drata)
- Written Information Security Program (GLBA)
- Privacy-by-design: consent management data model, deletion pipeline architecture, PII-aware data routing
- CCPA-compliant privacy policy framework
- Encryption everywhere (TLS 1.2+, AES-256)
- RBAC and MFA

### Phase 1 launch
- SOC 2 Type I audit completed (or in progress)
- GLBA safeguards operational
- CCPA consumer rights infrastructure live (right to know, delete, opt-out)
- Consent capture for aggregation and in-platform messaging
- Published security page and due diligence pack for advisor prospects

### Phase 2 launch (communication monitoring + learning)
- ECPA/wiretap consent language reviewed by legal counsel per target states
- Communication monitoring consent capture and enforcement operational
- PII detection and anonymization pipeline operational and audited
- Shared learning corpus launched with consent-gated contributions
- SOC 2 Type II audit completed

### Phase 3+ (health signals, expanded learning)
- HIPAA applicability assessment if health data sources are being integrated
- BAA framework if HIPAA applies
- Fine-tuning data governance framework reviewed by legal
- Expanded state privacy law coverage as geographic reach grows
