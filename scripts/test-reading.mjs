import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const path = new URL('../src/lib/reading.ts', import.meta.url);
let api = {};
if (existsSync(path)) {
  const js = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(js, { exports });
  api = exports;
}

test('tokenization preserves whitespace, punctuation and literal markup without interpreting it', () => {
  assert.equal(typeof api.tokenizeScript, 'function');
  const source = '  Hello,\tworld!\n\n<script>literal</script>  नमस्ते दुनिया';
  const tokens = api.tokenizeScript(source);
  assert.equal(tokens.map(t => t.text).join(''), source);
  assert.deepEqual(Array.from(tokens.filter(t => t.word).map(t => t.text)),
    ['Hello,', 'world!', '<script>literal</script>', 'नमस्ते', 'दुनिया']);
});

test('word paint advances in reading order, clamps completion and handles empty scripts', () => {
  assert.equal(typeof api.paintedWordCount, 'function');
  assert.equal(api.paintedWordCount(0, 4), 1);
  assert.equal(api.paintedWordCount(0.99, 4), 1);
  assert.equal(api.paintedWordCount(1, 4), 2);
  assert.equal(api.paintedWordCount(999, 4), 4);
  assert.equal(api.paintedWordCount(0, 0), 0);
});

test('word-follow scroll stays still within a row and glides into the next row', () => {
  assert.equal(typeof api.wordScrollOffset, 'function');
  const rows = [0, 0, 0, 72, 72, 144];
  assert.equal(api.wordScrollOffset(1.5, rows), 0);
  assert.equal(api.wordScrollOffset(2.5, rows), 36);
  assert.equal(api.wordScrollOffset(3, rows), 72);
  assert.equal(api.wordScrollOffset(100, rows), 144);
  assert.equal(api.wordScrollOffset(0, []), 0);
});

test('UI offers exclusive modes and an accessible optional split-text layer', () => {
  const html = readFileSync(new URL('../src/pages/app.astro', import.meta.url), 'utf8');
  assert.match(html, /id="ftp-mode-guide"[^>]*type="radio"[^>]*name="ftp-reading-mode"/);
  assert.match(html, /id="ftp-mode-words"[^>]*type="radio"[^>]*name="ftp-reading-mode"/);
  assert.match(html, /id="ftp-colour-read"[^>]*type="checkbox"/);
  assert.match(html, /id="ftp-read-layer"[^>]*aria-hidden="true"/);
  const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
  assert.match(css, /clip-path:\s*inset\(0 0 58% 0\)/);
  assert.match(css, /clip-path:\s*inset\(42% 0 0 0\)/);
  assert.match(css, /#ftp-colour-read-setting\[hidden\][^{]*\{\s*display:\s*none/);
});

test('leading blank lines are included in the scroll needed to reach the reading row', () => {
  assert.equal(typeof api.wordRowOffsets, 'function');
  const rows = api.wordRowOffsets([1593, 1593, 1665], 145);
  assert.deepEqual(Array.from(rows), [1448, 1448, 1520]);
  assert.equal(api.wordScrollOffset(0, rows), 1448);
});

test('saved reading mode accepts only guide or words and defaults safely', () => {
  assert.equal(typeof api.parseReadingMode, 'function');
  assert.equal(api.parseReadingMode('words'), 'words');
  assert.equal(api.parseReadingMode('guide'), 'guide');
  assert.equal(api.parseReadingMode('corrupt'), 'guide');
});
