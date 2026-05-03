import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import TanstackProvider from "@/components/providers/tanstack-provider";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModalProvider } from "@/components/providers/modal-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const sans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: {
    default: "Discord clone - Akkal Dhami",
    template: "%s | Discord clone - Akkal Dhami"
  },
  description:
    "A Discord clone built with Next.js, React Query, Shadcn and Tailwind CSS. This project is a demonstration of my skills in building a full-stack web application with modern technologies."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} font-sans ${mono.variable} h-full antialiased`}>
      <body className="selection:bg-primary-600 flex min-h-full flex-col selection:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange>
          <Toaster position="top-center" reverseOrder={false} gutter={8} />
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <TooltipProvider>
            <TanstackProvider>
              <SessionProvider>
                <NuqsAdapter>
                  <ModalProvider />
                  {children}
                </NuqsAdapter>
              </SessionProvider>
            </TanstackProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
