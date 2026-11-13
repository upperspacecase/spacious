// Daily Instagram question reels.
//   node scripts/reel/reels.mjs render   renders a reel for each question in questions.txt
//   node scripts/reel/reels.mjs post     hands the first question's reel to Buffer
// questions.txt holds one question per line, posted top to bottom.

import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SITE = "https://spacious.live";
const QUEUE = "questions.txt";
const POSTED = "questions-posted.txt";
const OUT = "public/reels";
const FONT = "scripts/reel/Newsreader.ttf";
const SECONDS = "7";

const questions = () =>
  readFileSync(QUEUE, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const slug = (question) =>
  question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

// ImageMagick reads % and \ in caption text as escapes.
const literal = (text) => text.replace(/\\/g, "\\\\").replace(/%/g, "%%");

function renderReel(question, file) {
  const tmp = mkdtempSync(join(tmpdir(), "reel-"));
  const text = join(tmp, "question.png");
  const footer = join(tmp, "footer.png");
  const type = ["-background", "none", "-font", FONT, "-gravity", "center"];
  execFileSync("convert", [
    ...type, "-fill", "#fbfbf9", "-pointsize", "88", "-interline-spacing", "14",
    "-size", "880x", `caption:${literal(question)}`, text,
  ]);
  execFileSync("convert", [...type, "-fill", "#9aa6ff", "-pointsize", "44", "label:spacious.live", footer]);
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error",
    "-f", "lavfi", "-i", `color=c=0x0b13a6:s=1080x1920:r=30:d=${SECONDS}`,
    "-loop", "1", "-t", SECONDS, "-i", text,
    "-loop", "1", "-t", SECONDS, "-i", footer,
    "-f", "lavfi", "-t", SECONDS, "-i", "anullsrc=r=44100:cl=stereo",
    "-filter_complex",
    "[1:v]format=rgba,fade=t=in:st=0.6:d=1.6:alpha=1[q];" +
      "[2:v]format=rgba,fade=t=in:st=2.4:d=1.2:alpha=1[f];" +
      "[0:v][q]overlay=(W-w)/2:(H-h)/2[a];" +
      "[a][f]overlay=(W-w)/2:H-h-220[v]",
    "-map", "[v]", "-map", "3:a",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac",
    "-t", SECONDS, "-movflags", "+faststart", file,
  ]);
}

function render() {
  mkdirSync(OUT, { recursive: true });
  for (const question of questions()) {
    const file = join(OUT, `${slug(question)}.mp4`);
    if (existsSync(file)) continue;
    renderReel(question, file);
    console.log(`rendered ${file}`);
  }
}

const CREATE_POST = `
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    __typename
    ... on PostActionSuccess { post { id dueAt status } }
    ... on MutationError { message }
  }
}`;

async function post() {
  const [question, ...rest] = questions();
  if (!question) throw new Error(`${QUEUE} is empty: nothing to post today`);

  const url = `${SITE}/reels/${slug(question)}.mp4`;
  const reel = await fetch(url, { method: "HEAD" });
  if (!reel.ok) throw new Error(`Reel not live yet: ${url} returned ${reel.status}`);

  const res = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.BUFFER_API_KEY}`,
    },
    body: JSON.stringify({
      query: CREATE_POST,
      variables: {
        input: {
          channelId: process.env.BUFFER_CHANNEL_ID,
          schedulingType: "automatic",
          mode: "customScheduled",
          dueAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          text: `${question}\n\nSpace to listen. Room to think.\nspacious.live`,
          metadata: { instagram: { type: "reel", shouldShareToFeed: true } },
          assets: [{ video: { url, metadata: { title: question } } }],
        },
      },
    }),
  });
  const body = await res.json();
  const result = body.data?.createPost;
  if (!result?.post) throw new Error(`Buffer did not accept the post: ${JSON.stringify(body)}`);

  writeFileSync(QUEUE, rest.map((line) => `${line}\n`).join(""));
  appendFileSync(POSTED, `${new Date().toISOString().slice(0, 10)}\t${question}\n`);
  console.log(`queued "${question}" as Buffer post ${result.post.id}, due ${result.post.dueAt}`);
}

await { render, post }[process.argv[2]]();
