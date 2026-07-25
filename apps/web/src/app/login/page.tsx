'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (err: any) {
      setError(err?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 bg-[#0A0A0F]">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#F97316] rounded-xl flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div>
          <span className="font-display text-2xl text-[#F8F8F2] tracking-wider">ORGANA</span>
        </div>
        <div className="card-gym p-6">
          <h2 className="text-lg font-semibold text-center mb-4 text-[#F8F8F2]">Se connecter</h2>
          {error && <div className="mb-4 p-3 bg-[#EF4444]/10 text-[#EF4444] text-sm rounded-lg border border-[#EF4444]/20">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-[#9CA3AF] mb-1">Email</label>
              <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F97316]/50"
                placeholder="votre@email.com" />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-[#9CA3AF] mb-1">Mot de passe</label>
              <input id="login-password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F97316]/50"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] disabled:opacity-50 font-medium text-sm transition">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-[#9CA3AF] mt-4">
          Pas encore de compte ? <Link href="/signup" className="text-[#F97316] hover:underline">Créer un compte</Link>
        </p>
      </div>
    </main>
  );
}
