'use client';

import { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { Plus, List, Settings as SettingsIcon } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TemplateForm, TemplateFormData } from './TemplateForm';
import { TemplateListItem } from './TemplateListItem';
import { Template } from '@/lib/db';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  onTemplatesChange: () => void;
  onShowSnackbar: (message: string, options?: { type?: 'success' | 'error' | 'info' }) => void;
}

type ViewMode = 'list' | 'create' | 'edit';

export function TemplateManagerModal({
  isOpen,
  onClose,
  templates,
  onTemplatesChange,
  onShowSnackbar,
}: TemplateManagerModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [draggedTemplate, setDraggedTemplate] = useState<Template | null>(null);
  const [sortedTemplates, setSortedTemplates] = useState<Template[]>(templates);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update sorted templates when templates prop changes
  useEffect(() => {
    setSortedTemplates([...templates].sort((a, b) => a.sort_order - b.sort_order));
  }, [templates]);

  const handleClose = () => {
    if (viewMode !== 'list') {
      setViewMode('list');
      setEditingTemplate(null);
    } else {
      onClose();
    }
  };

  const handleCreateTemplate = () => {
    setViewMode('create');
    setEditingTemplate(null);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setViewMode('edit');
  };

  const handleDeleteTemplate = (template: Template) => {
    setDeleteConfirm(template);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/templates/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onTemplatesChange();
        onShowSnackbar('Template deleted successfully', { type: 'success' });
        setDeleteConfirm(null);
      } else {
        throw new Error('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      onShowSnackbar('Failed to delete template', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (templateData: TemplateFormData) => {
    setLoading(true);
    try {
      const isEditing = !!templateData.id;
      const url = isEditing 
        ? `/api/templates/${templateData.id}`
        : '/api/templates';
      
      const method = isEditing ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateData.name,
          title_template: templateData.title_template,
          tags: templateData.tags,
          hotkey: templateData.hotkey || null,
          default_placeholder: templateData.default_placeholder || null,
          sort_order: isEditing ? editingTemplate?.sort_order : templates.length,
        }),
      });

      if (response.ok) {
        onTemplatesChange();
        onShowSnackbar(
          `Template ${isEditing ? 'updated' : 'created'} successfully`, 
          { type: 'success' }
        );
        setViewMode('list');
        setEditingTemplate(null);
      } else {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} template`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      onShowSnackbar(`Failed to ${templateData.id ? 'update' : 'create'} template`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const template = sortedTemplates.find(t => t.id === active.id);
    setDraggedTemplate(template || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedTemplate(null);

    if (!over || active.id === over.id) return;

    const oldIndex = sortedTemplates.findIndex(t => t.id === active.id);
    const newIndex = sortedTemplates.findIndex(t => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(sortedTemplates, oldIndex, newIndex);
      setSortedTemplates(newOrder);

      // Update sort_order for all templates
      const templateIds = newOrder.map(t => t.id);
      
      try {
        const response = await fetch('/api/templates/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ template_ids: templateIds }),
        });

        if (response.ok) {
          onTemplatesChange();
          onShowSnackbar('Templates reordered successfully', { type: 'success' });
        } else {
          throw new Error('Failed to reorder templates');
        }
      } catch (error) {
        console.error('Error reordering templates:', error);
        onShowSnackbar('Failed to reorder templates', { type: 'error' });
        // Revert the local change
        setSortedTemplates([...templates].sort((a, b) => a.sort_order - b.sort_order));
      }
    }
  };

  const getModalTitle = () => {
    switch (viewMode) {
      case 'create': return 'Create Template';
      case 'edit': return 'Edit Template';
      default: return 'Manage Templates';
    }
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={handleClose} 
        title={getModalTitle()}
        size="xl"
      >
        {viewMode === 'list' && (
          <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
              <div className="flex items-center gap-2 text-neon-cyan/80">
                <List size={16} />
                <span className="text-sm">
                  {sortedTemplates.length} template{sortedTemplates.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={handleCreateTemplate}
                className="btn-neon px-4 py-2 rounded-lg font-medium neon-glow-hover w-full sm:w-auto"
                disabled={loading}
              >
                <Plus size={16} className="inline mr-2" />
                New Template
              </button>
            </div>

            {/* Template List */}
            {sortedTemplates.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedTemplates.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {sortedTemplates.map((template) => (
                      <TemplateListItem
                        key={template.id}
                        template={template}
                        onEdit={handleEditTemplate}
                        onDelete={handleDeleteTemplate}
                        isDragging={draggedTemplate?.id === template.id}
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {draggedTemplate && (
                    <TemplateListItem
                      template={draggedTemplate}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      isDragging
                    />
                  )}
                </DragOverlay>
              </DndContext>
            ) : (
              <div className="text-center py-12 text-neon-cyan/60 grid-scan">
                <SettingsIcon size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No templates yet</p>
                <p className="text-sm mb-6">Create your first template to get started</p>
                <button
                  onClick={handleCreateTemplate}
                  className="btn-neon px-6 py-3 rounded-lg font-medium neon-glow-hover success-bounce"
                >
                  <Plus size={16} className="inline mr-2" />
                  Create First Template
                </button>
              </div>
            )}

            {/* Help Text */}
            {sortedTemplates.length > 1 && (
              <div className="mt-6 p-4 bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg">
                <p className="text-sm text-neon-cyan/80">
                  💡 <strong>Tip:</strong> Drag templates to reorder them. The order here determines the order of hotkey buttons in the admin panel.
                </p>
              </div>
            )}
          </div>
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <TemplateForm
            template={editingTemplate}
            existingTemplates={templates}
            onSave={handleSaveTemplate}
            onCancel={() => setViewMode('list')}
            loading={loading}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Template"
        message={`Are you sure you want to delete the template "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </>
  );
}