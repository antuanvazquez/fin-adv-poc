'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AnalyticsLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/sa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push(`/s/${slug}/analytics`);
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-[#1A1F35] border border-[#2A2F45] flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#C9A962]" />
          </div>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 bg-[#1A1F35] border border-[#2A2F45] rounded-lg text-[#F0F0F5] placeholder-[#555] focus:outline-none focus:border-[#C9A962] transition-colors"
          autoFocus
        />
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full py-3 bg-[#C9A962] text-[#0A0F1C] font-semibold rounded-lg hover:bg-[#D4B96E] transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Enter'}
        </button>
      </form>
    </div>
  );
}
