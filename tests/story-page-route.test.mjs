import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const script = await readFile(new URL('../dist/story-page.js', import.meta.url), 'utf8');

function loadStoryPage(pathname, search = '') {
  const nodes = new Map();
  const requests = [];
  const element = () => ({
    children: [],
    append(...children) { this.children.push(...children); },
    setAttribute(name, value) { this[name] = value; },
  });
  const document = {
    documentElement: {},
    querySelector(selector) {
      if (!nodes.has(selector)) nodes.set(selector, element());
      return nodes.get(selector);
    },
    createElement: element,
  };
  const context = {
    URLSearchParams,
    document,
    location: { pathname, search },
    fetch(url) { requests.push(url); return new Promise(() => {}); },
  };
  vm.runInNewContext(script, context);
  return { document, nodes, requests };
}

for (const [lang, route] of [['pt', 'historias'], ['en', 'stories'], ['es', 'historias']]) {
  test(`loads a published story from the visible ${lang} URL`, () => {
    const page = loadStoryPage(`/${lang}/${route}/incendio-edificio-joelma-1974/`);
    assert.deepEqual(page.requests, ['/api/story?slug=incendio-edificio-joelma-1974']);
    assert.equal(page.document.documentElement.lang, lang === 'pt' ? 'pt-BR' : lang);
    assert.equal(page.nodes.get('#home-link').href, `/${lang}/`);
    assert.equal(page.nodes.get('#language-links').children.length, 3);
  });
}

test('keeps direct story.html links working', () => {
  const page = loadStoryPage('/story.html', '?lang=en&slug=operacao-prato-colares-1977');
  assert.deepEqual(page.requests, ['/api/story?slug=operacao-prato-colares-1977']);
  assert.equal(page.document.documentElement.lang, 'en');
});
