import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { buildPlanDocument } from '@/components/pdf/plan-pdf';
import { getHousehold } from '@/lib/mock-data';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const household = getHousehold(id);

  if (!household) {
    return NextResponse.json({ error: 'Household not found' }, { status: 404 });
  }

  try {
    const doc = buildPlanDocument(household);
    const buffer = await renderToBuffer(doc);
    // Convert Node.js Buffer to Uint8Array for the Web API Response
    const uint8 = new Uint8Array(buffer);

    const safeName = household.name.replace(/[^a-zA-Z0-9_-]/g, '_');

    return new Response(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}_Financial_Plan.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 },
    );
  }
}
