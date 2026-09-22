import type { Metadata } from "next";
import { Archivo, Yaldevi } from "next/font/google";
import "./globals.css";

// 1. Import the SyncProvider we just created
import SyncProvider from "@/components/SyncProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const yaldevi = Yaldevi({
  subsets: ["sinhala"],
  variable: "--font-yaldevi",
  weight: ["400", "500", "700"],
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
    <html lang="en" className={`${archivo.variable} ${yaldevi.variable} h-full antialiased`}>
      <body className={`min-h-full flex flex-col font-sans`}>
        {/* 2. Wrap your app children in the provider */}
        <ThemeProvider>
          <LanguageProvider>
            <SyncProvider>
              {children}
            </SyncProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}