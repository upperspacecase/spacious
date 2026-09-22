export const THEMES = [
  "Teach Me Something",
  "Teach Me Something Hard",
  "Teach Me Something Spicy",
  "We'll Delete This",
] as const;

export type Theme = (typeof THEMES)[number];

export type Episode = {
  num: string;
  title: string;
  theme: Theme;
  date: string;
  blurb: string;
  audioUrl: string | null;
  duration: string | null;
};

const PLACEHOLDERS: Episode[] = [
  { num: "001", title: "Spacious 001", theme: "Teach Me Something", date: "2026-09-04", blurb: "coming soon", audioUrl: null, duration: null },
  { num: "002", title: "Spacious 002", theme: "Teach Me Something Hard", date: "2026-09-18", blurb: "coming soon", audioUrl: null, duration: null },
  { num: "003", title: "Spacious 003", theme: "Teach Me Something Spicy", date: "2026-10-02", blurb: "coming soon", audioUrl: null, duration: null },
  { num: "004", title: "Spacious 004", theme: "We'll Delete This", date: "2026-10-16", blurb: "coming soon", audioUrl: null, duration: null },
];

function tag(xml: string, name: string): string | null {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  if (!m) return null;
  return m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1").trim();
}

function attr(xml: string, name: string, attribute: string): string | null {
  const m = xml.match(new RegExp(`<${name}\\s[^>]*?${attribute}="([^"]*)"`));
  return m ? m[1] : null;
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function stripHtml(s: string): string {
  return decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function themeFor(text: string): Theme {
  const t = text.toLowerCase();
  if (t.includes("delete")) return "We'll Delete This";
  if (t.includes("spicy")) return "Teach Me Something Spicy";
  if (t.includes("hard")) return "Teach Me Something Hard";
  return "Teach Me Something";
}

function toIsoDate(pubDate: string): string {
  return new Date(pubDate).toISOString().slice(0, 10);
}

export function parseFeed(xml: string): Episode[] {
  const items = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/g) ?? [];
  const total = items.length;
  return items.map((item, i) => {
    const title = decode(tag(item, "title") ?? "Untitled");
    const description = tag(item, "itunes:summary") ?? tag(item, "description") ?? "";
    const keywords = tag(item, "itunes:keywords") ?? "";
    const episodeNumber = tag(item, "itunes:episode");
    const num = String(episodeNumber ?? total - i).padStart(3, "0");
    return {
      num,
      title,
      theme: themeFor(`${title} ${keywords}`),
      date: toIsoDate(tag(item, "pubDate") ?? ""),
      blurb: stripHtml(description).slice(0, 220),
      audioUrl: attr(item, "enclosure", "url"),
      duration: tag(item, "itunes:duration"),
    };
  });
}

export async function getEpisodes(): Promise<Episode[]> {
  const url = process.env.RIVERSIDE_RSS_URL;
  if (!url) return PLACEHOLDERS;
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) return PLACEHOLDERS;
  const episodes = parseFeed(await res.text());
  return episodes.length ? episodes : PLACEHOLDERS;
}
