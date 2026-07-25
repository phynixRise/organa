'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/site/logo';
import { ScrollProgress } from '@/components/site/scroll-progress';
import { api } from '@/lib/api';
import { CheckCircle, Lock } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 bg-background">
        <ScrollProgress />
        <div className="w-full max-w-sm text-center">
          <BrandLogo size={40} withWordmark={false} />
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-red-500">Lien invalide</h2>
            <p className="text-sm text-muted-foreground mt-2">Ce lien de réinitialisation est invalide ou a expiré.</p>
            <Link href="/forgot-password"
              className="inline-block mt-4 w-full py-2.5 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 font-medium text-sm transition shadow-brand">
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 bg-background">
      <ScrollProgress />
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <BrandLogo size={40} withWordmark={false} />
          <span className="font-display text-2xl font-bold tracking-wider">ORGANA</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          {done ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="text-lg font-semibold">Mot de passe réinitialisé</h2>
              <p className="text-sm text-muted-foreground">
                Votre mot de passe a été modifié avec succès.
              </p>
              <button onClick={() => router.push('/login')}
                className="w-full py-2.5 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 font-medium text-sm transition shadow-brand">
                Se connecter
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <Lock className="h-10 w-10 text-brand-teal dark:text-brand-cyan" />
              </div>
              <h2 className="text-lg font-semibold text-center mb-2">Nouveau mot de passe</h2>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Choisissez un nouveau mot de passe pour votre compte.
              </p>
              {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 text-sm rounded-lg border border-red-500/20">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="rp-password" className="block text-sm font-medium text-muted-foreground mb-1">Nouveau mot de passe</label>
                  <input id="rp-password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                    placeholder="••••••••" />
                </div>
                <div>
                  <label htmlFor="rp-confirm" className="block text-sm font-medium text-muted-foreground mb-1">Confirmer le mot de passe</label>
                  <input id="rp-confirm" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                    placeholder="••••••••" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 disabled:opacity-50 font-medium text-sm transition shadow-brand">
                  {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><span className="text-muted-foreground">Chargement...</span></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
