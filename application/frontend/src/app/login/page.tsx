'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.href = '/';
      } else {
        setError('Incorrect password');
        setPassword('');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,169,98,0.06)_0%,_transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(201,169,98,0.1)',
                '0 0 40px rgba(201,169,98,0.2)',
                '0 0 20px rgba(201,169,98,0.1)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl bg-[#131A2E] border border-[#C9A962]/20 flex items-center justify-center mb-6"
          >
            <Lock className="w-8 h-8 text-[#C9A962]" />
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight text-center">
            Partner <span className="text-[#C9A962]">Access</span>
          </h1>
          <p className="text-[#8B8FA3] mt-2 text-sm text-center">
            Enter the password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-[#131A2E] border border-[#1E2A45] text-[#F0F0F5] placeholder-[#4A5068] focus:outline-none focus:border-[#C9A962]/50 focus:ring-1 focus:ring-[#C9A962]/20 text-sm transition-colors"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={!password.trim() || loading}
            className="w-full px-4 py-3 bg-[#C9A962] text-[#0A0F1C] font-semibold rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-[#D4B872] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Enter'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-xs text-[#4A5068] mt-8 text-center">
          Confidential — Partner Preview Only
        </p>
      </motion.div>
    </div>
  );
}
