import Image from "next/image";
import { getEpisodes } from "@/lib/riverside";
import Episodes from "./Episodes";
// import PitchForm from "./PitchForm";

export default async function Home() {
  const episodes = await getEpisodes();

  return (
    <>
      <header>
        <a className="logo" href="#top">Spacious</a>
        <nav>
          <a href="#episodes">episodes</a>
          {/* <a href="#pitch">bring a conversation</a> */}
        </nav>
      </header>

      <div className="hero" id="top">
        <Image
          className="wordmark"
          src="/spacious-hero.png"
          width={718}
          height={1540}
          priority
          sizes="(max-width: 640px) 80vw, 22rem"
          alt="Spacious — handwritten in blue ink over a blue sky, with a line curving down to a lone tree in a wide green field"
        />
        <p className="tagline">
          Wide ranging conversations about the human experience, how to navigate the world we live in
          and the one we are building.
        </p>
      </div>

      <div className="descent" aria-hidden="true">
        <svg width="120" height="220" viewBox="0 0 120 220">
          <path d="M112 8 C60 14, 20 22, 52 34 C84 46, 70 62, 62 84 C54 106, 66 122, 60 148 C56 166, 62 176, 58 192 M42 178 C40 196, 52 206, 66 192" />
        </svg>
      </div>

      <Episodes episodes={episodes} />

      {/*
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
      */}

      <footer>
        <div className="line"></div>
        <p>Spacious &copy; 2026 &mdash; a quest for better questions</p>
        <span className="hand">the negative space is not unfinished.</span>
      </footer>
    </>
  );
}
