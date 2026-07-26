'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/site/logo';
import { ScrollProgress } from '@/components/site/scroll-progress';
import { ArrowLeft } from 'lucide-react';

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
          <h2 className="text-lg font-semibold text-center mb-4">Se connecter</h2>
          {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 text-sm rounded-lg border border-red-500/20">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
              <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                placeholder="votre@email.com" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="block text-sm font-medium text-muted-foreground">Mot de passe</label>
                <Link href="/forgot-password" className="text-xs text-brand-teal dark:text-brand-cyan hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <input id="login-password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 disabled:opacity-50 font-medium text-sm transition shadow-brand">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Pas encore de compte ? <Link href="/signup" className="text-brand-teal dark:text-brand-cyan hover:underline">Créer un compte</Link>
        </p>
      </div>
    </main>
  );
}
