'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, Keyboard, Tag, Hash } from 'lucide-react';
import { Template } from '@/lib/db';

interface TemplateListItemProps {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
  isDragging?: boolean;
}

export function TemplateListItem({ template, onEdit, onDelete, isDragging }: TemplateListItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: template.id,
    data: {
      type: 'template',
      template,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(template);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(template);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative bg-background-primary/30 border border-neon-cyan/20 rounded-lg p-4
        template-item-hover cyber-border
        ${isSortableDragging ? 'dragging-item scale-105 z-10' : ''}
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag Handle */}
      <div 
        className={`
          absolute left-2 top-1/2 transform -translate-y-1/2 p-1 rounded
          text-neon-cyan/40 hover:text-neon-cyan transition-colors cursor-grab
          ${isHovered || isSortableDragging ? 'opacity-100' : 'opacity-0'}
        `}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </div>

      {/* Content */}
      <div className="pl-6 pr-16">
        {/* Template Name and Hotkey */}
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-semibold text-neon-cyan">{template.name}</h3>
          {template.hotkey && (
            <div className="flex items-center gap-1 px-2 py-1 bg-neon-cyan/10 border border-neon-cyan/30 rounded text-xs font-mono hotkey-badge">
              <Keyboard size={12} />
              <span className="font-bold">{template.hotkey.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Title Template */}
        <div className="flex items-center gap-2 mb-2 text-sm text-neon-cyan/80">
          <Hash size={14} className="flex-shrink-0" />
          <code className="bg-background-secondary/50 px-2 py-1 rounded font-mono text-xs">
            {template.title_template}
          </code>
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex flex-wrap gap-1">
              {template.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-neon-purple/20 border border-neon-purple/40 rounded-full text-xs tag-item"
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={`
        absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1
        transition-opacity duration-200
        ${isHovered || isSortableDragging ? 'opacity-100' : 'opacity-0'}
      `}>
        <button
          onClick={handleEdit}
          className="p-2 text-neon-cyan/60 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded transition-colors"
          title="Edit template"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
          title="Delete template"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Sort Order Indicator */}
      <div className="absolute top-2 right-2 text-xs text-neon-cyan/40 font-mono">
        #{template.sort_order}
      </div>

      {/* Drag Overlay Effect */}
      {isSortableDragging && (
        <div className="absolute inset-0 border-2 border-neon-cyan/50 rounded-lg pointer-events-none">
          <div className="absolute inset-0 bg-neon-cyan/10 rounded-lg animate-pulse" />
        </div>
      )}
    </div>
  );
}