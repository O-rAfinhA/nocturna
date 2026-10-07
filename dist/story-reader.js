const copy = {
  pt: { heading: 'Ouvir este dossiê', play: 'Reproduzir', pause: 'Pausar', resume: 'Continuar', stop: 'Parar', speed: 'Velocidade', voice: 'Voz', automatic: 'Automática', preview: 'Testar voz', sample: 'Esta é uma amostra da voz para os dossiês do Nocturna.', ready: 'Pronto para ouvir.', playing: 'Reproduzindo o dossiê.', paused: 'Leitura pausada.', finished: 'Leitura concluída.', stopped: 'Leitura interrompida.', unavailable: 'A leitura em voz não está disponível neste navegador.', empty: 'Não há texto para reproduzir.', error: 'Não foi possível reproduzir a voz neste dispositivo.' },
  en: { heading: 'Listen to this dossier', play: 'Play', pause: 'Pause', resume: 'Resume', stop: 'Stop', speed: 'Speed', voice: 'Voice', automatic: 'Automatic', preview: 'Test voice', sample: 'This is a sample voice for Nocturna dossiers.', ready: 'Ready to listen.', playing: 'Playing the dossier.', paused: 'Reading paused.', finished: 'Reading complete.', stopped: 'Reading stopped.', unavailable: 'Speech playback is unavailable in this browser.', empty: 'There is no text to play.', error: 'Speech could not play on this device.' },
  es: { heading: 'Escuchar este dosier', play: 'Reproducir', pause: 'Pausar', resume: 'Continuar', stop: 'Detener', speed: 'Velocidad', voice: 'Voz', automatic: 'Automática', preview: 'Probar voz', sample: 'Esta es una muestra de la voz para los dosieres de Nocturna.', ready: 'Listo para escuchar.', playing: 'Reproduciendo el dosier.', paused: 'Lectura en pausa.', finished: 'Lectura terminada.', stopped: 'Lectura detenida.', unavailable: 'La lectura en voz alta no está disponible en este navegador.', empty: 'No hay texto para reproducir.', error: 'No se pudo reproducir la voz en este dispositivo.' },
};
const locales = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' };

function segments(text, limit = 320) {
  const result = [];
  let part = '';
  for (const word of text.replace(/\s+/g, ' ').trim().split(' ')) {
    if (!word) continue;
    if (part && `${part} ${word}`.length > limit) { result.push(part); part = ''; }
    if (word.length > limit) {
      for (let start = 0; start < word.length; start += limit) result.push(word.slice(start, start + limit));
    } else part = part ? `${part} ${word}` : word;
  }
  if (part) result.push(part);
  return result;
}

function readingParts(root) {
  const nodes = [root.querySelector('#story-title'), root.querySelector('#story-summary'), ...root.querySelectorAll('#story-reading-text h2, #story-reading-text h3, #story-reading-text p, #story-reading-text li')];
  return nodes.filter(Boolean).flatMap(node => segments(node.textContent || '').map((text, offset) => ({ text, pause: offset ? 0 : /^H[123]$/.test(node.tagName) ? 450 : 180 })));
}

