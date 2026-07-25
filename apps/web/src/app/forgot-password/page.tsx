'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/site/logo';
import { ScrollProgress } from '@/components/site/scroll-progress';
import { api } from '@/lib/api';
import { CheckCircle, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l\'envoi');
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
          {sent ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="text-lg font-semibold">Email envoyé</h2>
              <p className="text-sm text-muted-foreground">
                Si un compte existe avec l&apos;adresse <strong className="text-foreground">{email}</strong>, vous recevrez un lien de réinitialisation.
              </p>
              <Link href="/login"
                className="inline-block w-full py-2.5 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 font-medium text-sm transition shadow-brand text-center">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <Mail className="h-10 w-10 text-brand-teal dark:text-brand-cyan" />
              </div>
              <h2 className="text-lg font-semibold text-center mb-2">Mot de passe oublié</h2>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 text-sm rounded-lg border border-red-500/20">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="fp-email" className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                  <input id="fp-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                    placeholder="votre@email.com" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 disabled:opacity-50 font-medium text-sm transition shadow-brand">
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </button>
              </form>
            </>
          )}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link href="/login" className="text-brand-teal dark:text-brand-cyan hover:underline">Retour à la connexion</Link>
        </p>
      </div>
    </main>
  );
}
