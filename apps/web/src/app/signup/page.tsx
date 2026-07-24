'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', fullName: '', businessName: '', businessType: 'gym' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) { setForm((p) => ({ ...p, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      router.replace('/');
    } catch (err: any) {
      setError(err?.message || "Erreur d'inscription");
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
          <h2 className="text-lg font-semibold text-center mb-4 text-[#F8F8F2]">Créer un compte</h2>
          {error && <div className="mb-4 p-3 bg-[#EF4444]/10 text-[#EF4444] text-sm rounded-lg border border-[#EF4444]/20">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Nom complet</label>
              <input type="text" required value={form.fullName} onChange={(e) => update('fullName', e.target.value)}
                className="w-full px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F97316]/50"
                placeholder="Ahmed Ben Ali" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Email</label>
              <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)}
                className="w-full px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F97316]/50"
                placeholder="votre@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Mot de passe</label>
              <input type="password" required value={form.password} onChange={(e) => update('password', e.target.value)}
                className="w-full px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F97316]/50"
                placeholder="8 caractères minimum" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Nom de l'entreprise</label>
              <input type="text" required value={form.businessName} onChange={(e) => update('businessName', e.target.value)}
                className="w-full px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F97316]/50"
                placeholder="Mon Café" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Type d'activité</label>
              <select value={form.businessType} onChange={(e) => update('businessType', e.target.value)}
                className="w-full px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] focus:outline-none focus:ring-2 focus:ring-[#F97316]/50">
                <option value="gym">Salle de sport</option>
                <option value="cafe">Café / Restaurant</option>
                <option value="boutique">Boutique</option>
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] disabled:opacity-50 font-medium text-sm transition">
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-[#9CA3AF] mt-4">
          Déjà un compte ? <a href="/login" className="text-[#F97316] hover:underline">Se connecter</a>
        </p>
      </div>
    </main>
  );
}
