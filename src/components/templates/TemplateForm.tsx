'use client';

import { useState } from 'react';
import { Save, Eye, FileText, Hash } from 'lucide-react';
import { Template } from '@/lib/db';
import { HotkeyInput } from '@/components/ui/HotkeyInput';
import { TagInput } from '@/components/ui/TagInput';

interface TemplateFormProps {
  template?: Template | null;
  existingTemplates: Template[];
  onSave: (templateData: TemplateFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface TemplateFormData {
  id?: number;
  name: string;
  title_template: string;
  tags: string[];
  hotkey: string;
  default_placeholder: string;
}

export function TemplateForm({ 
  template, 
  existingTemplates, 
  onSave, 
  onCancel, 
  loading = false 
}: TemplateFormProps) {
  const [formData, setFormData] = useState<TemplateFormData>({
    id: template?.id,
    name: template?.name || '',
    title_template: template?.title_template || '',
    tags: template?.tags || [],
    hotkey: template?.hotkey || '',
    default_placeholder: template?.default_placeholder || '',
  });

  const [errors, setErrors] = useState<Partial<TemplateFormData>>({});
  const [previewTitle, setPreviewTitle] = useState('Sample Task');

  const isEditing = !!template;
  
  // Get existing hotkeys (excluding current template's hotkey)
  const existingHotkeys = existingTemplates
    .filter(t => t.id !== template?.id)
    .map(t => t.hotkey)
    .filter(Boolean) as string[];

  // Get existing names (excluding current template's name)
  const existingNames = existingTemplates
    .filter(t => t.id !== template?.id)
    .map(t => t.name.toLowerCase());

  const validateForm = (): boolean => {
    const newErrors: Partial<TemplateFormData> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Template name must be 50 characters or less';
    } else if (existingNames.includes(formData.name.trim().toLowerCase())) {
      newErrors.name = 'Template name already exists';
    }

    // Title template validation
    if (!formData.title_template.trim()) {
      newErrors.title_template = 'Title template is required';
    } else if (!formData.title_template.includes('{title}')) {
      newErrors.title_template = 'Title template must include {title} placeholder';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        name: formData.name.trim(),
        title_template: formData.title_template.trim(),
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        handleSubmit(e as any);
      }
    }
  };

  const updateField = (field: keyof TemplateFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getPreviewTitle = () => {
    try {
      const placeholderValue = formData.default_placeholder || previewTitle;
      return formData.title_template.replace(/\{title\}/g, placeholderValue);
    } catch {
      return formData.title_template;
    }
  };

  const hasChanges = () => {
    if (!template) return formData.name || formData.title_template || formData.tags.length > 0 || formData.hotkey || formData.default_placeholder;
    return (
      formData.name !== template.name ||
      formData.title_template !== template.title_template ||
      JSON.stringify(formData.tags) !== JSON.stringify(template.tags) ||
      formData.hotkey !== (template.hotkey || '') ||
      formData.default_placeholder !== (template.default_placeholder || '')
    );
  };

  return (
    <div className="p-6" onKeyDown={handleKeyDown} tabIndex={-1}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Name */}
        <div>
          <label className="block text-sm font-medium text-neon-cyan mb-2">
            <FileText size={16} className="inline mr-2" />
            Template Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g., Bug Report, Feature Request"
            className={`input-neon w-full py-2 ${errors.name ? 'field-error' : formData.name ? 'field-success' : ''}`}
            disabled={loading}
            maxLength={50}
          />
          {errors.name && (
            <div className="text-red-400 text-xs mt-1">{errors.name}</div>
          )}
          <div className="text-neon-cyan/60 text-xs mt-1">
            {formData.name.length}/50 characters
          </div>
        </div>

        {/* Title Template */}
        <div>
          <label className="block text-sm font-medium text-neon-cyan mb-2">
            <Hash size={16} className="inline mr-2" />
            Title Template *
          </label>
          <input
            type="text"
            value={formData.title_template}
            onChange={(e) => updateField('title_template', e.target.value)}
            placeholder="e.g., Bug: {title}, Feature: {title}"
            className={`input-neon w-full py-2 ${errors.title_template ? 'field-error' : formData.title_template.includes('{title}') ? 'field-success' : ''}`}
            disabled={loading}
          />
          {errors.title_template && (
            <div className="text-red-400 text-xs mt-1">{errors.title_template}</div>
          )}
          <div className="text-neon-cyan/60 text-xs mt-1">
            Use {'{title}'} as placeholder for the actual task title
          </div>
        </div>

        {/* Default Placeholder */}
        <div>
          <label className="block text-sm font-medium text-neon-cyan mb-2">
            <Hash size={16} className="inline mr-2" />
            Default Placeholder (Optional)
          </label>
          <input
            type="text"
            value={formData.default_placeholder}
            onChange={(e) => updateField('default_placeholder', e.target.value)}
            placeholder="e.g., fix issue with login, implement user dashboard"
            className="input-neon w-full py-2"
            disabled={loading}
          />
          <div className="text-neon-cyan/60 text-xs mt-1">
            Default text to replace {'{title}'} when template is applied (users can still edit it)
          </div>
        </div>

        {/* Preview */}
        {formData.title_template && (
          <div className="bg-background-primary/30 border border-neon-cyan/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={16} className="text-neon-blue" />
              <span className="text-sm font-medium text-neon-blue">Preview</span>
            </div>
            <div className="space-y-2">
              {!formData.default_placeholder && (
                <input
                  type="text"
                  value={previewTitle}
                  onChange={(e) => setPreviewTitle(e.target.value)}
                  placeholder="Enter sample task title"
                  className="input-neon w-full py-1 text-sm"
                />
              )}
              <div className="text-neon-cyan font-medium">
                → {getPreviewTitle()}
              </div>
              {formData.default_placeholder && (
                <div className="text-neon-blue/80 text-xs">
                  Using default placeholder: &ldquo;{formData.default_placeholder}&rdquo;
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-neon-cyan mb-2">
            Tags (Optional)
          </label>
          <TagInput
            tags={formData.tags}
            onChange={(tags) => updateField('tags', tags)}
            disabled={loading}
            placeholder="Add default tags for this template"
          />
        </div>

        {/* Hotkey */}
        <div>
          <label className="block text-sm font-medium text-neon-cyan mb-2">
            Hotkey (Optional)
          </label>
          <HotkeyInput
            value={formData.hotkey}
            onChange={(hotkey) => updateField('hotkey', hotkey)}
            existingHotkeys={existingHotkeys}
            disabled={loading}
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neon-cyan/20">
          <button
            type="button"
            onClick={onCancel}
            className="btn-neon px-4 py-2 rounded-lg font-medium transition-all flex-1 order-2 sm:order-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !hasChanges()}
            className="btn-neon px-4 py-2 rounded-lg font-medium transition-all flex-1 disabled:opacity-50 disabled:cursor-not-allowed neon-glow-hover order-1 sm:order-2"
          >
            <Save size={16} className="inline mr-2" />
            {loading ? 'Saving...' : isEditing ? 'Update Template' : 'Create Template'}
          </button>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="text-xs text-neon-cyan/60 text-center pt-2 border-t border-neon-cyan/10">
          <kbd className="bg-neon-cyan/10 px-1 rounded">Ctrl+S</kbd> to save • <kbd className="bg-neon-cyan/10 px-1 rounded">Esc</kbd> to cancel
        </div>
      </form>
    </div>
  );
}