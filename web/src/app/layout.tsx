import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Essential for 'app-like' feel on iOS
};

export const metadata: Metadata = {
  title: "Finance Track",
  description: "极简个人财务追踪器",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // Makes status bar transparent/overlay
    title: "Finance Track",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body
        className={`${dmSans.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
