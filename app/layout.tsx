import type { Metadata, Viewport } from "next";
import Providers from "../components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ኢግል ሜዲካል — የታመነ የጤና መድረክ",
  description:
    "በብቁ የጤና ባለሙያዎች የሕክምና ምክክር ያስይዙ። በአካል፣ በድምጽ ወይም በቪዲዮ።",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
