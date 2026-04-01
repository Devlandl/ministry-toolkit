import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import InstallPrompt from "@/components/InstallPrompt";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://ministrytoolkit.tvrapp.app"),
  title: {
    default: "Ministry Toolkit - AI-Powered Sermon & Lesson Creator",
    template: "%s | Ministry Toolkit",
  },
  description:
    "Enter a Bible verse or topic, get a complete teaching toolkit - sermon outline, object lesson, discussion questions, prayer points, and kids version. Free for all church leaders.",
  keywords: [
    "sermon creator",
    "object lesson generator",
    "bible study tools",
    "church leader resources",
    "ministry tools",
    "sermon outline",
    "sunday school lessons",
  ],
  authors: [{ name: "TVR App Store" }],
  creator: "TVR App Store",
  publisher: "TVR App Store",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ministrytoolkit.tvrapp.app",
    siteName: "Ministry Toolkit",
    title: "Ministry Toolkit - AI-Powered Sermon & Lesson Creator",
    description:
      "Enter a Bible verse or topic, get a complete teaching toolkit. Free for all church leaders.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ministry Toolkit - AI-Powered Sermon & Lesson Creator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ministry Toolkit - AI-Powered Sermon & Lesson Creator",
    description:
      "Enter a Bible verse or topic, get a complete teaching toolkit. Free for all church leaders.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8B5CF6" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className={`${inter.className} bg-brand-black text-brand-white`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <InstallPrompt />
      </body>
    </html>
  );
}
