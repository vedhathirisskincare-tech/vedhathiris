import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { getLanguageAlternates } from "@/utils/site";
import { CHENNAI_KEYWORDS, generateBreadcrumbSchema } from "@/utils/seo";

export const metadata: Metadata = {
  title: "About Us | Natural & Herbal Skincare in Chennai | Vedhathiri's Story",
  description:
    "The story behind Vedhathiri's Skin Care in Chennai. Crafted with motherly love and authentic herbs to deliver the finest natural soap and herbal skincare in Chennai.",
  keywords: [...CHENNAI_KEYWORDS.skincare, ...CHENNAI_KEYWORDS.soap],
  alternates: {
    canonical: "/about",
    languages: getLanguageAlternates("/about"),
  },
};

export default function AboutPage() {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)),
        }}
      />
      <AboutClient />
    </>
  );
}
