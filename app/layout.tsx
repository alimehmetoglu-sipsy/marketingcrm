import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Marketing CRM - Modern Customer Relationship Management",
  description: "A modern, AI-powered CRM system for managing leads, investors, and tasks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      
      {/* WUUNU SNIPPET - DON'T CHANGE THIS (START) */}
      {process.env.NODE_ENV !== "production" && (
        <>
          <Script id="wuunu-ws" strategy="afterInteractive">
            { `window.__WUUNU_WS__ = "http://127.0.0.1:38921/";` }
          </Script>
          <Script
            id="wuunu-widget"
            src="https://cdn.jsdelivr.net/npm/@wuunu/widget@0.1?cacheParam=438"
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        </>
      )}
      {/* WUUNU SNIPPET - DON'T CHANGE THIS (END) */}
</body>
    </html>
  );
}
