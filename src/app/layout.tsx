import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "VulnWatch AI — Intelligent Vulnerability Detection";
const appDescription =
  "Intelligent vulnerability detection for your domains and GitHub repositories — continuous, non-intrusive scans with severity-ranked findings and step-by-step fixes anyone can follow.";
const ogImage = "/images/logo.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: appName,
  icons: {
    icon: "/images/logo-auth.png",
    shortcut: "/images/logo-auth.png",
    apple: "/images/logo-auth.png",
  },
  title: {
    default: appName,
    template: `%s · ${appName}`,
  },
  description: appDescription,
  openGraph: {
    type: "website",
    url: appUrl,
    siteName: appName,
    title: appName,
    description: appDescription,
    images: [{ url: ogImage, width: 516, height: 144, alt: "VulnWatch AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: appDescription,
    images: [ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        <ReactQueryProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
