/**
 * Floating Teleprompter — scroll engine + controls + Document Picture-in-Picture.
 *
 * Everything runs client-side; the script is persisted only to localStorage.
 * The scroll is a requestAnimationFrame loop translating the .ftp-track on the
 * Y axis at a rate derived from WPM. The "Float on top" feature MOVES the
 * .ftp-stage wrapper element itself (not its children) into a Document PiP
 * window so the same DOM node — and therefore the same rAF loop + state —
 * keeps running while floating over OBS/Zoom/Loom. Move-the-wrapper, restore
 * on close (originParent + originNextSibling), and clone stylesheets into the
 * PiP document so the design tokens apply.
 */

const LS = {
  script: "ftp:script",
  speed: "ftp:speed",
  font: "ftp:font",
  lh: "ftp:lh",
  width: "ftp:width",
  mirror: "ftp:mirror",
  countdown: "ftp:countdown",
};

function lsGet(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode — ignore */
  }
}

const $ = <T extends HTMLElement = HTMLElement>(id: string): T | null =>
  document.getElementById(id) as T | null;

// Document Picture-in-Picture isn't in the DOM lib types yet.
interface DocumentPiP {
  requestWindow(opts?: { width?: number; height?: number }): Promise<Window>;
  window: Window | null;
}
function getDocPiP(): DocumentPiP | null {
  return (window as unknown as { documentPictureInPicture?: DocumentPiP })
    .documentPictureInPicture ?? null;
}

