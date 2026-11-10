export const THEMES = [
  "Teach Me Something",
  "Teach Me Something Hard",
  "Teach Me Something Spicy",
  "We'll Delete This",
] as const;

export type Episode = {
  num: string;
  title: string;
  guest: string | null;
  date: string;
  description: string;
  descriptionHtml: string;
  contact: { label: string; url: string } | null;
  audioUrl: string | null;
  seconds: number | null;
};

const PLACEHOLDERS: Episode[] = ["0001", "0002", "0003", "0004"].map((num, i) => ({
  num,
  title: "Coming soon",
  guest: null,
  date: `2026-09-${String(4 + i * 7).padStart(2, "0")}`,
  description: "",
  descriptionHtml: "",
  contact: null,
  audioUrl: null,
  seconds: null,
}));

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

function stripHtml(html: string): string {
  return decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

const ALLOWED_TAGS = new Set(["p", "br", "ul", "ol", "li", "b", "strong", "em", "i"]);

// Show notes are rendered as HTML in the episode modal, so keep only basic
// formatting tags and http(s) links, and drop every other tag and attribute.
function sanitizeHtml(html: string): string {
  return html
    .replace(/<(script|style|iframe)[\s\S]*?<\/\1>/gi, "")
    .replace(/<(\/?)([a-z0-9]+)([^>]*)>/gi, (_, slash: string, name: string, rest: string) => {
      const t = name.toLowerCase();
      if (t === "a") {
        if (slash) return "</a>";
        const href = rest.match(/href="(https?:\/\/[^"]*)"/i)?.[1];
        return href ? `<a href="${href}" target="_blank" rel="noopener noreferrer">` : "<a>";
      }
      return ALLOWED_TAGS.has(t) ? `<${slash}${t}>` : "";
    });
}

// Show notes list the guest's links under a "Find Erica:" heading; take the first one.
function findContact(html: string): { label: string; url: string } | null {
  const list = html.match(/Find [^<:]*:\s*<\/[^>]+>[\s\S]*?<ul>([\s\S]*?)<\/ul>/i)?.[1];
  const item = list?.match(/<li>([^<]*?):?\s*<a [^>]*href="(https?:\/\/[^"]*)"/i);
  return item ? { label: decode(item[1]).trim() || "Website", url: item[2] } : null;
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
  return h ? `${h}h ${m}m` : `${m}m`;
}

// Riverside titles look like "Spacious 0001 with Erica Bonham: A Joyful Disruption".
function splitTitle(raw: string): { title: string; guest: string | null } {
  const m = raw.match(/^Spacious\s+\d+\s+with\s+(.+?):\s*(.+)$/i);
  return m ? { title: m[2].trim(), guest: m[1].trim() } : { title: raw, guest: null };
}

function toIsoDate(pubDate: string): string {
  return new Date(pubDate).toISOString().slice(0, 10);
}

export function parseFeed(xml: string): Episode[] {
  const items = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/g) ?? [];
  const total = items.length;
  return items.map((item, i) => {
    // <description> is raw HTML in CDATA; itunes:summary is the same HTML entity-escaped.
    const html = tag(item, "description") ?? decode(tag(item, "itunes:summary") ?? "");
    const episodeNumber = tag(item, "itunes:episode");
    return {
      num: String(episodeNumber ?? total - i).padStart(4, "0"),
      ...splitTitle(decode(tag(item, "title") ?? "Untitled")),
      date: toIsoDate(tag(item, "pubDate") ?? ""),
      description: stripHtml(html),
      descriptionHtml: sanitizeHtml(html),
      contact: findContact(html),
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
