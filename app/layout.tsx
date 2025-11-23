import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { QueryProvider } from "@/components/QueryProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { MSWProvider } from "./providers";
import { SWRegister } from "./sw-register";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fitness Tracker",
  description: "Track your fitness journey",
  manifest: "/manifest.json",
      appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Fitness Tracker",
      },
      other: {
        "mobile-web-app-capable": "yes",
      },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.className} dark`}>
        <MSWProvider>
          <AuthProvider>
            <QueryProvider>
              <AppShell>{children}</AppShell>
              <SWRegister />
            </QueryProvider>
          </AuthProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
