import type { Metadata } from "next";
import { Fraunces, Manrope, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-script",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Aashu - The Unwritten Verse",
    template: "%s — My Blog",
  },
  description:
    "A personal space for stories, poems, thoughts and little moments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${manrope.variable} ${caveat.variable}`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
