'use client';

import { useAuth } from '@/contexts/auth-context';
import { useOrg } from '@/contexts/org-context';
import { ScrollProgress } from '@/components/site/scroll-progress';
import { SiteHeader } from '@/components/site/header';
import { SiteFooter } from '@/components/site/footer';
import { Hero } from '@/components/site/sections/hero';
import { BusinessMarquee } from '@/components/site/sections/business-marquee';
import { BusinessVerticals } from '@/components/site/sections/business-verticals';
import { ModuleMatrix } from '@/components/site/sections/module-matrix';
import { Comparison } from '@/components/site/sections/comparison';
import { HowItWorks } from '@/components/site/sections/how-it-works';
import { PlatformFeatures } from '@/components/site/sections/platform-features';
import { Security } from '@/components/site/sections/security';
import { Pricing } from '@/components/site/sections/pricing';
import { Faq } from '@/components/site/sections/faq';
import { CtaSection } from '@/components/site/sections/cta';

export default function RootPage() {
  const { loading: authLoading } = useAuth();
  const { loading: orgLoading } = useOrg();

  if (authLoading || orgLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-background"><div className="text-muted-foreground">Chargement...</div></div>;
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <ScrollProgress />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <BusinessMarquee />
        <BusinessVerticals />
        <ModuleMatrix />
        <Comparison />
        <HowItWorks />
        <PlatformFeatures />
        <Security />
        <Pricing />
        <Faq />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
