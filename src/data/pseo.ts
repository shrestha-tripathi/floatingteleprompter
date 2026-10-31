/**
 * Programmatic-SEO guide entries (rendered by src/pages/guides/[slug].astro).
 * Only claim what the app actually does: WPM scroll (60–300), font/line-height/
 * width sliders, mirror, countdown, fullscreen, keyboard + media-key control,
 * and the Document Picture-in-Picture float (desktop Chrome/Edge only).
 */
export interface PseoEntry {
  slug: string;
  title: string;
  h1: string;
  metaDescription: string;
  intro: string;
  steps: string[];
  tips: string[];
  faqs: { q: string; a: string }[];
  related: string[];
}

const FLOAT_NOTE =
  "The always-on-top floating window uses Document Picture-in-Picture, which is available in desktop Chrome and Edge. Other browsers get a fullscreen teleprompter instead.";

export const pseoA: PseoEntry[] = [
  {
    slug: "teleprompter-for-zoom",
    title: "Teleprompter for Zoom Calls — Free, Floats Over Zoom",
    h1: "Teleprompter for Zoom",
    metaDescription:
      "Read a script during a Zoom call without looking away: a free browser teleprompter that floats on top of the Zoom window. No install, script stays on your device.",
    intro:
      "Reading notes from a separate document during a Zoom call can make your eyes drift away from the camera. This guide shows how to float a scrolling script in a small always-on-top window right under your webcam so you can present on Zoom while still looking at people.",
    steps: [
      "Open the teleprompter in desktop Chrome or Edge and paste your talking points or full script.",
      "Press Start to reveal the controls. Pause after the countdown, then set Speed to your speaking pace; 130 WPM is the default.",
      "Click \"Float on top\" (or press P) to move the script into a small window, then press Space while it has focus to resume.",
      "Join or start your Zoom meeting and drag the floating window to the top-centre of your screen, just below the webcam.",
      "Shrink the column width and bump the font size so only a few words per line sit near the lens.",
      "Click the floating script before using Space to pause or the arrow keys to adjust speed. These shortcuts do not work while Zoom has focus.",
    ],
    tips: [
      "If you share your screen, share a specific window (e.g. your slides) rather than your entire screen — otherwise participants may see the floating script.",
      "Zoom's self-view can compete for the same spot near the camera; hide self-view or move it to the side.",
      "Keep the script in short paragraphs; line breaks give you natural pause points during Q&A.",
      "When Zoom has focus, supported desktop browsers may respond to media play/pause. Test it before a call; click the script if media keys are unavailable.",
    ],
    faqs: [
      {
        q: "Will Zoom participants see my teleprompter?",
        a: "Your camera does not capture an on-screen script. Screen sharing can: select the intended window or tab and verify the audience preview before presenting.",
      },
      {
        q: "Do I need a Zoom plugin or app?",
        a: "No. The teleprompter runs in a normal browser tab and is independent of Zoom, so it works with the Zoom desktop client or Zoom in the browser.",
      },
      {
        q: "Does it work on a Mac with Zoom?",
        a: `Yes, in Chrome or Edge for macOS. ${FLOAT_NOTE}`,
      },
    ],
    related: ["teleprompter-for-microsoft-teams", "teleprompter-for-google-meet", "teleprompter-for-webinars"],
  },
  {
    slug: "teleprompter-for-microsoft-teams",
    title: "Teleprompter for Microsoft Teams Meetings — Free",
    h1: "Teleprompter for Microsoft Teams",
    metaDescription:
      "Present in Microsoft Teams with a scrolling script that floats above the meeting window. Free browser teleprompter, no install, no signup, script never uploaded.",
    intro:
      "Teams meetings, town halls and recorded briefings often need a prepared script — but reading it from a document makes you look down and to the side. A floating teleprompter keeps the text next to your webcam so your eye line stays natural while Teams runs underneath.",
    steps: [
      "Open the teleprompter in Chrome or Edge (Edge ships with Windows, so it's usually already there).",
      "Paste your script and check the estimated read time under the text box against your agenda slot.",
      "Press Start, pause after the countdown and adjust your settings. Click \"Float on top\" to move the script into its own window.",
      "Open the Teams meeting and position the floating window near the top of the screen under your camera.",
      "The 3-2-1 countdown applies only when starting a new run. Turn it off before a new run if you want scrolling to begin immediately; ordinary Play or Space resume does not repeat the countdown.",
      "Click the floating script and press Space to pause or resume. Close the floating window to return it to the tab.",
    ],
    tips: [
      "In Teams, share a window or a PowerPoint Live presentation rather than your whole desktop so the script isn't visible to attendees.",
      "Laptop webcams sit above the screen — dragging the floating window to the top edge minimises how far your eyes travel.",
      "For a formal all-hands, rehearse once at your target WPM and adjust; the speed slider changes live while scrolling.",
      "Your script is saved in this browser only, so a work laptop and a home PC won't share drafts.",
    ],
    faqs: [
      {
        q: "Is it allowed on a locked-down work PC?",
        a: "It's a normal website — no extension or install — so it typically works wherever Chrome or Edge is allowed. Your IT policy still applies.",
      },
      {
        q: "Does my script get sent to Microsoft or anyone else?",
        a: "No. The script lives in your browser's local storage and is never uploaded. Teams has no connection to the teleprompter tab.",
      },
      {
        q: "Can I use it with the Teams web app?",
        a: "Yes. Open Teams in one tab and the teleprompter in another, then float the teleprompter — the floating window stays on top of either the web app or the desktop client.",
      },
    ],
    related: ["teleprompter-for-zoom", "teleprompter-for-presentations", "teleprompter-on-windows"],
  },
  {
    slug: "teleprompter-for-google-meet",
    title: "Teleprompter for Google Meet — Free Floating Script",
    h1: "Teleprompter for Google Meet",
    metaDescription:
      "Use a free floating teleprompter with Google Meet. Keep your script next to the camera while Meet runs in another tab. Works in Chrome, no extension needed.",
    intro:
      "Google Meet lives in a browser tab, which makes a second tab for your notes awkward: switching tabs hides the meeting. A floating teleprompter solves that — the script sits in its own always-on-top window, so Meet and your notes are visible at the same time.",
    steps: [
      "In Chrome, open the teleprompter in a new tab next to your Meet tab.",
      "Paste your script, press Start and pause after the countdown. Then set Speed and Font size.",
      "Click \"Float on top\" to move the script into a small window. With that window focused, press Space to resume.",
      "Switch back to the Meet tab; the floating script stays put. Drag it under your webcam.",
      "Resize the floating window by dragging its edge — the scroll re-measures automatically.",
    ],
    tips: [
      "When presenting in Meet, choose \"A tab\" or \"A window\" instead of \"Your entire screen\" to keep the script off the shared view.",
      "Meet shows your own tile in the corner; if it distracts you, minimise it so your eyes go to the script and camera.",
      "Because Meet and the teleprompter share the same browser, closing the teleprompter tab also closes its floating window — keep both tabs open during the call.",
      "Chromebooks run Meet in Chrome too; see the Chromebook guide for that setup.",
    ],
    faqs: [
      {
        q: "Do I need a Chrome extension?",
        a: "No. The floating window is a built-in Chrome feature (Document Picture-in-Picture) that a normal web page can use after you click a button.",
      },
      {
        q: "Does it work in Firefox or Safari with Meet?",
        a: `The teleprompter scrolls in any modern browser, but ${FLOAT_NOTE.charAt(0).toLowerCase()}${FLOAT_NOTE.slice(1)}`,
      },
      {
        q: "Can other people in the Meet see the script?",
        a: "Your webcam does not capture the on-screen script, but screen sharing might. Select the intended tab or window and check the audience preview.",
      },
    ],
    related: ["teleprompter-for-zoom", "teleprompter-on-chromebook", "teleprompter-for-webinars"],
  },
  {
    slug: "teleprompter-for-youtube-videos",
    title: "Teleprompter for YouTube Videos — Free & Browser-Based",
    h1: "Teleprompter for YouTube videos",
    metaDescription:
      "Record YouTube talking-head videos with a free browser teleprompter: WPM speed control, big text, mirror mode for rigs, countdown. No install, no watermark.",
    intro:
      "Scripted YouTube videos — explainers, reviews, tutorials — sound tighter when you read, but only if viewers can't tell. The trick is keeping the text close to the lens and scrolling at a pace that matches how you actually talk. This guide covers a webcam setup and a camera-plus-rig setup.",
    steps: [
      "Write your script with one idea per paragraph; the gap between paragraphs becomes a natural breath.",
      "Paste it into the teleprompter and check the estimated duration shown under the box.",
      "Press Start, pause after the countdown, then choose a speed. Try 130 WPM and adjust after a test take.",
      "For webcam recording, click \"Float on top\", place it near the lens and press Space while the script has focus to resume.",
      "For a camera with a beam-splitter rig, enable Mirror before entering Fullscreen. On touch devices, exit fullscreen to access settings and playback controls.",
      "Use R to restart for a retake — it jumps back to the top without leaving the prompter.",
    ],
    tips: [
      "Narrow the column width so your eyes move less side-to-side — horizontal eye scanning is what gives readers away on camera.",
      "Sit further from the camera than feels natural; the further you are, the less visible small eye movements become.",
      "Record in short sections and cut between them; restarting from the top with R is quicker than scrubbing.",
      "The 3-2-1 countdown gives you time to look up and settle before the first line appears.",
    ],
    faqs: [
      {
        q: "Does the teleprompter add a watermark or record video?",
        a: "Neither. It only scrolls your text; you record with whatever you already use (OBS, your camera, a phone). There is no watermark because nothing is exported.",
      },
      {
        q: "What does mirror mode do?",
        a: "It flips the text horizontally so it reads correctly after reflecting off the angled glass in a hardware teleprompter rig.",
      },
      {
        q: "Can it follow my voice?",
        a: "No — it scrolls at the WPM you set. You can change speed live with the slider or arrow keys and pause with Space.",
      },
    ],
    related: ["teleprompter-for-obs", "teleprompter-for-loom", "teleprompter-on-ipad"],
  },
  {
    slug: "teleprompter-for-obs",
    title: "Teleprompter for OBS Studio — Floats Over OBS, Free",
    h1: "Teleprompter for OBS Studio",
    metaDescription:
      "Read a script while recording or streaming in OBS Studio. Free floating teleprompter window that stays above OBS and isn't captured if you use a camera-only scene.",
    intro:
      "OBS Studio is great at capturing your camera and screen, but it has no script reader. Pairing it with a floating teleprompter lets you read your lines in a small window above OBS while your scene records just the webcam — or your webcam plus a specific app window.",
    steps: [
      "Open the teleprompter in desktop Chrome or Edge and paste your script.",
      "In OBS, build your scene with a Video Capture Device (your webcam) and, if needed, a Window Capture of the app you're demoing.",
      "Back in the teleprompter, press Start and pause after the countdown. Adjust your settings, then click \"Float on top\".",
      "Drag the floating window under your webcam; it stays above OBS even when OBS has focus.",
      "Resume with the floating script focused, then start recording in OBS. Test media play/pause before relying on it while OBS has focus.",
    ],
    tips: [
      "Avoid a Display Capture of the whole monitor if the floating window sits on it — use Window Capture for the specific app instead.",
      "Keyboard shortcuts require focus in the floating script. Media play/pause may work while OBS has focus on supported desktop browsers; verify this before streaming.",
      "On a multi-monitor setup, put OBS on the second screen and the floating script on the screen with the webcam.",
      "Match the font size to your distance from the screen — larger text lets you sit back from the camera.",
    ],
    faqs: [
      {
        q: "Will OBS capture the teleprompter?",
        a: "Display Capture can include the floating script. Prefer a camera-only scene or a capture of the intended app, then make a short test recording to confirm what OBS captures.",
      },
      {
        q: "Is this an OBS plugin or browser source?",
        a: "Neither — it's a standalone web page. That keeps it independent from OBS, so an OBS crash or scene change never resets your script.",
      },
      {
        q: "Does it work on Linux with OBS?",
        a: "The teleprompter works in Chrome or Edge on Linux too; the floating window behaviour depends on the browser supporting Document Picture-in-Picture.",
      },
    ],
    related: ["teleprompter-for-youtube-videos", "teleprompter-for-loom", "teleprompter-on-mac"],
  },
  {
    slug: "teleprompter-for-loom",
    title: "Teleprompter for Loom Recordings — Free Floating Script",
    h1: "Teleprompter for Loom",
    metaDescription:
      "Record Loom videos from a script without looking off-screen. A free floating teleprompter sits beside Loom's camera bubble. No install, script stays local.",
    intro:
      "Loom videos are meant to feel quick and personal, but rambling costs viewers time. Reading a short script from a floating window keeps the video tight while your face stays in Loom's camera bubble looking at the lens.",
    steps: [
      "Draft a short script — most Loom walkthroughs work best at a few hundred words.",
      "Paste it into the teleprompter in Chrome or Edge. Press Start, pause after the countdown, configure your settings and click \"Float on top\".",
      "Open Loom and choose \"Window\" or a specific tab as the recording source rather than the full screen.",
      "Place the floating script near the top of the screen, close to where Loom's camera bubble and your webcam are.",
      "Resume in the focused script, then record in Loom. Test media play/pause first if you want to pause without clicking back to the script.",
    ],
    tips: [
      "If you record the full screen in Loom, the floating window will appear in the video — record a single window or tab to keep it out.",
      "Write the script around your clicks. Click the teleprompter before using Space to pause; Space is not a global shortcut.",
      "A slower speed (around 110–120 WPM) helps when you're narrating and operating the UI at the same time.",
    ],
    faqs: [
      {
        q: "Does Loom have its own teleprompter?",
        a: "Loom's features change over time, so check its current version. This teleprompter works independently of Loom either way, in any Chrome or Edge window.",
      },
      {
        q: "Will the teleprompter show up in my Loom?",
        a: "Full-screen recording can include the script. Choose the intended window or tab and verify a short test recording before relying on exclusion.",
      },
      {
        q: "Is my script shared with Loom?",
        a: "No. The script is stored only in your browser's local storage and is never uploaded anywhere.",
      },
    ],
    related: ["teleprompter-for-obs", "teleprompter-for-youtube-videos", "teleprompter-for-presentations"],
  },
];

import { pseoB } from "./pseo-b";

export const pseo: PseoEntry[] = [...pseoA, ...pseoB];
export const pseoBySlug = new Map(pseo.map((e) => [e.slug, e]));
