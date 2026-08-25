import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavBar } from "@/app/components/NavBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grow Up - Tracker Progres Mingguan",
  description: "Lacak progres usaha, konten, karir, dan skill setiap minggu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-zinc-900 dark:text-zinc-50">
        <div className="ambient-bg" />
        <NavBar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
