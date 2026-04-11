import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import "@snc0x/baseupi-react/styles.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "BUY67 - Digital Product Marketplace for Creators",
  description:
    "Sell your digital products with zero commission. Accept UPI payments directly. Built for Indian creators.",
  keywords: ["digital products", "marketplace", "UPI", "Indian creators", "sell online"],
  openGraph: {
    title: "BUY67 - Digital Product Marketplace for Creators",
    description: "Sell your digital products with zero commission. Accept UPI payments directly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
