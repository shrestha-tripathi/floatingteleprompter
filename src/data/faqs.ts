import { site } from "../site.config";

// Real search-intent questions → FAQPage rich-result eligibility.
export const faqs: { q: string; a: string }[] = [
  {
    q: "Is this teleprompter free?",
    a: `Yes — ${site.name} is completely free, with no watermark, no signup and no install. There's no paid tier and nothing to upgrade. Because the whole tool runs in your browser with no servers to pay for, there's nothing to charge for.`,
  },
  {
    q: "Does it work over Zoom, OBS, Loom or other recording apps?",
    a: "Yes — that's the whole point. Click \"Float on top\" and the scrolling script pops into a small always-on-top window (using your browser's Document Picture-in-Picture feature) that hovers over OBS, Zoom, Loom, CapCut, Google Meet or any other app while you record. Drag it just under your webcam and read while looking at the camera.",
  },
  {
    q: "Does my script get uploaded anywhere?",
    a: "No. Your script never leaves your device. It's saved only in your browser's local storage so it's still there when you come back, and it's never sent to any server. There is no backend — the tool is just static files and JavaScript running on your machine.",
  },
  {
    q: "Can I use it on my phone?",
    a: "The teleprompter itself works on phones and tablets — paste your script, set the speed, and it scrolls. The floating \"on top of other apps\" window is a desktop-Chromium feature (Chrome and Edge), so on mobile and on Safari/Firefox you get a fullscreen teleprompter instead of a floating one.",
  },
  {
    q: "What is mirror mode?",
    a: "Mirror mode flips the text horizontally. Hardware teleprompter rigs use a piece of angled glass (a beam splitter) in front of the lens that reflects a screen — the reflection reverses the text, so you feed it mirrored text that reads correctly in the reflection. If you're reading straight off your monitor, leave mirror off.",
  },
  {
    q: "Does it work offline?",
    a: "Once the page has loaded, the teleprompter runs entirely on your device, so a flaky connection won't interrupt your recording. Nothing is fetched or uploaded while you read.",
  },
  {
    q: "How do I control the scroll speed?",
    a: "Use the Speed slider (measured in words per minute, default 130) or the up/down arrow keys while reading. You can also change font size, line height and column width live, and everything you set is remembered for next time.",
  },
];


