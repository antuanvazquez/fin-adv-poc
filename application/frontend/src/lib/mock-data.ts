import type {
  Advisor,
  Household,
  LifeSignal,
} from './types';

// ─── Advisor ────────────────────────────────────────────────────────────────

export const mockAdvisor: Advisor = {
  id: 'adv-1',
  name: 'Alanna Shepherd',
  title: 'Senior Financial Advisor, CFP®',
  firm: 'Meridian Wealth Partners',
  email: 'alanna.shepherd@meridianwp.com',
  totalAUM: 48_200_000,
  clientCount: 42,
  prospectCount: 7,
};

// ─── Household 1 — The Martins ──────────────────────────────────────────────

const martinHousehold: Household = {
  id: 'h1',
  name: 'The Martins',
  status: 'active',
  advisorId: 'adv-1',
  createdAt: '2019-06-15T00:00:00Z',
  clients: [
    {
      id: 'c1-1',
      firstName: 'Robert',
      lastName: 'Martin',
      email: 'robert.martin@email.com',
      phone: '(312) 555-0142',
      dateOfBirth: '1972-03-18',
      retirementAge: 65,
      riskTolerance: 'moderate',
      occupation: 'Senior Mechanical Engineer',
      employer: 'Raytheon Technologies',
    },
    {
      id: 'c1-2',
      firstName: 'Patricia',
      lastName: 'Martin',
      email: 'patricia.martin@email.com',
      phone: '(312) 555-0198',
      dateOfBirth: '1974-08-05',
      retirementAge: 65,
      riskTolerance: 'moderate',
      occupation: 'Hospital Administrator',
      employer: 'Northwestern Memorial Hospital',
    },
  ],

  // ── Financial Plan ──
  financialPlan: {
    householdId: 'h1',
    lastUpdated: '2026-02-10T00:00:00Z',
    healthScore: 72,

    netWorth: {
      totalAssets: 1_742_000,
      totalLiabilities: 237_000,
      netWorth: 1_505_000,
      history: [
        { year: 2022, value: 1_085_000 },
        { year: 2023, value: 1_198_000 },
        { year: 2024, value: 1_310_000 },
        { year: 2025, value: 1_425_000 },
        { year: 2026, value: 1_505_000 },
      ],
      assets: [
        { category: 'Retirement Accounts', amount: 892_000 },
        { category: 'Brokerage', amount: 215_000 },
        { category: 'Real Estate (Primary)', amount: 480_000 },
        { category: 'Cash & Equivalents', amount: 87_000 },
        { category: 'Other (Vehicles, Personal)', amount: 68_000 },
      ],
      liabilities: [
        { category: 'Mortgage', amount: 198_000 },
        { category: 'Auto Loan', amount: 24_000 },
        { category: 'Credit Cards', amount: 15_000 },
      ],
    },

    cashReserve: {
      currentReserve: 87_000,
      monthlyExpenses: 14_800,
      targetMonths: 6,
      goal: 88_800,
      shortage: 1_800,
    },

    discretionaryIncome: {
      grossIncome: 230_000,
      taxes: 57_500,
      fixedExpenses: 98_400,
      variableExpenses: 32_400,
      totalOutflows: 188_300,
      discretionary: 41_700,
      savingsRate: 18.1,
    },

    disabilityInsurance: {
      policies: [
        {
          id: 'ins-1-1',
          type: 'Long-Term Disability',
          owner: 'Robert Martin',
          policyNumber: 'DIS-448821',
          benefit: 8_100,
          premium: 142,
          premiumFrequency: 'monthly',
          beneficiary: 'N/A',
          waitingPeriod: '90 days',
        },
        {
          id: 'ins-1-2',
          type: 'Long-Term Disability',
          owner: 'Patricia Martin',
          policyNumber: 'DIS-773204',
          benefit: 5_700,
          premium: 118,
          premiumFrequency: 'monthly',
          beneficiary: 'N/A',
          waitingPeriod: '90 days',
        },
      ],
      suggestedCoverage: [
        { person: 'Robert Martin', amount: 8_100 },
        { person: 'Patricia Martin', amount: 5_700 },
      ],
      currentCoverage: [
        { person: 'Robert Martin', amount: 8_100 },
        { person: 'Patricia Martin', amount: 5_700 },
      ],
      shortage: [
        { person: 'Robert Martin', amount: 0 },
        { person: 'Patricia Martin', amount: 0 },
      ],
    },

    lifeInsurance: {
      policies: [
        {
          id: 'ins-1-3',
          type: 'Term Life (20-year)',
          owner: 'Robert Martin',
          policyNumber: 'LIF-992341',
          benefit: 750_000,
          premium: 82,
          premiumFrequency: 'monthly',
          beneficiary: 'Patricia Martin',
        },
        {
          id: 'ins-1-4',
          type: 'Whole Life',
          owner: 'Patricia Martin',
          policyNumber: 'LIF-110487',
          benefit: 250_000,
          premium: 195,
          premiumFrequency: 'monthly',
          beneficiary: 'Robert Martin',
          cashValue: 38_200,
        },
      ],
      suggestedCoverage: [
        { person: 'Robert Martin', amount: 1_000_000 },
        { person: 'Patricia Martin', amount: 500_000 },
      ],
      currentCoverage: [
        { person: 'Robert Martin', amount: 750_000 },
        { person: 'Patricia Martin', amount: 250_000 },
      ],
      shortage: [
        { person: 'Robert Martin', amount: 250_000 },
        { person: 'Patricia Martin', amount: 250_000 },
      ],
    },

    longTermCare: {
      policies: [],
      suggestedCoverage: [
        { person: 'Robert Martin', amount: 5_000 },
        { person: 'Patricia Martin', amount: 5_000 },
      ],
      currentCoverage: [
        { person: 'Robert Martin', amount: 0 },
        { person: 'Patricia Martin', amount: 0 },
      ],
      shortage: [
        { person: 'Robert Martin', amount: 5_000 },
        { person: 'Patricia Martin', amount: 5_000 },
      ],
    },

    retirementAssets: {
      accounts: [
        {
          id: 'ret-1-1',
          name: 'Robert 401(k) — Raytheon',
          type: '401k',
          balance: 487_000,
          contributionRate: 12,
          employerMatch: 6,
        },
        {
          id: 'ret-1-2',
          name: 'Patricia 403(b) — Northwestern',
          type: '401k',
          balance: 218_000,
          contributionRate: 8,
          employerMatch: 4,
        },
        {
          id: 'ret-1-3',
          name: 'Robert Traditional IRA',
          type: 'ira',
          balance: 112_000,
        },
        {
          id: 'ret-1-4',
          name: 'Patricia Roth IRA',
          type: 'roth-ira',
          balance: 75_000,
        },
      ],
      totalEarmarked: 892_000,
      retirementGoal: 1_400_000,
      shortage: 508_000,
      percentFunded: 63.7,
      projectedAge: 67,
    },

    estatePlanning: {
      totalEstateValue: 1_742_000,
      documents: [
        { name: 'Will (Robert)', completed: true, lastReviewed: '2021-04-10' },
        { name: 'Will (Patricia)', completed: true, lastReviewed: '2021-04-10' },
        { name: 'Revocable Living Trust', completed: false },
        { name: 'Power of Attorney (Robert)', completed: true, lastReviewed: '2021-04-10' },
        { name: 'Power of Attorney (Patricia)', completed: true, lastReviewed: '2021-04-10' },
        { name: 'Healthcare Directive (Robert)', completed: false },
        { name: 'Healthcare Directive (Patricia)', completed: false },
      ],
      beneficiaries: [
        { name: 'Patricia Martin', relationship: 'Spouse', percentage: 60 },
        { name: 'Emily Martin', relationship: 'Daughter', percentage: 20 },
        { name: 'James Martin', relationship: 'Son', percentage: 20 },
      ],
    },

    assetAllocation: {
      current: [
        { category: 'US Equities', percentage: 42 },
        { category: 'International Equities', percentage: 18 },
        { category: 'Fixed Income', percentage: 28 },
        { category: 'Real Estate', percentage: 7 },
        { category: 'Cash', percentage: 5 },
      ],
      target: [
        { category: 'US Equities', percentage: 38 },
        { category: 'International Equities', percentage: 15 },
        { category: 'Fixed Income', percentage: 35 },
        { category: 'Real Estate', percentage: 7 },
        { category: 'Cash', percentage: 5 },
      ],
    },
  },

  // ── Accounts ──
  accounts: [
    {
      id: 'acct-1-1',
      institution: 'Fidelity',
      type: 'retirement',
      name: 'Robert 401(k)',
      balance: 487_000,
      lastRefreshed: '2026-02-28T08:00:00Z',
    },
    {
      id: 'acct-1-2',
      institution: 'Fidelity',
      type: 'retirement',
      name: 'Robert Traditional IRA',
      balance: 112_000,
      lastRefreshed: '2026-02-28T08:00:00Z',
    },
    {
      id: 'acct-1-3',
      institution: 'Schwab',
      type: 'brokerage',
      name: 'Joint Brokerage',
      balance: 215_000,
      lastRefreshed: '2026-02-28T08:00:00Z',
    },
    {
      id: 'acct-1-4',
      institution: 'Chase',
      type: 'checking',
      name: 'Joint Checking',
      balance: 18_400,
      lastRefreshed: '2026-02-28T12:30:00Z',
    },
    {
      id: 'acct-1-5',
      institution: 'Marcus (Goldman Sachs)',
      type: 'savings',
      name: 'High-Yield Savings',
      balance: 68_600,
      lastRefreshed: '2026-02-28T08:00:00Z',
    },
  ],

  // ── Communications ──
  communications: [
    {
      id: 'msg-1-1',
      senderId: 'c1-1',
      senderName: 'Robert Martin',
      senderType: 'client',
      content:
        "Hi Alanna, Patricia received a renewal notice for her whole life policy and we're confused about the cash value section. I attached the document — can you take a look and let us know what it means for our overall plan? Also wondering if we should be increasing coverage given how close we are to retirement.",
      timestamp: '2026-02-25T14:22:00Z',
      attachments: [
        {
          name: 'WL_Policy_Renewal_LIF-110487.pdf',
          type: 'application/pdf',
          content: '[Whole Life Policy Renewal — Policy LIF-110487]\nInsured: Patricia Martin\nFace Amount: $250,000\nAnnual Premium: $2,340\nCash Surrender Value: $38,200\nPaid-Up Additions: $12,400\nDividend Option: Paid-Up Additions\nPolicy Anniversary: April 15, 2026\nBeneficiary: Robert Martin (100%)\nLoan Balance: $0\nGuaranteed Death Benefit: $250,000\nNon-Guaranteed Death Benefit: $274,600',
        },
      ],
      aiAnalysis:
        'This is a whole life renewal showing healthy cash value accumulation ($38,200). The non-guaranteed death benefit of $274,600 exceeds the face amount due to paid-up additions, which is positive. However, the Martins have a $250K life insurance shortage per person. Consider recommending a supplemental term policy rather than increasing this whole life premium.',
      aiDraftResponse:
        `Hi Robert,\n\nGreat question — I reviewed the renewal notice. Here's the quick summary:\n\n• Patricia's policy is performing well with $38,200 in cash value\n• The paid-up additions are growing the effective death benefit to ~$274,600\n• No loan balance, which is good\n\nHowever, based on our last review, both you and Patricia are about $250K short on life insurance coverage. Rather than increasing this whole life policy (which has higher premiums), I'd recommend we look at a 10-year term policy to bridge the gap until retirement when your coverage needs will decrease.\n\nWant to set up a call this week to discuss options?\n\nBest,\nAlanna`,
      status: 'sent',
    },
    {
      id: 'msg-1-2',
      senderId: 'adv-1',
      senderName: 'Alanna Shepherd',
      senderType: 'advisor',
      content:
        `Hi Robert,\n\nGreat question — I reviewed the renewal notice. Here's the quick summary:\n\n• Patricia's policy is performing well with $38,200 in cash value\n• The paid-up additions are growing the effective death benefit to ~$274,600\n• No loan balance, which is good\n\nHowever, based on our last review, both you and Patricia are about $250K short on life insurance coverage. Rather than increasing this whole life policy (which has higher premiums), I'd recommend we look at a 10-year term policy to bridge the gap until retirement when your coverage needs will decrease.\n\nWant to set up a call this week to discuss options?\n\nBest,\nAlanna`,
      timestamp: '2026-02-25T16:45:00Z',
      status: 'sent',
    },
    {
      id: 'msg-1-3',
      senderId: 'c1-1',
      senderName: 'Robert Martin',
      senderType: 'client',
      content:
        `Thanks Alanna, that makes a lot of sense. A 10-year term would line up perfectly with our retirement timeline. Let's set up that call — any availability Thursday afternoon? Also, Patricia wanted me to ask about our IRA contribution deadline for this tax year.`,
      timestamp: '2026-02-26T09:15:00Z',
      status: 'sent',
    },
  ],

  // ── Documents ──
  documents: [
    {
      id: 'doc-1-1',
      name: 'WL_Policy_Renewal_LIF-110487.pdf',
      type: 'application/pdf',
      classification: 'Insurance',
      uploadedAt: '2026-02-25T14:22:00Z',
      uploadedBy: 'Robert Martin',
      aiSummary:
        'Whole life policy renewal for Patricia Martin. Face amount $250K, cash value $38,200, non-guaranteed death benefit $274,600 due to paid-up additions. Policy in good standing with no outstanding loans.',
      size: '284 KB',
    },
    {
      id: 'doc-1-2',
      name: 'Martin_Joint_Tax_Return_2025.pdf',
      type: 'application/pdf',
      classification: 'Tax',
      uploadedAt: '2026-02-15T10:00:00Z',
      uploadedBy: 'Robert Martin',
      aiSummary:
        'Joint federal return for 2025. AGI $224,800. Total tax $53,450. Standard deduction elected. Includes W-2 income from Raytheon ($135K) and Northwestern ($95K), plus interest/dividend income.',
      size: '1.2 MB',
    },
    {
      id: 'doc-1-3',
      name: 'Martin_Will_2021.pdf',
      type: 'application/pdf',
      classification: 'Estate',
      uploadedAt: '2021-04-10T00:00:00Z',
      uploadedBy: 'Alanna Shepherd',
      aiSummary:
        'Last will and testament for Robert and Patricia Martin, dated April 2021. Designates spouse as primary beneficiary with children Emily and James as contingent. Review overdue — last reviewed over 4 years ago.',
      size: '520 KB',
    },
    {
      id: 'doc-1-4',
      name: 'Fidelity_401k_Q4_2025_Statement.pdf',
      type: 'application/pdf',
      classification: 'Investment',
      uploadedAt: '2026-01-15T08:00:00Z',
      uploadedBy: 'System (Auto-Import)',
      aiSummary:
        'Q4 2025 statement for Robert Martin 401(k) at Fidelity. Ending balance $487,000. Contributions $5,400 (employee) + $2,700 (employer). Growth 8.2% YTD. Allocation: 60% equities / 30% bonds / 10% stable value.',
      size: '890 KB',
    },
  ],

  // ── Life Signals ──
  signals: [
    {
      id: 'sig-1-1',
      householdId: 'h1',
      clientName: 'Robert & Patricia Martin',
      type: 'warning',
      category: 'Cash Reserve',
      title: 'Cash reserve below 6-month target',
      description:
        'Current cash reserves ($87,000) are $1,800 short of the 6-month expense target ($88,800). While close, any unexpected expense could create a shortfall.',
      suggestedAction:
        `Recommend directing next month's discretionary savings to high-yield savings to close the gap.`,
      source: 'Account Aggregation',
      triggeredAt: '2026-02-20T09:00:00Z',
      status: 'active',
    },
    {
      id: 'sig-1-2',
      householdId: 'h1',
      clientName: 'Robert Martin',
      type: 'info',
      category: 'Tax Planning',
      title: 'IRA contribution deadline approaching',
      description:
        'The deadline for 2025 IRA contributions is April 15, 2026. Robert has room for an additional $7,000 contribution to his Traditional IRA. Patricia can contribute $7,000 to her Roth IRA.',
      suggestedAction:
        'Reach out to the Martins about maximizing IRA contributions before the April 15 deadline.',
      source: 'Tax Calendar',
      triggeredAt: '2026-02-15T08:00:00Z',
      status: 'active',
    },
    {
      id: 'sig-1-3',
      householdId: 'h1',
      clientName: 'Robert & Patricia Martin',
      type: 'critical',
      category: 'Estate Planning',
      title: 'Estate documents not reviewed in 4+ years',
      description:
        'Wills and powers of attorney were last reviewed in April 2021 — nearly 5 years ago. Healthcare directives and revocable living trust remain incomplete. Changes in tax law and family circumstances may require updates.',
      suggestedAction:
        'Schedule estate planning review and recommend establishing healthcare directives and a revocable living trust.',
      source: 'Document Review',
      triggeredAt: '2026-02-01T08:00:00Z',
      status: 'active',
    },
  ],

  // ── Tasks ──
  tasks: [
    {
      id: 'task-1-1',
      title: 'Schedule estate planning review',
      description:
        "Coordinate with the Martins' estate attorney to review and update wills, POAs, and establish healthcare directives.",
      assignedTo: 'Alanna Shepherd',
      dueDate: '2026-03-15',
      status: 'pending',
      priority: 'high',
    },
    {
      id: 'task-1-2',
      title: 'Prepare 10-year term life quotes',
      description:
        'Obtain quotes for $250K 10-year term policies for both Robert and Patricia to close the life insurance gap.',
      assignedTo: 'Alanna Shepherd',
      dueDate: '2026-03-07',
      status: 'in-progress',
      priority: 'medium',
    },
  ],

  // ── Meetings ──
  meetings: [
    {
      id: 'mtg-1-1',
      householdId: 'h1',
      householdName: 'The Martins',
      type: 'quarterly-check-in',
      date: '2026-03-06',
      time: '2:00 PM',
      status: 'scheduled',
      aiPrep:
        'Key discussion items: (1) Cash reserve shortfall — only $1,800 away from target, quick fix. (2) Life insurance gap — present 10-year term quotes. (3) Estate document review — wills are 5 years old, need healthcare directives. (4) IRA contribution deadline April 15 — both have room to contribute. (5) Retirement projections — currently 63.7% funded, discuss increasing contribution rates.',
    },
  ],
};

