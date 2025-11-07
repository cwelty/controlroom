'use client';

import { useState, KeyboardEvent } from 'react';
import { Tag, X, Plus } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
}

export function TagInput({ 
  tags, 
  onChange, 
  placeholder = 'Add tags...', 
  maxTags = 10,
  disabled = false 
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const validateTag = (tag: string): string | null => {
    if (!tag.trim()) return 'Tag cannot be empty';
    if (tag.length > 20) return 'Tag must be 20 characters or less';
    if (!/^[a-zA-Z0-9\s-_]+$/.test(tag)) return 'Tag contains invalid characters';
    if (tags.includes(tag.trim().toLowerCase())) return 'Tag already exists';
    if (tags.length >= maxTags) return `Maximum ${maxTags} tags allowed`;
    return null;
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    const validationError = validateTag(trimmedTag);
    
    if (validationError) {
      setError(validationError);
      return false;
    }
    
    onChange([...tags, trimmedTag]);
    setInputValue('');
    setError('');
    return true;
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
    setError('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      e.preventDefault();
      removeTag(tags.length - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (error) setError('');
  };

  const handleAddClick = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div className="space-y-2">
      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-neon-purple/20 border border-neon-purple/40 rounded-full text-sm transition-all hover:bg-neon-purple/30"
            >
              <Tag size={12} />
              <span>{tag}</span>
              {!disabled && (
                <button
                  onClick={() => removeTag(index)}
                  className="ml-1 text-neon-purple hover:text-red-400 transition-colors"
                  title={`Remove ${tag} tag`}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      {!disabled && tags.length < maxTags && (
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              input-neon w-full pr-12 py-2
              ${error ? 'border-red-400 focus:border-red-400' : ''}
            `}
          />
          
          {inputValue.trim() && (
            <button
              onClick={handleAddClick}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neon-cyan/60 hover:text-neon-cyan transition-colors"
              title="Add tag"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-400 text-xs flex items-center gap-2 bg-red-500/10 border border-red-400/30 rounded px-2 py-1">
          ⚠ {error}
        </div>
      )}

      {/* Helper Text */}
      {!error && !disabled && (
        <div className="text-neon-cyan/60 text-xs">
          {tags.length === 0 
            ? 'Press Enter or comma to add tags'
            : `${tags.length}/${maxTags} tags • Press Enter to add • Backspace to remove last`
          }
        </div>
      )}

      {/* Max Tags Warning */}
      {tags.length >= maxTags && (
        <div className="text-yellow-400 text-xs flex items-center gap-2 bg-yellow-500/10 border border-yellow-400/30 rounded px-2 py-1">
          ⚠ Maximum tags reached ({maxTags})
        </div>
      )}
    </div>
  );
}