import type { APIRoute } from "astro";
import { site } from "../site.config";
import { llmsHeader, pageList } from "../lib/llms";

/** /llms.txt — llmstxt.org summary + page index. */
export const GET: APIRoute = () => {
  const body = `${llmsHeader()}
## Pages
${pageList()}

## Optional
- [llms-full.txt](${site.url}/llms-full.txt): this file plus every FAQ answer inlined.

## Publisher
${site.publisherName} — ${site.publisherUrl}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
