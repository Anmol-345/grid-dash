import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grindshot Online",
  description:
    "Grindshot Online is a minimalistic free aim trainer. It will improve your accuracy and reflexes with different game modes. No signup, just play!",
  keywords: [
    "aim trainer",
    "grindshot online",
    "fps trainer",
    "browser aim trainer",
    "3d aim trainer",
  ],
  authors: [{ name: "Grindshot Team" }],
  creator: "Grindshot Team",
  robots: "index, follow",
  metadataBase: new URL("https://grindshot.online"),
  openGraph: {
    title: "Grindshot Online - Free Aim Trainer",
    description:
      "Grindshot Online is a minimalistic free aim trainer. It will improve your accuracy and reflexes with different game modes. No signup, just play!",
    url: "https://grindshot.online",
    siteName: "Grindshot Online",
    type: "website",
    images: [
      {
        url: "https://grindshot.online/slogo.png",
        width: 1200,
        height: 630,
        alt: "Grindshot Online preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grindshot Online - Free Aim Trainer",
    description:
      "Grindshot Online is a minimalistic free aim trainer. It will improve your accuracy and reflexes with different game modes. No signup, just play!",
    images: ["https://grindshot.online/slogo.png"],
  },
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="relative h-full overflow-hidden bg-[#f8f8f8] font-mono text-black"
      >
        {children}
      </body>
    </html>
  );
}
