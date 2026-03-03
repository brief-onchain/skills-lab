import type { Metadata } from "next";
import { Orbitron, Noto_Sans_SC, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({ 
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const notoSans = Noto_Sans_SC({ 
  subsets: ["latin"],
  variable: "--font-noto",
  display: "swap",
});

const jetbrains = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkillsBrain | Binance/BSC Skills Hub",
  description: "Intelligence Unleashed. The premier hub for BSC skills and on-chain intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${orbitron.variable} ${notoSans.variable} ${jetbrains.variable} bg-bg text-text-main font-body antialiased selection:bg-gold selection:text-bg`}>
        {children}
      </body>
    </html>
  );
}
