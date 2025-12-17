import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Guirilandia - Repetición Espaciada",
  description: "Aprende vocabulario alemán con repetición espaciada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 min-h-screen pb-20 md:pb-0`}
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Guirilandia
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Domina el vocabulario con repetición espaciada
            </p>
          </header>
          <Navigation />
          <main>{children}</main>
        </div>
        <Navigation />
      </body>
    </html>
  );
}
