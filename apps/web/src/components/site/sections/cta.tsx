import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { BrandMark } from "@/components/site/logo";

export function CtaSection() {
  return (
    <section
      id="get-started"
      className="relative py-20 lg:py-28 overflow-hidden"
    >
      {/* deep gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-teal via-brand-teal to-[#003844]" />
      <div className="absolute inset-0 -z-10 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -top-32 -left-20 -z-10 h-96 w-96 rounded-full bg-brand-cyan/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 -z-10 h-[28rem] w-[28rem] rounded-full bg-brand-cyan/20 blur-3xl" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2rem] border border-white/15 bg-white/5 backdrop-blur-sm p-8 sm:p-12 lg:p-16 text-center">
          <div className="mx-auto mb-7 flex justify-center">
            <div className="relative">
              <BrandMark size={56} className="rounded-2xl" />
              <span className="absolute -inset-2 rounded-2xl border border-white/20 animate-pulse-ring" />
            </div>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Run every business you own,
            <span className="block text-brand-cyan">from one login.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
            Start free for 14 days. No card, no setup fee, no per-vertical
            charge. Add your first business in under five minutes.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white text-brand-teal px-7 py-3.5 text-sm font-semibold shadow-brand-lg hover:bg-brand-cyan-soft hover:text-brand-teal transition-colors"
            >
              Start free for 14 days
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Book a demo
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/75">
            {[
              "No card required",
              "Cancel anytime",
              "FR · AR · EN support",
            ].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-cyan" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
