'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useOrg } from '@/contexts/org-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const GYM_TYPES = ['gym', 'fitness', 'salle_de_sport'];
const BOUTIQUE_TYPES = ['boutique', 'tienda'];
const CAFE_TYPES = ['cafe', 'restaurant'];

function getDashboardPath(businessType: string): string {
  if (GYM_TYPES.includes(businessType)) return '/gym/dashboard';
  if (BOUTIQUE_TYPES.includes(businessType)) return '/boutique/dashboard';
  if (CAFE_TYPES.includes(businessType)) return '/cafe/dashboard';
  return '/boutique/dashboard';
}

export default function LoginPage() {
  const { login } = useAuth();
  const { refreshOrgs } = useOrg();
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
      const orgs = await api.get<{ id: string; businessType: string }[]>('/organizations');
      if (orgs.length > 0) {
        const savedId = localStorage.getItem('orgId');
        const match = orgs.find((o) => o.id === savedId) || orgs[0];
        localStorage.setItem('orgId', match.id);
        router.replace(getDashboardPath(match.businessType));
      } else {
        router.replace('/home');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 bg-[#0A0A0F]">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#F97316] font-display tracking-wider">ORGANA</h1>
        <div className="card-gym p-6">
          <h2 className="text-lg font-semibold text-center mb-4 text-[#F8F8F2]">Se connecter</h2>
          {error && (
            <div className="mb-4 p-3 bg-[#EF4444]/10 text-[#EF4444] text-sm rounded-lg border border-[#EF4444]/20">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F97316]/50"
                placeholder="votre@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Mot de passe</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
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
          Pas encore de compte ?{' '}
          <a href="/signup" className="text-[#F97316] hover:underline">Créer un compte</a>
        </p>
      </div>
    </main>
  );
}
