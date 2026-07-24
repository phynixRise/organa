'use client';

import Link from 'next/link';
import { Dumbbell, Store, Coffee, CreditCard, Users, BarChart3, Shield, Smartphone, CheckCircle } from 'lucide-react';

const FEATURES = [
  { icon: Store, title: 'Multi-entreprise', desc: 'Gérez toutes vos entreprises depuis un seul compte.' },
  { icon: CreditCard, title: 'Caisse intégrée', desc: 'POS avec code-barres, paiements espèces/cartes.' },
  { icon: Users, title: 'Gestion des membres', desc: 'Abonnements, gel, renouvellement, présence.' },
  { icon: BarChart3, title: 'Tableau de bord', desc: 'Revenus, alertes, graphiques en temps réel.' },
  { icon: Shield, title: 'Isolation des données', desc: 'Chaque entreprise a ses propres données, zéro fuite.' },
  { icon: Smartphone, title: 'Responsive', desc: 'Fonctionne sur ordinateur, tablette et téléphone.' },
];

const VERTICALS = [
  { icon: Dumbbell, name: 'Salle de sport', color: 'text-[#F97316]', bg: 'bg-[#F97316]/10' },
  { icon: Coffee, name: 'Café / Restaurant', color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' },
  { icon: Store, name: 'Boutique', color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F97316]/5 to-transparent" />
        <div className="max-w-6xl mx-auto px-4 py-20 relative">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#F97316] rounded-2xl flex items-center justify-center">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="font-display text-5xl sm:text-7xl text-[#F8F8F2] tracking-wider mb-4">
              ORGANA
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8 max-w-2xl mx-auto">
              Une plateforme pour toutes vos entreprises. Gérez vos ventes, clients, abonnements et plus encore.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="px-8 py-3 bg-[#F97316] text-white rounded-xl font-medium hover:bg-[#EA580C] transition text-lg">
                Commencer gratuitement
              </Link>
              <Link href="/login" className="px-8 py-3 bg-[#1C1C27] text-[#F8F8F2] border border-white/10 rounded-xl font-medium hover:bg-[#22222E] transition text-lg">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Verticals */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-display text-3xl text-[#F8F8F2] tracking-wider text-center mb-8">Pour chaque type d'activité</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {VERTICALS.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.name} className="card-gym text-center hover:border-[#F97316]/30 transition-colors">
                <div className={`w-14 h-14 ${v.bg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-7 h-7 ${v.color}`} />
                </div>
                <h3 className="font-display text-xl text-[#F8F8F2] tracking-wider">{v.name}</h3>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-display text-3xl text-[#F8F8F2] tracking-wider text-center mb-8">Tout ce dont vous avez besoin</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card-gym">
                <div className="w-10 h-10 bg-[#F97316]/10 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#F97316]" />
                </div>
                <h3 className="font-display text-lg text-[#F8F8F2] tracking-wider mb-1">{f.title}</h3>
                <p className="text-sm text-[#9CA3AF]">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="card-gym text-center">
          <h2 className="font-display text-3xl text-[#F8F8F2] tracking-wider mb-4">Prêt à commencer ?</h2>
          <p className="text-[#9CA3AF] mb-6">Créez votre compte en 2 minutes. Sans carte bancaire.</p>
          <Link href="/signup" className="inline-block px-8 py-3 bg-[#F97316] text-white rounded-xl font-medium hover:bg-[#EA580C] transition text-lg">
            Créer mon compte
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-[#6B7280]">
          Organa © 2026 — Une plateforme pour toutes vos entreprises
        </div>
      </footer>
    </div>
  );
}
