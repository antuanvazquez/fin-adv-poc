# Executive Summary: Financial Advisory Platform

**Prepared for Alanna and Joe — March 2026**

---

## The Opportunity

There are [32,445+ registered RIA firms](https://www.investmentadviser.org/iaatoday/press-release/2025-investment-adviser-industry-snapshot-shows-continued-growth-in-demand-for-adviser-services/) in the US ([15,870 SEC-registered](https://www.investmentadviser.org/iaatoday/press-release/2025-investment-adviser-industry-snapshot-shows-continued-growth-in-demand-for-adviser-services/) + [16,575 state-registered](https://www.investmentnews.com/regulation-legal-compliance/state-registered-rias-assets-top-360b-as-firm-count-slips-nasaa-says/262006)), [92.7% with 100 or fewer employees](https://www.investmentadviser.org/iaatoday/press-release/2025-investment-adviser-industry-snapshot-shows-continued-growth-in-demand-for-adviser-services/). Small-to-mid RIAs spend [$2,000–$12,500/month on technology](https://investipal.co/blog/7-technology-investments-financial-advisors-should-make-before-2026/), and [54% of advisors plan to increase that budget (avg. +19%)](https://www.planadviser.com/advisers-planning-increase-technology-ai-usage-spend/).

No single platform combines all three capabilities — living financial plans, AI communication analysis, and proactive life signals — into one integrated tool for small-to-mid RIAs at an accessible price point. Orion's new Denali AI approaches this but targets enterprise firms. Zocks handles communication AI but isn't a planning platform. Trove (closed beta) surfaces signals but doesn't manage plans or communications. We integrate the end-to-end workflow for the underserved 10–200 household advisor segment.

**The team:** Alanna brings real-time industry insight and product validation — her active practice serves as a built-in customer lens from day one. Joe contributes outstanding sales expertise, extensive industry experience, credibility, and a strong network. Antuan is a serial entrepreneur and builder-operator who covers the AI stack, the trust stack (cloud security, SOC 2 readiness), and the integrations that make the product sticky — amplified by AI-assisted development that dramatically accelerates the build timeline while keeping costs low.

---

## Revenue Model

Pricing is one of the decisions we'll make together. The table below uses **$25 per client, per month** as a starting point to illustrate the math — it's simple, scales naturally with practice size, and is easy for advisors to evaluate.

| Firm Size | Clients | Monthly Fee | Annual Fee | Context |
|---|---|---|---|---|
| Small RIA | 50 | **$1,250/mo** | $15,000/yr | [RightCapital starts at $150/mo](https://www.rightcapital.com/pricing/) but no AI, no comm hub, no signals |
| Mid RIA | 100 | **$2,500/mo** | $30,000/yr | Well within the [$2K–$3.75K/mo small RIA tech spend band](https://investipal.co/blog/7-technology-investments-financial-advisors-should-make-before-2026/) |
| Larger RIA | 200 | **$5,000/mo** | $60,000/yr | Below the $6.25K–$12.5K/mo mid-size RIA benchmark |
| Large practice | 300 | **$7,500/mo** | $90,000/yr | Consistent with what top practices spend on core platforms |

A platform minimum (~$500/month) would ensure we cover AI compute costs for smaller firms.

### Other pricing models worth exploring

- **AUM-based fee** — a small basis point charge on total assets under management per client, aligning our pricing with how advisors already think about costs
- **Flat tier by total AUM** — e.g., $1,500/mo for firms under $250M AUM, $3,000/mo for $250M–$1B, scaling from there
- **Hybrid** — base platform fee + per-client usage, giving smaller firms a lower entry point

We'll also need to consider multi-firm advisors, team accounts, and volume discounts as we learn more from early customers. The right model will become clearer once we're in market.

### Why the economics work at $25/client

Advisors generate [$5,000–$15,000+ in annual revenue per client](https://www.aboutschwab.com/ria-benchmarking-study-2025) (based on typical [1% AUM fee models](https://www.kitces.com/blog/financial-advisors-charge-services-fees-fee-structure-advisory-firm-profession-aum-pricing-insight/)). At $25/client/month, our platform costs $300/client/year — roughly 2–6% of what each client generates. The ROI is clear: faster meeting prep ([4.6 hours saved per annual review](https://advisoryai.com/blog/scaling-client-service-without-hiring-a-field-guide-for-uk-advisory-firms)), proactive retention, and capacity to [serve 20–40% more clients without hiring](https://advisoryai.com/blog/scaling-client-service-without-hiring-a-field-guide-for-uk-advisory-firms). Any of the pricing models above would land in a similar range relative to advisor revenue.

---

## Cost Roadmap

### Phase 0 — Validation & POC (Weeks 1–4)

Build fast, validate with insiders. AI-assisted development means a functional POC can be live within days — the bottleneck is feedback cycles, not engineering.

| Item | Cost | Notes |
|---|---|---|
| Engineering (Antuan) | Negotiable | AI-assisted development compresses timelines dramatically |
| AI development tools + API credits | $1,000 | ~$1,000/mo — enables rapid iteration |
| AWS infrastructure (hosting POC) | $100 | ~$50–$100/mo for lightweight deployment |
| Domain registration + marketing site hosting | $40 | |
| Discovery calls (5–15 advisors via XYPN/NAPFA) | $500 | Assumes mostly phone/video; can be much higher if a lot are in-person with meals or travel |
| Legal (entity formation, initial counsel) | $1,500–$5,000 | Basic structure ~$1,500; if we pursue a Delaware C-Corp with outside corporate counsel (recommended if future fundraising is likely), $3,000–$5,000+ (optional) |
| **Phase 0 Total** | **~$3,140–$6,640 + eng** | |

**What gets delivered:** A functional POC deployed online for Alanna, Joe, and a small group of trusted advisors to test and provide feedback. Entity formed. Initial advisor discovery calls underway.

### Phase 1 — MVP Build (Months 2–4)

Incorporate feedback from Phase 0 into a production-ready MVP with compliance foundations. Contract engineering help expected mid-phase.

| Item | Cost | Notes |
|---|---|---|
| Engineering (Antuan) | Negotiable | Full-time build; AI-assisted development dramatically accelerates output |
| Contract engineer | $6,000 | ~$75/hr x 20 hrs/wk; starts mid-phase (~6–8 weeks of the 3-month phase) |
| AI development tools + API credits | $3,000 | ~$1,000/mo x 3 months |
| AWS infrastructure (dev + staging + prod) | $750 | ~$250/mo x 3 months (infra plan includes Multi-AZ, CloudTrail, GuardDuty, WAF — SOC 2 requirements baked in) |
| [AWS Activate credits (Founders)](https://aws.amazon.com/activate/founders/) | –$1,000 | Immediate upon application — no VC required |
| Anthropic API credits (production AI features) | $450 | ~$150/mo at low volume during beta |
| SOC 2 readiness + Type I audit | $15,000 | Compliance automation platform + auditor engagement; Type II requires 3–6 month observation period after controls are in place |
| Legal (ToS, privacy policy, DPA templates) | $1,500 | One-time |
| Business insurance (E&O, cyber liability, general liability) | $1,000 | ~$2K/yr prorated |
| **Phase 1 Total** | **~$27,700 + eng** | Before AWS credits |
| After AWS credits | **~$26,700 + eng** | |

### Phase 2 — First Customers & Growth (Months 5–12)

| Item | Cost | Notes |
|---|---|---|
| Contract engineer | $36,000 | ~$75/hr x 15 hrs/wk x 8 months ($4,500/mo, continued from Phase 1) |
| AWS infrastructure (scaling) | $6,000 | ~$750/mo x 8 months, scaling up as users onboard |
| Anthropic/Bedrock AI credits | $2,600 | Ramps from ~$150/mo (month 5) to ~$500/mo (month 12) as usage grows; partially offset via Bedrock on AWS credits |
| Plaid/MX account aggregation fees | $4,000 | ~$500/mo at early scale |
| **Marketing:** | | |
| — Marketing person or agency | $32,000 | $3,000–$5,000/mo x 8 months (avg ~$4K/mo) — strategy, copy, creative, video |
| — LinkedIn ads (targeting RIAs) | $16,000 | $2K/mo x 8 months. [LinkedIn B2B CPL: ~$90–$150](https://www.flyweel.co/blog/lead-gen-cpl-cac-benchmark-index-2025) |
| — Facebook/Instagram ads (retargeting) | $20,000 | $2.5K/mo x 8 months — [CPL ~$25 for finance retargeting](https://www.superads.ai/facebook-ads-costs/cost-per-lead/finance/united-states) |
| **Phase 2 Total (before credits)** | **$116,600** | |
| [AWS Activate Portfolio credits](https://blogs.nvidia.com/blog/nvidia-inception-aws-activate-startups/) | –$25,000 | Via [NVIDIA Inception](https://www.nvidia.com/en-us/startups/) (free to join, [up to $100K in AWS credits](https://blogs.nvidia.com/blog/nvidia-inception-aws-activate-startups/)) |
| **Phase 2 Total (after credits)** | **~$91,600** | AWS credits only offset AWS usage (infra + Bedrock); other line items are not reduced |

### Cloud Credits — Potential Offsets

Credits only offset AWS usage (infrastructure, Bedrock AI calls, S3, etc.) — they do not reduce non-AWS line items like Anthropic direct API, marketing, legal, or personnel.

| Program | Credits | Requirements | Status |
|---|---|---|---|
| [AWS Activate Founders](https://aws.amazon.com/activate/founders/) | Up to $1,000 | Self-funded startup, no prior credits | Apply immediately |
| [AWS Activate Portfolio](https://blogs.nvidia.com/blog/nvidia-inception-aws-activate-startups/) (via NVIDIA Inception) | Up to $100,000 | Join [NVIDIA Inception](https://www.nvidia.com/en-us/startups/) (free, no equity) | Apply in Phase 1 |
| AWS Activate Portfolio (via VC) | Up to $100,000+ | Minimum ~$250K investment from qualifying VC | If/when VC-funded |

### Year 2+ (Deferred — funded by revenue)

| Item | Est. Annual Cost | When |
|---|---|---|
| [SOC 2 Type II annual renewal](https://soc2auditors.org/insights/soc-2-type-2-audit-cost) | $8,000–$15,000 | Annually from Year 2; lower end realistic with Vanta continuous monitoring already in place |
| Compliance automation (Vanta/Drata) ongoing | $10,000/yr | Annual subscription |
| Full-time marketing hire | $60,000–$80,000 | When MRR exceeds $30K/mo |
| Customer success hire | $50,000–$70,000 | When client count exceeds 30 advisors |

---

## Revenue Projection & Break-Even

### Growth assumptions

*The projections below use $25/client as a baseline. The actual numbers will shift depending on which pricing model we choose — but the trajectory and break-even dynamics are similar across all models at comparable price points.*

- MVP live by end of Month 4; first paying customer(s) target Month 5 (founder-led sales; Alanna's practice validates the product at launch)
- Joe's referrals bring 2–3 advisors in months 6–7 (founder-led sales — no sales team needed yet)
- Marketing pipeline contributes 1–2 new advisors per month starting month 8
- Average firm size: 100 clients (Month 5 uses Alanna's practice at 260 clients as the anchor customer)

| Month | Advisors | Clients | MRR | Monthly Burn | Net Cash Flow | Cumulative |
|---|---|---|---|---|---|---|
| 1 | 0 | 0 | $0 | ~$3,100 | –$3,100 | –$3,100 |
| 2–4 | 0 | 0 | $0 | ~$7,900/mo | –$23,700 | –$26,800 |
| 5 | 1 | 260 | $6,500 | ~$14,500 | –$8,000 | –$34,800 |
| 6 | 3 | 560 | $14,000 | ~$14,500 | –$500 | –$35,300 |
| 7 | 5 | 860 | $21,500 | ~$14,500 | +$7,000 | –$28,300 |
| 8 | 7 | 1,060 | $26,500 | ~$15,000 | +$11,500 | –$16,800 |
| 9 | 9 | 1,260 | $31,500 | ~$15,000 | +$16,500 | –$300 |
| 10 | 11 | 1,460 | $36,500 | ~$15,500 | +$21,000 | +$20,700 |
| 11 | 13 | 1,660 | $41,500 | ~$15,500 | +$26,000 | +$46,700 |
| **12** | **15** | **1,960** | **$49,000** | ~$16,000 | **+$33,000** | **+$79,700** |

**Break-even: Month 7** (MRR exceeds monthly operating costs)

**Fully self-funded: Month 9–10** (cumulative revenue has repaid all invested cash)

**Year 1 total revenue: ~$227,000** (months 5–12)

*Note: Monthly burn includes contract engineer (15 hrs/wk) and marketing but excludes Antuan's engineering (negotiable). Phase 1 burn includes SOC 2 ($15K). AWS credits reduce actual cash outflow further — see Cloud Credits table.*

### Growth Potential

The Year 1 projections above are conservative — 15 advisors by month 12 with a 100-client average. With dedicated marketing and founder-led sales, reaching well beyond that by year 2 is realistic (the entire addressable market is 32,000+ firms).

Industry data ([Kitces](https://www.kitces.com/blog/the-solo-independent-ria-financial-advisor-is-not-just-surviving-but-thriving-by-serving-the-mass-affluent/), [FA Insight](https://fainsight.com/)) shows solo advisors typically serve 75–150 clients, while small ensemble firms serve 150–300. As we onboard more firms, the mix skews toward smaller practices, bringing the average down.

| Year 2 Scenario | Advisors | Avg Clients/Firm | MRR/Firm | ARR | Valuation (10–15x ARR) |
|---|---|---|---|---|---|
| Conservative | 75 | 120 | $3,000 | $2.7M | $27M–$41M |
| Base case | 200 | 100 | $2,500 | $6.0M | $60M–$90M |
| Aggressive | 500 | 85 | $2,125 | $12.8M | $128M–$191M |

### The path to $1B

A $1B valuation requires roughly $65M–$80M in ARR at a 12–15x multiple. At $25/client, that translates to approximately **3,000–3,500 advisor firms** averaging 75–80 clients each — about 10% of the addressable market. For context, Orion (a comparable advisor-tech platform) surpassed $2B in valuation by reaching a similar share of the RIA market. The path would likely involve venture funding to accelerate sales and marketing, but the unit economics and market dynamics support it.

Valuation multiples reflect typical early-stage vertical SaaS in fintech (comparable companies: Orion, Nitrogen/Riskalyze, Addepar). The key lever is average practice size — selling into mid-size firms with 150+ clients is significantly more valuable per sale than volume alone.

---

## Investment Overview

| | Amount | Timing |
|---|---|---|
| Phase 0 (validation + POC) | ~$3,100–$6,600 + eng | Month 1 (higher end if Delaware C-Corp with outside counsel) |
| Phase 1 (MVP build) | ~$26,700 + eng | Months 2–4 (after $1K AWS credit) |
| Phase 2 (growth — after $25K credit) | ~$91,600 | Months 5–12 |
| **Gross cash needed (excl. Antuan eng)** | **~$121,400–$124,900** | Over 12 months |
| Additional AWS credits possible | up to –$75,000 more | If full NVIDIA Inception or VC-backed credits secured |
| Revenue generated (months 5–12) | –$227,000 | |

### Risk-adjusted scenarios

| Scenario | Assumption | Peak cash outlay (before revenue covers costs) | Self-funded by |
|---|---|---|---|
| **Optimistic** | Founder network delivers fast; 15+ advisors by month 12; full credits secured | ~$30,000 | Month 8 |
| **Base case** | 12 advisors by month 12; $26K in credits | ~$40,000 | Month 10 |
| **Conservative** | 50% slower acquisition; 6 advisors by month 12 | ~$65,000 | Month 14 |
| **Worst case** | Single early customer for 6 months; very slow growth | ~$100,000 | Month 17+ |

Even in the worst case, the investment is modest relative to the revenue opportunity. The faster we acquire customers, the less total cash is needed — founder-led distribution through Alanna and Joe's network is the key lever.

---

## Why This Works

**Built-in product validation.** Alanna's active practice gives us real-time industry feedback from day one — we build with a live advisor lens, not in a vacuum. Her stated willingness to pay ($5,000+/mo) validates the $25/client price point from day one.

**AI makes us fast.** AI-assisted development dramatically accelerates the build timeline. A functional POC can be live within days; a production MVP within weeks. Monthly burn stays low even as we scale.

**Cloud credits slash infrastructure cost.** [AWS Activate](https://aws.amazon.com/activate/founders/) ($1K–$100K) and [NVIDIA Inception](https://www.nvidia.com/en-us/startups/) (free, no equity) can cover our infrastructure bill for the first 12–18 months.

**Per-client pricing scales with adoption.** No complex enterprise sales — every new advisor who onboards immediately generates recurring revenue proportional to their practice size.

**The market is moving toward us.** [511 new independent RIAs launched in 2025 alone](https://www.dakota.com/reports-blog/the-state-of-the-ria-market-2025-year-end-review). [Advisor tech budgets are growing 19% year-over-year](https://www.planadviser.com/advisers-planning-increase-technology-ai-usage-spend/). No single competitor integrates the full loop for our target segment.

---

## Next Steps

1. **Week 1:** Agree on equity split among the three partners. Form the entity (LLC or C-Corp — if future fundraising is likely, a Delaware C-Corp with outside corporate counsel is worth considering).
2. **Week 2:** Apply for [AWS Activate](https://aws.amazon.com/activate/founders/) (Founders — immediate $1K). Apply for [NVIDIA Inception](https://www.nvidia.com/en-us/startups/) (free, up to $100K in AWS credits). Deploy POC for insider testing.
3. **Weeks 2–4:** Begin 5–15 discovery calls with target advisors. Incorporate feedback into MVP scope.
4. **Month 2:** Begin Phase 1 MVP build. Initiate SOC 2 readiness research.

---

*All external statistics are cited inline with links to their primary sources. Projections are estimates based on published industry benchmarks and comparable SaaS trajectories. Actual results will vary based on market conditions, customer acquisition speed, and execution.*
