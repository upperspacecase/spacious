"use client";

import type { FormEvent } from "react";

export default function PitchForm() {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => encodeURIComponent(String(data.get(k) ?? ""));
    const subject = encodeURIComponent("Spacious — conversation request");
    const body =
      "Name: " + get("name") +
      "%0D%0AWhatsApp: " + get("whatsapp") +
      "%0D%0AEmail: " + (get("email") || "not given") +
      "%0D%0A%0D%0AWhat they want to talk about:%0D%0A" + get("topic");
    window.location.href = "mailto:taytoddpattison@gmail.com?subject=" + subject + "&body=" + body;
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="name">Your name</label>
        <input type="text" id="name" name="name" required autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="whatsapp">WhatsApp number</label>
        <input type="tel" id="whatsapp" name="whatsapp" required autoComplete="tel" placeholder="Include your country code" />
      </div>
      <div className="field">
        <label htmlFor="email">Email (optional)</label>
        <input type="email" id="email" name="email" autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="topic">What would you like to talk about?</label>
        <textarea id="topic" name="topic" required />
      </div>
      <button type="submit">Send</button>
    </form>
  );
}
