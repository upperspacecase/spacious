"use client";

import type { FormEvent } from "react";
import { THEMES } from "@/lib/riverside";

export default function PitchForm() {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => encodeURIComponent(String(data.get(k) ?? ""));
    const subject = encodeURIComponent("Spacious — a conversation that needs room");
    const body =
      "Name: " + get("name") +
      "%0D%0AWhatsApp: " + get("whatsapp") +
      "%0D%0AEmail: " + (get("email") || "not given") +
      "%0D%0ATheme: " + get("room") +
      "%0D%0A%0D%0AThe conversation:%0D%0A" + get("topic");
    window.location.href = "mailto:taytoddpattison@gmail.com?subject=" + subject + "&body=" + body;
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="name">a name to call you</label>
        <input type="text" id="name" name="name" required placeholder="your name, or one you'd rather go by" />
      </div>
      <div className="field">
        <label htmlFor="whatsapp">where to reach you</label>
        <input type="tel" id="whatsapp" name="whatsapp" required autoComplete="tel" placeholder="your WhatsApp number, e.g. +44 7700 900000" />
      </div>
      <div className="field">
        <label htmlFor="email">email, if you&rsquo;d rather</label>
        <input type="email" id="email" name="email" autoComplete="email" placeholder="optional" />
      </div>
      <div className="field">
        <label htmlFor="room">which theme, if you know</label>
        <select id="room" name="room" defaultValue="Not sure yet">
          <option value="Not sure yet">not sure yet — that&rsquo;s fine</option>
          {THEMES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="topic">the conversation</label>
        <textarea id="topic" name="topic" required placeholder="What do you want to talk about, and where might it go that an ordinary interview wouldn't?" />
      </div>
      <button type="submit">send it &rarr;</button>
    </form>
  );
}
