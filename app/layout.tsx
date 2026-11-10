import type { Metadata } from "next";
import { Newsreader, Caveat } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spacious",
  description:
    "Wide ranging conversations about the human experience, how to navigate the world we live in and the one we are building.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
