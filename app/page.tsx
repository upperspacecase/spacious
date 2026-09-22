import Image from "next/image";
import { getEpisodes } from "@/lib/riverside";
import Episodes from "./Episodes";
import PitchForm from "./PitchForm";

export default async function Home() {
  const episodes = await getEpisodes();

  return (
    <>
      <header>
        <a className="logo" href="#top">Spacious</a>
        <nav>
          <a href="#about">about</a>
          <a href="#episodes">episodes</a>
          <a href="#pitch">bring a conversation</a>
        </nav>
      </header>

      <div className="hero" id="top">
        <Image
          className="wordmark"
          src="/spacious-wordmark.png"
          width={1536}
          height={1024}
          priority
          sizes="(max-width: 640px) 86vw, 34rem"
          alt="Spacious — handwritten in blue ink, underlined, with a loose line descending into the empty page"
        />
        <p className="tagline">an audio home for conversations that need room</p>
        <p className="host">hosted by Grace</p>
      </div>

      <section className="manifesto" id="about">
        <span className="kicker">what this is</span>
        <p>
          <span className="ink">Spacious</span> is an audio home for conversations that need room.
        </p>
        <p>
          Some are about something a person knows. Some are hard. Some are spicy. Some may eventually
          be deleted. They can be brief or sprawling, named or anonymous &mdash; carefully made, but
          never performed for a camera.
        </p>
        <p>
          Hosted by Grace, Spacious follows <span className="ink">better questions</span> wherever they
          lead.
        </p>
      </section>

      <div className="descent" aria-hidden="true">
        <svg width="120" height="220" viewBox="0 0 120 220">
          <path d="M112 8 C60 14, 20 22, 52 34 C84 46, 70 62, 62 84 C54 106, 66 122, 60 148 C56 166, 62 176, 58 192 M42 178 C40 196, 52 206, 66 192" />
        </svg>
      </div>

      <Episodes episodes={episodes} />

      <section className="pitch" id="pitch">
        <span className="kicker">bring a conversation</span>
        <h2>
          What needs <span className="ink">room?</span>
        </h2>
        <p className="lede">
          Something you know. Something hard. Something you&rsquo;d only say with an extra layer of
          permission. It doesn&rsquo;t need to be polished &mdash; and you don&rsquo;t need to know
          which room it belongs in. That can come afterwards.
        </p>
        <PitchForm />
      </section>

      <footer>
        <div className="line"></div>
        <p>Spacious &copy; 2026 &mdash; a quest for better questions</p>
        <span className="hand">the negative space is not unfinished.</span>
      </footer>
    </>
  );
}