// ─── Household 2 — Marcus Chen ──────────────────────────────────────────────

const chenHousehold: Household = {
  id: 'h2',
  name: 'Marcus Chen',
  status: 'prospect',
  advisorId: 'adv-1',
  createdAt: '2026-01-20T00:00:00Z',
  clients: [
    {
      id: 'c2-1',
      firstName: 'Marcus',
      lastName: 'Chen',
      email: 'marcus.chen@protonmail.com',
      phone: '(415) 555-0237',
      dateOfBirth: '1995-01-12',
      retirementAge: 60,
      riskTolerance: 'aggressive',
      occupation: 'Senior Software Engineer',
      employer: 'Stripe',
    },
  ],

  financialPlan: {
    householdId: 'h2',
    lastUpdated: '2026-02-18T00:00:00Z',
    healthScore: 45,

    netWorth: {
      totalAssets: 322_000,
      totalLiabilities: 42_000,
      netWorth: 280_000,
      history: [
        { year: 2022, value: 62_000 },
        { year: 2023, value: 118_000 },
        { year: 2024, value: 185_000 },
        { year: 2025, value: 240_000 },
        { year: 2026, value: 280_000 },
      ],
      assets: [
        { category: 'Retirement Accounts', amount: 148_000 },
        { category: 'Brokerage', amount: 72_000 },
        { category: 'Cash & Equivalents', amount: 45_000 },
        { category: 'Cryptocurrency', amount: 35_000 },
        { category: 'Other (Vehicles)', amount: 22_000 },
      ],
      liabilities: [{ category: 'Student Loans', amount: 42_000 }],
    },

    cashReserve: {
      currentReserve: 45_000,
      monthlyExpenses: 6_800,
      targetMonths: 6,
      goal: 40_800,
      shortage: 0,
    },

    discretionaryIncome: {
      grossIncome: 185_000,
      taxes: 48_100,
      fixedExpenses: 42_000,
      variableExpenses: 18_600,
      totalOutflows: 108_700,
      discretionary: 76_300,
      savingsRate: 41.2,
    },

    disabilityInsurance: {
      policies: [],
      suggestedCoverage: [{ person: 'Marcus Chen', amount: 11_100 }],
      currentCoverage: [{ person: 'Marcus Chen', amount: 0 }],
      shortage: [{ person: 'Marcus Chen', amount: 11_100 }],
    },

    lifeInsurance: {
      policies: [],
      suggestedCoverage: [{ person: 'Marcus Chen', amount: 500_000 }],
      currentCoverage: [{ person: 'Marcus Chen', amount: 0 }],
      shortage: [{ person: 'Marcus Chen', amount: 500_000 }],
    },

    longTermCare: {
      policies: [],
      suggestedCoverage: [{ person: 'Marcus Chen', amount: 0 }],
      currentCoverage: [{ person: 'Marcus Chen', amount: 0 }],
      shortage: [{ person: 'Marcus Chen', amount: 0 }],
    },

    retirementAssets: {
      accounts: [
        {
          id: 'ret-2-1',
          name: 'Marcus 401(k) — Stripe',
          type: '401k',
          balance: 148_000,
          contributionRate: 15,
          employerMatch: 6,
        },
      ],
      totalEarmarked: 148_000,
      retirementGoal: 3_200_000,
      shortage: 3_052_000,
      percentFunded: 4.6,
      projectedAge: 60,
    },

    estatePlanning: {
      totalEstateValue: 322_000,
      documents: [
        { name: 'Will', completed: false },
        { name: 'Power of Attorney', completed: false },
        { name: 'Healthcare Directive', completed: false },
        { name: 'Beneficiary Designations', completed: false },
      ],
      beneficiaries: [],
    },

    assetAllocation: {
      current: [
        { category: 'US Equities', percentage: 55 },
        { category: 'International Equities', percentage: 20 },
        { category: 'Cryptocurrency', percentage: 12 },
        { category: 'Fixed Income', percentage: 5 },
        { category: 'Cash', percentage: 8 },
      ],
      target: [
        { category: 'US Equities', percentage: 50 },
        { category: 'International Equities', percentage: 25 },
        { category: 'Fixed Income', percentage: 10 },
        { category: 'Alternatives', percentage: 10 },
        { category: 'Cash', percentage: 5 },
      ],
    },
  },

  accounts: [
    {
      id: 'acct-2-1',
      institution: 'Fidelity',
      type: 'retirement',
      name: 'Marcus 401(k)',
      balance: 148_000,
      lastRefreshed: '2026-02-28T08:00:00Z',
    },
    {
      id: 'acct-2-2',
      institution: 'Schwab',
      type: 'brokerage',
      name: 'Individual Brokerage',
      balance: 72_000,
      lastRefreshed: '2026-02-28T08:00:00Z',
    },
    {
      id: 'acct-2-3',
      institution: 'Chase',
      type: 'checking',
      name: 'Personal Checking',
      balance: 12_400,
      lastRefreshed: '2026-02-28T14:00:00Z',
    },
  ],

  communications: [
    {
      id: 'msg-2-1',
      senderId: 'c2-1',
      senderName: 'Marcus Chen',
      senderType: 'client',
      content:
        `Hey Alanna, I was referred to you by a colleague at Stripe. I've been managing my own investments but I feel like I'm missing the bigger picture — insurance, tax optimization, estate stuff. I'm doing well income-wise but want to make sure I'm not leaving money on the table. Do you offer a comprehensive financial plan?`,
      timestamp: '2026-01-20T11:30:00Z',
      status: 'sent',
    },
    {
      id: 'msg-2-2',
      senderId: 'adv-1',
      senderName: 'Alanna Shepherd',
      senderType: 'advisor',
      content:
        `Hi Marcus, thanks for reaching out! I'm glad your colleague recommended us. Absolutely — our planning process covers what we call the "Great 8" checkpoints: net worth, cash reserves, discretionary income, disability insurance, life insurance, long-term care, retirement projections, and estate planning.\n\nFrom a quick look at what you've shared, there are some immediate opportunities — especially around disability coverage and tax-advantaged accounts. I'd love to set up an initial consultation to walk through everything.\n\nWould next Tuesday at 10am work for a 45-minute Zoom call?`,
      timestamp: '2026-01-20T14:15:00Z',
      status: 'sent',
    },
  ],

  documents: [
    {
      id: 'doc-2-1',
      name: 'Chen_Stripe_W2_2025.pdf',
      type: 'application/pdf',
      classification: 'Tax',
      uploadedAt: '2026-02-01T09:00:00Z',
      uploadedBy: 'Marcus Chen',
      aiSummary:
        'W-2 for Marcus Chen from Stripe, Inc. Gross compensation $185,000 including RSUs. Federal withholding $38,200. 401(k) deferrals $22,500.',
      size: '156 KB',
    },
  ],

  signals: [
    {
      id: 'sig-2-1',
      householdId: 'h2',
      clientName: 'Marcus Chen',
      type: 'critical',
      category: 'Disability Insurance',
      title: 'No disability insurance coverage',
      description:
        'Marcus has no disability insurance outside of any basic employer coverage. As a single earner with $42K in student loans, a disability event would be financially devastating. His monthly income of $15,400 is entirely at risk.',
      suggestedAction:
        'Recommend an individual long-term disability policy covering 60% of income ($11,100/month) with a 90-day waiting period.',
      source: 'Insurance Review',
      triggeredAt: '2026-02-18T08:00:00Z',
      status: 'active',
    },
    {
      id: 'sig-2-2',
      householdId: 'h2',
      clientName: 'Marcus Chen',
      type: 'warning',
      category: 'Estate Planning',
      title: 'No estate planning documents in place',
      description:
        'Marcus has no will, power of attorney, healthcare directive, or beneficiary designations on file. Without these, state intestacy laws would govern asset distribution and no one is designated for medical or financial decisions.',
      suggestedAction:
        'Recommend establishing basic estate documents: will, durable POA, healthcare directive, and updating beneficiary designations on all accounts.',
      source: 'Document Review',
      triggeredAt: '2026-02-18T08:00:00Z',
      status: 'active',
    },
  ],

  tasks: [
    {
      id: 'task-2-1',
      title: 'Prepare initial financial plan for Marcus Chen',
      description:
        'Complete Great 8 analysis and build initial financial plan presentation for the follow-up consultation.',
      assignedTo: 'Alanna Shepherd',
      dueDate: '2026-03-10',
      status: 'in-progress',
      priority: 'high',
    },
  ],

  meetings: [
    {
      id: 'mtg-2-1',
      householdId: 'h2',
      householdName: 'Marcus Chen',
      type: 'initial-consultation',
      date: '2026-03-12',
      time: '10:00 AM',
      status: 'scheduled',
      aiPrep:
        'Key discussion items: (1) Introduce the Great 8 framework — Marcus is unfamiliar. (2) Critical gap: no disability insurance — single earner with student debt. (3) No estate documents — start with basics. (4) Asset allocation: 12% crypto is high risk — discuss diversification. (5) Strong savings rate (41%) — leverage for accelerated retirement funding. (6) Review Stripe RSU vesting schedule and tax implications.',
    },
  ],
};

