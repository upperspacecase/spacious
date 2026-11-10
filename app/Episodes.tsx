"use client";

import { useState } from "react";
import { THEMES, formatDuration, type Episode, type Theme } from "@/lib/riverside";

const LABELS: Record<Theme, string> = {
  "Teach Me Something": "Teach Me Something",
  "Teach Me Something Hard": "Hard",
  "Teach Me Something Spicy": "Spicy",
  "We'll Delete This": "We’ll Delete This",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

export default function Episodes({ episodes }: { episodes: Episode[] }) {
  const sorted = [...episodes].sort((a, b) => b.date.localeCompare(a.date));
  const [current, setCurrent] = useState<Episode>(sorted[0]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [activeTheme, setActiveTheme] = useState<Theme | "all">("all");

  const list = sorted.filter((ep) => activeTheme === "all" || ep.theme === activeTheme);
  const isLatest = current.num === sorted[0].num;

  function play(ep: Episode) {
    setCurrent(ep);
    setAutoPlay(true);
    document.getElementById("latest")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <section className="latest" id="latest">
        <div className="latest-title">
          <span className="eyebrow">{isLatest ? "Latest episode" : "Now playing"}</span>
          <h2>{current.title}</h2>
          {current.guest && <p className="guest">with {current.guest}</p>}
        </div>
        <div className="latest-detail">
          {current.blurb && <p className="blurb">{current.blurb}</p>}
          <span className="pill">{current.theme}</span>
          <p className="meta">
            EP {current.num} &middot; {formatDate(current.date)}
            {current.seconds ? ` · ${formatDuration(current.seconds)}` : ""}
          </p>
          {current.audioUrl && (
            <audio key={current.num} controls preload="none" autoPlay={autoPlay} src={current.audioUrl} />
          )}
        </div>
      </section>

      <section className="find" id="episodes">
        <div className="find-inner">
          <h2>Find your conversation</h2>
          <div className="filters">
            <button type="button" className={activeTheme === "all" ? "active" : ""} onClick={() => setActiveTheme("all")}>
              All
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
          </div>
          {list.length === 0 ? (
            <p className="empty">nothing in this theme yet &mdash; maybe that&rsquo;s yours to start.</p>
          ) : (
            <ul className="ep-list">
              {list.map((ep) => (
                <li key={ep.num}>
                  <button
                    type="button"
                    className="play"
                    onClick={() => play(ep)}
                    disabled={!ep.audioUrl}
                    aria-label={`Play ${ep.title}`}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 7.5v9l7.5-4.5z" />
                    </svg>
                  </button>
                  <span className="num">{ep.num}</span>
                  <span className="title">{ep.title}</span>
                  <span className="guest">{ep.guest}</span>
                  <span className="length">{ep.seconds ? `${Math.round(ep.seconds / 60)} min` : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