export function mountStoryReader(root = document) {
  const host = root.querySelector('#story-reader');
  if (!host || host.dataset.mounted) return;
  host.dataset.mounted = 'true';
  const lang = ['pt', 'en', 'es'].includes(host.dataset.lang) ? host.dataset.lang : 'pt';
  const words = copy[lang];
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
  const synth = window.speechSynthesis;
  const heading = document.createElement('h2'); heading.textContent = words.heading;
  const controls = document.createElement('div'); controls.className = 'story-reader-controls';
  const button = (label, action) => {
    const item = document.createElement('button'); item.type = 'button'; item.textContent = label; item.addEventListener('click', action); return item;
  };
  let active = false, paused = false, sampleMode = false, index = 0, generation = 0, parts = [];
  const status = document.createElement('p'); status.className = 'story-reader-status'; status.setAttribute('role', 'status'); status.textContent = words.ready;
  const speedLabel = document.createElement('label'); speedLabel.textContent = words.speed;
  const speed = document.createElement('select'); speed.setAttribute('aria-label', words.speed);
  for (const rate of [0.85, 1, 1.15, 1.3]) {
    const option = document.createElement('option'); option.value = String(rate); option.textContent = `${rate.toLocaleString(locales[lang])}×`; if (rate === 1) option.selected = true; speed.append(option);
  }
  speedLabel.append(speed);
  const voiceLabel = document.createElement('label'); voiceLabel.textContent = words.voice;
  const voiceSelect = document.createElement('select'); voiceSelect.setAttribute('aria-label', words.voice);
  voiceLabel.append(voiceSelect);
  const preferenceKey = `nocturna-reader-${lang}`;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(preferenceKey) || '{}'); } catch { /* Private browsing can deny storage. */ }
  if ([0.85, 1, 1.15, 1.3].includes(Number(saved.rate))) speed.value = String(saved.rate);
  function availableVoices() { return synth.getVoices().filter(voice => voice.lang.toLowerCase().startsWith(lang)); }
  function populateVoices() {
    const current = voiceSelect.value || saved.voice || '';
    voiceSelect.replaceChildren();
    const automatic = document.createElement('option'); automatic.value = ''; automatic.textContent = words.automatic; voiceSelect.append(automatic);
    for (const voice of availableVoices().sort((a, b) => a.name.localeCompare(b.name))) {
      const option = document.createElement('option'); option.value = voice.voiceURI; option.textContent = `${voice.name} (${voice.lang})`; voiceSelect.append(option);
    }
    voiceSelect.value = Array.from(voiceSelect.options).some(option => option.value === current) ? current : '';
  }
  populateVoices();
  synth.addEventListener?.('voiceschanged', populateVoices);
  function remember() { try { localStorage.setItem(preferenceKey, JSON.stringify({ voice: voiceSelect.value, rate: Number(speed.value) })); } catch { /* Storage is optional. */ } }
  voiceSelect.addEventListener('change', remember); speed.addEventListener('change', remember);
  function updateButtons() { play.textContent = paused ? words.resume : words.play; play.disabled = active && !paused; pause.disabled = !active || paused; stop.disabled = !active; }
  function finish(message) { active = false; paused = false; sampleMode = false; parts = []; index = 0; status.textContent = message; updateButtons(); }
  function stopReading() { generation++; synth.cancel(); finish(words.stopped); }
  function speakNext(token) {
    if (token !== generation || !active || paused) return;
    if (index >= parts.length) { finish(words.finished); return; }
    const utterance = new SpeechSynthesisUtterance(parts[index].text);
    utterance.lang = locales[lang]; utterance.rate = Number(speed.value);
    const voices = synth.getVoices();
    const voice = voices.find(voice => voice.voiceURI === voiceSelect.value)
      || voices.find(voice => voice.lang.toLowerCase() === locales[lang].toLowerCase() && voice.localService)
      || voices.find(voice => voice.lang.toLowerCase().startsWith(lang) && voice.localService)
      || voices.find(voice => voice.lang.toLowerCase() === locales[lang].toLowerCase())
      || voices.find(voice => voice.lang.toLowerCase().startsWith(lang)) || null;
    if (voice) utterance.voice = voice;
    utterance.onend = () => { if (token === generation) { index++; setTimeout(() => speakNext(token), parts[index]?.pause || 0); } };
    utterance.onerror = () => { if (token === generation) finish(words.error); };
    try { synth.speak(utterance); } catch { finish(words.error); }
  }
  function playReading() {
    if (paused) { paused = false; synth.resume(); if (!sampleMode && !synth.speaking) speakNext(generation); status.textContent = words.playing; updateButtons(); return; }
    if (active) return;
    parts = readingParts(root);
    if (!parts.length) { status.textContent = words.empty; return; }
    synth.cancel();
    generation++; index = 0; active = true; paused = false; sampleMode = false;
    status.textContent = words.playing; updateButtons(); speakNext(generation);
  }
  const play = button(words.play, playReading);
  const pause = button(words.pause, () => { if (!active || paused) return; synth.pause(); paused = true; status.textContent = words.paused; updateButtons(); });
  const stop = button(words.stop, stopReading);
  const preview = button(words.preview, () => {
    generation++; synth.cancel(); active = true; paused = false; sampleMode = true; parts = []; index = 0;
    const token = generation;
    const utterance = new SpeechSynthesisUtterance(words.sample); utterance.lang = locales[lang]; utterance.rate = Number(speed.value);
    utterance.voice = synth.getVoices().find(voice => voice.voiceURI === voiceSelect.value) || null;
    utterance.onend = () => { if (token === generation) finish(words.ready); };
    utterance.onerror = () => { if (token === generation) finish(words.error); };
    status.textContent = words.playing; updateButtons(); synth.speak(utterance);
  });
  controls.append(play, pause, stop, voiceLabel, preview, speedLabel);
  host.append(heading, controls, status); host.hidden = false; updateButtons();
  window.addEventListener('pagehide', () => { if (active) { generation++; synth.cancel(); } }, { once: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mountStoryReader(), { once: true });
else mountStoryReader();
