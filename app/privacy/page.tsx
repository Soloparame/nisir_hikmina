import type { Metadata } from "next";
import PrivacyPolicyPage from "../../components/PrivacyPolicyPage";

export const metadata: Metadata = {
  title: "Privacy & Policies — Eagle Medical",
  description:
    "Privacy Policy and Medical Disclaimer for Eagle Medical Care — how we collect, use, and protect your information.",
};

export default function Privacy() {
  return <PrivacyPolicyPage />;
}
