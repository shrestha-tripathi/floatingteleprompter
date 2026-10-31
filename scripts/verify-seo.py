#!/usr/bin/env python3
"""Verify built SEO/AEO output using Python's standard library. Run after npm run build."""
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote, urljoin
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.links, self.meta, self.images, self.ids = [], {}, [], set()
        self.styles = []
        self.schemas, self.text, self.h1, self.title = [], [], 0, ""
        self.canonical = None
        self.in_schema = self.in_title = False
        self.schema_text = ""
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a: self.ids.add(a["id"])
        if tag == "h1": self.h1 += 1
        if tag == "title": self.in_title = True
        if tag == "a" and "href" in a: self.links.append(a["href"])
        if tag == "img": self.images.append(a)
        if tag == "link" and a.get("rel") == "stylesheet": self.styles.append(a.get("href", ""))
        if tag == "meta": self.meta[a.get("name", a.get("property", ""))] = a.get("content", "")
        if tag == "link" and a.get("rel") == "canonical": self.canonical = a.get("href")
        if tag == "script" and a.get("type") == "application/ld+json":
            self.in_schema, self.schema_text = True, ""

    def handle_data(self, text):
        if self.in_schema: self.schema_text += text
        elif self.in_title: self.title += text
        else: self.text.append(text)

    def handle_endtag(self, tag):
        if tag == "script" and self.in_schema:
            self.schemas.append(json.loads(self.schema_text))
            self.in_schema = False
        if tag == "title": self.in_title = False

assert DIST.exists(), "Run npm run build first"
pages = {p.relative_to(DIST).as_posix(): Page(p.read_text()) for p in DIST.rglob("*.html")}
assert pages, "No built HTML"
origin = urlsplit(pages["index.html"].canonical)
assert origin.scheme == "https" and not origin.netloc.endswith("pages.dev"), "Invalid production canonical origin"
base = f"{origin.scheme}://{origin.netloc}"

def target(path):
    path = unquote(path).lstrip("/")
    if not path or path.endswith("/"): path += "index.html"
    return path

canonical_urls = set()
for file, page in pages.items():
    assert page.h1 == 1, (file, "needs one H1")
    assert page.title.strip() and page.meta.get("description"), (file, "missing title/description")
    assert page.canonical and page.canonical.startswith(base + "/"), (file, "invalid canonical")
    assert page.canonical not in canonical_urls, (file, "duplicate canonical")
    canonical_urls.add(page.canonical)
    if file != "404.html": assert not page.meta.get("robots", "").startswith("noindex"), (file, "unexpected noindex")
    for href in page.links:
        u = urlsplit(urljoin(page.canonical, href))
        if u.scheme and not (u.scheme in {"http", "https"} and u.netloc == origin.netloc): continue
        if u.netloc and u.netloc != origin.netloc: continue
        resolved = target(u.path) if u.path else file
        assert (DIST / resolved).is_file(), (file, "broken internal link", href)
        if u.fragment and resolved in pages: assert unquote(u.fragment) in pages[resolved].ids, (file, "broken fragment", href)
    visible = " ".join(" ".join(page.text).split())
    for schema in page.schemas:
        if schema.get("@type") == "HowTo":
            for step in schema["step"]:
                assert " ".join(step["text"].split()) in visible, (file, "HowTo schema is not visible")
        if schema.get("@type") == "FAQPage":
            for question in schema["mainEntity"]:
                assert " ".join(question["name"].split()) in visible, (file, "FAQ question not visible")
                assert " ".join(question["acceptedAnswer"]["text"].split()) in visible, (file, "FAQ answer not visible")
    for image in page.images:
        src = image.get("src", "")
        assert src and image.get("alt"), (file, "image missing source/alt")
        if src.startswith("/"): assert (DIST / src.lstrip("/")).is_file(), (file, "missing image", src)

sitemap = ET.parse(DIST / "sitemap.xml")
ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
urls = [e.text for e in sitemap.findall("s:url/s:loc", ns)]
assert len(urls) == len(set(urls)), "Duplicate sitemap URLs"
assert not sitemap.findall("s:url/s:lastmod", ns), "Do not invent build-date modification dates"
for url in urls:
    assert url in canonical_urls, ("Sitemap/canonical mismatch", url)
    assert (DIST / target(urlsplit(url).path)).is_file(), ("Missing sitemap page", url)
llms = (DIST / "llms.txt").read_text()
full = (DIST / "llms-full.txt").read_text()
assert llms.startswith("# ") and full.startswith("# "), "Missing documentation H1"
for markdown in [llms, full]:
    for url in re.findall(r"\]\((https?://[^)]+)\)", markdown):
        u = urlsplit(url)
        if u.netloc == origin.netloc:
            assert (DIST / target(u.path)).is_file(), ("Broken documentation link", url)

for file, page in pages.items():
    if not file.startswith("guides/") or file == "guides/index.html": continue
    assert page.canonical in llms and page.canonical in full, (file, "missing from LLM docs")
    assert page.canonical in urls, (file, "missing from sitemap")
    visible = " ".join(" ".join(page.text).split())
    for schema in page.schemas:
        if schema.get("@type") == "HowTo":
            for step in schema["step"]:
                assert step["text"] in full, (file, "guide step absent from expanded docs")
                assert " ".join(step["text"].split()) in visible, (file, "schema step not visible")
        if schema.get("@type") == "FAQPage":
            for question in schema["mainEntity"]:
                answer = question["acceptedAnswer"]["text"]
                assert answer in full and question["name"] in full, (file, "FAQ missing from expanded docs")
                assert " ".join(answer.split()) in visible, (file, "FAQ schema not visible")
for question in next(s for s in pages["faq/index.html"].schemas if s.get("@type") == "FAQPage")["mainEntity"]:
    assert question["name"] in full and question["acceptedAnswer"]["text"] in full, "General FAQ absent from expanded docs"
app_css = "\n".join((DIST / target(urlsplit(url).path)).read_text() for url in pages["app/index.html"].styles)
assert app_css and ".mk-hero" not in app_css and ".marketing-home" not in app_css, "Homepage CSS leaked into app"
assert "teleprompter-preview.webp" in (DIST / "index.html").read_text(), "Missing real product preview"
assert "marketing-home" not in (DIST / "app/index.html").read_text(), "Marketing styling must not apply to the app"
print(f"PASS: {len(pages)} HTML pages, {len(urls)} sitemap URLs, all internal links/fragments, JSON-LD and expanded guide documentation")
