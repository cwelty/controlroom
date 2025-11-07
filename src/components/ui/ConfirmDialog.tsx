'use client';

import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const typeColors = {
    danger: 'border-red-400 bg-red-500/10',
    warning: 'border-yellow-400 bg-yellow-500/10',
    info: 'border-neon-cyan bg-neon-cyan/10',
  };

  const buttonColors = {
    danger: 'bg-red-500/20 border-red-400 hover:bg-red-500/30 hover:border-red-300',
    warning: 'bg-yellow-500/20 border-yellow-400 hover:bg-yellow-500/30 hover:border-yellow-300',
    info: 'bg-neon-cyan/20 border-neon-cyan hover:bg-neon-cyan/30 hover:border-neon-blue',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6">
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${typeColors[type]} mb-6`}>
          <AlertTriangle size={20} className="flex-shrink-0" />
          <p className="text-sm">{message}</p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="btn-neon px-4 py-2 rounded-lg font-medium transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg font-medium border transition-all ${buttonColors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}