import { site, absoluteUrl, lastUpdatedLabel } from "../site.config";

/**
 * llms.txt (llmstxt.org). Generated at build time so brand/domain come from
 * site.config. Emitted as /llms.txt and /llms-full.txt.
 */
export const pages: { path: string; desc: string }[] = [
  { path: "/", desc: "Home — what the floating teleprompter does and where it works." },
  { path: "/app", desc: "The teleprompter itself: paste a script, set WPM, play, float on top or go fullscreen." },
  { path: "/how-it-works", desc: "How the floating window (Document Picture-in-Picture) and scroll engine work." },
  { path: "/faq", desc: "FAQ: free, Zoom/OBS/Loom use, privacy, phones, mirror mode, offline, speed." },
  { path: "/about", desc: "About the project and its maker." },
  { path: "/privacy", desc: "Privacy policy." },
];

export function llmsHeader(): string {
  return `# ${site.name}

> ${site.description}

## What it is
A free browser-based teleprompter. Paste or type a script, pick a reading speed (60–300 words per minute, default 130) and press Start for an optional 3-2-1 countdown and smooth auto-scroll. "Float on top" pops the scrolling script into an always-on-top Document Picture-in-Picture window that sits over Zoom, Teams, Google Meet, OBS, Loom or any other app. Also: mirror mode for beam-splitter rigs, adjustable font size (24–96 px), line height and column width, fullscreen, keyboard shortcuts (Space play/pause, arrow keys speed, R restart, M mirror, P float, F fullscreen) and media-key control. WebMCP tools (load_script, set_speed, start_teleprompter, stop_teleprompter) are registered on /app when the browser supports navigator.modelContext.

## Privacy
The script is stored only in the browser's localStorage and is never uploaded; there is no backend. The website uses Google Analytics and may show ads; the script is never part of that.

## Limits
- The floating always-on-top window requires Document Picture-in-Picture: desktop Chrome or Edge. Safari, Firefox, iPad, phones and other browsers get a fullscreen teleprompter instead.
- No voice-tracking / speech-following scroll; speed is set by WPM and adjusted manually.
- No file import or cloud sync; paste text in. Settings are remembered per browser.
- Free, no signup. Last updated ${lastUpdatedLabel}.
`;
}

export function pageList(extra: { path: string; desc: string }[] = []): string {
  return [...pages, ...extra].map((p) => `- [${p.path}](${absoluteUrl(p.path)}): ${p.desc}`).join("\n");
}
