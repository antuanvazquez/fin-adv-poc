// === Household & Client ===

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  retirementAge: number;
  riskTolerance:
    | 'conservative'
    | 'moderate'
    | 'moderately-aggressive'
    | 'aggressive';
  occupation: string;
  employer: string;
}

export interface Household {
  id: string;
  name: string;
  clients: Client[];
  status: 'prospect' | 'active' | 'inactive';
  advisorId: string;
  createdAt: string;
  financialPlan: FinancialPlan;
  accounts: Account[];
  communications: Message[];
  documents: Document[];
  signals: LifeSignal[];
  tasks: Task[];
  meetings: Meeting[];
}

// === Great 8 Financial Plan ===

export interface FinancialPlan {
  householdId: string;
  lastUpdated: string;
  healthScore: number;
  netWorth: NetWorth;
  cashReserve: CashReserve;
  discretionaryIncome: DiscretionaryIncome;
  disabilityInsurance: InsuranceCoverage;
  lifeInsurance: InsuranceCoverage;
  longTermCare: InsuranceCoverage;
  retirementAssets: RetirementAssets;
  estatePlanning: EstatePlanning;
  assetAllocation: AssetAllocation;
}

export interface NetWorth {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  history: { year: number; value: number }[];
  assets: { category: string; amount: number }[];
  liabilities: { category: string; amount: number }[];
}

export interface CashReserve {
  currentReserve: number;
  monthlyExpenses: number;
  targetMonths: number;
  goal: number;
  shortage: number;
}

export interface DiscretionaryIncome {
  grossIncome: number;
  taxes: number;
  fixedExpenses: number;
  variableExpenses: number;
  totalOutflows: number;
  discretionary: number;
  savingsRate: number;
}

export interface InsuranceCoverage {
  policies: InsurancePolicy[];
  suggestedCoverage: { person: string; amount: number }[];
  currentCoverage: { person: string; amount: number }[];
  shortage: { person: string; amount: number }[];
}

export interface InsurancePolicy {
  id: string;
  type: string;
  owner: string;
  policyNumber: string;
  benefit: number;
  premium: number;
  premiumFrequency: 'monthly' | 'quarterly' | 'annual';
  beneficiary: string;
  cashValue?: number;
  waitingPeriod?: string;
}

export interface RetirementAssets {
  accounts: RetirementAccount[];
  totalEarmarked: number;
  retirementGoal: number;
  shortage: number;
  percentFunded: number;
  projectedAge: number;
}

export interface RetirementAccount {
  id: string;
  name: string;
  type: '401k' | 'ira' | 'roth-ira' | 'brokerage' | 'pension' | 'annuity';
  balance: number;
  contributionRate?: number;
  employerMatch?: number;
}

export interface EstatePlanning {
  totalEstateValue: number;
  documents: { name: string; completed: boolean; lastReviewed?: string }[];
  beneficiaries: { name: string; relationship: string; percentage: number }[];
}

export interface AssetAllocation {
  current: { category: string; percentage: number }[];
  target: { category: string; percentage: number }[];
}

// === Accounts ===

export interface Account {
  id: string;
  institution: string;
  type:
    | 'checking'
    | 'savings'
    | 'brokerage'
    | 'retirement'
    | 'credit-card'
    | 'mortgage'
    | 'loan';
  name: string;
  balance: number;
  lastRefreshed: string;
}

// === Communications ===

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'client' | 'advisor' | 'ai-draft';
  content: string;
  timestamp: string;
  attachments?: { name: string; type: string; content: string }[];
  aiAnalysis?: string;
  aiDraftResponse?: string;
  status: 'sent' | 'draft' | 'pending-approval' | 'approved';
}

// === Documents ===

export interface Document {
  id: string;
  name: string;
  type: string;
  classification: string;
  uploadedAt: string;
  uploadedBy: string;
  aiSummary?: string;
  size: string;
}

// === Life Signals ===

export interface LifeSignal {
  id: string;
  householdId: string;
  clientName: string;
  type: 'info' | 'warning' | 'critical';
  category: string;
  title: string;
  description: string;
  suggestedAction: string;
  source: string;
  triggeredAt: string;
  status: 'active' | 'snoozed' | 'dismissed' | 'resolved';
}

// === Tasks ===

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

// === Meetings ===

export interface Meeting {
  id: string;
  householdId: string;
  householdName: string;
  type:
    | 'annual-review'
    | 'quarterly-check-in'
    | 'initial-consultation'
    | 'ad-hoc';
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  aiPrep?: string;
}

// === Advisor ===

export interface Advisor {
  id: string;
  name: string;
  title: string;
  firm: string;
  email: string;
  totalAUM: number;
  clientCount: number;
  prospectCount: number;
}

// === AI Response ===

export interface AIAnalysisResponse {
  summary: string;
  recommendations: string[];
  riskFlags: string[];
  healthScore: number;
  checkpointScores: {
    checkpoint: string;
    score: number;
    status: 'good' | 'warning' | 'critical';
  }[];
}
