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
  title: "Spacious — an audio home for conversations that need room",
  description:
    "Spacious is an audio home for conversations that need room. Some are about something a person knows. Some are hard. Some are spicy. Some may eventually be deleted. Hosted by Grace.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
