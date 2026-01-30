import { Instrument_Sans, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { GlobalCommandMenu } from "@/components/global-command-menu";

const fontSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "ConnectX LMS - AI-Powered Learning Management System",
  description:
    "Transform engineering education with AI-driven collaboration, real-time coding, and immersive learning experiences.",
  keywords: [
    "LMS",
    "engineering education",
    "AI learning",
    "collaborative coding",
    "IoT simulation",
  ],
  authors: [{ name: "ConnectX Team" }],
  creator: "ConnectX",
  publisher: "ConnectX",
  openGraph: {
    title: "ConnectX LMS - AI-Powered Engineering Education",
    description:
      "Revolutionary LMS with AI pair programming, IoT simulations, and 3D algorithm visualizations for engineering students.",
    url: "https://connectx-lms.vercel.app", // Update this with your actual domain
    siteName: "ConnectX LMS",
    images: [
      {
        url: "/lms.harshjdhv.com_.png", // Your custom LMS preview image
        width: 1200,
        height: 630,
        alt: "ConnectX LMS - AI-Powered Engineering Education Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConnectX LMS - AI-Powered Engineering Education",
    description:
      "Revolutionary LMS with AI pair programming, IoT simulations, and 3D algorithm visualizations.",
    images: ["/lms.harshjdhv.com_.png"], // Same image for Twitter
    creator: "@connectx_lms", // Update with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />

        {/* Additional meta tags for better SEO */}
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
