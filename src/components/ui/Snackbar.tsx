'use client';

import { useEffect, useState } from 'react';
import { X, Undo2 } from 'lucide-react';

export interface SnackbarProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
  onUndo?: () => void;
  undoLabel?: string;
}

export function Snackbar({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose, 
  onUndo,
  undoLabel = 'Undo'
}: SnackbarProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleUndo = () => {
    if (onUndo) {
      onUndo();
    }
    handleClose();
  };

  const typeColors = {
    success: 'border-green-400 bg-green-500/10',
    error: 'border-red-400 bg-red-500/10',
    info: 'border-neon-cyan bg-neon-cyan/10',
  };

  return (
    <div
      className={`snackbar ${isVisible ? 'opacity-100' : 'opacity-0'} 
                 ${typeColors[type]} flex items-center gap-3 transition-all duration-300`}
    >
      <span className="flex-1 text-sm font-medium">{message}</span>
      
      <div className="flex items-center gap-2">
        {onUndo && (
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-neon-cyan 
                     hover:text-neon-blue transition-colors duration-200 
                     hover:bg-neon-cyan/10 rounded"
          >
            <Undo2 size={14} />
            {undoLabel}
          </button>
        )}
        
        <button
          onClick={handleClose}
          className="p-1 text-neon-cyan/60 hover:text-neon-cyan transition-colors duration-200"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export interface SnackbarState {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onUndo?: () => void;
  undoLabel?: string;
}

export function SnackbarContainer({ 
  snackbars, 
  removeSnackbar 
}: { 
  snackbars: SnackbarState[]; 
  removeSnackbar: (id: string) => void; 
}) {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
      {snackbars.map((snackbar) => (
        <Snackbar
          key={snackbar.id}
          message={snackbar.message}
          type={snackbar.type}
          duration={snackbar.duration}
          onClose={() => removeSnackbar(snackbar.id)}
          onUndo={snackbar.onUndo}
          undoLabel={snackbar.undoLabel}
        />
      ))}
    </div>
  );
}