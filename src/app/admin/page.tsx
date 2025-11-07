'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Settings, Tag, Clock, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Task, Template } from '@/lib/db';
import { formatDateForTimezone } from '@/lib/utils';
import { useSnackbar } from '@/hooks/useSnackbar';
import { SnackbarContainer } from '@/components/ui/Snackbar';
import { TemplateManagerModal } from '@/components/templates/TemplateManagerModal';

export default function AdminPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const { snackbars, addSnackbar, removeSnackbar } = useSnackbar();

  // Load initial data
  const loadTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks?limit=20');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      addSnackbar('Failed to load tasks', { type: 'error' });
    }
  }, [addSnackbar]);

  const loadTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      addSnackbar('Failed to load templates', { type: 'error' });
    }
  }, [addSnackbar]);

  useEffect(() => {
    loadTasks();
    loadTemplates();
  }, [loadTasks, loadTemplates]);

  // Focus input on mount and setup hotkeys
  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle hotkeys when not typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const template = templates.find(t => t.hotkey === e.key);
      if (template) {
        e.preventDefault();
        applyTemplate(template);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [templates]);


  const createTask = async () => {
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          tags,
          template_id: selectedTemplateId,
          is_public: isPublic,
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => [newTask, ...prev.slice(0, 19)]);
        
        // Reset form
        setTitle('');
        setTags([]);
        setTagInput('');
        setSelectedTemplateId(null);
        setIsPublic(true);
        
        inputRef.current?.focus();
        addSnackbar('Task created successfully', { type: 'success' });
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      addSnackbar('Failed to create task', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: number) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        
        addSnackbar('Task deleted', {
          type: 'success',
          onUndo: async () => {
            try {
              const restoreResponse = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: taskToDelete.title,
                  tags: taskToDelete.tags,
                  is_public: taskToDelete.is_public,
                }),
              });
              if (restoreResponse.ok) {
                loadTasks();
                addSnackbar('Task restored', { type: 'success' });
              }
            } catch {
              addSnackbar('Failed to restore task', { type: 'error' });
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      addSnackbar('Failed to delete task', { type: 'error' });
    }
  };

  const toggleTaskVisibility = async (taskId: number, newVisibility: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: newVisibility }),
      });

      if (response.ok) {
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, is_public: newVisibility } : t
        ));
        addSnackbar(`Task ${newVisibility ? 'published' : 'hidden'}`, { type: 'success' });
      }
    } catch (error) {
      console.error('Failed to update task visibility:', error);
      addSnackbar('Failed to update task visibility', { type: 'error' });
    }
  };

  const applyTemplate = (template: Template) => {
    // Replace {title} with default placeholder if available
    let titleValue = template.title_template;
    if (template.default_placeholder) {
      titleValue = template.title_template.replace(/\{title\}/g, template.default_placeholder);
    }
    
    setTitle(titleValue);
    setTags(template.tags);
    setSelectedTemplateId(template.id);
    inputRef.current?.focus();
    
    // Select the placeholder text for easy editing
    setTimeout(() => {
      if (inputRef.current && template.default_placeholder) {
        const placeholderStart = titleValue.indexOf(template.default_placeholder);
        if (placeholderStart !== -1) {
          inputRef.current.setSelectionRange(
            placeholderStart, 
            placeholderStart + template.default_placeholder.length
          );
        }
      } else if (inputRef.current && titleValue.includes('{title}')) {
        // Fallback to original behavior if no default placeholder
        const cursorPos = titleValue.indexOf('{title}');
        if (cursorPos !== -1) {
          inputRef.current.setSelectionRange(cursorPos, cursorPos + 7);
        }
      }
    }, 0);
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !tags.includes(tag)) {
        setTags(prev => [...prev, tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTask();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary to-background-secondary p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold font-orbitron mb-2">Control Room</h1>
          <p className="text-neon-cyan/80 font-exo text-sm md:text-base">Task creation and management center</p>
          <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-neon-cyan to-neon-blue mx-auto mt-4 rounded-full neon-glow"></div>
        </div>

        {/* Quick Add Form */}
        <div className="bg-background-secondary/50 backdrop-blur-sm border border-neon-cyan/20 rounded-lg p-4 md:p-6 neon-glow-hover">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-neon w-full px-4 py-3 rounded-lg text-lg font-medium"
                disabled={loading}
              />
            </div>

            {/* Tags Input */}
            <div className="flex flex-wrap items-center gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-neon-purple/20 border border-neon-purple/40 rounded-full text-sm"
                >
                  <Tag size={12} />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-neon-purple hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyPress}
                className="input-neon flex-1 min-w-32 px-3 py-2 rounded text-sm"
                disabled={loading}
              />
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm font-medium">
                  Public:
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      disabled={loading}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={!title.trim() || loading}
                className="btn-neon px-4 md:px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <Plus size={16} className="inline mr-2" />
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>

        {/* Template Buttons */}
        <div className="bg-background-secondary/30 border border-neon-cyan/20 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <h3 className="text-lg font-semibold font-exo">Quick Templates</h3>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="btn-neon px-3 py-2 rounded text-sm neon-glow-hover w-full sm:w-auto"
            >
              <Settings size={14} className="inline mr-1" />
              Manage
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap gap-2">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className="btn-neon px-4 py-2 rounded-lg text-sm font-medium relative group"
                title={`Hotkey: ${template.hotkey || 'None'}`}
              >
                {template.name}
                {template.hotkey && (
                  <span className="absolute -top-1 -right-1 bg-neon-cyan text-background-primary text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {template.hotkey.toUpperCase()}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-background-secondary/30 border border-neon-cyan/20 rounded-lg p-4 md:p-6">
          <h3 className="text-lg font-semibold font-exo mb-4">Recent Tasks (20)</h3>
          
          <div className="space-y-3">
            {tasks.map(task => (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-background-primary/30 border border-neon-cyan/10 rounded-lg hover:border-neon-cyan/30 transition-colors gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium break-words">{task.title}</span>
                    {!task.is_public && (
                      <span title="Private" className="flex-shrink-0">
                        <EyeOff size={16} className="text-neon-magenta" />
                      </span>
                    )}
                  </div>
                  
                  {task.tags.length > 0 && (
                    <div className="flex gap-1 mb-2">
                      {task.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 bg-neon-purple/20 border border-neon-purple/40 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-neon-cyan/60">
                    <Clock size={12} />
                    {formatDateForTimezone(task.created_at)}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleTaskVisibility(task.id, !task.is_public)}
                    className="p-2 text-neon-cyan/60 hover:text-neon-cyan transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title={task.is_public ? 'Make Private' : 'Make Public'}
                  >
                    {task.is_public ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-red-400/60 hover:text-red-400 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Delete Task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="text-center py-8 text-neon-cyan/60">
                <p>No tasks yet. Create your first task above!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <SnackbarContainer snackbars={snackbars} removeSnackbar={removeSnackbar} />
      
      {/* Template Management Modal */}
      <TemplateManagerModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        templates={templates}
        onTemplatesChange={loadTemplates}
        onShowSnackbar={addSnackbar}
      />
    </div>
  );
}