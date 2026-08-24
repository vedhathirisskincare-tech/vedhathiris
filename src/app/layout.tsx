import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import RealtimeListener from "../components/RealtimeListener";
import OfferBar from "../components/OfferBar";
import { ToastProvider } from "../components/Toast";
import LoginPopup from "../components/LoginPopup";


import { SITE_URL, getLanguageAlternates } from "@/utils/site";
import {
  CHENNAI_KEYWORDS,
  generateLocalBusinessSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/utils/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vedhathiris Skin Care | Natural Soap & Herbal Skincare in Chennai",
    template: "%s | Vedhathiri's Skin Care Chennai",
  },
  description:
    "Handcrafted natural skincare in Chennai. Shop pure handmade soap in Chennai, herbal shampoo, organic hair oil, and gentle personal care products made in Tamil Nadu.",
  keywords: CHENNAI_KEYWORDS.all,
  alternates: {
    canonical: "/",
    languages: getLanguageAlternates("/"),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Vedhathiris Skin Care | Natural Soap & Herbal Skincare in Chennai",
    description:
      "Handcrafted natural skincare products in Chennai. Discover authentic handmade soap in Chennai, herbal hair oil, natural shampoo, and botanical skin care.",
    url: SITE_URL,
    siteName: "Vedhathiri's Skin Care",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vedhathiris Skin Care | Natural Soap & Herbal Skincare in Chennai",
    description:
      "Handcrafted natural skincare products in Chennai. Discover authentic handmade soap in Chennai, herbal hair oil, natural shampoo, and botanical skin care.",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              generateOrganizationSchema(),
              generateLocalBusinessSchema(),
              generateWebSiteSchema(),
            ]),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans text-gray-900 bg-white">
        <ToastProvider>
          <RealtimeListener />
          <LoginPopup />
          <OfferBar />
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />

        </ToastProvider>
      </body>
    </html>
  );
}
