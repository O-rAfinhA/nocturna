(() => {
  const key = 'nocturna-privacy-v1';
  const script = document.currentScript;
  const analyticsAvailable = script?.dataset.analytics === 'vercel';
  const copy = {
    pt: { title: 'Sua privacidade no Nocturna', body: 'Usamos recursos necessários para o site funcionar. Com sua escolha, podemos ativar a medição agregada de visitas da Vercel, sem cookies de análise. Anúncios não estão ativos.', local: 'Esta versão local não mede visitas. Você pode registrar sua preferência para a medição opcional.', accept: 'Permitir medição', reject: 'Continuar sem medição', policy: 'Ler política de privacidade', settings: 'Preferências de privacidade' },
    en: { title: 'Your privacy at Nocturna', body: 'We use resources needed for the site to work. If you choose, we can enable Vercel’s aggregate visit measurement, without analytics cookies. Ads are not active.', local: 'This local version does not measure visits. You can save your preference for optional measurement.', accept: 'Allow measurement', reject: 'Continue without measurement', policy: 'Read privacy policy', settings: 'Privacy preferences' },
    es: { title: 'Tu privacidad en Nocturna', body: 'Usamos recursos necesarios para que funcione el sitio. Si lo eliges, podemos activar la medición agregada de visitas de Vercel, sin cookies de análisis. Los anuncios no están activos.', local: 'Esta versión local no mide visitas. Puedes guardar tu preferencia para la medición opcional.', accept: 'Permitir medición', reject: 'Continuar sin medición', policy: 'Leer política de privacidad', settings: 'Preferencias de privacidad' },
  };
  const language = () => {
    const code = document.documentElement.lang.slice(0, 2).toLowerCase();
    return copy[code] ? code : 'en';
  };
  let choice;
  try { choice = localStorage.getItem(key); } catch { choice = null; }
  if (choice !== 'accept' && choice !== 'reject') choice = null;
  let analyticsLoaded = false;
  function loadAnalytics() {
    if (!analyticsAvailable || analyticsLoaded) return;
    analyticsLoaded = true;
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    const tag = document.createElement('script');
    tag.defer = true;
    tag.src = '/_vercel/insights/script.js';
    document.head.append(tag);
  }
  if (choice === 'accept') loadAnalytics();

  function initialize() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const preferences = document.createElement('button');
    preferences.type = 'button';
    preferences.className = 'privacy-preferences';
    footer.append(preferences);

    const banner = document.createElement('section');
    banner.className = 'privacy-banner';
    banner.setAttribute('aria-labelledby', 'privacy-banner-title');
    banner.innerHTML = '<div class="privacy-banner-copy"><h2 id="privacy-banner-title"></h2><p></p><a></a></div><div class="privacy-banner-actions"><button type="button" data-choice="reject"></button><button type="button" data-choice="accept"></button></div>';
    document.body.append(banner);

    function translate() {
      const lang = language();
      const words = copy[lang];
      preferences.textContent = words.settings;
      banner.querySelector('h2').textContent = words.title;
      banner.querySelector('p').textContent = analyticsAvailable ? words.body : words.local;
      const policy = banner.querySelector('a');
      policy.textContent = words.policy;
      policy.href = `/${lang}/privacidade.html`;
      banner.querySelector('[data-choice="accept"]').textContent = words.accept;
      banner.querySelector('[data-choice="reject"]').textContent = words.reject;
    }
    translate();
    banner.hidden = choice !== null;
    preferences.addEventListener('click', () => { translate(); banner.hidden = false; banner.querySelector('[data-choice="reject"]').focus(); });
    banner.addEventListener('click', event => {
      const selected = event.target.closest('[data-choice]')?.dataset.choice;
      if (!selected) return;
      const previous = choice;
      choice = selected;
      try { localStorage.setItem(key, choice); } catch { /* Preference lasts for this page only. */ }
      banner.hidden = true;
      preferences.focus();
      if (selected === 'accept') loadAnalytics();
      else if (previous === 'accept' && analyticsLoaded) location.reload();
    });
    new MutationObserver(translate).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
