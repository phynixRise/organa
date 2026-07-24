'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Dumbbell, CheckCircle, AlertCircle, User } from 'lucide-react';

export default function PublicCheckinPage() {
  const { gymId } = useParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already'>('loading');
  const [memberName, setMemberName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // This would normally decode a QR code token
    // For now, show the check-in interface
    setStatus('loading');
  }, [gymId]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-[#F97316] rounded-2xl flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
        </div>

        <div>
          <h1 className="font-display text-3xl text-[#F8F8F2] tracking-wider">Check-in</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">Scannez votre QR code ou entrez votre code-barres</p>
        </div>

        {status === 'loading' && (
          <div className="card-gym space-y-4">
            <input
              type="text"
              placeholder="Entrez votre code-barres..."
              className="w-full px-4 py-3 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF] text-center font-mono text-lg"
            />
            <button className="w-full py-3 bg-[#F97316] text-white rounded-lg font-medium hover:bg-[#EA580C] transition">
              Enregistrer ma présence
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="card-gym space-y-3">
            <CheckCircle className="w-12 h-12 text-[#22C55E] mx-auto" />
            <div className="font-display text-xl text-[#22C55E]">Présence enregistrée !</div>
            <div className="text-sm text-[#9CA3AF]">Bienvenue, {memberName}</div>
          </div>
        )}

        {status === 'already' && (
          <div className="card-gym space-y-3">
            <AlertCircle className="w-12 h-12 text-[#EAB308] mx-auto" />
            <div className="font-display text-xl text-[#EAB308]">Déjà enregistré</div>
            <div className="text-sm text-[#9CA3AF]">Votre présence a déjà été enregistrée aujourd'hui</div>
          </div>
        )}

        {status === 'error' && (
          <div className="card-gym space-y-3">
            <AlertCircle className="w-12 h-12 text-[#EF4444] mx-auto" />
            <div className="font-display text-xl text-[#EF4444]">Erreur</div>
            <div className="text-sm text-[#9CA3AF]">{message}</div>
          </div>
        )}
      </div>
    </div>
  );
}
