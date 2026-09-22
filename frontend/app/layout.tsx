import type { Metadata } from "next";
import type { ReactNode } from "react";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import AuthFlowGuard from "../components/AuthFlowGuard";
import BackToTop from "../components/BackToTop";

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
  title: "Daily Ally",
  description:
    "Your personal AI-powered wellness companion.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          antialiased
        `}
      >
        <AuthFlowGuard>
          {children}
          <BackToTop />
        </AuthFlowGuard>
      </body>
    </html>
  );
}