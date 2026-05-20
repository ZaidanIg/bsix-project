import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";

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

export const metadata = {
  title: "BMSF School System - SMP Bina Harapan Jatigede",
  description: "Sistem Informasi Manajemen Sekolah SMP Bina Harapan Jatigede",
};

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextSSRPlugin
          /**
           * The `extractRouterConfig` will extract the route config from the
           * router, so we don't have to pass it to the client.
           */
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
