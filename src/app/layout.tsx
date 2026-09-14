import type { Metadata } from "next";
import { Figtree, Newsreader } from "next/font/google";
import "./globals.css";

const serif = Newsreader({
  variable: "--font-haven-serif",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const sans = Figtree({
  variable: "--font-haven-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Haven",
  description: "A private AI companion. 18+ only. This is software, not a person.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