export function initTeleprompter(): void {
  const editor = $("ftp-editor");
  const prompter = $("ftp-prompter");
  const scriptBox = $<HTMLTextAreaElement>("ftp-script");
  const meta = $("ftp-meta");
  const stage = $("ftp-stage");
  const viewport = $("ftp-viewport");
  const track = $("ftp-track");
  const statusBadge = $("ftp-status-badge");
  const countdownEl = $("ftp-countdown");
  const endcard = $("ftp-endcard");
  const progress = $("ftp-progress");
  const timeEl = $("ftp-time");

  // Controls
  const startBtn = $("ftp-start");
  const playBtn = $("ftp-play");
  const playLabel = $("ftp-play-label");
  const restartBtn = $("ftp-restart");
  const restartEndBtn = $("ftp-restart-end");
  const mirrorBtn = $("ftp-mirror");
  const floatBtn = $("ftp-float");
  const fullscreenBtn = $("ftp-fullscreen");
  const fauxExitBtn = $("ftp-faux-exit");
  const editBtn = $("ftp-edit");
  const helpBtn = $("ftp-help");
  const clearBtn = $("ftp-clear");

  // Sliders
  const speed = $<HTMLInputElement>("ftp-speed");
  const speedVal = $("ftp-speed-val");
  const font = $<HTMLInputElement>("ftp-font");
  const fontVal = $("ftp-font-val");
  const lh = $<HTMLInputElement>("ftp-lh");
  const lhVal = $("ftp-lh-val");
  const width = $<HTMLInputElement>("ftp-width");
  const widthVal = $("ftp-width-val");
  const countdownToggle = $<HTMLInputElement>("ftp-countdown-toggle");

  // Shortcuts overlay
  const shortcuts = $("ftp-shortcuts");
  const shortcutsClose = $("ftp-shortcuts-close");

  if (!scriptBox || !stage || !viewport || !track) return; // not the /app page

  // ---- state ----
  let playing = false;
  let rafId = 0;
  let lastTs = 0;
  let offset = 0; // px scrolled from the start position
  let maxOffset = 1; // recomputed on layout
  let mirrored = lsGet(LS.mirror, "0") === "1";
  let textHeight = 1; // rendered height of the script text (excl. padding)
  // Silent-audio element used to arm OS media keys (see MediaSession section).
  let silentAudio: HTMLAudioElement | null = null;
  let mediaSessionWired = false;

  function currentWordCount(): number {
    const t = scriptBox?.value ?? "";
    return t.trim() ? t.trim().split(/\s+/).length : 0;
  }

  // Scroll speed derived from the ACTUAL rendered text height and the reading
  // time (wordCount / WPM). This guarantees the scroll covers exactly the whole
  // script in exactly the estimated reading time — no fragile words-per-line
  // guess that made short scripts race to the end instantly.
  function pxPerSecond(): number {
    const wpm = Number(speed?.value ?? 130);
    const words = currentWordCount();
    if (words < 1 || textHeight < 1) return 40;
    const totalSec = (words / wpm) * 60;
    return Math.max(8, textHeight / Math.max(1, totalSec));
  }

  function applyTypography(): void {
    if (!track) return;
    track.style.fontSize = `${font?.value ?? 48}px`;
    track.style.lineHeight = String(lh?.value ?? 1.5);
    track.style.maxWidth = `${width?.value ?? 80}%`;
  }

  function renderScript(): void {
    if (!track) return;
    const text = scriptBox?.value ?? "";
    track.textContent = text.trim().length ? text : "Your script will appear here…";
  }

  // The track starts with its first line on the eyeline (≈42% down the stage),
  // and scrolls until the last line passes the eyeline. We measure the REAL
  // rendered text height (via a marker) so pxPerSecond can pace the whole
  // script across its reading time. Returns false if the stage isn't laid out
  // yet (height 0) so callers can retry — this was the mobile "instant Done" bug.
  function recomputeBounds(): boolean {
    if (!viewport || !track) return false;
    const vpH = viewport.clientHeight;
    if (vpH < 40) return false; // not laid out yet — caller should retry
    const startPad = vpH * 0.42;
    track.style.paddingTop = `${startPad}px`;
    track.style.paddingBottom = `${vpH * 0.55}px`;
    // Real text height = full scrollHeight minus the top+bottom padding we added.
    textHeight = Math.max(1, track.scrollHeight - startPad - vpH * 0.55);
    // Scroll distance: move the whole text past the eyeline. The first line sits
    // at startPad; we scroll until the text bottom reaches the eyeline.
    maxOffset = Math.max(1, textHeight);
    return true;
  }

  // Try to measure bounds, retrying across a few frames until layout settles.
  // Mobile Safari frequently reports height 0 on the first 1-2 frames after a
  // panel is un-hidden, which previously made the script "finish" instantly.
  function recomputeBoundsWhenReady(cb?: () => void, tries = 0): void {
    if (recomputeBounds()) {
      cb?.();
      return;
    }
    if (tries > 30) {
      // give up gracefully — use a safe fallback so it still scrolls
      maxOffset = Math.max(1, textHeight);
      cb?.();
      return;
    }
    requestAnimationFrame(() => recomputeBoundsWhenReady(cb, tries + 1));
  }

  // ---- progress-preserving re-measure (resize / PiP-resize / fullscreen) ----
  // ANY viewport size change must re-run recomputeBounds so startPad, textHeight
  // and maxOffset match the NEW size — and must keep the reader at the same
  // FRACTION scrolled instead of snapping. The original code only handled
  // MAIN-window resize, so resizing the floating Document-PiP window was missed
  // entirely: the geometry stayed frozen at open-time values, which is why the
  // eyeline drifted out of alignment, lines fell outside the visible area, and
  // the script "finished" before reaching the orange line after a PiP resize.
  let remeasureScheduled = false;
  function remeasureNow(): void {
    const prevRatio = maxOffset > 0 ? offset / maxOffset : 0;
    if (!recomputeBounds()) return; // not laid out yet — a later trigger retries
    offset = Math.min(maxOffset, Math.max(0, prevRatio * maxOffset));
    applyTransform();
    updateProgress();
  }
  function scheduleRemeasure(): void {
    if (remeasureScheduled) return;
    remeasureScheduled = true;
    const run = (): void => {
      remeasureScheduled = false;
      if (prompter && !prompter.classList.contains("hidden")) remeasureNow();
    };
    // Use the floating window's own animation clock while in PiP — the main
    // tab's requestAnimationFrame can be throttled when the user has clicked
    // away into their recording app, which would delay the re-measure.
    if (pipActive && pipWin) pipWin.requestAnimationFrame(run);
    else requestAnimationFrame(run);
  }

  function applyTransform(): void {
    if (!track) return;
    const base = `translate(-50%, ${-offset}px)`;
    track.style.transform = mirrored ? `${base} scaleX(-1)` : base;
  }

  function fmtTime(sec: number): string {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")} left`;
  }

  function updateProgress(): void {
    const ratio = Math.min(1, offset / maxOffset);
    if (progress) progress.style.width = `${ratio * 100}%`;
    const pps = pxPerSecond();
    const remainingPx = Math.max(0, maxOffset - offset);
    if (timeEl) timeEl.textContent = fmtTime(pps > 0 ? remainingPx / pps : 0);
  }

  function tick(ts: number): void {
    if (!playing) return;
    if (!lastTs) lastTs = ts;
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;
    offset += pxPerSecond() * dt;
    if (offset >= maxOffset) {
      offset = maxOffset;
      applyTransform();
      updateProgress();
      pause();
      endcard?.classList.remove("hidden");
      return;
    }
    applyTransform();
    updateProgress();
    rafId = requestAnimationFrame(tick);
  }

  function play(): void {
    if (playing) return;
    endcard?.classList.add("hidden");
    playing = true;
    lastTs = 0;
    statusBadge?.classList.add("hidden");
    if (playLabel) playLabel.textContent = "Pause";
    playBtn?.classList.add("is-active");
    rafId = requestAnimationFrame(tick);
    // Arm OS media keys so the user can control the scroll while focused on their
    // recording app (PiP scenario). Safe to call repeatedly; only the first call
    // creates the silent audio. play() is reached from button/Start gestures.
    void armMediaKeys();
    syncMediaState();
  }

  function pause(): void {
    playing = false;
    cancelAnimationFrame(rafId);
    statusBadge?.classList.remove("hidden");
    if (playLabel) playLabel.textContent = "Play";
    playBtn?.classList.remove("is-active");
    syncMediaState();
  }

  function togglePlay(): void {
    playing ? pause() : play();
  }

  function restart(): void {
    offset = 0;
    applyTransform();
    updateProgress();
    endcard?.classList.add("hidden");
  }

  let countingDown = false;
  function startWithCountdown(): void {
    restart();
    if (countdownToggle && !countdownToggle.checked) {
      play();
      return;
    }
    if (countingDown) return;
    countingDown = true;
    let n = 3;
    if (countdownEl) {
      countdownEl.classList.remove("hidden");
      countdownEl.textContent = String(n);
    }
    const iv = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(iv);
        countingDown = false;
        countdownEl?.classList.add("hidden");
        play();
      } else if (countdownEl) {
        countdownEl.textContent = String(n);
      }
    }, 1000);
  }

  function setMirror(on: boolean): void {
    mirrored = on;
    track?.classList.toggle("is-mirrored", on);
    mirrorBtn?.classList.toggle("is-active", on);
    applyTransform();
    lsSet(LS.mirror, on ? "1" : "0");
  }

  // ---- view switching ----
  function showPrompter(): void {
    // Guard: nothing to read → keep the user in the editor with a nudge.
    if (currentWordCount() < 1) {
      scriptBox?.focus();
      scriptBox?.classList.add("ftp-shake");
      setTimeout(() => scriptBox?.classList.remove("ftp-shake"), 500);
      if (meta) meta.textContent = "Paste or type a script first ↑";
      return;
    }
    editor?.classList.add("hidden");
    prompter?.classList.remove("hidden");
    renderScript();
    applyTypography();
    endcard?.classList.add("hidden");
    // Wait until the stage actually has a height (mobile Safari reports 0 for a
    // frame or two after un-hiding) before measuring + starting — otherwise the
    // scroll distance is wrong and the script "finishes" instantly.
    recomputeBoundsWhenReady(() => {
      restart();
      startWithCountdown();
    });
  }
  function showEditor(): void {
    pause();
    disarmMediaKeys();
    if (pipActive) closePip();
    if (fauxFull) exitFaux();
    prompter?.classList.add("hidden");
    editor?.classList.remove("hidden");
  }

  // ---- script meta ----
  function updateMeta(): void {
    const text = scriptBox?.value ?? "";
    const words = text.trim().length ? text.trim().split(/\s+/).length : 0;
    const wpm = Number(speed?.value ?? 130);
    const sec = words > 0 ? Math.round((words / wpm) * 60) : 0;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const dur = m > 0 ? `~${m} min ${s} sec` : `~${s} sec`;
    if (meta) meta.textContent = `${words} words · ${dur} at ${wpm} WPM`;
  }

  // ================= Document Picture-in-Picture =================
  let pipActive = false;
  let pipWin: Window | null = null;
  let pipResizeHandler: (() => void) | null = null;
  let stageOriginParent: Node | null = null;
  let stageOriginNext: Node | null = null;

  function cloneStylesIntoPip(win: Window): void {
    // Copy <style> + <link rel=stylesheet> so the design tokens + .ftp-* rules apply.
    document
      .querySelectorAll('style, link[rel="stylesheet"]')
      .forEach((node) => {
        win.document.head.appendChild(node.cloneNode(true));
      });
    win.document.documentElement.classList.add("pip-mode");
  }

  async function openPip(): Promise<void> {
    const pip = getDocPiP();
    if (!pip || !stage) return;
    // Leaving faux-fullscreen first: the stage is about to move into the PiP doc,
    // and the `.ftp-fauxscreen` fixed-position styles would follow it there.
    if (fauxFull) exitFaux();
    try {
      pipWin = await pip.requestWindow({ width: 420, height: 680 });
    } catch {
      return; // user dismissed / blocked
    }
    pipActive = true;
    cloneStylesIntoPip(pipWin);
    // Remember where the stage lived so we can put it back.
    stageOriginParent = stage.parentNode;
    stageOriginNext = stage.nextSibling;
    // MOVE THE WRAPPER ITSELF (not its children) — keeps the rAF loop + node identity.
    pipWin.document.body.appendChild(stage);
    floatBtn?.classList.add("is-active");
    // Keyboard control inside the floating window.
    pipWin.addEventListener("keydown", onKey as EventListener);
    // Explicit PiP-window resize listener. The ResizeObserver on the viewport is
    // the primary trigger, but cross-realm observer delivery into a detached
    // Document-PiP document isn't guaranteed across browsers — this guarantees a
    // re-measure when the user drags the floating window's edges.
    pipResizeHandler = () => scheduleRemeasure();
    pipWin.addEventListener("resize", pipResizeHandler);
    // Ensure media keys are armed so the user can control the scroll once they
    // click away into their recording app and the PiP/browser loses focus.
    void armMediaKeys();
    showMediaKeyHint();
    // Restore when the PiP window closes (user clicks its native ✕, or tab closes).
    pipWin.addEventListener("pagehide", restoreFromPip, { once: true });
    // Measure for the small window, preserving scroll progress, once laid out.
    recomputeBoundsWhenReady(() => remeasureNow());
  }

  function restoreFromPip(): void {
    if (!stage) return;
    if (pipWin && pipResizeHandler) {
      try {
        pipWin.removeEventListener("resize", pipResizeHandler);
      } catch {
        /* ignore */
      }
    }
    pipResizeHandler = null;
    if (stageOriginParent) {
      stageOriginParent.insertBefore(stage, stageOriginNext);
    }
    pipActive = false;
    pipWin = null;
    floatBtn?.classList.remove("is-active");
    // Back in the main document — re-measure for the page-sized stage, keeping
    // the reader's scroll progress.
    recomputeBoundsWhenReady(() => remeasureNow());
  }

  function closePip(): void {
    try {
      pipWin?.close();
    } catch {
      /* ignore */
    }
    // pagehide handler does the DOM restore.
    if (pipActive) restoreFromPip();
  }

  // ================= Fullscreen =================
  // Native Fullscreen API where it exists (desktop Chrome/Edge/Firefox, Android
  // Chrome), with a CSS "faux fullscreen" fallback for iOS Safari — which does
  // NOT implement requestFullscreen on non-<video> elements, so the native call
  // is `undefined` there and tapping the button would silently do nothing.
  let fauxFull = false;

  function enterFaux(): void {
    if (!stage) return;
    fauxFull = true;
    stage.classList.add("ftp-fauxscreen");
    document.documentElement.classList.add("ftp-noscroll");
    // Geometry changed (now full-viewport) — re-measure, tolerating the 0-height
    // first frame on mobile via the retry helper.
    recomputeBoundsWhenReady();
  }
  function exitFaux(): void {
    if (!stage) return;
    fauxFull = false;
    stage.classList.remove("ftp-fauxscreen");
    document.documentElement.classList.remove("ftp-noscroll");
    recomputeBoundsWhenReady();
  }

  function toggleFullscreen(): void {
    if (!stage) return;
    // If we're in the CSS fallback, just toggle it back off.
    if (fauxFull) {
      exitFaux();
      return;
    }
    // Native fullscreen path (preferred where supported).
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }
    if (typeof stage.requestFullscreen === "function") {
      stage
        .requestFullscreen()
        .then(() => requestAnimationFrame(recomputeBounds))
        .catch(() => enterFaux()); // e.g. user-gesture/permission rejection
      return;
    }
    // No native element-fullscreen (iOS Safari) → CSS fallback.
    enterFaux();
  }

  function nudgeSpeed(delta: number): void {
    if (!speed) return;
    const next = Math.max(60, Math.min(300, Number(speed.value) + delta));
    speed.value = String(next);
    speed.dispatchEvent(new Event("input"));
  }

  // ================= Hands-off control via OS media keys =================
  //
  // Problem: when the teleprompter is floating in a Document Picture-in-Picture
  // window and the user clicks into their RECORDING app (OBS/Zoom/Loom), the
  // browser loses keyboard focus — so the keydown shortcuts stop working. The
  // user can't pause or adjust speed without clicking back to the browser.
  //
  // Fix: the OS media keys (the play/pause and ⏮/⏭ keys on keyboards, headsets,
  // Stream Decks, etc.) are delivered via the MediaSession API and fire REGARDLESS
  // of which window has focus. But the OS only routes them to a tab that is
  // actively producing media. So we play a looping, effectively-silent <audio>
  // element to "arm" the media session, then map the media-key actions onto the
  // teleprompter controls.
  //
  // Constraints learned the hard way (do not "simplify" these away):
  //  - It MUST be an <audio> element. The Web Audio API does NOT request OS audio
  //    focus, so an oscillator/GainNode will NOT capture media keys (per Chrome's
  //    own Media Session docs).
  //  - The <audio> + navigator.mediaSession live on the MAIN page, never inside
  //    the PiP document. mediaSession is global to the top-level browsing context,
  //    and keeping audio in the opener means it survives PiP open/close cleanly.
  //  - play() needs a user gesture — we only ever start it from the Play button /
  //    Start, which are gestures, so autoplay policy is satisfied.
  //  - Desktop Chrome/Edge only. Safari partial, Firefox lacks it. Feature-detect
  //    and degrade silently — the on-screen + keyboard controls always still work.

  function makeSilentWavUri(): string {
    // ~0.4s of near-silence, 8kHz mono 16-bit. Tiny non-zero samples so the audio
    // graph is "active" (some engines optimize away a literally-all-zero buffer),
    // played at volume ~0.0001 so it's inaudible.
    const sampleRate = 8000;
    const seconds = 0.4;
    const n = Math.floor(seconds * sampleRate);
    const dataLen = n * 2;
    const buf = new ArrayBuffer(44 + dataLen);
    const dv = new DataView(buf);
    const w = (o: number, s: string) => {
      for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i));
    };
    w(0, "RIFF");
    dv.setUint32(4, 36 + dataLen, true);
    w(8, "WAVE");
    w(12, "fmt ");
    dv.setUint32(16, 16, true);
    dv.setUint16(20, 1, true);
    dv.setUint16(22, 1, true);
    dv.setUint32(24, sampleRate, true);
    dv.setUint32(28, sampleRate * 2, true);
    dv.setUint16(32, 2, true);
    dv.setUint16(34, 16, true);
    w(36, "data");
    dv.setUint32(40, dataLen, true);
    for (let i = 0; i < n; i++) dv.setInt16(44 + i * 2, i % 2 ? 1 : -1, true);
    let bin = "";
    const u8 = new Uint8Array(buf);
    for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
    return "data:audio/wav;base64," + btoa(bin);
  }

  function mediaSupported(): boolean {
    return "mediaSession" in navigator &&
      typeof navigator.mediaSession?.setActionHandler === "function";
  }

  function ensureMediaSession(): void {
    if (mediaSessionWired || !mediaSupported()) return;
    mediaSessionWired = true;

    silentAudio = new Audio(makeSilentWavUri());
    silentAudio.loop = true;
    silentAudio.volume = 0.0001;
    // Keep it out of the AT / tab-audio UI as much as possible.
    silentAudio.setAttribute("aria-hidden", "true");

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: "Teleprompter",
        artist: "Floating Teleprompter",
        album: "Hands-free control",
      });
    } catch {
      /* MediaMetadata may be unavailable — non-fatal */
    }

    const set = (
      action: MediaSessionAction,
      handler: (() => void) | null,
    ) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        /* unsupported action on this browser — ignore */
      }
    };

    // Map media keys → teleprompter controls.
    set("play", () => play());
    set("pause", () => pause());
    set("stop", () => pause());
    // Seek keys → speed up / down (most useful hands-off adjustment).
    set("seekforward", () => nudgeSpeed(10));
    set("seekbackward", () => nudgeSpeed(-10));
    // Track keys → restart / jump to top.
    set("previoustrack", () => restart());
    set("nexttrack", () => {
      restart();
      play();
    });
  }

  // Start the silent audio (arms the media keys). Called from a user gesture.
  async function armMediaKeys(): Promise<void> {
    if (!mediaSupported()) return;
    ensureMediaSession();
    if (!silentAudio) return;
    try {
      await silentAudio.play();
      navigator.mediaSession.playbackState = "playing";
    } catch {
      // Autoplay blocked (no gesture yet) — harmless; on-screen controls work.
    }
  }

  function disarmMediaKeys(): void {
    if (!mediaSupported()) return;
    try {
      navigator.mediaSession.playbackState = "none";
    } catch {
      /* ignore */
    }
    if (silentAudio) {
      silentAudio.pause();
    }
  }

  // Keep the OS notification's play/pause state in sync with the scroll state.
  function syncMediaState(): void {
    if (!mediaSupported() || !mediaSessionWired) return;
    try {
      navigator.mediaSession.playbackState = playing ? "playing" : "paused";
    } catch {
      /* ignore */
    }
  }

  // One-time discovery hint shown inside the PiP window the first time the user
  // floats the teleprompter — tells them media keys work hands-free.
  function showMediaKeyHint(): void {
    if (!mediaSupported() || !pipWin) return;
    if (lsGet("ftp:mediahint", "0") === "1") return;
    lsSet("ftp:mediahint", "1");
    try {
      const doc = pipWin.document;
      const hint = doc.createElement("div");
      hint.textContent = "Tip: use your ⏯ media keys to play/pause hands-free while recording.";
      hint.style.cssText =
        "position:fixed;left:8px;right:8px;bottom:8px;z-index:50;" +
        "background:rgba(20,20,20,0.92);color:#fff;font:500 12px/1.4 system-ui,sans-serif;" +
        "padding:10px 12px;border-radius:8px;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.5)";
      doc.body.appendChild(hint);
      pipWin.setTimeout(() => hint.remove(), 6000);
    } catch {
      /* PiP doc may already be gone — ignore */
    }
  }

  // ================= Keyboard =================
  function onKey(e: KeyboardEvent): void {
    // don't hijack typing in the editor
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT")) return;
    if (prompter?.classList.contains("hidden")) {
      if (e.key === "?") {
        e.preventDefault();
        shortcuts?.removeAttribute("hidden");
      }
      return;
    }
    switch (e.key) {
      case " ":
        e.preventDefault();
        togglePlay();
        break;
      case "ArrowUp":
        e.preventDefault();
        nudgeSpeed(10);
        break;
      case "ArrowDown":
        e.preventDefault();
        nudgeSpeed(-10);
        break;
      case "r":
      case "R":
        e.preventDefault();
        restart();
        break;
      case "m":
      case "M":
        e.preventDefault();
        setMirror(!mirrored);
        break;
      case "p":
      case "P":
        e.preventDefault();
        if (getDocPiP()) (pipActive ? closePip() : openPip());
        break;
      case "f":
      case "F":
        e.preventDefault();
        toggleFullscreen();
        break;
      case "?":
        e.preventDefault();
        shortcuts?.removeAttribute("hidden");
        break;
      case "Escape":
        if (fauxFull) {
          e.preventDefault();
          exitFaux();
        }
        shortcuts?.setAttribute("hidden", "");
        break;
    }
  }

  // ================= Wire everything =================
  // Restore persisted settings
  scriptBox.value = lsGet(LS.script, "");
  if (speed) speed.value = lsGet(LS.speed, "130");
  if (font) font.value = lsGet(LS.font, "48");
  if (lh) lh.value = lsGet(LS.lh, "1.5");
  if (width) width.value = lsGet(LS.width, "80");
  if (countdownToggle) countdownToggle.checked = lsGet(LS.countdown, "1") === "1";
  setMirror(mirrored);

  function syncSliderLabels(): void {
    if (speedVal) speedVal.textContent = `${speed?.value ?? 130} WPM`;
    if (fontVal) fontVal.textContent = `${font?.value ?? 48} px`;
    if (lhVal) lhVal.textContent = String(lh?.value ?? 1.5);
    if (widthVal) widthVal.textContent = `${width?.value ?? 80}%`;
  }
  syncSliderLabels();
  updateMeta();

  scriptBox.addEventListener("input", () => {
    lsSet(LS.script, scriptBox.value);
    updateMeta();
  });
  clearBtn?.addEventListener("click", () => {
    scriptBox.value = "";
    lsSet(LS.script, "");
    updateMeta();
    scriptBox.focus();
  });

  startBtn?.addEventListener("click", showPrompter);
  editBtn?.addEventListener("click", showEditor);
  playBtn?.addEventListener("click", togglePlay);
  restartBtn?.addEventListener("click", restart);
  restartEndBtn?.addEventListener("click", () => {
    restart();
    play();
  });
  mirrorBtn?.addEventListener("click", () => setMirror(!mirrored));
  fullscreenBtn?.addEventListener("click", toggleFullscreen);
  fauxExitBtn?.addEventListener("click", exitFaux);
  helpBtn?.addEventListener("click", () => shortcuts?.removeAttribute("hidden"));
  shortcutsClose?.addEventListener("click", () => shortcuts?.setAttribute("hidden", ""));
  shortcuts?.addEventListener("click", (e) => {
    if (e.target === shortcuts) shortcuts.setAttribute("hidden", "");
  });

  // Float button: feature-detect Document PiP; otherwise hide it (Fullscreen stays).
  if (getDocPiP()) {
    floatBtn?.addEventListener("click", () => (pipActive ? closePip() : openPip()));
  } else {
    floatBtn?.classList.add("hidden");
  }

  // Sliders → live update + persist
  speed?.addEventListener("input", () => {
    syncSliderLabels();
    updateMeta();
    updateProgress();
    lsSet(LS.speed, speed.value);
  });
  font?.addEventListener("input", () => {
    syncSliderLabels();
    applyTypography();
    recomputeBounds();
    lsSet(LS.font, font.value);
  });
  lh?.addEventListener("input", () => {
    syncSliderLabels();
    applyTypography();
    recomputeBounds();
    lsSet(LS.lh, lh.value);
  });
  width?.addEventListener("input", () => {
    syncSliderLabels();
    applyTypography();
    recomputeBounds();
    lsSet(LS.width, width.value);
  });
  countdownToggle?.addEventListener("change", () =>
    lsSet(LS.countdown, countdownToggle.checked ? "1" : "0"),
  );

  document.addEventListener("keydown", onKey);
  // Re-measure on ANY size change of the stage's viewport — this is the single
  // catch-all that fires no matter which document/window owns the element, so it
  // covers main-window resize, Document-PiP window resize, fullscreen enter/exit,
  // device rotation, and the on-screen-keyboard reflow. (The old window-only
  // resize listener missed PiP-window resizes entirely.)
  if (viewport && typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => scheduleRemeasure());
    ro.observe(viewport);
  } else {
    // Legacy fallback: main-window resize only.
    window.addEventListener("resize", () => scheduleRemeasure());
  }
  // Belt-and-suspenders for fullscreen on browsers where the observer is slow to
  // fire on the synchronous enter/exit.
  document.addEventListener("fullscreenchange", () => scheduleRemeasure());
}
