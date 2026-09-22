"use client";

import { useState } from "react";
import { THEMES, type Episode, type Theme } from "@/lib/riverside";

const LABELS: Record<Theme, string> = {
  "Teach Me Something": "Teach Me Something",
  "Teach Me Something Hard": "Hard",
  "Teach Me Something Spicy": "Spicy",
  "We'll Delete This": "We'll Delete This",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

export default function Episodes({ episodes }: { episodes: Episode[] }) {
  const [activeTheme, setActiveTheme] = useState<Theme | "all">("all");
  const [newestFirst, setNewestFirst] = useState(true);

  const list = episodes
    .filter((ep) => activeTheme === "all" || ep.theme === activeTheme)
    .sort((a, b) => (newestFirst ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));

  return (
    <section className="episodes" id="episodes">
      <span className="kicker">episodes</span>
      <div className="filters">
        <button type="button" className={activeTheme === "all" ? "active" : ""} onClick={() => setActiveTheme("all")}>
          all
        </button>
        {THEMES.map((theme) => (
          <button
            key={theme}
            type="button"
            className={activeTheme === theme ? "active" : ""}
            onClick={() => setActiveTheme(theme)}
          >
            {LABELS[theme]}
          </button>
        ))}
        <button type="button" className="sort" onClick={() => setNewestFirst((v) => !v)}>
          {newestFirst ? "newest first ↓" : "oldest first ↑"}
        </button>
      </div>
      <div className="carousel">
        {list.length === 0 ? (
          <p className="empty">nothing in this theme yet — maybe that’s yours to start.</p>
        ) : (
          list.map((ep) => (
            <article className="ep-card" key={ep.num + ep.title}>
              <span className="theme">{ep.theme}</span>
              <h3>{ep.title}</h3>
              <p className="date">
                {formatDate(ep.date)} · ep {ep.num}
                {ep.duration ? ` · ${ep.duration}` : ""}
              </p>
              <p className="blurb">{ep.blurb}</p>
              {ep.audioUrl && <audio controls preload="none" src={ep.audioUrl} />}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
