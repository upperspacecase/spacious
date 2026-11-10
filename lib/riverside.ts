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
  guest: string | null;
  theme: Theme;
  date: string;
  blurb: string;
  audioUrl: string | null;
  seconds: number | null;
};

const PLACEHOLDERS: Episode[] = [
  { num: "0001", title: "Coming soon", guest: null, theme: "Teach Me Something", date: "2026-09-04", blurb: "", audioUrl: null, seconds: null },
  { num: "0002", title: "Coming soon", guest: null, theme: "Teach Me Something Hard", date: "2026-09-18", blurb: "", audioUrl: null, seconds: null },
  { num: "0003", title: "Coming soon", guest: null, theme: "Teach Me Something Spicy", date: "2026-10-02", blurb: "", audioUrl: null, seconds: null },
  { num: "0004", title: "Coming soon", guest: null, theme: "We'll Delete This", date: "2026-10-16", blurb: "", audioUrl: null, seconds: null },
];

function tag(xml: string, name: string): string | null {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  if (!m) return null;
  return m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1").trim();
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

function attr(xml: string, name: string, attribute: string): string | null {
  const m = xml.match(new RegExp(`<${name}\\s[^>]*?${attribute}="([^"]*)"`));
  return m ? decode(m[1]) : null;
}

// itunes:summary arrives entity-escaped, so decode before stripping tags.
function stripHtml(s: string): string {
  return decode(decode(s).replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function toSeconds(raw: string | null): number | null {
  if (!raw) return null;
  return /^\d+$/.test(raw)
    ? parseInt(raw, 10)
    : raw.split(":").reduce((acc, part) => acc * 60 + parseInt(part, 10), 0);
}

export function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m} min`;
}

// Riverside titles look like "Spacious 0001 with Erica Bonham: A Joyful Disruption".
function splitTitle(raw: string): { title: string; guest: string | null } {
  const m = raw.match(/^Spacious\s+\d+\s+with\s+(.+?):\s*(.+)$/i);
  return m ? { title: m[2].trim(), guest: m[1].trim() } : { title: raw, guest: null };
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
    const rawTitle = decode(tag(item, "title") ?? "Untitled");
    const description = stripHtml(tag(item, "itunes:summary") ?? tag(item, "description") ?? "");
    const keywords = tag(item, "itunes:keywords") ?? "";
    const episodeNumber = tag(item, "itunes:episode");
    const num = String(episodeNumber ?? total - i).padStart(4, "0");
    return {
      num,
      ...splitTitle(rawTitle),
      theme: themeFor(`${rawTitle} ${keywords}`),
      date: toIsoDate(tag(item, "pubDate") ?? ""),
      blurb: description.length > 220 ? description.slice(0, 220).replace(/\s+\S*$/, "") + "…" : description,
      audioUrl: attr(item, "enclosure", "url"),
      seconds: toSeconds(tag(item, "itunes:duration")),
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
