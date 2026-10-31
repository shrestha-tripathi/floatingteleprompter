import { site } from "../site.config";

/** One public answer source for the FAQ page, its JSON-LD and llms-full.txt. */
export const faqs: { q: string; a: string }[] = [
  {
    q: "Is this teleprompter free?",
    a: `${site.name} is free, with no paid tier, signup, credit card or watermark. Open the website and paste your script; no native app or extension is required.`,
  },
  {
    q: "Does it work over Zoom, OBS, Loom or other recording apps?",
    a: "Yes, in desktop Chrome and Edge with Document Picture-in-Picture support. Paste your script, press Start, pause to configure settings and click Float on top. Place the floating script near your webcam. The teleprompter is separate from your meeting or recording app, not a plugin.",
  },
  {
    q: "Does my script get uploaded anywhere?",
    a: "No. Your script is never uploaded or synced. Scripts and settings are saved in this browser's local storage when storage is available. Clearing site data or using a different browser removes access to that local draft. Keep a separate backup of important scripts. The website uses analytics; your script is not sent with those analytics.",
  },
  {
    q: "Can I use it on my phone?",
    a: "Yes. Start the teleprompter, pause to set the speed and text size, then read in-page or use Fullscreen. Configure Mirror before fullscreen if you use a rig. Exit fullscreen to access the controls. Phones, iPad, Safari and Firefox do not get the floating window above other apps. On mobile, fullscreen may be a browser-viewport fallback.",
  },
  {
    q: "What is mirror mode?",
    a: "Mirror mode flips the text horizontally for a beam-splitter teleprompter rig. The angled glass reverses the screen's reflection, so mirrored text reads correctly in the glass. Leave Mirror off when reading directly from a monitor.",
  },
  {
    q: "Does it work offline?",
    a: "The already-loaded app can keep scrolling without an internet connection. Offline reloads, opening other pages or revisiting the site are not guaranteed. Load the app and prepare your script before disconnecting; your meeting or recording platform may still need a connection.",
  },
  {
    q: "How do I control the scroll speed?",
    a: "After Start, use the Speed slider from 60 to 300 words per minute; the default is 130 WPM. Arrow keys change speed when the script has keyboard focus. Font size, line height and column width are adjustable in the main tab. Settings are remembered when browser storage is available.",
  },
  {
    q: "Why does Space stop pausing when Zoom or OBS has focus?",
    a: "Space is a keyboard shortcut in the teleprompter tab and floating script, not a system-wide hotkey. Click the script before pressing Space. Shortcuts do not run inside the script textarea. Supported desktop browsers may accept media play/pause when another app has focus, but test your keyboard and browser before relying on it.",
  },
  {
    q: "Will my audience see the floating script?",
    a: "Your webcam does not capture an on-screen script. Whole-screen sharing or recording can include it. Choose the intended window or tab instead and verify the audience preview or a short test recording. Capture behavior depends on your recorder, browser and operating system, so exclusion is not guaranteed for every setup.",
  },
  {
    q: "Does the teleprompter follow my voice or record video?",
    a: "No. It scrolls at the WPM you choose, not by listening to your voice. It does not record or export video, import documents, sync drafts or generate scripts with AI. Paste plain text and record using your own camera or software.",
  },
  {
    q: "Can an AI agent control the teleprompter?",
    a: "In browsers exposing navigator.modelContext, the app registers four WebMCP tools: load_script, set_speed, start_teleprompter and stop_teleprompter. These drive the existing app controls. Availability depends on the browser; unsupported browsers keep the normal teleprompter behavior.",
  },
];
