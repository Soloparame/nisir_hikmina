import type { Metadata } from "next";
import Providers from "../components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ንስር ሕክምና — የታመነ የጤና መድረክ",
  description:
    "በብቁ የጤና ባለሙያዎች የሕክምና ምክክር ያስይዙ። በአካል፣ በድምጽ ወይም በቪዲዮ።",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="am">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
