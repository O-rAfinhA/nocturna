import assert from 'node:assert/strict';
import test from 'node:test';
import { generateElevenSample, sampleText, SAMPLE_LIMIT } from '../api/_lib/narration.mjs';

test('editorial sample stays short and omits Markdown links', () => {
  const story = { translations: { pt: { title: 'Um caso', summary: '[Veja a fonte](https://example.com) e o contexto.', body: '## Investigação\n\n' + 'Detalhes do caso. '.repeat(100) } } };
  const text = sampleText(story, 'pt');
  assert.ok(text.length <= SAMPLE_LIMIT);
  assert.ok(text.includes('Veja a fonte'));
  assert.ok(!text.includes('https://'));
  assert.equal(sampleText(story, 'en'), '');
});

test('sample request sends the saved excerpt only to ElevenLabs', async () => {
  let call;
  const audio = await generateElevenSample({ apiKey: 'private-test-key', voiceId: 'ABCDEFGHIJ1234567890', model: 'eleven_multilingual_v2', text: 'Olá, Nocturna.' }, async (url, options) => {
    call = { url, options };
    return new Response('mp3', { headers: { 'Content-Type': 'audio/mpeg' } });
  });
  assert.equal(audio.status, 200);
  assert.match(call.url, /^https:\/\/api\.elevenlabs\.io\/v1\/text-to-speech\//);
  assert.equal(call.options.headers['xi-api-key'], 'private-test-key');
  assert.equal(JSON.parse(call.options.body).text, 'Olá, Nocturna.');
  await assert.rejects(generateElevenSample({ apiKey: 'x', voiceId: '../bad', model: 'eleven_multilingual_v2', text: 'x' }));
});
