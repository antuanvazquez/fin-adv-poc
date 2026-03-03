import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument, draftResponse, chatWithPlan } from '@/lib/ai';

export async function POST(req: NextRequest) {
  let requestType = 'message';
  try {
    const { type, content, clientContext, advisorKnowledge, mode } = await req.json();
    requestType = type;

    let result: string;
    if (mode === 'plan-chat') {
      result = await chatWithPlan(content, clientContext);
    } else if (type === 'document') {
      result = await analyzeDocument(content, clientContext);
    } else {
      result = await draftResponse(
        content,
        clientContext,
        advisorKnowledge || 'Warm, thorough, and proactive. Uses client\'s first name. Always suggests a concrete next step — whether that\'s a call, a document to review, or a deadline to hit. Signs off as "Alanna".',
      );
    }

    return NextResponse.json({ response: result });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({
      response: requestType === 'document'
        ? "## For the Client\nThis document outlines your current coverage details and any recent changes to your policy. The key items to note are the coverage amounts, deductibles, and any exclusions listed. I'd recommend we schedule a brief call to walk through it together.\n\n## For the Advisor\n**Document Classification**: Insurance/Financial document\n**Action Items**: Review coverage levels against the client's plan targets. Consider whether any changes are needed given their current life stage.\n**Draft Response**: Hi — thanks for sending this over. I've reviewed the document and there are a few things I'd like to walk through with you. The key takeaway is [summarize]. Let's schedule a quick 15-minute call this week to discuss — what works for your schedule?"
        : "Thanks for reaching out — that's a great question and I want to make sure I give you a thorough answer. Let me review your current situation and I'll follow up within 24 hours with a detailed response. In the meantime, if you have any additional documents or context to share, please send them my way.\n\nBest,\nAlanna"
    });
  }
}
