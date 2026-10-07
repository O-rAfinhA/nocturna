import { STORY_BYTES, failure, hash, input, json, sameOrigin, sessionToken, storyProblem } from '../_lib/http.mjs';
import { requireAdmin } from '../_lib/auth.mjs';
import { allStories, deleteStory, saveStory, storyBySlug, takeRate } from '../_lib/store.mjs';
import { generateElevenSample, listElevenVoices, sampleText, SAMPLE_MODELS } from '../_lib/narration.mjs';

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.response) return auth.response;
    if (new URL(request.url).searchParams.get('audio') === 'voices') {
      if (!process.env.ELEVENLABS_API_KEY) return failure('Configure ELEVENLABS_API_KEY na Vercel para testar as vozes.', 503);
      try { return json({ voices: await listElevenVoices(process.env.ELEVENLABS_API_KEY) }); }
      catch { return failure('Não foi possível carregar as vozes da ElevenLabs.', 502); }
    }
    return json({ stories: await allStories() });
  } catch (error) {
    console.error(error);
    return json({ error: 'Catálogo temporariamente indisponível' }, 503);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin(request, true);
    if (auth.response) return auth.response;
    if (!sameOrigin(request)) return failure('Origem inválida', 403);
    if (new URL(request.url).searchParams.get('audio') === 'sample') {
      if (!process.env.ELEVENLABS_API_KEY) return failure('Configure ELEVENLABS_API_KEY na Vercel para testar as vozes.', 503);
      const { slug, lang, voiceId, model } = await input(request, 2000);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '') || !['pt', 'en', 'es'].includes(lang) || !/^[a-zA-Z0-9]{10,64}$/.test(voiceId || '') || !SAMPLE_MODELS.includes(model)) return failure('Opções de amostra inválidas');
      const story = await storyBySlug(slug, false);
      if (!story) return failure('Salve o dossiê antes de gerar a amostra.', 404);
      const text = sampleText(story, lang);
      if (!text) return failure('Texto do idioma indisponível.');
      if (!await takeRate(`voice-sample:${hash(sessionToken(request) || '')}`, 18, 3600)) return failure('Limite de amostras atingido. Tente novamente mais tarde.', 429);
      try {
        const audio = await generateElevenSample({ apiKey: process.env.ELEVENLABS_API_KEY, voiceId, model, text });
        return new Response(audio.body, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
      } catch { return failure('A ElevenLabs não conseguiu gerar esta amostra. Confira a voz, o plano e os créditos.', 502); }
    }
    const story = await input(request, STORY_BYTES);
    const problem = storyProblem(story);
    if (problem) return failure(problem);
    await saveStory(story);
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return failure(error.message === 'too large' ? 'História muito longa' : 'Não foi possível salvar a história', error.message === 'too large' ? 413 : 503);
  }
}

export async function DELETE(request) {
  try {
    const auth = await requireAdmin(request, true);
    if (auth.response) return auth.response;
    if (!sameOrigin(request)) return failure('Origem inválida', 403);
    const slug = new URL(request.url).searchParams.get('slug') || '';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return failure('História inválida');
    const removed = await deleteStory(slug);
    return removed ? json({ ok: true }) : failure('História não encontrada', 404);
  } catch (error) {
    console.error(error);
    return failure('Não foi possível excluir a história', 503);
  }
}
