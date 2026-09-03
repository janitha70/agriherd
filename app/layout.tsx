import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Sinhala } from "next/font/google";
import "./globals.css";

// 1. Import the SyncProvider we just created
import SyncProvider from "@/components/SyncProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  variable: "--font-noto-sinhala",
});

export const metadata: Metadata = {
  title: "AgriHerd | Field Terminal",
  description: "Offline-first livestock management.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className={`min-h-full flex flex-col ${notoSinhala.variable}`}>
        {/* 2. Wrap your app children in the provider */}
        <LanguageProvider>
          <SyncProvider>
            {children}
          </SyncProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}