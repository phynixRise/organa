'use client';

import Link from 'next/link';
import { Dumbbell, Store, Coffee, CreditCard, Users, BarChart3, Shield, Smartphone, CheckCircle, ArrowRight, Phone, Mail, MapPin, ChevronRight, Star, Zap, Globe } from 'lucide-react';

const FEATURES = [
  { icon: Globe, title: 'Multi-entreprise', desc: 'Gérez toutes vos entreprises depuis un seul compte, un seul login.' },
  { icon: CreditCard, title: 'Caisse intégrée', desc: 'POS avec code-barres, paiements espèces et cartes, tickets automatiques.' },
  { icon: Users, title: 'Gestion des clients', desc: 'Base de données clients, historique d\'achats, fidélisation.' },
  { icon: BarChart3, title: 'Tableau de bord', desc: 'Revenus, ventes, graphiques en temps réel. Tout en un coup d\'œil.' },
  { icon: Shield, title: 'Isolation totale', desc: 'Chaque entreprise a ses propres données. Zéro fuite entre businesses.' },
  { icon: Smartphone, title: 'Responsive', desc: 'Fonctionne sur ordinateur, tablette et téléphone. Partout.' },
];

const VERTICALS = [
  { icon: Dumbbell, name: 'Salle de sport', desc: 'Membres, abonnements, présence, gel d\'abonnement', color: '#F97316' },
  { icon: Coffee, name: 'Café / Restaurant', desc: 'Menu, commandes, tables, cuisine, inventaire', color: '#22C55E' },
  { icon: Store, name: 'Boutique / Retail', desc: 'Produits, caisse, stock, clients, ventes', color: '#3B82F6' },
];

