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

  // px the average line occupies, used to convert WPM → px/sec.
  // Rough model: 1 line ≈ ~9 words; line height in px = fontSize * lineHeight.
  function pxPerSecond(): number {
    const wpm = Number(speed?.value ?? 130);
    const fontPx = Number(font?.value ?? 48);
    const lineH = Number(lh?.value ?? 1.5);
    const wordsPerLine = 9;
    const linePx = fontPx * lineH;
    const linesPerSec = wpm / wordsPerLine / 60;
    return linesPerSec * linePx;
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
  // and we let it scroll until the last line passes the eyeline.
  function recomputeBounds(): void {
    if (!viewport || !track) return;
    const vpH = viewport.clientHeight;
    const startPad = vpH * 0.42;
    track.style.paddingTop = `${startPad}px`;
    track.style.paddingBottom = `${vpH * 0.6}px`;
    // total scrollable distance = track height - the portion already visible
    maxOffset = Math.max(1, track.scrollHeight - vpH * 0.42 - vpH * 0.5);
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
  }

  function pause(): void {
    playing = false;
    cancelAnimationFrame(rafId);
    statusBadge?.classList.remove("hidden");
    if (playLabel) playLabel.textContent = "Play";
    playBtn?.classList.remove("is-active");
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
    editor?.classList.add("hidden");
    prompter?.classList.remove("hidden");
    renderScript();
    applyTypography();
    requestAnimationFrame(() => {
      recomputeBounds();
      restart();
      startWithCountdown();
    });
  }
  function showEditor(): void {
    pause();
    if (pipActive) closePip();
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
    // Restore when the PiP window closes (user clicks its native ✕, or tab closes).
    pipWin.addEventListener("pagehide", restoreFromPip, { once: true });
    // Resize bounds for the small window.
    requestAnimationFrame(recomputeBounds);
  }

  function restoreFromPip(): void {
    if (!stage) return;
    if (stageOriginParent) {
      stageOriginParent.insertBefore(stage, stageOriginNext);
    }
    pipActive = false;
    pipWin = null;
    floatBtn?.classList.remove("is-active");
    requestAnimationFrame(recomputeBounds);
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
  function toggleFullscreen(): void {
    if (!stage) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      stage.requestFullscreen?.().then(() => requestAnimationFrame(recomputeBounds)).catch(() => {});
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
        if (speed) {
          speed.value = String(Math.min(300, Number(speed.value) + 10));
          speed.dispatchEvent(new Event("input"));
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (speed) {
          speed.value = String(Math.max(60, Number(speed.value) - 10));
          speed.dispatchEvent(new Event("input"));
        }
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
  window.addEventListener("resize", () => {
    if (!prompter?.classList.contains("hidden")) recomputeBounds();
  });
}
