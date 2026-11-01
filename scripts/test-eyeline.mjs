import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const rule = selector => {
  // Exact selector at line start, not a suffix of a contextual override.
  const block = css.split('\n').findIndex(line => line === `${selector} {`);
  assert.notEqual(block, -1, `Missing ${selector}`);
  const lines = css.split('\n').slice(block);
  return lines.slice(0, lines.findIndex(line => line === '}') + 1).join('\n');
};

test('reading guide is opaque and has no glow that blends with moving text', () => {
  const guide = rule('.ftp-eyeline');
  assert.match(guide, /border-top:\s*2px solid var\(--color-accent\)/);
  assert.match(guide, /box-shadow:\s*none/);
  assert.doesNotMatch(guide, /color-mix|opacity:/);
  for (const marker of ['.ftp-eyeline::before', '.ftp-eyeline::after']) {
    assert.match(rule(marker), /border-(?:left|right)-color:\s*var\(--color-accent\)/);
  }
});

test('reading guide has an independent compositing hint and never receives the scroll transform', () => {
  const guide = rule('.ftp-eyeline');
  assert.match(guide, /transform:\s*translateZ\(0\)/);
  assert.match(guide, /will-change:\s*transform/);
  const ts = readFileSync(new URL('../src/lib/teleprompter.ts', import.meta.url), 'utf8');
  assert.match(ts, /track\.style\.transform =/);
  assert.doesNotMatch(ts, /eyeline(?:\?|)\.style\.transform\s*=/);
});