// ─── Household 3 — Eleanor Voss ─────────────────────────────────────────────

const vossHousehold: Household = {
  id: 'h3',
  name: 'Eleanor Voss',
  status: 'active',
  advisorId: 'adv-1',
  createdAt: '2015-09-01T00:00:00Z',
  clients: [
    {
      id: 'c3-1',
      firstName: 'Eleanor',
      lastName: 'Voss',
      email: 'eleanor.voss@gmail.com',
      phone: '(617) 555-0384',
      dateOfBirth: '1959-06-22',
      retirementAge: 62,
      riskTolerance: 'conservative',
      occupation: 'Retired — Former High School Teacher',
      employer: 'Boston Public Schools (Retired 2021)',
    },
  ],

  financialPlan: {
    householdId: 'h3',
    lastUpdated: '2026-02-05T00:00:00Z',
    healthScore: 88,

    netWorth: {
      totalAssets: 2_135_000,
      totalLiabilities: 0,
      netWorth: 2_135_000,
      history: [
        { year: 2022, value: 1_820_000 },
        { year: 2023, value: 1_910_000 },
        { year: 2024, value: 1_985_000 },
        { year: 2025, value: 2_060_000 },
        { year: 2026, value: 2_135_000 },
      ],
      assets: [
        { category: 'Retirement Accounts', amount: 845_000 },
        { category: 'Brokerage & Trust', amount: 620_000 },
        { category: 'Real Estate (Primary)', amount: 520_000 },
        { category: 'Cash & Equivalents', amount: 105_000 },
        { category: 'Other (Art, Personal)', amount: 45_000 },
      ],
      liabilities: [],
    },

    cashReserve: {
      currentReserve: 105_000,
      monthlyExpenses: 7_200,
      targetMonths: 12,
      goal: 86_400,
      shortage: 0,
    },

    discretionaryIncome: {
      grossIncome: 112_800,
      taxes: 19_200,
      fixedExpenses: 46_800,
      variableExpenses: 21_600,
      totalOutflows: 87_600,
      discretionary: 25_200,
      savingsRate: 22.3,
    },

    disabilityInsurance: {
      policies: [],
      suggestedCoverage: [{ person: 'Eleanor Voss', amount: 0 }],
      currentCoverage: [{ person: 'Eleanor Voss', amount: 0 }],
      shortage: [{ person: 'Eleanor Voss', amount: 0 }],
    },

    lifeInsurance: {
      policies: [
        {
          id: 'ins-3-1',
          type: 'Whole Life (Paid-Up)',
          owner: 'Eleanor Voss',
          policyNumber: 'LIF-334782',
          benefit: 200_000,
          premium: 0,
          premiumFrequency: 'annual',
          beneficiary: 'Katherine Voss-Reilly',
          cashValue: 94_500,
        },
      ],
      suggestedCoverage: [{ person: 'Eleanor Voss', amount: 200_000 }],
      currentCoverage: [{ person: 'Eleanor Voss', amount: 200_000 }],
      shortage: [{ person: 'Eleanor Voss', amount: 0 }],
    },

    longTermCare: {
      policies: [
        {
          id: 'ins-3-2',
          type: 'Long-Term Care (Hybrid)',
          owner: 'Eleanor Voss',
          policyNumber: 'LTC-887123',
          benefit: 6_000,
          premium: 3_800,
          premiumFrequency: 'annual',
          beneficiary: 'N/A',
        },
      ],
      suggestedCoverage: [{ person: 'Eleanor Voss', amount: 6_000 }],
      currentCoverage: [{ person: 'Eleanor Voss', amount: 6_000 }],
      shortage: [{ person: 'Eleanor Voss', amount: 0 }],
    },

    retirementAssets: {
      accounts: [
        {
          id: 'ret-3-1',
          name: 'Eleanor 403(b)',
          type: '401k',
          balance: 412_000,
        },
        {
          id: 'ret-3-2',
          name: 'Eleanor Traditional IRA (Rollover)',
          type: 'ira',
          balance: 285_000,
        },
        {
          id: 'ret-3-3',
          name: 'Eleanor Roth IRA',
          type: 'roth-ira',
          balance: 148_000,
        },
        {
          id: 'ret-3-4',
          name: "MA Teachers' Pension",
          type: 'pension',
          balance: 0,
        },
      ],
      totalEarmarked: 845_000,
      retirementGoal: 800_000,
      shortage: 0,
      percentFunded: 105.6,
      projectedAge: 95,
    },

    estatePlanning: {
      totalEstateValue: 2_135_000,
      documents: [
        { name: 'Will', completed: true, lastReviewed: '2025-06-15' },
        { name: 'Revocable Living Trust', completed: true, lastReviewed: '2025-06-15' },
        { name: 'Power of Attorney', completed: true, lastReviewed: '2025-06-15' },
        { name: 'Healthcare Directive', completed: true, lastReviewed: '2025-06-15' },
        { name: 'Beneficiary Designations', completed: true, lastReviewed: '2025-06-15' },
      ],
      beneficiaries: [
        { name: 'Katherine Voss-Reilly', relationship: 'Daughter', percentage: 50 },
        { name: 'Thomas Voss', relationship: 'Son', percentage: 50 },
      ],
    },

    assetAllocation: {
      current: [
        { category: 'US Equities', percentage: 25 },
        { category: 'International Equities', percentage: 10 },
        { category: 'Fixed Income', percentage: 45 },
        { category: 'Real Estate', percentage: 8 },
        { category: 'Cash', percentage: 12 },
      ],
      target: [
        { category: 'US Equities', percentage: 25 },
        { category: 'International Equities', percentage: 10 },
        { category: 'Fixed Income', percentage: 45 },
        { category: 'Real Estate', percentage: 8 },
        { category: 'Cash', percentage: 12 },
      ],
    },
  },

  accounts: [
    {
      id: 'acct-3-1',
      institution: 'Vanguard',
      type: 'retirement',
      name: 'Eleanor 403(b)',
      balance: 412_000,
      lastRefreshed: '2026-02-28T08:00:00Z',
    },
    {
      id: 'acct-3-2',
      institution: 'Vanguard',
      type: 'retirement',
      name: 'Traditional IRA (Rollover)',
      balance: 285_000,
      lastRefreshed: '2026-02-28T08:00:00Z',
    },
    {
      id: 'acct-3-3',
      institution: 'Vanguard',
      type: 'retirement',
      name: 'Roth IRA',
      balance: 148_000,
      lastRefreshed: '2026-02-28T08:00:00Z',
    },
    {
      id: 'acct-3-4',
      institution: 'Fidelity',
      type: 'brokerage',
      name: 'Revocable Trust Account',
      balance: 620_000,
      lastRefreshed: '2026-02-28T08:00:00Z',
    },
    {
      id: 'acct-3-5',
      institution: 'Bank of America',
      type: 'checking',
      name: 'Personal Checking',
      balance: 22_300,
      lastRefreshed: '2026-02-28T12:00:00Z',
    },
  ],

  communications: [
    {
      id: 'msg-3-1',
      senderId: 'c3-1',
      senderName: 'Eleanor Voss',
      senderType: 'client',
      content:
        `Good morning Alanna, I received a notice from Vanguard about my Required Minimum Distribution for 2026. The amount seems higher than last year. Is that expected? Also, I wanted to let you know that my daughter Katherine and her husband are expecting their first child in July — I'm going to be a grandmother!`,
      timestamp: '2026-02-20T09:45:00Z',
      status: 'sent',
    },
    {
      id: 'msg-3-2',
      senderId: 'adv-1',
      senderName: 'Alanna Shepherd',
      senderType: 'advisor',
      content:
        `Eleanor, congratulations on the grandchild — how exciting! 🎉\n\nRegarding the RMD: yes, the increase is expected. Your RMD is calculated using your account balance on December 31st of the prior year divided by an IRS life expectancy factor. Since your accounts grew in 2025, the 2026 RMD will be higher. For your Traditional IRA + 403(b), I'm estimating roughly $28,400 for this year.\n\nA few things to consider:\n• We can take the RMD early in the year to get it out of the way\n• A Qualified Charitable Distribution (QCD) could satisfy part of the RMD tax-free if you have any charities in mind\n• The Roth IRA has no RMD — that continues to grow tax-free\n\nWant to discuss this at our next quarterly check-in, or would you like to hop on a quick call this week?`,
      timestamp: '2026-02-20T11:30:00Z',
      status: 'sent',
    },
    {
      id: 'msg-3-3',
      senderId: 'c3-1',
      senderName: 'Eleanor Voss',
      senderType: 'client',
      content:
        `Thank you, Alanna! The QCD idea is wonderful — I've been meaning to make a donation to the Boston Public Library Foundation. Could we direct $5,000 of the RMD there? Let's cover the rest at our quarterly meeting. Also, with the baby coming, I've been thinking about setting up a 529 plan for the grandchild. Is that something you can help with?`,
      timestamp: '2026-02-21T08:15:00Z',
      status: 'sent',
    },
    {
      id: 'msg-3-4',
      senderId: 'adv-1',
      senderName: 'Alanna Shepherd',
      senderType: 'advisor',
      content:
        `Absolutely — a QCD to the Boston Public Library Foundation is a great use of that. I'll coordinate with Vanguard to set that up.\n\nAnd yes, I'd love to help with a 529 plan! Massachusetts offers the U.Fund through Fidelity with good in-state tax benefits. I'll put together some options for our meeting — we can compare the MA plan vs. other top-rated state plans.\n\nI've added both items to our agenda for March 20th. See you then!`,
      timestamp: '2026-02-21T10:00:00Z',
      status: 'sent',
    },
  ],

  documents: [
    {
      id: 'doc-3-1',
      name: 'Voss_RMD_Notice_2026.pdf',
      type: 'application/pdf',
      classification: 'Tax',
      uploadedAt: '2026-02-20T09:45:00Z',
      uploadedBy: 'Eleanor Voss',
      aiSummary:
        'Vanguard RMD notice for Eleanor Voss. Estimated 2026 RMD of $28,400 across Traditional IRA ($16,100) and 403(b) ($12,300). Deadline December 31, 2026.',
      size: '210 KB',
    },
    {
      id: 'doc-3-2',
      name: 'Voss_Trust_Agreement_2025.pdf',
      type: 'application/pdf',
      classification: 'Estate',
      uploadedAt: '2025-06-15T00:00:00Z',
      uploadedBy: 'Alanna Shepherd',
      aiSummary:
        'Revocable living trust for Eleanor Voss. Assets held in trust include brokerage account ($620K) and primary residence ($520K). Successor trustee: Katherine Voss-Reilly. Equal distribution to Katherine and Thomas upon Eleanor\'s passing.',
      size: '1.4 MB',
    },
    {
      id: 'doc-3-3',
      name: 'Voss_LTC_Policy_LTC-887123.pdf',
      type: 'application/pdf',
      classification: 'Insurance',
      uploadedAt: '2024-03-10T00:00:00Z',
      uploadedBy: 'Alanna Shepherd',
      aiSummary:
        'Hybrid long-term care policy for Eleanor Voss. Monthly benefit $6,000, benefit period 4 years, 90-day elimination period. Annual premium $3,800. Includes death benefit rider.',
      size: '340 KB',
    },
  ],

  signals: [
    {
      id: 'sig-3-1',
      householdId: 'h3',
      clientName: 'Eleanor Voss',
      type: 'info',
      category: 'Tax Planning',
      title: 'RMD deadline — December 31, 2026',
      description:
        `Eleanor's estimated 2026 RMD is $28,400 across her Traditional IRA and 403(b). She has expressed interest in a $5,000 QCD to the Boston Public Library Foundation. Remaining $23,400 will be distributed as ordinary income.`,
      suggestedAction:
        'Coordinate QCD with Vanguard and plan distribution timing for optimal tax efficiency. Consider spreading across Q1 and Q3.',
      source: 'Tax Calendar',
      triggeredAt: '2026-02-20T08:00:00Z',
      status: 'active',
    },
    {
      id: 'sig-3-2',
      householdId: 'h3',
      clientName: 'Eleanor Voss',
      type: 'info',
      category: 'Tax Planning',
      title: 'Property tax payment due — Q1 2026',
      description:
        `Estimated property tax of $6,840 due for Eleanor's primary residence in Brookline, MA. Payment deadline March 31, 2026.`,
      suggestedAction:
        'Remind Eleanor of the upcoming property tax deadline and confirm payment from checking account.',
      source: 'Public Records',
      triggeredAt: '2026-02-25T08:00:00Z',
      status: 'active',
    },
  ],

  tasks: [
    {
      id: 'task-3-1',
      title: 'Set up QCD to Boston Public Library Foundation',
      description:
        `Coordinate with Vanguard to execute a $5,000 Qualified Charitable Distribution from Eleanor's Traditional IRA to the Boston Public Library Foundation.`,
      assignedTo: 'Alanna Shepherd',
      dueDate: '2026-03-15',
      status: 'pending',
      priority: 'medium',
    },
  ],

  meetings: [
    {
      id: 'mtg-3-1',
      householdId: 'h3',
      householdName: 'Eleanor Voss',
      type: 'annual-review',
      date: '2025-12-18',
      time: '10:00 AM',
      status: 'completed',
      notes:
        'Reviewed 2025 performance — portfolio up 3.8% in line with conservative allocation. Estate documents updated in June. LTC policy renewed. Discussed Roth conversion strategy for 2026. Eleanor comfortable with current allocation. No major changes needed.',
    },
    {
      id: 'mtg-3-2',
      householdId: 'h3',
      householdName: 'Eleanor Voss',
      type: 'quarterly-check-in',
      date: '2026-03-20',
      time: '10:00 AM',
      status: 'scheduled',
      aiPrep:
        'Key discussion items: (1) RMD strategy for 2026 — $28,400 total, $5,000 via QCD to Boston Public Library Foundation. (2) 529 plan options for new grandchild — compare MA U.Fund vs. other states. (3) Property tax due March 31. (4) Review Q1 portfolio performance. (5) Discuss Roth conversion tranche for 2026 — staying within 22% bracket.',
    },
  ],
};

// ─── Exports ────────────────────────────────────────────────────────────────

export const mockHouseholds: Household[] = [
  martinHousehold,
  chenHousehold,
  vossHousehold,
];

export function getHousehold(id: string): Household | undefined {
  return mockHouseholds.find((h) => h.id === id);
}

export function getAllSignals(): LifeSignal[] {
  return mockHouseholds
    .flatMap((h) => h.signals)
    .sort(
      (a, b) =>
        new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime(),
    );
}
