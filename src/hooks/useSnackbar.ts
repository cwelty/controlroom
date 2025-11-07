'use client';

import { useState, useCallback } from 'react';
import { SnackbarState } from '@/components/ui/Snackbar';

export function useSnackbar() {
  const [snackbars, setSnackbars] = useState<SnackbarState[]>([]);

  const addSnackbar = useCallback((
    message: string,
    options?: Partial<Omit<SnackbarState, 'id' | 'message'>>
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newSnackbar: SnackbarState = {
      id,
      message,
      type: 'info',
      duration: 5000,
      ...options,
    };

    setSnackbars(prev => [...prev, newSnackbar]);
    return id;
  }, []);

  const removeSnackbar = useCallback((id: string) => {
    setSnackbars(prev => prev.filter(snackbar => snackbar.id !== id));
  }, []);

  const clearSnackbars = useCallback(() => {
    setSnackbars([]);
  }, []);

  return {
    snackbars,
    addSnackbar,
    removeSnackbar,
    clearSnackbars,
  };
}