import { getImageProps } from "next/image";
import { getEpisodes } from "@/lib/riverside";
import Episodes from "./Episodes";
import RequestConversation from "./RequestConversation";

export default async function Home() {
  const episodes = await getEpisodes();

  const common = {
    alt: "Spacious — handwritten in blue ink over a clear sky, with a line curving down to a lone oak in a wide meadow",
    sizes: "100vw",
    loading: "eager",
    fetchPriority: "high",
  } as const;
  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, src: "/spacious-hero.png", width: 1536, height: 1024 });
  const {
    props: { srcSet: mobile, ...hero },
  } = getImageProps({ ...common, src: "/spacious-hero-mobile.png", width: 718, height: 1540 });

  return (
    <>
      <header>
        <a className="logo" href="#top">Spacious</a>
        <nav>
          <RequestConversation />
          <a className="listen-now" href="#episodes">
            Listen now
          </a>
        </nav>
      </header>

      <div className="hero" id="top">
        <picture>
          <source media="(min-width: 721px)" srcSet={desktop} />
          <source srcSet={mobile} />
          <img {...hero} alt={common.alt} />
        </picture>
      </div>

      <Episodes episodes={episodes} />

      <footer>
        <svg className="squiggle" width="170" height="30" viewBox="0 0 170 30" aria-hidden="true">
          <path d="M3 26 C30 12, 62 2, 82 10 C92 14, 86 20, 98 16 C110 12, 118 8, 130 12 C140 15, 150 16, 167 13" />
        </svg>
        <p className="tagline">
          Wide ranging conversations about the human experience, how to navigate the world we live in
          and the one we are building.
        </p>
        <p>Space to listen. Room to think.</p>
      </footer>
    </>
  );
}
