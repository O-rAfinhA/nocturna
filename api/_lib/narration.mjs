import { plainText } from '../../dist/markdown.js';

const BASE = 'https://api.elevenlabs.io';
export const SAMPLE_LIMIT = 450;
export const SAMPLE_MODELS = ['eleven_multilingual_v2', 'eleven_flash_v2_5'];

export function sampleText(story, lang) {
  const copy = story?.translations?.[lang];
  if (!copy) return '';
  const text = [copy.title, copy.summary, copy.body].map(plainText).join('. ').replace(/\s+/g, ' ').trim();
  if (text.length <= SAMPLE_LIMIT) return text;
  const cut = text.slice(0, SAMPLE_LIMIT);
  return cut.slice(0, Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '), 300)).trim() || cut.trim();
}

export async function listElevenVoices(apiKey, fetcher = fetch) {
  const response = await fetcher(`${BASE}/v2/voices?page_size=100`, { headers: { 'xi-api-key': apiKey }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('ElevenLabs voices unavailable');
  const data = await response.json();
  return (data.voices || []).filter(voice => /^[a-zA-Z0-9]{10,64}$/.test(voice.voice_id || '')).map(voice => ({ id: voice.voice_id, name: String(voice.name || voice.voice_id).slice(0, 100), description: String(voice.description || '').slice(0, 180) }));
}

export async function generateElevenSample({ apiKey, voiceId, model, text }, fetcher = fetch) {
  if (!/^[a-zA-Z0-9]{10,64}$/.test(voiceId) || !SAMPLE_MODELS.includes(model) || !text || text.length > SAMPLE_LIMIT) throw new Error('Invalid narration sample');
  const response = await fetcher(`${BASE}/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: model }),
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`ElevenLabs generation failed (${response.status})`);
  if (!response.headers.get('content-type')?.includes('audio/')) throw new Error('ElevenLabs returned no audio');
  return response;
}
