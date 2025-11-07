'use client';

import { useState, useRef } from 'react';
import { Keyboard } from 'lucide-react';

interface HotkeyInputProps {
  value?: string;
  onChange: (hotkey: string) => void;
  existingHotkeys?: string[];
  placeholder?: string;
  disabled?: boolean;
}

export function HotkeyInput({ 
  value = '', 
  onChange, 
  existingHotkeys = [], 
  placeholder = 'Press a key...',
  disabled = false 
}: HotkeyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validateHotkey = (key: string): string | null => {
    if (!key) return null;
    
    if (key.length !== 1) {
      return 'Hotkey must be a single character';
    }
    
    if (!/^[a-zA-Z0-9]$/.test(key)) {
      return 'Hotkey must be alphanumeric (a-z, A-Z, 0-9)';
    }
    
    const normalizedKey = key.toLowerCase();
    const normalizedExisting = existingHotkeys.map(k => k?.toLowerCase()).filter(Boolean);
    
    if (normalizedExisting.includes(normalizedKey) && normalizedKey !== value?.toLowerCase()) {
      return `Hotkey '${key}' is already in use`;
    }
    
    return null;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    // Allow backspace/delete to clear
    if (e.key === 'Backspace' || e.key === 'Delete') {
      onChange('');
      setError('');
      return;
    }
    
    // Ignore modifier keys and special keys
    if (e.key.length > 1 && !['Space'].includes(e.key)) {
      return;
    }
    
    const key = e.key === 'Space' ? ' ' : e.key;
    const validationError = validateHotkey(key);
    
    if (validationError) {
      setError(validationError);
    } else {
      setError('');
      onChange(key);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent normal typing, only allow through keyDown
    e.preventDefault();
  };

  const handleClear = () => {
    onChange('');
    setError('');
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-cyan/60">
          <Keyboard size={16} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            input-neon w-full pl-10 pr-12 py-2 text-center font-mono text-lg font-bold
            ${error ? 'border-red-400 focus:border-red-400' : ''}
            ${isFocused ? 'neon-glow' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          maxLength={1}
        />
        
        {value && !disabled && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neon-cyan/60 hover:text-neon-cyan transition-colors"
            title="Clear hotkey"
          >
            ×
          </button>
        )}
      </div>
      
      {error && (
        <div className="text-red-400 text-xs flex items-center gap-2 bg-red-500/10 border border-red-400/30 rounded px-2 py-1">
          ⚠ {error}
        </div>
      )}
      
      {!error && value && (
        <div className="text-neon-cyan/60 text-xs text-center">
          Hotkey: <span className="font-mono font-bold text-neon-cyan">{value.toUpperCase()}</span>
        </div>
      )}
      
      {!error && !value && isFocused && (
        <div className="text-neon-cyan/60 text-xs text-center">
          Press any key to set hotkey, or Backspace to clear
        </div>
      )}
    </div>
  );
}