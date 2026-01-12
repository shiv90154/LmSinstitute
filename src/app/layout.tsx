import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AppProviders from "@/components/providers/app-providers";
import Navigation from "@/components/layout/navigation";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Career Path Institute - LMS",
  description: "Comprehensive Learning Management System for competitive exam preparation",
  keywords: ["LMS", "education", "competitive exams", "online learning", "Career Path Institute"],
  authors: [{ name: "Career Path Institute" }],
  robots: "index, follow",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CPI LMS",
  },
  openGraph: {
    type: "website",
    siteName: "Career Path Institute LMS",
    title: "Career Path Institute - LMS",
    description: "Comprehensive Learning Management System for competitive exam preparation",
  },
  twitter: {
    card: "summary_large_image",
    title: "Career Path Institute - LMS",
    description: "Comprehensive Learning Management System for competitive exam preparation",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#3b82f6",
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
        <AppProviders>
          <div className="min-h-screen bg-background flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t mt-auto">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-muted-foreground">
                <p className="text-sm">&copy; 2024 Career Path Institute. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
