import { NextRequest, NextResponse } from 'next/server';
import { createTemplate, getTemplates } from '@/lib/db';
import { isValidHotkey } from '@/lib/utils';

export async function GET() {
  try {
    const templates = await getTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, title_template, tags, hotkey, default_placeholder, sort_order } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      );
    }

    if (!title_template || typeof title_template !== 'string') {
      return NextResponse.json(
        { error: 'Title template is required and must be a string' },
        { status: 400 }
      );
    }

    if (hotkey && !isValidHotkey(hotkey)) {
      return NextResponse.json(
        { error: 'Hotkey must be a single alphanumeric character' },
        { status: 400 }
      );
    }

    const template = await createTemplate({
      name: name.trim(),
      title_template: title_template.trim(),
      tags: tags || [],
      hotkey: hotkey || null,
      default_placeholder: default_placeholder || null,
      sort_order: sort_order || 0,
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}