'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'lg' }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm md:max-w-md',
    md: 'max-w-sm md:max-w-lg',
    lg: 'max-w-sm md:max-w-2xl',
    xl: 'max-w-sm md:max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm modal-backdrop"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative w-full ${sizeClasses[size]} max-h-[95vh] md:max-h-[90vh] overflow-hidden
        bg-gradient-to-br from-background-secondary to-background-primary
        border border-neon-cyan/30 rounded-lg shadow-2xl
        modal-content neon-glow
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-neon-cyan/20">
          <h2 className="text-lg md:text-xl font-bold font-orbitron text-neon-cyan pr-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-neon-cyan/60 hover:text-neon-cyan transition-colors rounded-lg hover:bg-neon-cyan/10 min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-72px)] md:max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}