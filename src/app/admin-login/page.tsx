'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) {
      setError('Please enter the admin secret');
      return;
    }
    
    // Redirect with secret as query param, middleware will handle setting cookie
    router.push(`/admin?admin_secret=${encodeURIComponent(secret)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background-primary to-background-secondary">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-orbitron mb-2">TaskFeed</h1>
          <h2 className="text-xl font-exo text-neon-cyan">Admin Access</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-neon-cyan to-neon-blue mx-auto mt-4 rounded-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="secret" className="sr-only">
              Admin Secret
            </label>
            <input
              id="secret"
              type="password"
              required
              className="input-neon w-full px-4 py-3 rounded-lg text-lg font-mono"
              placeholder="Enter admin secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-neon w-full py-3 px-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105"
          >
            Access Control Room
          </button>
        </form>

        <div className="text-center text-sm text-neon-cyan/60">
          <p>Authorized personnel only</p>
        </div>
      </div>
    </div>
  );
}