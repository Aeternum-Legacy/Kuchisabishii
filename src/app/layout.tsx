import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getBaseUrl } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Get the base URL for proper metadata resolution
const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Kuchisabishii - When Your Mouth is Lonely",
  description: "Food journaling app for emotional food experiences - Rate dishes, not just restaurants. Discover your taste profile and connect with food lovers.",
  keywords: ["food", "journaling", "taste", "restaurants", "AI recommendations", "social dining"],
  authors: [{ name: "Kuchisabishii Team" }],
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
      { url: "/images/kuchisabishii-logo.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [
      { url: "/images/kuchisabishii-logo.png", sizes: "180x180", type: "image/png" }
    ]
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Kuchisabishii - When Your Mouth is Lonely",
    description: "Food journaling app for emotional food experiences",
    url: baseUrl,
    siteName: "Kuchisabishii",
    images: [
      {
        url: "/images/kuchisabishii-logo.png",
        width: 192,
        height: 192,
        alt: "Kuchisabishii Logo"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Kuchisabishii - When Your Mouth is Lonely",
    description: "Food journaling app for emotional food experiences",
    images: ["/images/kuchisabishii-logo.png"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
