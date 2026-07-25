import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { Hero } from "@/components/site/sections/hero";
import { BusinessMarquee } from "@/components/site/sections/business-marquee";
import { TrustBar } from "@/components/site/sections/trust-bar";
import { ValueProps } from "@/components/site/sections/value-props";
import { BusinessVerticals } from "@/components/site/sections/business-verticals";
import { ModuleMatrix } from "@/components/site/sections/module-matrix";
import { Comparison } from "@/components/site/sections/comparison";
import { HowItWorks } from "@/components/site/sections/how-it-works";
import { PlatformFeatures } from "@/components/site/sections/platform-features";
import { Security } from "@/components/site/sections/security";
import { Integrations } from "@/components/site/sections/integrations";
import { Testimonials } from "@/components/site/sections/testimonials";
import { Pricing } from "@/components/site/sections/pricing";
import { Faq } from "@/components/site/sections/faq";
import { CtaSection } from "@/components/site/sections/cta";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <ScrollProgress />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <BusinessMarquee />
        <TrustBar />
        <ValueProps />
        <BusinessVerticals />
        <ModuleMatrix />
        <Comparison />
        <HowItWorks />
        <PlatformFeatures />
        <Security />
        <Integrations />
        <Testimonials />
        <Pricing />
        <Faq />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
