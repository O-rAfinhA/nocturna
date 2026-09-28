import assert from 'node:assert/strict';
import test from 'node:test';
import { plainText, renderMarkdown } from '../dist/markdown.js';

test('story text formatting becomes HTML instead of visible marks', () => {
  const html = renderMarkdown('## A primeira dançarina\n\nA data de **14 de julho** vem do documentário *Les Danseurs Fous*.\n\n- anais\n- uma crônica\n\n1. primeiro\n2. segundo');
  assert.equal(html, '<h2>A primeira dançarina</h2><p>A data de <strong>14 de julho</strong> vem do documentário <em>Les Danseurs Fous</em>.</p><ul><li>anais</li><li>uma crônica</li></ul><ol><li>primeiro</li><li>segundo</li></ol>');
});

test('headings are h2 or h3 and a heading followed by text in the same block splits correctly', () => {
  assert.equal(renderMarkdown('# Título\n### Seção\nTexto logo abaixo'), '<h2>Título</h2><h3>Seção</h3><p>Texto logo abaixo</p>');
});

test('typed HTML is escaped and only https links become anchors', () => {
  const html = renderMarkdown('<script>alert(1)</script> [fonte](https://example.org/a) [x](javascript:alert(1))');
  assert.ok(!html.includes('<script>'));
  assert.match(html, /<a href="https:\/\/example\.org\/a" target="_blank" rel="noopener noreferrer">fonte<\/a>/);
  assert.ok(!html.includes('href="javascript'));
});

test('unpaired or arithmetic asterisks do not break the text', () => {
  assert.equal(renderMarkdown('2*3 e 4*5'), '<p>2*3 e 4*5</p>');
  assert.equal(renderMarkdown('negrito **sem fim'), '<p>negrito sem fim</p>');
  assert.equal(plainText('## Um **caso** *raro*'), 'Um caso raro');
});
