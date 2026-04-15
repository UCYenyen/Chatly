import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import SplashCursor from "@/components/personal/SplashCursor";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { TransitionProvider } from "@/components/providers/TransitionProvider";

export const metadata: Metadata = {
  title: "Chatly",
  description: "Chatbot AI canggih untuk bisnis Anda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex">
        <main className="flex-1 w-full flex flex-col h-full bg-background overflow-auto relative">
          <TransitionProvider>
            {children}
            <SplashCursor SPLAT_FORCE={9000} />  
            <Toaster richColors position="bottom-right" duration={3000} closeButton />
          </TransitionProvider>
        </main>
      </body>
    </html>
  );
}
