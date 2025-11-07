import { NextRequest, NextResponse } from 'next/server';
import { updateTemplate, deleteTemplate } from '@/lib/db';
import { isValidHotkey } from '@/lib/utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const templateId = parseInt(id);
    const body = await request.json();

    if (isNaN(templateId)) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    const { name, title_template, tags, hotkey, default_placeholder, sort_order } = body;

    // Validate hotkey if provided
    if (hotkey !== undefined && hotkey !== null && !isValidHotkey(hotkey)) {
      return NextResponse.json(
        { error: 'Hotkey must be a single alphanumeric character' },
        { status: 400 }
      );
    }

    const updateData: { 
      id: number; 
      name?: string; 
      title_template?: string; 
      tags?: string[]; 
      hotkey?: string; 
      default_placeholder?: string;
      sort_order?: number; 
    } = { id: templateId };
    
    if (name !== undefined) updateData.name = name.trim();
    if (title_template !== undefined) updateData.title_template = title_template.trim();
    if (tags !== undefined) updateData.tags = tags;
    if (hotkey !== undefined) updateData.hotkey = hotkey;
    if (default_placeholder !== undefined) updateData.default_placeholder = default_placeholder;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    const updatedTemplate = await updateTemplate(updateData);

    if (!updatedTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    const deletedTemplate = await deleteTemplate(templateId);

    if (!deletedTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(deletedTemplate);
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}