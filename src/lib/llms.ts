import { site, absoluteUrl } from "../site.config";
import { pseo } from "../data/pseo";

/** Build-time, public documentation only. Never includes a visitor's script. */
export const pages: { path: string; title: string; desc: string }[] = [
  { path: "/", title: site.name, desc: "Free online teleprompter overview and browser compatibility." },
  { path: "/app", title: "Open the teleprompter", desc: "Paste your script, start scrolling, then configure speed and float or use fullscreen." },
  { path: "/how-it-works", title: "How to use the teleprompter", desc: "Setup, playback controls and the floating window." },
  { path: "/faq", title: "Teleprompter questions and answers", desc: "Cost, privacy, browser support, mirror mode and offline limits." },
  { path: "/guides", title: "Teleprompter setup guides", desc: "Guides for recording apps, meetings and devices." },
  ...pseo.map((e) => ({ path: `/guides/${e.slug}`, title: e.h1, desc: e.metaDescription })),
  { path: "/about", title: "About the project", desc: "The project, publisher and maker." },
  { path: "/privacy", title: "Privacy policy", desc: "Local script storage, analytics and website privacy." },
  { path: "/contact", title: "Contact", desc: "Contact the maker about the project." },
  { path: "/terms", title: "Terms of use", desc: "Conditions for using the website." },
];

export function llmsHeader(): string {
  return `# ${site.name}

> A free online teleprompter with adjustable auto-scroll and an always-on-top script window in supported desktop browsers. No account or script upload.

The product is at ${absoluteUrl("/app")}. It displays plain text; it does not record or export video. Use your own recording or meeting application alongside it.

## Setup and controls
Paste a script and press Start teleprompter. Scrolling starts after the optional countdown. Pause to configure speed, font size, line height, column width or mirror mode; then use Float on top or Fullscreen.

- Speed: 60 to 300 words per minute, default 130 WPM.
- Font size: 24 to 96 pixels.
- Space toggles playback. Arrow keys adjust speed. R resets position, M toggles mirror, P opens the floating window and F toggles fullscreen.
- Keyboard shortcuts require focus in the teleprompter tab or floating script, not another app or a text field. Supported desktop browsers may route media play/pause while another app has focus; test this before recording.
- The floating window contains the script. Configure settings in the main tab before floating or entering fullscreen.

## Compatibility and limits
- Float on top requires Document Picture-in-Picture in desktop Chrome or Edge. If unsupported, the Float button is hidden. Safari, Firefox, phones and iPad use in-page or fullscreen reading, not an overlay above other apps.
- Fullscreen may use a browser-viewport fallback on mobile; it does not turn the page into a system-wide overlay.
- Scrolling is manual-speed, not voice-tracking or speech-following.
- No file import, cloud sync, video recording or built-in AI script generation. Paste plain text.
- The already-loaded app can keep scrolling without a connection. Offline reloads or navigation are not guaranteed.
- When screen sharing, select the intended tab or window and verify the audience preview or a test recording. Do not assume the floating script is excluded from every capture method.

## Privacy and pricing
The app is free with no signup, credit card or watermark. Scripts and settings are saved in this browser's localStorage when storage is available, never uploaded or synced. Clearing site data removes saved drafts. The website uses Google Analytics and may show ads; a visitor's script is not included in this documentation or analytics.

## AI agent integration
On ${absoluteUrl("/app")}, browsers exposing navigator.modelContext can discover WebMCP tools: load_script, set_speed, start_teleprompter and stop_teleprompter. They control the existing app. This integration is browser-dependent and separate from this static documentation.
`;
}

export function pageList(): string {
  return pages.map((p) => `- [${p.title}](${absoluteUrl(p.path)}): ${p.desc}`).join("\n");
}

export function guideText(): string {
  return pseo.map((e) => `## ${e.h1}
Source: ${absoluteUrl(`/guides/${e.slug}`)}

${e.intro}

### Setup
${e.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

### Tips
${e.tips.map((t) => `- ${t}`).join("\n")}

### Questions and answers
${e.faqs.map((f) => `#### ${f.q}\n${f.a}`).join("\n\n")}

Related guides:
${e.related.map((s) => pages.find((p) => p.path === `/guides/${s}`)).filter((p): p is typeof pages[number] => Boolean(p)).map((p) => `- [${p.title}](${absoluteUrl(p.path)})`).join("\n")}`).join("\n\n");
}
