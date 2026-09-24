import type { PseoEntry } from "./pseo";

const FLOAT_NOTE =
  "The always-on-top floating window uses Document Picture-in-Picture, available in desktop Chrome and Edge.";

export const pseoB: PseoEntry[] = [
  {
    slug: "teleprompter-for-webinars",
    title: "Teleprompter for Webinars — Free Floating Script Reader",
    h1: "Teleprompter for webinars",
    metaDescription:
      "Deliver webinars from a script with a free teleprompter that floats above Zoom, Teams, Meet or any webinar platform. Live speed control, pause for Q&A.",
    intro:
      "Webinars mix a prepared talk with live Q&A, so you need a teleprompter you can pause, resume and speed up without fumbling. A floating script window works on top of whichever webinar platform you use, since it doesn't depend on any integration.",
    steps: [
      "Split your webinar into sections (intro, each topic, close) with a blank line between them.",
      "Paste the script into the teleprompter and note the estimated read time against your slot length.",
      "Press Start, then \"Float on top\"; drag the window under your camera.",
      "Open your webinar platform and share only your slides window, not the whole screen.",
      "Press Space to pause for questions, then Space again to pick up where you left off.",
      "If you're running long, press the up arrow to speed up by 10 WPM at a time.",
    ],
    tips: [
      "Put cues like [SLIDE 4] or [POLL] in the script — they scroll by right when you need them.",
      "Turn the countdown off for the second half so resuming after Q&A is instant.",
      "Keep a backup copy of your script elsewhere; the teleprompter saves to this browser only.",
      "Test once with the exact webinar tool — some platforms open a separate presenter window that you'll want to arrange around.",
    ],
    faqs: [
      {
        q: "Which webinar platforms does it work with?",
        a: "Any of them — it's a separate browser window, so it doesn't matter whether you use Zoom Webinars, Teams, Google Meet, YouTube Live or something else.",
      },
      {
        q: "Can I jump to a specific section?",
        a: "There's no section navigation; you can pause, restart from the top (R) and change speed. Keep sections short so pausing between them is enough.",
      },
      {
        q: "Does it need an internet connection during the webinar?",
        a: "The teleprompter itself doesn't — once the page has loaded it runs on your device. Your webinar platform obviously still needs a connection.",
      },
    ],
    related: ["teleprompter-for-zoom", "teleprompter-for-presentations", "teleprompter-for-microsoft-teams"],
  },
  {
    slug: "teleprompter-for-presentations",
    title: "Teleprompter for Presentations & Speeches — Free Online",
    h1: "Teleprompter for presentations",
    metaDescription:
      "Rehearse and deliver presentations and speeches with a free online teleprompter: big adjustable text, WPM speed, fullscreen mode, mirror for rigs.",
    intro:
      "Whether you're giving a recorded conference talk, a keynote on a confidence monitor, or a virtual pitch, a teleprompter lets you keep eye contact without memorising every word. The same tool covers rehearsal on a laptop and delivery on a big screen.",
    steps: [
      "Paste your speech and read the estimated duration — at the default 130 WPM, 650 words is about five minutes.",
      "Rehearse once at the default speed, then adjust the slider to your natural pace.",
      "For a confidence monitor or second screen, open the prompter there and press F for fullscreen.",
      "For a virtual presentation, press \"Float on top\" instead and place the window near your webcam.",
      "Increase font size and line height until you can read comfortably from your delivery distance.",
    ],
    tips: [
      "Write in spoken language — short sentences and contractions read more naturally than written prose.",
      "Mark emphasis with CAPS sparingly; the teleprompter shows plain text only.",
      "On stage, have someone else run it: Space pauses and arrow keys adjust speed, so a helper with the keyboard can follow you.",
      "Use a presentation remote's media keys if it has them — the app responds to media play/pause.",
    ],
    faqs: [
      {
        q: "How many words is a 10-minute speech?",
        a: "At a typical 130 words per minute, around 1,300 words. The teleprompter shows the estimated time for your script at the current speed.",
      },
      {
        q: "Can I use it with PowerPoint or Google Slides?",
        a: "Yes, alongside them. Float the teleprompter above your slides on your screen and share only the slides window with the audience.",
      },
      {
        q: "Does it support rich formatting?",
        a: "No, it displays plain text. Line breaks and blank lines are kept, which is usually all you need for pacing.",
      },
    ],
    related: ["teleprompter-for-webinars", "teleprompter-for-microsoft-teams", "teleprompter-on-ipad"],
  },
  {
    slug: "teleprompter-on-mac",
    title: "Free Teleprompter for Mac — Floats Over Any App",
    h1: "Teleprompter on Mac",
    metaDescription:
      "A free teleprompter for macOS that floats over FaceTime, QuickTime, Zoom or OBS. Runs in Chrome or Edge on Mac — no App Store download, no signup.",
    intro:
      "Most Mac teleprompter apps are paid downloads. You can get the core features — WPM scrolling, big text, mirror mode and a window that stays on top — in a browser tab instead. The only requirement for the floating window is Chrome or Edge.",
    steps: [
      "Open the teleprompter in Chrome or Edge on your Mac.",
      "Paste your script and set the speed and font size.",
      "Press Start, then \"Float on top\" (or P). A small window appears above every app, including full-window QuickTime, Photo Booth or Zoom.",
      "Drag it right under the MacBook's camera at the top-centre of the display.",
      "Use Space and the arrow keys while the teleprompter is focused, or your Mac's play/pause media key while another app is focused.",
    ],
    tips: [
      "Safari can run the teleprompter but without the floating window — use its fullscreen mode (F) on a second display instead.",
      "If you record with QuickTime's screen recording, record a selected portion or window to keep the floating script out of frame.",
      "On a notch MacBook, placing the window just below the menu bar keeps your eyes closest to the lens.",
    ],
    faqs: [
      {
        q: "Does it work in Safari on Mac?",
        a: `The teleprompter scrolls in Safari, but the floating window does not. ${FLOAT_NOTE}`,
      },
      {
        q: "Do I need to install anything?",
        a: "No. It's a website; nothing is installed and there's no account.",
      },
      {
        q: "Does it work on Apple silicon Macs?",
        a: "Yes — it runs in the browser, so it works the same on Apple silicon and Intel Macs.",
      },
    ],
    related: ["teleprompter-for-obs", "teleprompter-for-zoom", "teleprompter-on-ipad"],
  },
  {
    slug: "teleprompter-on-windows",
    title: "Free Teleprompter for Windows 10 & 11 — No Install",
    h1: "Teleprompter on Windows",
    metaDescription:
      "Free teleprompter for Windows 10 and 11 that floats over Teams, Zoom, OBS or the Camera app. Runs in Edge or Chrome, no download, no signup.",
    intro:
      "Windows doesn't ship a teleprompter, but Microsoft Edge — which does ship with Windows — supports the floating always-on-top window this teleprompter uses. That means you can go from nothing to reading a script over any app without installing software.",
    steps: [
      "Open the teleprompter in Edge (or Chrome) on Windows.",
      "Paste your script, then press Start.",
      "Click \"Float on top\" (or press P) to move the script into an always-on-top window.",
      "Open your recording or meeting app — Camera, Clipchamp, Teams, Zoom or OBS — and drag the floating window under your webcam.",
      "Control it with Space, arrow keys, R and M while it's focused, or the keyboard's media play/pause key from any app.",
    ],
    tips: [
      "If you use the Xbox Game Bar (Win+G) to record, it captures a single app window, so the floating script stays out of the recording.",
      "On high-DPI laptops, raise the font size — Windows display scaling can make the default text feel small from recording distance.",
      "Snap layouts won't dock the floating window; drag it manually and it stays where you put it.",
    ],
    faqs: [
      {
        q: "Does it work on Windows 10?",
        a: "Yes, in a current version of Edge or Chrome. The feature depends on the browser, not the Windows version.",
      },
      {
        q: "Can I use it on a Windows tablet with touch?",
        a: "Yes. The buttons and sliders work with touch; the floating window is available as long as you use Edge or Chrome.",
      },
      {
        q: "Is anything saved to my PC?",
        a: "Only in the browser's local storage: your script and settings, so they're there next time. Clearing site data removes them.",
      },
    ],
    related: ["teleprompter-for-microsoft-teams", "teleprompter-for-obs", "teleprompter-on-chromebook"],
  },
  {
    slug: "teleprompter-on-ipad",
    title: "Teleprompter on iPad — Free, Fullscreen, Mirror Mode",
    h1: "Teleprompter on iPad",
    metaDescription:
      "Use your iPad as a free teleprompter: fullscreen scrolling script, WPM speed, adjustable text and mirror mode for beam-splitter rigs. Runs in Safari.",
    intro:
      "An iPad is the classic screen for a hardware teleprompter rig — and a handy one for reading while filming on another device. On iPad the teleprompter runs fullscreen rather than as a floating window, which is exactly what a rig needs.",
    steps: [
      "Open the teleprompter in Safari (or any browser) on the iPad and paste your script — AirDrop or Universal Clipboard from a Mac makes this quick.",
      "Set Speed and a large font size for reading from a distance.",
      "Tap Start, then tap Fullscreen.",
      "For a beam-splitter rig, tap Mirror so the text reads correctly in the glass.",
      "Tap Play/Pause to stop and start; use Restart for a retake.",
    ],
    tips: [
      "Turn on Do Not Disturb so notifications don't pop over the script mid-take.",
      "Set Auto-Lock to Never while recording so the screen doesn't dim.",
      "A Bluetooth keyboard gives you the Space, arrow and R shortcuts, which is easier than reaching into a rig.",
      "Rotate to landscape for wider lines, or narrow the column width for shorter eye travel.",
    ],
    faqs: [
      {
        q: "Can the teleprompter float over the iPad camera app?",
        a: "No. Floating windows over other apps need Document Picture-in-Picture, which iPadOS browsers don't support. Use fullscreen on the iPad, and film with another camera or phone.",
      },
      {
        q: "Does it work on iPhone too?",
        a: "Yes, the same fullscreen mode works on iPhone, though the screen is small for reading at distance.",
      },
      {
        q: "Does mirror mode work on iPad?",
        a: "Yes. Mirror mode flips the text horizontally on any device.",
      },
    ],
    related: ["teleprompter-for-youtube-videos", "teleprompter-on-mac", "teleprompter-for-presentations"],
  },
  {
    slug: "teleprompter-on-chromebook",
    title: "Teleprompter on Chromebook — Free, Floats Over Meet",
    h1: "Teleprompter on Chromebook",
    metaDescription:
      "A free teleprompter for Chromebooks that floats above Google Meet, the Camera app or Screencast. Runs in Chrome — nothing to install.",
    intro:
      "Chromebooks run everything in Chrome, which suits a browser teleprompter well. As long as your ChromeOS version's Chrome supports Document Picture-in-Picture, you get the same floating window as on desktop Chrome — handy for students and teachers recording with Screencast or presenting in Meet.",
    steps: [
      "Open the teleprompter in Chrome on your Chromebook and paste your script.",
      "Press Start, then \"Float on top\". If the button isn't shown, your Chrome build doesn't support the floating window — use Fullscreen instead.",
      "Open Google Meet, the Camera app or Screencast and drag the floating window near the webcam.",
      "Use Space to pause and the arrow keys to adjust speed while the teleprompter is focused.",
    ],
    tips: [
      "Keep ChromeOS updated — the floating window depends on the version of Chrome.",
      "Managed school Chromebooks may restrict some sites; the teleprompter needs no extension, so it's usually allowed wherever normal websites are.",
      "With Screencast or screen recording, record a window or partial area so the script stays out of the video.",
    ],
    faqs: [
      {
        q: "Why don't I see the \"Float on top\" button?",
        a: "The app hides it when the browser doesn't support Document Picture-in-Picture. The fullscreen teleprompter still works.",
      },
      {
        q: "Does it work offline on a Chromebook?",
        a: "Once the page has loaded, the teleprompter runs entirely on the device, so a dropped connection won't stop it.",
      },
      {
        q: "Is my script stored on Google's servers?",
        a: "No. It's kept only in this browser's local storage and isn't synced or uploaded.",
      },
    ],
    related: ["teleprompter-for-google-meet", "teleprompter-on-windows", "teleprompter-for-presentations"],
  },
];