const PLANS = [
  { name: 'Starter', price: 29, period: '/mois', features: ['1 entreprise', 'Tableau de bord de base', 'Caisse POS', 'Support par email'], highlighted: false, businesses: 1 },
  { name: 'Pro', price: 59, period: '/mois', features: ['3 entreprises', 'Toutes les fonctionnalités', 'Rapports avancés', 'Support prioritaire', 'Notifications WhatsApp'], highlighted: true, businesses: 3 },
  { name: 'Business', price: 99, period: '/mois', features: ['5+ entreprises', 'Tout du plan Pro', 'API accès', 'Support dédié', 'Personnalisation complète', 'Multi-utilisateurs'], highlighted: false, businesses: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F97316] rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl text-[#F8F8F2] tracking-wider">ORGANA</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#9CA3AF]">
            <a href="#features" className="hover:text-[#F8F8F2] transition">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-[#F8F8F2] transition">Tarifs</a>
            <a href="#about" className="hover:text-[#F8F8F2] transition">À propos</a>
            <a href="#contact" className="hover:text-[#F8F8F2] transition">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm text-[#9CA3AF] hover:text-[#F8F8F2] transition">Connexion</Link>
            <Link href="/signup" className="px-4 py-2 bg-[#F97316] text-white text-sm rounded-lg hover:bg-[#EA580C] transition font-medium">Commencer</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F97316]/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#F97316]/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F97316]/10 border border-[#F97316]/20 rounded-full text-[#F97316] text-sm mb-8">
              <Star className="w-4 h-4" />
              Plateforme #1 pour les entreprises en Tunisie
            </div>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F8F8F2] tracking-wider mb-6 leading-tight">
              UNE SEULE PLATEFORME.<br />
              <span className="text-[#F97316]">TOUS VOS BUSINESSES.</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-10 max-w-2xl mx-auto leading-relaxed">
              Gérez votre café, boutique, salle de sport et plus encore — tout depuis un seul compte. 
              Chaque entreprise obtient ses propres outils, son propre design, ses propres données.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="px-8 py-4 bg-[#F97316] text-white rounded-xl font-medium hover:bg-[#EA580C] transition text-lg flex items-center justify-center gap-2">
                Commencer gratuitement <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="px-8 py-4 bg-[#1C1C27] text-[#F8F8F2] border border-white/10 rounded-xl font-medium hover:bg-[#22222E] transition text-lg">
                Découvrir
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Business Types */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-[#F8F8F2] tracking-wider mb-4">Pour chaque type d'activité</h2>
            <p className="text-[#9CA3AF] text-lg">Un design et des outils spécifiques pour votre domaine</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VERTICALS.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.name} className="card-gym group hover:border-white/10 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${v.color}15` }}>
                    <Icon className="w-8 h-8" style={{ color: v.color }} />
                  </div>
                  <h3 className="font-display text-2xl text-[#F8F8F2] tracking-wider mb-3">{v.name}</h3>
                  <p className="text-[#9CA3AF] leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-[#F8F8F2] tracking-wider mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-[#9CA3AF] text-lg">Des outils puissants, simples à utiliser</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="p-6 rounded-xl bg-[#111118] border border-white/5 hover:border-[#F97316]/20 transition-colors">
                  <div className="w-12 h-12 bg-[#F97316]/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#F97316]" />
                  </div>
                  <h3 className="font-display text-xl text-[#F8F8F2] tracking-wider mb-2">{f.title}</h3>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-[#F8F8F2] tracking-wider mb-4">Des tarifs clairs</h2>
            <p className="text-[#9CA3AF] text-lg">Pas de frais cachés. Payez pour ce que vous utilisez.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                plan.highlighted 
                  ? 'bg-[#111118] border-[#F97316] shadow-lg shadow-[#F97316]/10' 
                  : 'bg-[#111118] border-white/5 hover:border-white/10'
              }`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#F97316] text-white text-xs font-medium rounded-full">
                    Le plus populaire
                  </div>
                )}
                <h3 className="font-display text-2xl text-[#F8F8F2] tracking-wider mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-[#F8F8F2]">{plan.price}</span>
                  <span className="text-[#9CA3AF]">TND{plan.period}</span>
                </div>
                <div className="text-sm text-[#9CA3AF] mb-6">{plan.businesses} {plan.businesses === 1 ? 'entreprise' : 'entreprises'}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-[#9CA3AF]">
                      <CheckCircle className="w-4 h-4 text-[#22C55E] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`block w-full py-3 rounded-xl text-center font-medium text-sm transition ${
                  plan.highlighted 
                    ? 'bg-[#F97316] text-white hover:bg-[#EA580C]' 
                    : 'bg-[#1C1C27] text-[#F8F8F2] border border-white/5 hover:bg-[#22222E]'
                }`}>
                  Choisir {plan.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl text-[#F8F8F2] tracking-wider mb-6">Pourquoi Organa ?</h2>
              <p className="text-[#9CA3AF] text-lg leading-relaxed mb-6">
                Les propriétaires d'entreprises en Tunisie jonglent entre plusieurs outils, plusieurs logins, plusieurs abonnements. 
                Organa change ça : une seule plateforme pour toutes vos activités.
              </p>
              <p className="text-[#9CA3AF] leading-relaxed mb-8">
                Que vous gériez un café, une boutique ou une salle de sport, chaque entreprise obtient ses propres outils 
                et son propre design — mais tout est connecté sous un seul compte. Paiements en TND, WhatsApp intégré, 
                et un support qui comprend votre marché.
              </p>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#F97316]">500+</div>
                  <div className="text-sm text-[#9CA3AF]">Entreprises</div>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#F97316]">99.9%</div>
                  <div className="text-sm text-[#9CA3AF]">Uptime</div>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#F97316]">24/7</div>
                  <div className="text-sm text-[#9CA3AF]">Support</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#F97316]/10 to-transparent rounded-3xl" />
              <div className="card-gym p-8 relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0A0A0F] rounded-xl"><Dumbbell className="w-8 h-8 text-[#F97316] mb-2" /><div className="text-sm text-[#F8F8F2] font-medium">Gym</div></div>
                  <div className="p-4 bg-[#0A0A0F] rounded-xl"><Coffee className="w-8 h-8 text-[#22C55E] mb-2" /><div className="text-sm text-[#F8F8F2] font-medium">Café</div></div>
                  <div className="p-4 bg-[#0A0A0F] rounded-xl"><Store className="w-8 h-8 text-[#3B82F6] mb-2" /><div className="text-sm text-[#F8F8F2] font-medium">Boutique</div></div>
                  <div className="p-4 bg-[#0A0A0F] rounded-xl"><Globe className="w-8 h-8 text-[#8B5CF6] mb-2" /><div className="text-sm text-[#F8F8F2] font-medium">+ Plus</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-[#F8F8F2] tracking-wider mb-4">Contactez-nous</h2>
            <p className="text-[#9CA3AF] text-lg">Une question ? Nous sommes là.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="card-gym text-center">
              <Phone className="w-8 h-8 text-[#F97316] mx-auto mb-4" />
              <h3 className="font-display text-lg text-[#F8F8F2] tracking-wider mb-2">Téléphone</h3>
              <p className="text-sm text-[#9CA3AF]">+216 XX XXX XXX</p>
            </div>
            <div className="card-gym text-center">
              <Mail className="w-8 h-8 text-[#22C55E] mx-auto mb-4" />
              <h3 className="font-display text-lg text-[#F8F8F2] tracking-wider mb-2">Email</h3>
              <p className="text-sm text-[#9CA3AF]">contact@organa.tn</p>
            </div>
            <div className="card-gym text-center">
              <MapPin className="w-8 h-8 text-[#3B82F6] mx-auto mb-4" />
              <h3 className="font-display text-lg text-[#F8F8F2] tracking-wider mb-2">Adresse</h3>
              <p className="text-sm text-[#9CA3AF]">Tunis, Tunisie</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl text-[#F8F8F2] tracking-wider mb-6">Prêt à transformer votre business ?</h2>
          <p className="text-[#9CA3AF] text-lg mb-8">Créez votre compte en 2 minutes. Sans carte bancaire.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-[#F97316] text-white rounded-xl font-medium hover:bg-[#EA580C] transition text-lg">
            Commencer maintenant <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center"><Zap className="w-4 h-4 text-white" /></div>
                <span className="font-display text-xl text-[#F8F8F2] tracking-wider">ORGANA</span>
              </div>
              <p className="text-sm text-[#9CA3AF]">La plateforme pour toutes vos entreprises en Tunisie.</p>
            </div>
            <div>
              <h4 className="font-display text-sm text-[#F8F8F2] tracking-wider mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-[#9CA3AF]">
                <li><a href="#features" className="hover:text-[#F8F8F2] transition">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-[#F8F8F2] transition">Tarifs</a></li>
                <li><a href="#about" className="hover:text-[#F8F8F2] transition">À propos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-sm text-[#F8F8F2] tracking-wider mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-[#9CA3AF]">
                <li><a href="#contact" className="hover:text-[#F8F8F2] transition">Contact</a></li>
                <li><a href="#" className="hover:text-[#F8F8F2] transition">Documentation</a></li>
                <li><a href="#" className="hover:text-[#F8F8F2] transition">Statut</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-sm text-[#F8F8F2] tracking-wider mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-[#9CA3AF]">
                <li><a href="#" className="hover:text-[#F8F8F2] transition">CGV</a></li>
                <li><a href="#" className="hover:text-[#F8F8F2] transition">Politique de confidentialité</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-sm text-[#6B7280]">
            Organa © 2026 — Une plateforme pour toutes vos entreprises
          </div>
        </div>
      </footer>
    </div>
  );
}
