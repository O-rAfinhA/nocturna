import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// Regressão: uma edição removeu removeDashes() e o botão Salvar parou de funcionar sem mensagem.
test('admin script defines every helper it calls', async () => {
  const source = await readFile(new URL('../dist/admin/admin.js', import.meta.url), 'utf8');
  for (const name of ['removeDashes', 'applyPendingTextFixes', 'pendingTextFixes', 'publishButton', 'renderStoryList', 'showTab', 'message', 'api']) {
    if (source.includes(`${name}(`)) assert.match(source, new RegExp(`(function ${name}\\(|const ${name}\\s*=)`), `${name} é usada mas não está definida`);
  }
});
