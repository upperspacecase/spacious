// Daily Instagram question reels.
//   node scripts/reel/reels.mjs render   renders a reel for each unposted question
//   node scripts/reel/reels.mjs post     hands the next question's reel to Buffer
// Questions live in the Notion database "Spacious questions". A row with no
// Posted date is waiting; they post in order of the No column.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SITE = "https://spacious.live";
const NOTION_DATABASE = "41842ee2443b8102b2ccefbbba01b555";
const OUT = "public/reels";
const FONT = "scripts/reel/Newsreader.ttf";
const SECONDS = "7";

async function notion(method, path, body) {
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Notion ${method} ${path} returned ${res.status}: ${await res.text()}`);
  return res.json();
}

async function questions() {
  const { results } = await notion("POST", `databases/${NOTION_DATABASE}/query`, {
    filter: { property: "Posted", date: { is_empty: true } },
    sorts: [{ property: "No", direction: "ascending" }],
  });
  return results
    .map((page) => ({
      id: page.id,
      text: page.properties.Question.title.map((part) => part.plain_text).join("").trim(),
    }))
    .filter((question) => question.text);
}

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

async function render() {
  mkdirSync(OUT, { recursive: true });
  for (const { text } of await questions()) {
    const file = join(OUT, `${slug(text)}.mp4`);
    if (existsSync(file)) continue;
    renderReel(text, file);
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

const nextDay = (day) => new Date(Date.parse(day) + 86_400_000).toISOString().slice(0, 10);

// Schedules every waiting question, one per day, after the last day already
// taken. Buffer caps how many posts can be scheduled at once, so each run
// tops the schedule up as far as Buffer allows.
async function post() {
  const waiting = await questions();
  const { results: [latest] } = await notion("POST", `databases/${NOTION_DATABASE}/query`, {
    filter: { property: "Posted", date: { is_not_empty: true } },
    sorts: [{ property: "Posted", direction: "descending" }],
    page_size: 1,
  });
  const today = new Date().toISOString().slice(0, 10);
  const lastDay = latest?.properties.Posted.date.start.slice(0, 10);
  if (!waiting.length) {
    if (!lastDay || lastDay < today) throw new Error("No questions left in Notion: nothing to post today");
    return;
  }

  let day = lastDay >= today ? nextDay(lastDay) : today;
  for (const { id, text } of waiting) {
    // A reel rendered in this run is only reachable once the site has redeployed.
    const url = `${SITE}/reels/${slug(text)}.mp4`;
    let live = false;
    for (let attempt = 0; attempt < 40 && !live; attempt++) {
      if (attempt) await new Promise((resolve) => setTimeout(resolve, 15_000));
      live = (await fetch(url, { method: "HEAD" })).ok;
    }
    if (!live) throw new Error(`Reel never went live: ${url}`);

    const soonest = Date.now() + 10 * 60 * 1000;
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
            dueAt: new Date(Math.max(Date.parse(`${day}T15:10:00Z`), soonest)).toISOString(),
            text: `${text}\n\nSpace to listen. Room to think.\nspacious.live`,
            metadata: { instagram: { type: "reel", shouldShareToFeed: true } },
            assets: [{ video: { url, metadata: { title: text } } }],
          },
        },
      }),
    });
    const body = await res.json();
    const result = body.data?.createPost;
    if (result?.__typename === "LimitReachedError") {
      console.log(`Buffer is full: ${result.message}`);
      return;
    }
    if (!result?.post) throw new Error(`Buffer did not accept the post: ${JSON.stringify(body)}`);

    await notion("PATCH", `pages/${id}`, { properties: { Posted: { date: { start: day } } } });
    console.log(`scheduled "${text}" for ${day} as Buffer post ${result.post.id}`);
    day = nextDay(day);
  }
}

await { render, post }[process.argv[2]]();
