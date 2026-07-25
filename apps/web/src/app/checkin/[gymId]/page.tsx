'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Dumbbell, CheckCircle, AlertCircle } from 'lucide-react';
import { BrandLogo } from '@/components/site/logo';

export default function PublicCheckinPage() {
  const { gymId } = useParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already'>('loading');
  const [memberName, setMemberName] = useState('');
  const [message, setMessage] = useState('');
  const [barcode, setBarcode] = useState('');

  useEffect(() => {
    setStatus('loading');
  }, [gymId]);

  async function handleCheckin() {
    if (!barcode.trim()) return;
    try {
      const res = await api.post<{ memberName?: string; message?: string }>(
        `/organizations/${gymId}/attendance/checkin`,
        { barcode: barcode.trim() },
      );
      if (res.message?.includes('already')) {
        setStatus('already');
      } else {
        setMemberName(res.memberName || barcode);
        setStatus('success');
      }
    } catch (err: any) {
      setMessage(err?.message || 'Code-barres non reconnu');
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-brand-teal/10 dark:bg-brand-cyan/15 rounded-2xl flex items-center justify-center">
            <BrandLogo size={40} withWordmark={false} />
          </div>
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Check-in</h1>
          <p className="text-sm text-muted-foreground mt-1">Scannez votre QR code ou entrez votre code-barres</p>
        </div>

        {status === 'loading' && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <input
              type="text"
              placeholder="Entrez votre code-barres..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckin()}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
            />
            <button
              onClick={handleCheckin}
              className="w-full py-3 bg-brand-teal text-white rounded-lg font-medium hover:bg-brand-teal/90 transition shadow-brand"
            >
              Enregistrer ma présence
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <div className="font-display text-xl text-green-500">Présence enregistrée !</div>
            <div className="text-sm text-muted-foreground">Bienvenue, {memberName}</div>
          </div>
        )}

        {status === 'already' && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
            <div className="font-display text-xl text-yellow-500">Déjà enregistré</div>
            <div className="text-sm text-muted-foreground">Votre présence a déjà été enregistrée aujourd&apos;hui</div>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <div className="font-display text-xl text-red-500">Erreur</div>
            <div className="text-sm text-muted-foreground">{message}</div>
          </div>
        )}
      </div>
    </div>
  );
}
