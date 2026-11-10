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
          {/* <a href="#pitch">bring a conversation</a> */}
          <a
            className="listen-now"
            href="https://podcasts.apple.com/us/podcast/spacious/id6833112785"
            target="_blank"
            rel="noopener noreferrer"
          >
            Listen now
          </a>
        </nav>
      </header>

      <div className="hero" id="top">
        <Image
          src="/spacious-hero.png"
          width={1536}
          height={1024}
          priority
          sizes="100vw"
          alt="Spacious — handwritten in cream over a dusk sky, with a line curving down to a lone oak in a wide field"
        />
        <div className="hero-copy">
          <p className="tagline">
            Wide ranging conversations about the human experience, how to navigate the world we live in
            and the one we are building.
          </p>
          <a className="cta" href="#episodes">Listen to the latest</a>
        </div>
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
        <svg className="squiggle" width="170" height="30" viewBox="0 0 170 30" aria-hidden="true">
          <path d="M3 26 C30 12, 62 2, 82 10 C92 14, 86 20, 98 16 C110 12, 118 8, 130 12 C140 15, 150 16, 167 13" />
        </svg>
        <p>Space to listen. Room to think.</p>
      </footer>
    </>
  );
}
