import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const FALLBACK_STRUCTURED = {
  agenda: [
    { id: '1', title: 'Welcome & Life Updates', minutes: 5, notes: 'Check in on personal and family developments since last meeting' },
    { id: '2', title: 'Financial Health Score Review', minutes: 10, notes: 'Walk through the Great 8 dashboard together — highlight changes' },
    { id: '3', title: 'Net Worth & Cash Reserve Update', minutes: 10, notes: 'Review current positions, year-over-year changes, cash reserve gap' },
    { id: '4', title: 'Retirement Progress & Contributions', minutes: 12, notes: 'Contribution rates, performance, gap analysis, IRA deadline' },
    { id: '5', title: 'Insurance Coverage Review', minutes: 8, notes: 'Disability, life, and LTC assessment — address shortfalls' },
    { id: '6', title: 'Estate Planning Status', minutes: 5, notes: 'Document completion, beneficiary review, attorney referral' },
    { id: '7', title: 'Open Questions & Client Concerns', minutes: 5, notes: 'Address anything on the client\'s mind' },
    { id: '8', title: 'Action Items & Next Steps', minutes: 5, notes: 'Assign tasks with deadlines, schedule follow-up' },
  ],
  talkingPoints: [
    { topic: 'Net Worth Growth', points: ['Year-over-year net worth growth is on a positive trajectory', 'Asset allocation is broadly in line with risk tolerance', 'Real estate represents a concentrated position — worth discussing'] },
    { topic: 'Cash Reserve', points: ['Current reserve is close to but below the 6-month target', 'Recommend routing discretionary savings to high-yield savings first', 'Once reserve is topped off, redirect to retirement contributions'] },
    { topic: 'Retirement Planning', points: ['At 70% funded, there is a gap to close before target retirement age', 'Maximizing 401(k) contributions should be the #1 priority', 'IRA contribution deadline April 15 — act soon'] },
    { topic: 'Estate Planning', points: ['This is the most critical outstanding item — 4+ years since last review', 'Will, POA, and healthcare directives need updating', 'Recommend referral to estate attorney this quarter'] },
  ],
  riskFlags: [
    { severity: 'critical', title: 'Estate documents outdated', detail: 'Last reviewed April 2021. Changes in tax law and family circumstances likely require updates. Trust documents remain incomplete.' },
    { severity: 'warning', title: 'Cash reserve below 6-month target', detail: 'Currently $87K vs $88.8K target. Any unexpected expense creates a shortfall.' },
    { severity: 'info', title: 'IRA contribution deadline April 15', detail: 'Combined $14,000 in IRA contributions still available for tax year 2025.' },
  ],
  discussionStarters: [
    'Have there been any significant life changes since we last met — health, family, career, or housing?',
    'How are you feeling about your retirement timeline? Has anything made you reconsider the target age?',
    'Are there any large purchases or expenses on the horizon in the next 12–18 months we should plan for?',
    'Is there anything about your current insurance coverage that concerns you or that you\'d like to revisit?',
    'How has your relationship with your money felt lately — are you sleeping well at night?',
  ],
  clientInsights: '',
};

export async function POST(req: NextRequest) {
  try {
    const { clientData, meetingType } = await req.json();

    const prompt = `You are preparing a financial advisor for a ${meetingType.replace(/-/g, ' ')} meeting with their client.

Client data:
${clientData}

Return a JSON object (no markdown, no explanation, just the JSON) with exactly this structure:
{
  "agenda": [
    { "id": "1", "title": "...", "minutes": 10, "notes": "specific talking note for this item based on client data" }
  ],
  "talkingPoints": [
    { "topic": "Topic Name", "points": ["specific point 1", "specific point 2"] }
  ],
  "riskFlags": [
    { "severity": "critical|warning|info", "title": "...", "detail": "specific detail referencing client numbers" }
  ],
  "discussionStarters": ["question 1", "question 2"],
  "clientInsights": "2-3 sentence personalized insight about this client's situation and what makes this meeting particularly important"
}

Requirements:
- agenda: 6-8 items, each with a realistic time allocation. Total should equal ~60 minutes for annual review, ~30 for quarterly, ~45 for initial consultation. Include specific notes grounded in the client's actual data.
- talkingPoints: 3-5 topics, each with 2-4 specific bullet points using real numbers from the client's financial plan
- riskFlags: 2-5 flags ordered by severity, using actual figures from the data
- discussionStarters: 4-6 open-ended questions tailored to this client's specific situation
- clientInsights: personalized, specific to this client

Be specific. Reference actual dollar amounts, percentages, and dates from the client data. Do not be generic.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = (message.content[0] as { type: 'text'; text: string }).text;

    // Parse JSON — strip any markdown fences if present
    const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json({ prep: parsed });
  } catch (error) {
    console.error('Meeting prep error:', error);
    return NextResponse.json({ prep: FALLBACK_STRUCTURED });
  }
}
