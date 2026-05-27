import type { Metadata } from "next";
import AboutPage from "../../components/AboutPage";

export const metadata: Metadata = {
  title: "About Us — Nisir Health",
  description:
    "Learn about Nisir Health — connecting patients with trusted doctors in Ethiopia and abroad.",
};

export default function About() {
  return <AboutPage />;
}
