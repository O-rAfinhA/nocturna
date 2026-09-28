import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import test from 'node:test';

// O plano Hobby da Vercel aceita no máximo 12 Functions por deploy; a 13ª faz o deploy falhar.
test('the API stays within the Vercel Hobby limit of 12 functions', async () => {
  const entries = await readdir(new URL('../api/', import.meta.url), { recursive: true });
  const functions = entries.filter(path => path.endsWith('.mjs') && !path.startsWith('_lib'));
  assert.ok(functions.length <= 12, `${functions.length} Functions: ${functions.join(', ')}`);
});
