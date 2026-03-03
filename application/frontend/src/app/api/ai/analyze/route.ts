import { NextRequest, NextResponse } from 'next/server';
import { analyzeFinancialPlan } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { planData } = await req.json();
    const analysis = await analyzeFinancialPlan(planData);
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze financial plan', fallback: generateFallbackAnalysis() },
      { status: 200 }
    );
  }
}

function generateFallbackAnalysis(): string {
  return `## Financial Health Score: 72/100

### Net Worth — Good
Current net worth of $1,505,000 shows healthy asset accumulation. Year-over-year growth trend is positive.

### Cash Reserve — Needs Attention
Current reserve of $38,000 covers approximately 3.2 months of expenses. Recommend building to 6-month target of $72,000 ($34,000 shortfall).

### Discretionary Income — Good
$46,220 in annual discretionary income (20% of gross). Healthy savings capacity exists.

### Disability Insurance — Needs Attention
Coverage gaps identified. Recommend reviewing employer-provided benefits and supplemental options.

### Life Insurance — Good
Current coverage appears adequate for household needs.

### Long-Term Care — Needs Attention
Given ages (54 and 52), recommend evaluating LTC coverage options while premiums are manageable.

### Retirement Assets — Needs Attention
$697,000 earmarked vs. $1,000,000 goal (70% funded, $303,000 shortfall). Maximize 401(k) contributions and review investment allocation.

### Estate Planning — Critical
Will and living will in place, but irrevocable trust, revocable trust not completed. Recommend meeting with estate attorney.

### Top 3 Priority Recommendations:
1. Complete estate planning documents (trust, POA updates)
2. Build cash reserve to 6-month target
3. Maximize retirement contributions to close $303K gap

### Risk Flags:
- Estate planning incomplete — significant exposure
- Cash reserve below recommended minimum
- LTC coverage should be evaluated before age 55`;
}
