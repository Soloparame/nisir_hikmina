import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nisir Hikimina — Ethiopia's Trusted Health Platform",
  description: "Book medical consultations with qualified professionals across Ethiopia. In person, audio call, or video call.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
