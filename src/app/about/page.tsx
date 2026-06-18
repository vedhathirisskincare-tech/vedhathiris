import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "Our Story | Born From a Mother's Love | Vedhathiri's",
  description: "Discover the origin of Vedhathiri's Skin Care. Born out of a mother's search for safe, organic, and chemical-free personal care for her family.",
};

export default function AboutPage() {
  return <AboutClient />;
}
