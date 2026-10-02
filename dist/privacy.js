(() => {
  const key = 'nocturna-privacy-v1';
  const script = document.currentScript;
  const analyticsAvailable = script?.dataset.analytics === 'vercel';
  // Google Analytics 4 da conta atual; só carrega depois que o visitante permite a medição.
  const googleAnalyticsId = 'G-29E7MVR3D8';
  const copy = {
    pt: { title: 'Privacidade', body: 'Com sua permissão, medimos as visitas com o Google Analytics (que usa cookies), para entender como o site é usado. Você escolhe se permite essa medição.', local: 'Esta versão local não mede visitas. Você pode registrar sua preferência para a medição opcional.', accept: 'Permitir medição', reject: 'Continuar sem medição', policy: 'Ler política de privacidade', settings: 'Alterar minha escolha de medição' },
    en: { title: 'Privacy', body: 'With your permission, we measure visits with Google Analytics (which uses cookies) to understand how the site is used. You choose whether to allow this measurement.', local: 'This local version does not measure visits. You can save your preference for optional measurement.', accept: 'Allow measurement', reject: 'Continue without measurement', policy: 'Read privacy policy', settings: 'Change my measurement choice' },
    es: { title: 'Privacidad', body: 'Con tu permiso, medimos las visitas con Google Analytics (que usa cookies) para entender cómo se usa el sitio. Tú eliges si permites esta medición.', local: 'Esta versión local no mide visitas. Puedes guardar tu preferencia para la medición opcional.', accept: 'Permitir medición', reject: 'Continuar sin medición', policy: 'Leer política de privacidad', settings: 'Cambiar mi elección de medición' },
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
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', googleAnalyticsId);
    const google = document.createElement('script');
    google.async = true;
    google.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
    document.head.append(google);
  }
  // Ao retirar a permissão, apaga os cookies do Google Analytics (_ga, _ga_*) deste domínio.
  function removeAnalyticsCookies() {
    const hosts = [location.hostname, `.${location.hostname}`, `.${location.hostname.split('.').slice(-3).join('.')}`];
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^_ga(_|$)/.test(name)) continue;
      for (const domain of ['', ...hosts.map(host => `; domain=${host}`)]) document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
    }
  }
  if (choice === 'accept') loadAnalytics();

  function initialize() {
    // O aviso aparece só na primeira visita. Depois, a escolha pode ser revista apenas na página de privacidade.
    const place = document.getElementById('privacy-choice');
    const preferences = document.createElement('button');
    preferences.type = 'button';
    preferences.className = 'privacy-preferences';
    if (place) place.append(preferences);

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
      if (place) preferences.focus();
      if (selected === 'accept') loadAnalytics();
      else { removeAnalyticsCookies(); if (previous === 'accept' && analyticsLoaded) location.reload(); }
    });
    new MutationObserver(translate).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
