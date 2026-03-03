import type { FinancialPlan } from './types';

export function formatCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return amount < 0 ? `-${formatted}` : formatted;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Calculates overall health score from the Great 8 financial plan data.
 *
 * Weights: net worth 15%, cash reserve 15%, discretionary income 10%,
 * disability 10%, life insurance 10%, LTC 10%, retirement 20%, estate 10%.
 */
export function calculateHealthScore(plan: FinancialPlan): number {
  const netWorthScore = scoreNetWorth(plan);
  const cashScore = scoreCashReserve(plan);
  const incomeScore = scoreDiscretionaryIncome(plan);
  const disabilityScore = scoreInsurance(plan.disabilityInsurance);
  const lifeScore = scoreInsurance(plan.lifeInsurance);
  const ltcScore = scoreInsurance(plan.longTermCare);
  const retirementScore = scoreRetirement(plan);
  const estateScore = scoreEstate(plan);

  return Math.round(
    netWorthScore * 0.15 +
      cashScore * 0.15 +
      incomeScore * 0.1 +
      disabilityScore * 0.1 +
      lifeScore * 0.1 +
      ltcScore * 0.1 +
      retirementScore * 0.2 +
      estateScore * 0.1,
  );
}

function scoreNetWorth(plan: FinancialPlan): number {
  const { netWorth, history } = plan.netWorth;
  if (netWorth <= 0) return 10;
  const growing =
    history.length >= 2 && history[history.length - 1].value > history[0].value;
  const base = Math.min(netWorth / 2_000_000, 1) * 80;
  return Math.min(100, base + (growing ? 20 : 0));
}

function scoreCashReserve(plan: FinancialPlan): number {
  const { currentReserve, goal } = plan.cashReserve;
  if (goal <= 0) return 100;
  return Math.min(100, (currentReserve / goal) * 100);
}

function scoreDiscretionaryIncome(plan: FinancialPlan): number {
  const { savingsRate } = plan.discretionaryIncome;
  if (savingsRate >= 25) return 100;
  if (savingsRate >= 15) return 80;
  if (savingsRate >= 10) return 60;
  if (savingsRate >= 5) return 40;
  return 20;
}

function scoreInsurance(
  coverage: FinancialPlan['disabilityInsurance'],
): number {
  const totalShortage = coverage.shortage.reduce((s, c) => s + c.amount, 0);
  const totalSuggested = coverage.suggestedCoverage.reduce(
    (s, c) => s + c.amount,
    0,
  );
  if (totalSuggested === 0) return 100;
  const funded = 1 - totalShortage / totalSuggested;
  return Math.max(0, Math.min(100, Math.round(funded * 100)));
}

function scoreRetirement(plan: FinancialPlan): number {
  const { percentFunded } = plan.retirementAssets;
  return Math.min(100, percentFunded);
}

function scoreEstate(plan: FinancialPlan): number {
  const { documents } = plan.estatePlanning;
  if (documents.length === 0) return 0;
  const completed = documents.filter((d) => d.completed).length;
  return Math.round((completed / documents.length) * 100);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export function getSignalIcon(type: string): string {
  switch (type) {
    case 'critical':
      return 'alert-triangle';
    case 'warning':
      return 'alert-circle';
    case 'info':
      return 'info';
    default:
      return 'bell';
  }
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const then = new Date(dateString);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}
