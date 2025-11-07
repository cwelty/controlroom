import { NextRequest, NextResponse } from 'next/server';
import { reorderTemplates } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template_ids } = body;

    if (!Array.isArray(template_ids) || template_ids.length === 0) {
      return NextResponse.json(
        { error: 'template_ids must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate that all items are numbers
    if (!template_ids.every(id => typeof id === 'number' && !isNaN(id))) {
      return NextResponse.json(
        { error: 'All template IDs must be valid numbers' },
        { status: 400 }
      );
    }

    await reorderTemplates(template_ids);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering templates:', error);
    return NextResponse.json(
      { error: 'Failed to reorder templates' },
      { status: 500 }
    );
  }
}