import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/site/theme-provider";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://organa.app"),
  title: {
    default: "Organa — One platform for every business you run",
    template: "%s · Organa",
  },
  description:
    "Organa is a single subscription platform that lets Tunisian business owners run café, restaurant, boutique, gym, cabinet médical and tienda — all from one login. Pay in TND with Konnect.",
  keywords: [
    "Organa",
    "POS",
    "Tunisia POS",
    "multi-business platform",
    "cafe POS",
    "restaurant POS",
    "boutique POS",
    "gym management",
    "cabinet médical",
    "SaaS Tunisia",
    "TND payments",
    "Konnect",
  ],
  authors: [{ name: "Organa" }],
  creator: "Organa",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "Organa — One platform for every business you run",
    description:
      "Run café, restaurant, boutique, gym, cabinet médical and tienda from one login. Built for Tunisia. Paid in TND.",
    url: "https://organa.app",
    siteName: "Organa",
    type: "website",
    locale: "fr_TN",
    images: [{ url: "/logo.jpg", width: 1024, height: 1024, alt: "Organa" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Organa — One platform for every business you run",
    description:
      "Run café, restaurant, boutique, gym, cabinet médical and tienda from one login. Built for Tunisia.",
    images: ["/logo.jpg"],
  },
  alternates: {
    canonical: "/",
    languages: { "fr-TN": "/", "ar-TN": "/?lang=ar" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${display.variable} antialiased bg-background text-foreground font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
