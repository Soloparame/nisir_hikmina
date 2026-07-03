import type { Metadata } from "next";
import AboutPage from "../../components/AboutPage";

export const metadata: Metadata = {
  title: "About Us — Eagle Medical",
  description:
    "Learn about Eagle Medical — connecting patients with trusted doctors in Ethiopia and abroad.",
};

export default function About() {
  return <AboutPage />;
}
