import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SplitLink — Affiliate Payment Links for SMEs",
  description:
    "Create affiliate payment links with automatic commission splitting. Let creators promote your products and get paid instantly via Stripe.",
  openGraph: {
    title: "SplitLink — Affiliate Payment Links for SMEs",
    description:
      "Create affiliate payment links with automatic commission splitting.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasValidClerkKey =
    Boolean(publishableKey) &&
    (publishableKey!.startsWith("pk_test_") || publishableKey!.startsWith("pk_live_")) &&
    !publishableKey!.includes("placeholder");

  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${fraunces.variable} ${inter.variable}`}
    >
      <body className="min-h-full antialiased bg-canvas text-charcoal">
        {hasValidClerkKey ? <ClerkProvider>{children}</ClerkProvider> : children}
      </body>
    </html>
  );
}
