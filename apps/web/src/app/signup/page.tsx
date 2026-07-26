'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/site/logo';
import { ScrollProgress } from '@/components/site/scroll-progress';
import { ALL_BUSINESS_TYPES } from '@/lib/constants';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
    <main className="flex min-h-screen items-center justify-center px-4 bg-background">
      <ScrollProgress />
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour au site
        </Link>
        <div className="flex items-center justify-center gap-3 mb-8">
          <BrandLogo size={40} withWordmark={false} />
          <span className="font-display text-2xl font-bold tracking-wider">ORGANA</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-center mb-4">Créer un compte</h2>
          {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 text-sm rounded-lg border border-red-500/20">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Nom complet</label>
              <input type="text" required value={form.fullName} onChange={(e) => update('fullName', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                placeholder="Ahmed Ben Ali" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
              <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                placeholder="votre@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Mot de passe</label>
              <input type="password" required value={form.password} onChange={(e) => update('password', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                placeholder="8 caractères minimum" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Nom de l&apos;entreprise</label>
              <input type="text" required value={form.businessName} onChange={(e) => update('businessName', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                placeholder="Mon Café" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Type d&apos;activité</label>
              <select value={form.businessType} onChange={(e) => update('businessType', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50">
                {ALL_BUSINESS_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 disabled:opacity-50 font-medium text-sm transition shadow-brand">
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Déjà un compte ? <Link href="/login" className="text-brand-teal dark:text-brand-cyan hover:underline">Se connecter</Link>
        </p>
      </div>
    </main>
  );
}
