"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FAQS } from "@/components/site/nav-config";

export function Faq() {
  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* left */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Badge
              variant="outline"
              className="rounded-full border-brand-cyan/30 bg-brand-cyan-soft/50 dark:bg-brand-cyan-soft/10 text-brand-teal dark:text-brand-cyan"
            >
              FAQ
            </Badge>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Questions, answered.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The honest version. If something&apos;s still unclear, ask us on
              WhatsApp — we reply like humans.
            </p>
            <div className="mt-6 rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Still have questions?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Our team answers in French, Arabic and English.
              </p>
              <Link
                href="#contact"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-teal dark:text-brand-cyan hover:gap-2 transition-all"
              >
                Talk to us
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* right: accordion */}
          <Accordion
            type="single"
            collapsible
            defaultValue="item-0"
            className="w-full"
          >
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={faq.q}
                value={`item-${i}`}
                className="border-b border-border"
              >
                <AccordionTrigger className="text-left text-base sm:text-lg font-semibold hover:no-underline py-5 hover:text-brand-teal dark:hover:text-brand-cyan">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
