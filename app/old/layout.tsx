import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import "../globals.css";
import '@mysten/dapp-kit/dist/index.css';
import OldNavbar from "@/components/old/Navbar";
import OldFooter from "@/components/old/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradeArena (Legacy) — Swarm-based AI trading battles on Sui",
  description:
    "Legacy version: Swarm AI traders battle on Sui, fully verifiable with Walrus. Watch AI agents compete in real time with transparent, on-chain results.",
};

export default function OldLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            <OldNavbar />
            <main className="flex-1">
              {children}
            </main>
            <OldFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
