import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_CONTEXT = `You are the AI engine powering a financial advisory platform built for independent Registered Investment Advisors (RIAs). The advisor using this platform is a CFP® (Certified Financial Planner) who manages client households with a fee-based advisory model.

Key context:
- You are an ASSISTANT to a licensed, human financial advisor — never the advisor yourself
- The advisor has fiduciary duty to act in the client's best interest
- All your outputs will be reviewed and approved by the advisor before reaching any client
- You should be specific with numbers, reference actual data points, and be actionable
- Use the "Great 8" financial planning framework: Net Worth, Cash Reserve, Discretionary Income, Disability Insurance, Life Insurance, Long-Term Care, Retirement Assets, Estate Planning
- Never recommend specific securities, funds, or tickers — keep recommendations at the strategy level
- When discussing insurance, retirement, or estate planning, frame as areas to "review together" rather than giving direct directives
- Use warm but professional language — this is a high-trust relationship`;

export async function analyzeFinancialPlan(planData: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    system: SYSTEM_CONTEXT,
    messages: [{
      role: 'user',
      content: `Perform a comprehensive Great 8 financial plan analysis for this client household.

For EACH of the 8 checkpoints, provide:
1. **Status**: Good / Needs Attention / Critical
2. **Current Position**: Key numbers with context (don't just repeat — interpret)
3. **Gap Analysis**: Specific shortfall in dollars or percentages, with what "good" looks like
4. **Recommendation**: One concrete, prioritized action the advisor should discuss with the client

After all 8 checkpoints, provide:

**Overall Financial Health Score**: X/100
Explain the score briefly — what's pulling it up and what's dragging it down.

**Top 3 Priority Actions** (ranked by financial impact):
For each, explain WHY it's the priority and WHAT specifically the advisor should do.

**Risk Flags**:
List anything that represents immediate financial exposure — gaps in coverage, upcoming deadlines, or vulnerabilities that could materially harm the client.

**Positive Progress**:
2-3 things the client is doing right — advisors need to reinforce good behavior in meetings.

Be direct, specific, and reference actual dollar amounts from the data. Format with clear markdown headers and bullet points.

Client Financial Data:
${planData}`
    }],
  });
  return (message.content[0] as { type: 'text'; text: string }).text;
}

export async function analyzeDocument(documentContent: string, clientContext: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: SYSTEM_CONTEXT,
    messages: [{
      role: 'user',
      content: `A client has shared a document with their financial advisor through the platform. Analyze it and prepare two outputs:

## For the Client (plain language)
Write 2-3 paragraphs explaining what this document means in simple terms. Assume the client has no financial background. Cover:
- What is this document and why did they receive it?
- What are the key numbers or terms they should understand?
- Is any action required on their part, and by when?
- How does this relate to their overall financial picture?

## For the Advisor (technical analysis)
Provide a professional analysis that helps the advisor respond effectively:
- **Document Classification**: What type of document is this?
- **Key Data Points**: Extract all financially relevant numbers, dates, and terms
- **Plan Implications**: How does this affect the client's Great 8 checkpoints? Should the living financial plan be updated?
- **Action Items**: What should the advisor do with this information?
- **Draft Response**: Write a 2-3 paragraph response the advisor can review, edit, and send to the client. The tone should be warm, reassuring, and proactive — acknowledge the client's question, explain the key takeaway, and suggest a next step.

Client's Financial Context:
${clientContext}

Document Content:
${documentContent}`
    }],
  });
  return (message.content[0] as { type: 'text'; text: string }).text;
}

export async function draftResponse(clientMessage: string, clientContext: string, advisorKnowledge: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: SYSTEM_CONTEXT,
    messages: [{
      role: 'user',
      content: `Draft a response on behalf of the financial advisor to their client's message. The advisor will review and approve before sending.

Guidelines:
- Match the client's communication style (if they're casual, be warm; if they're formal, be professional)
- Address their specific question or concern directly — don't be vague
- Reference relevant details from their financial plan when it adds value
- If the question touches on investment advice territory, frame as "let's review this together" rather than giving a direct answer
- If any action is needed, clearly state what and by when
- End with a next step — schedule a call, confirm an action, or offer to discuss further
- Keep it to 2-3 paragraphs — advisors are busy, clients don't want to read essays
- Sign off warmly (e.g., "Best," or "Talk soon,") followed by the advisor's first name

Client's Message:
"${clientMessage}"

Client's Financial Context:
${clientContext}

Advisor's Communication Style:
${advisorKnowledge}

Write the response the advisor would send:`
    }],
  });
  return (message.content[0] as { type: 'text'; text: string }).text;
}

export async function chatWithPlan(userQuestion: string, planContext: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: `${SYSTEM_CONTEXT}

You are now in "Plan Chat" mode. The advisor is looking at a specific client's financial plan and asking you questions about it. You have full access to the client's financial data.

When answering:
- Reference specific numbers from the plan data
- If asked "what should we do about X", provide 2-3 actionable options with pros/cons
- If asked about projections, use reasonable assumptions (e.g., 7% average annual return, 3% inflation) and state them
- If asked about tax implications, provide general guidance but recommend confirming with a CPA
- Be conversational but substantive — the advisor is using this to prepare, not to read a textbook
- Keep responses focused and concise — 2-4 paragraphs max unless the question requires depth`,
    messages: [{
      role: 'user',
      content: `Client Financial Plan Data:
${planContext}

Advisor's Question:
${userQuestion}`
    }],
  });
  return (message.content[0] as { type: 'text'; text: string }).text;
}

export async function generateMeetingPrep(clientData: string, meetingType: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are preparing a financial advisor for a ${meetingType} meeting with their client.

Based on the client data below, generate:

1. **Suggested Agenda** (5-7 items with time estimates)
2. **Key Talking Points** (what changed, what needs attention, positive progress to highlight)
3. **Risk Flags** (anything the advisor should address proactively)
4. **Recommended Discussion Topics** (based on life signals and plan gaps)
5. **Meeting Notes Template** (pre-filled with client context, blank spaces for advisor notes)

Be specific to this client's situation. Reference actual numbers from their data.

Client Data:
${clientData}`
    }],
  });
  return (message.content[0] as { type: 'text'; text: string }).text;
}
