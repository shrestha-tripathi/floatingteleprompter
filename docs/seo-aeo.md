# SEO and answer-engine baseline

## Scope

The acquisition surface is separate from the app. Changes here cover homepage content/design, existing guide discoverability and accuracy, static LLM-readable documentation, and crawl metadata. They do not add teleprompter controls, analytics events, dependencies, voice tracking or recording features.

Protected runtime files: `src/lib/teleprompter.ts`, `src/lib/webmcp.ts`, `src/pages/app.astro` and `src/styles/global.css`. Homepage styles are imported only by `src/pages/index.astro`; the app does not load them. `Header.astro` retains its original output by default; only pages opting into `compact` get short labels.

## Public acquisition surfaces

- `/`: free online / always-on-top teleprompter, a real product screenshot and direct Zoom, OBS, Loom and device-guide links.
- `/guides/`: existing guides grouped by meetings/presentations, recording/streaming and device.
- `/guides/<slug>/`: intent-specific titles, answer-first compatibility summary, linked setup sections, related guides and visible-content-derived FAQ/HowTo markup.
- `/how-it-works/`: the real control sequence, including touch/fullscreen and keyboard-focus limitations.
- `/faq/`: public answers about pricing, privacy, browser compatibility, keyboard focus, recording privacy and feature limits.
- `/llms.txt`: product summary, compatibility, limitations and human-readable canonical page index.
- `/llms-full.txt`: expanded documentation with the general FAQ and every existing guide's steps, tips, answers and source URL. Generated from the same content arrays as the pages. No visitor scripts or local browser state.
- `/sitemap.xml`: canonical public URLs, without synthetic build-date `lastmod`.

The product screenshot was captured from the running app with a generic sample script, then converted to WebP. It is not an HTML mock, a testimonial or evidence of a specific recording-app integration. Its light control panel is the real app UI and remains unchanged in the dark homepage.

## Verification

```sh
npm run build
npx astro check
python3 scripts/verify-seo.py
```

The verifier uses Python's standard library, with no pip installation. It checks every built page, internal link and fragment; canonical/sitemap agreement; schema/visible-answer agreement; guide coverage in both LLM documents; and homepage CSS isolation from the app.

Hallmark render audit:

```sh
CHROME_PATH=/absolute/path/to/chrome node ~/.hermes/skills/creative/hallmark/scripts/sloplint.mjs \
  src/pages/index.astro src/styles/marketing.css \
  --genre modern-minimal --url http://127.0.0.1:4321/ --render
```

Use an actual browser for light/dark responsive checks and a basic app smoke test. Desktop headless tests do not establish physical media-key behavior or every mobile/fullscreen recording setup.

## Measure results, do not infer them

- In Search Console, compare homepage and individual guide impressions, clicks, CTR and position over comparable time windows. Check page indexing and sitemap processing after deployment.
- Look for relevant non-brand queries: free online teleprompter, floating teleprompter, teleprompter for Zoom/OBS/Loom, and device-specific setups. These are intent targets, not measured keyword-volume estimates.
- Use the existing GA4 property to compare organic landing traffic and engagement by page. No new event tracking was added, so a dedicated app-launch conversion needs a separate approved instrumentation change.
- Review referral traffic from answer engines where identifiable. Do not treat one model mentioning the app as a stable ranking or attributed conversion.
- Improve guides receiving impressions but weak clicks before adding overlapping keyword pages. Publish additional content only when it addresses a distinct user task.

`llms.txt` is a documentation convention, not a robots directive, a Google ranking factor or a guarantee that answer engines will cite the site. JSON-LD describes public content; FAQ rich results are restricted to authoritative government/health sites, and Google has retired HowTo rich results. No invented reviews, ratings or usage metrics are included.

## Cloudflare crawler caveat

The live robots response contains Cloudflare-managed training-crawler rules in addition to the repository's explicit AI-crawler allowances. OAI-SearchBot, ChatGPT-User and PerplexityBot are allowed by the repository, but a robots Allow does not bypass Cloudflare WAF/bot challenges or establish that every crawler can fetch the content. The managed content signal reserves AI training rights. No account-level Cloudflare setting or training policy was changed in this work.
