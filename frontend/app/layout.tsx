import type {
  Metadata
} from "next";

import type {
  ReactNode
} from "react";

import {
  Geist,
  Geist_Mono
} from "next/font/google";

import AuthFlowGuard from "../components/AuthFlowGuard";

import "./globals.css";


const geistSans =
  Geist({
    variable:
      "--font-geist-sans",

    subsets:
      [
        "latin"
      ],
  });


const geistMono =
  Geist_Mono({
    variable:
      "--font-geist-mono",

    subsets:
      [
        "latin"
      ],
  });


// =========================================================
// METADATA
// =========================================================

export const metadata: Metadata = {

  title:
    "Daily Ally",

  description:
    "Your everyday companion for nutrition, fitness, sleep and wellbeing.",

};


// =========================================================
// ROOT LAYOUT
// =========================================================

export default function RootLayout({
  children,
}: {
  children:
    ReactNode;
}) {

  return (

    <html
      lang="en"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        h-full
        antialiased
      `}
    >

      <body className="min-h-full">

        <AuthFlowGuard>

          {children}

        </AuthFlowGuard>

      </body>

    </html>

  );

}