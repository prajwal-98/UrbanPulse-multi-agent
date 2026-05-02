import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UrbanPulse · Multi-Agent Intelligence System",
  description:
    "Transform customer reviews into boardroom decisions using multi-agent AI. Revenue risk detection, platform analysis, and executive insights.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
