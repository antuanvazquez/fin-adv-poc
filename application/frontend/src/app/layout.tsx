import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Advisory Intelligence Platform",
  description: "Advisory Intelligence Platform — Partner Preview",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-[#0A0F1C] text-[#F0F0F5] antialiased min-h-screen`}>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,169,98,0.03)_0%,_transparent_50%)] pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
