"""Generate localized static pages from the Portuguese home and privacy copy."""

from html import escape
import json
import os
from pathlib import Path
import re
import unicodedata
from datetime import date
import shutil

ROOT = Path(__file__).parent / "dist"
HOME = (ROOT / "index.html").read_text(encoding="utf-8")

HOME_TEXT = {
    "pt": {},
    "en": {
        "Nocturna — Atlas do incomum": "Nocturna — Atlas of the unusual",
        "Explore um atlas interativo de histórias incomuns pelo mundo.": "Explore an interactive atlas of unusual stories around the world.",
        "ATLAS DO INCOMUM": "ATLAS OF THE UNUSUAL",
        "EXPLORAR O DESCONHECIDO": "EXPLORE THE UNKNOWN",
        "Todo lugar guarda uma história.": "Every place has a story.",
        "Escolha um ponto do globo ou procure uma cidade para descobrir histórias próximas.": "Pick a point on the globe or search for a city to discover nearby stories.",
        "Busque uma cidade ou código postal": "Search for a city or postal code",
        "Busca de locais:": "Place search:",
        "Buscar cidade": "Search for a city",
        "Explorar": "Explore",
        "Minha localização": "My location",
        "ATLAS INTERATIVO": "INTERACTIVE ATLAS",
        "Mapa detalhado; arraste para navegar e clique para selecionar": "Detailed map; drag to navigate and click to select",
        "Visualização": "View", "Mapa detalhado": "Detailed map",
        "ARRASTE PARA GIRAR · CLIQUE PARA ESCOLHER": "DRAG TO ROTATE · CLICK TO SELECT",
        "Globo interativo; arraste para girar e clique para selecionar": "Interactive globe; drag to rotate and click to select",
        "Globo interativo": "Interactive globe",
        ">Globo</button>": ">Globe</button>",
        "O globo está indisponível. Use a busca ou a lista de cidades abaixo.": "The globe is unavailable. Use search or the city list below.",
        "Afastar": "Zoom out", "Aproximar": "Zoom in",
        "LOCAL SELECIONADO": "SELECTED LOCATION",
        "Comentários da região": "Comments from this region",
        "Ou escolha uma cidade": "Or choose a city",
        "Disponíveis nesta demonstração": "Available in this demo",
        "Um atlas de histórias incomuns pelo mundo.": "An atlas of unusual stories around the world.",
        "Sem cadastro. Localização opcional.": "No account. Location is optional.",
        "Privacidade": "Privacy", "Fechar": "Close",
        "FICÇÃO · EXEMPLO": "FICTION · SAMPLE",
        "Esta história é fictícia e demonstra apenas como uma futura página poderá funcionar.": "This story is fictional and only demonstrates how a future story page could work.",
    },
    "es": {
        "Nocturna — Atlas do incomum": "Nocturna — Atlas de lo insólito",
        "Explore um atlas interativo de histórias incomuns pelo mundo.": "Explora un atlas interactivo de historias insólitas del mundo.",
        "ATLAS DO INCOMUM": "ATLAS DE LO INSÓLITO",
        "EXPLORAR O DESCONHECIDO": "EXPLORA LO DESCONOCIDO",
        "Todo lugar guarda uma história.": "Cada lugar guarda una historia.",
        "Escolha um ponto do globo ou procure uma cidade para descobrir histórias próximas.": "Elige un punto del globo o busca una ciudad para descubrir historias cercanas.",
        "Busque uma cidade ou código postal": "Busca una ciudad o código postal",
        "Busca de locais:": "Búsqueda de lugares:",
        "Buscar cidade": "Buscar ciudad",
        "Minha localização": "Mi ubicación",
        "ATLAS INTERATIVO": "ATLAS INTERACTIVO",
        "Mapa detalhado; arraste para navegar e clique para selecionar": "Mapa detallado; arrastra para navegar y haz clic para elegir",
        "Visualização": "Vista", "Mapa detalhado": "Mapa detallado",
        "ARRASTE PARA GIRAR · CLIQUE PARA ESCOLHER": "ARRASTRA PARA GIRAR · HAZ CLIC PARA ELEGIR",
        "Globo interativo; arraste para girar e clique para selecionar": "Globo interactivo; arrastra para girar y haz clic para elegir",
        "Globo interativo": "Globo interactivo",
        "O globo está indisponível. Use a busca ou a lista de cidades abaixo.": "El globo no está disponible. Usa la búsqueda o la lista de ciudades.",
        "Afastar": "Alejar", "Aproximar": "Acercar",
        "LOCAL SELECIONADO": "UBICACIÓN SELECCIONADA",
        "Comentários da região": "Comentarios de la región",
        "Ou escolha uma cidade": "O elige una ciudad",
        "Disponíveis nesta demonstração": "Disponibles en esta demostración",
        "Um atlas de histórias incomuns pelo mundo.": "Un atlas de historias insólitas por el mundo.",
        "Sem cadastro. Localização opcional.": "Sin cuenta. Ubicación opcional.",
        "Privacidade": "Privacidad", "Fechar": "Cerrar",
        "FICÇÃO · EXEMPLO": "FICCIÓN · EJEMPLO",
        "Esta história é fictícia e demonstra apenas como uma futura página poderá funcionar.": "Esta historia es ficticia y solo muestra cómo podría funcionar una futura página.",
    },
}

PRIVACY = {
    "pt": {
        "title": "Privacidade", "back": "Voltar ao atlas", "status": "Rascunho para a versão local. Antes da publicação, serão necessários os dados e o contato do responsável pelo site.",
        "intro": "Esta página descreve o funcionamento da versão atual do Nocturna. Ela não inclui contas, anúncios ou ferramentas de análise de audiência.",
        "h1": "Sua localização", "p1": "O navegador só pede acesso à localização quando você clica em “Minha localização”. As coordenadas são usadas na memória desta página para centralizar o globo e ordenar os exemplos por distância. O código do site não as grava nem as coloca no endereço da página. Você pode negar a permissão e continuar usando a busca ou o globo. O próprio navegador permite revisar a permissão depois.",
        "h2": "Idioma", "p2": "Ao abrir a página inicial, o site usa o idioma informado pelo navegador: português, espanhol ou inglês para os demais idiomas. Você pode trocar o idioma pelo seletor; essa troca não é salva no dispositivo. Para visitantes, o código atual não cria cookies; a área administrativa usa um cookie de sessão restrito ao administrador.",
        "h3": "Mapa, busca e conexões", "p3": "Para desenhar os contornos dos países, o navegador solicita um arquivo do pacote world-atlas à CDN jsDelivr. Ao escolher “Mapa detalhado”, também carrega a biblioteca Leaflet da jsDelivr e os blocos da área visualizada do OpenStreetMap. Esses provedores recebem dados técnicos habituais, como endereço IP; os blocos solicitados revelam a área visualizada, que pode ser pequena em zoom alto. Se você usar “Minha localização” no mapa detalhado, os blocos solicitados refletem a área da sua posição. Ao enviar uma busca fora das cidades de exemplo, o texto digitado é enviado à API de geocodificação Open-Meteo, que usa dados GeoNames; nenhum pedido é feito enquanto você apenas digita. Não envie dados pessoais na busca. O código do Nocturna não envia diretamente as coordenadas escolhidas no mapa nem as salva. Você pode usar o globo sem abrir o mapa detalhado. O servidor que hospedar o site também poderá registrar dados técnicos de acesso conforme sua configuração.",
        "h4": "Comentários", "p4": "Ao comentar uma história publicada, você informa um nome público e o texto do comentário. Não pedimos e-mail. O comentário é salvo no servidor para análise do administrador; somente após aprovação, o nome e o texto aparecem publicamente. Comentários aprovados também aparecem para quem explora a região aproximada da história. A região vem da história, não da localização de quem comentou. O administrador pode rejeitar ou excluir comentários. Informe dados que deseja tornar públicos apenas no texto.",
        "h5": "Publicidade e contato", "p5": "Não há Google AdSense nem ferramentas de análise nesta versão. Antes de ativar esses serviços, esta página e os controles de privacidade deverão ser revisados. Responsável e contato: [PREENCHER ANTES DA PUBLICAÇÃO].",
    },
    "en": {
        "title": "Privacy", "back": "Back to the atlas", "status": "Draft for the local version. The site owner's details and contact information are needed before publication.",
        "intro": "This page describes the current version of Nocturna. It has no accounts, ads, or audience analytics tools.",
        "h1": "Your location", "p1": "The browser requests location access only when you click “My location”. Coordinates are used in this page's memory to center the globe and sort sample stories by distance. The site code does not save them or put them in the page URL. You can refuse permission and still use search or the globe. You can review this permission in your browser later.",
        "h2": "Language", "p2": "When you open the home page, the site uses the language reported by your browser: Portuguese, Spanish, or English for other languages. You can change it using the selector; this choice is not stored on your device. The current visitor experience does not set cookies; the administrator area uses an administrator-only session cookie.",
        "h3": "Map, search and connections", "p3": "To draw country outlines, the browser requests a world-atlas file through the jsDelivr CDN. When you choose ‘Detailed map’, it also loads the Leaflet library from jsDelivr and tiles for the area you view from OpenStreetMap. These providers receive usual technical data such as your IP address; requested tiles reveal the area viewed, which may be small at high zoom. If you use ‘My location’ in the detailed map, requested tiles reflect your location's area. When you submit a search outside the sample cities, the search text is sent to Open-Meteo's geocoding API, based on GeoNames data; no request is made as you type. Do not enter personal data in search. Nocturna's code does not directly send your selected map coordinates or store them. You can use the globe without opening the detailed map. The hosting server may record technical access data depending on its configuration.",
        "h4": "Comments", "p4": "To comment on a published story, you provide a public name and comment text. We do not ask for an email address. The comment is saved on the server for administrator review; only after approval are the name and text shown publicly. Approved comments also appear for people exploring the story's approximate region. The region comes from the story, not from the commenter's location. The administrator can reject or delete comments. Share only information you want to make public in your comment.",
        "h5": "Ads and contact", "p5": "This version does not include Google AdSense or analytics tools. Before enabling them, this page and the privacy controls must be reviewed. Site owner and contact: [COMPLETE BEFORE PUBLICATION].",
    },
    "es": {
        "title": "Privacidad", "back": "Volver al atlas", "status": "Borrador para la versión local. Antes de publicar se necesitan los datos y el contacto del responsable del sitio.",
        "intro": "Esta página describe la versión actual de Nocturna. No incluye cuentas, anuncios ni herramientas de análisis de audiencia.",
        "h1": "Tu ubicación", "p1": "El navegador solo solicita acceso a la ubicación cuando pulsas “Mi ubicación”. Las coordenadas se usan en la memoria de esta página para centrar el globo y ordenar las historias de ejemplo por distancia. El código del sitio no las guarda ni las añade a la URL. Puedes denegar el permiso y seguir usando la búsqueda o el globo. Después puedes revisar el permiso en el navegador.",
        "h2": "Idioma", "p2": "Al abrir la página inicial, el sitio usa el idioma indicado por el navegador: portugués, español o inglés para los demás idiomas. Puedes cambiarlo con el selector; la elección no se guarda en el dispositivo. El código actual no crea cookies para los visitantes; el área administrativa utiliza una cookie de sesión exclusiva del administrador.",
        "h3": "Mapa, búsqueda y conexiones", "p3": "Para dibujar los contornos de los países, el navegador solicita un archivo de world-atlas a la CDN jsDelivr. Al elegir ‘Mapa detallado’, también carga la biblioteca Leaflet desde jsDelivr y los mosaicos de la zona visualizada desde OpenStreetMap. Esos proveedores reciben datos técnicos habituales, como la dirección IP; los mosaicos solicitados revelan la zona vista, que puede ser pequeña con mucho zoom. Si utilizas ‘Mi ubicación’ en el mapa detallado, los mosaicos reflejan la zona de tu posición. Al enviar una búsqueda fuera de las ciudades de ejemplo, el texto se envía a la API de geocodificación de Open-Meteo, basada en datos GeoNames; no se realiza ninguna consulta mientras escribes. No introduzcas datos personales en la búsqueda. El código de Nocturna no envía directamente las coordenadas seleccionadas en el mapa ni las guarda. Puedes usar el globo sin abrir el mapa detallado. El servidor de alojamiento también podría registrar datos técnicos de acceso según su configuración.",
        "h4": "Comentarios", "p4": "Para comentar una historia publicada, indicas un nombre público y el texto del comentario. No pedimos correo electrónico. El comentario se guarda en el servidor para revisión del administrador; solo después de su aprobación aparecen públicamente el nombre y el texto. Los comentarios aprobados también aparecen para quienes exploran la región aproximada de la historia. La región procede de la historia, no de la ubicación de quien comenta. El administrador puede rechazar o eliminar comentarios. Escribe únicamente datos que quieras hacer públicos.",
        "h5": "Publicidad y contacto", "p5": "Esta versión no incluye Google AdSense ni herramientas de análisis. Antes de activarlas, habrá que revisar esta página y los controles de privacidad. Responsable y contacto: [COMPLETAR ANTES DE PUBLICAR].",
    },
}

for lang in ("pt", "en", "es"):
    folder = ROOT / lang
    folder.mkdir(exist_ok=True)
    page = HOME.replace('href="./styles.css"', 'href="../styles.css"').replace('src="./app.js"', 'src="../app.js"')
    page = page.replace('href="./"', f'href="/{lang}/"').replace('href="./pt/privacidade.html"', f'href="/{lang}/privacidade.html"')
    page = page.replace('lang="pt-BR"', f'lang="{dict(pt="pt-BR", en="en", es="es")[lang]}"')
    for source, target in HOME_TEXT[lang].items():
        assert source in page, (lang, source)
        page = page.replace(source, target)
    (folder / "index.html").write_text(page, encoding="utf-8")

    copy = PRIVACY[lang]
    locale = dict(pt="pt-BR", en="en", es="es")[lang]
    legal = f'''<!doctype html>
<html lang="{locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,follow"><meta name="theme-color" content="#080d14"><title>{escape(copy['title'])} — Nocturna</title><link rel="stylesheet" href="../styles.css"></head>
<body><div class="shell"><header class="masthead"><a class="brand" href="/{lang}/"><span class="brand-mark" aria-hidden="true">✦</span><span>NOCTURNA</span></a><label class="language"><span class="sr-only">{escape(copy['title'])}</span><select id="legal-language" aria-label="{dict(pt='Idioma',en='Language',es='Idioma')[lang]}"><option value="pt" {'selected' if lang=='pt' else ''}>PT</option><option value="en" {'selected' if lang=='en' else ''}>EN</option><option value="es" {'selected' if lang=='es' else ''}>ES</option></select></label></header><main class="legal"><a class="back" href="/{lang}/">← {escape(copy['back'])}</a><h1>{escape(copy['title'])}</h1><p class="draft">{escape(copy['status'])}</p><p>{escape(copy['intro'])}</p><h2>{escape(copy['h1'])}</h2><p>{escape(copy['p1'])}</p><h2>{escape(copy['h2'])}</h2><p>{escape(copy['p2'])}</p><h2>{escape(copy['h3'])}</h2><p>{escape(copy['p3'])}</p><h2>{escape(copy['h4'])}</h2><p>{escape(copy['p4'])}</p><h2>{escape(copy['h5'])}</h2><p>{escape(copy['p5'])}</p></main></div><script>document.getElementById('legal-language').addEventListener('change',function(){{location.href='/'+this.value+'/privacidade.html'}})</script></body></html>'''
    (folder / "privacidade.html").write_text(legal, encoding="utf-8")

def validate_story(story):
    slug = story.get("slug", "")
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        raise ValueError(f"Invalid story slug: {slug!r}")
    if story.get("status") not in {"draft", "review", "published"}:
        raise ValueError(f"Invalid status for {slug}")
    if story.get("classification") not in {"documented", "unverified", "fiction"}:
        raise ValueError(f"Invalid classification for {slug}")
    place = story.get("place", {})
    if not (-90 <= place.get("latitude", 999) <= 90 and -180 <= place.get("longitude", 999) <= 180):
        raise ValueError(f"Invalid coordinates for {slug}")
    for key in ("city", "region", "country"):
        if not isinstance(place.get(key), str) or not place[key].strip():
            raise ValueError(f"Missing {key} for {slug}")
    for key in ("publishedAt", "updatedAt"):
        date.fromisoformat(story[key])
    sources = story.get("sources")
    if not isinstance(sources, list) or len(sources) > 10:
        raise ValueError(f"Invalid sources for {slug}")
    for source in sources:
        if not isinstance(source, dict) or not isinstance(source.get("title"), str) or not source["title"].strip() or not isinstance(source.get("url"), str) or not source["url"].startswith("https://"):
            raise ValueError(f"Invalid source for {slug}")
    explore = story.get("explore", [])
    if not isinstance(explore, list) or len(explore) > 10:
        raise ValueError(f"Invalid exploration links for {slug}")
    for item in explore:
        if not isinstance(item, dict) or item.get("kind") not in {"document", "image", "audio", "video", "reading"} or not isinstance(item.get("url"), str) or not item["url"].startswith("https://"):
            raise ValueError(f"Invalid exploration link for {slug}")
        if not all(isinstance(item.get("labels", {}).get(lang), str) and item["labels"][lang].strip() for lang in ("pt", "en", "es")):
            raise ValueError(f"Missing exploration label for {slug}")
    if story["status"] == "published":
        for lang in ("pt", "en", "es"):
            copy = story.get("translations", {}).get(lang, {})
            if not all(isinstance(copy.get(key), str) and copy[key].strip() for key in ("title", "summary", "body")):
                raise ValueError(f"Published story {slug} lacks {lang} translation")
        if story["classification"] == "documented" and not story.get("sources"):
            raise ValueError(f"Documented story {slug} needs a source")


ROUTES = {"pt": ("historias", "locais"), "en": ("stories", "places"), "es": ("historias", "lugares")}


def place_key(story):
    place = story["place"]
    return tuple(place[field].strip().casefold() for field in ("city", "region", "country"))


def place_slug(key):
    words = "-".join(key)
    ascii_text = unicodedata.normalize("NFKD", words).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-")
    if not slug:
        raise ValueError("Published place has no usable URL slug")
    return slug


def language_links(kind, slug, current):
    labels = {"pt": "PT", "en": "EN", "es": "ES"}
    return '<nav class="article-languages" aria-label="Languages">' + "".join(
        f'<a href="/{lang}/{ROUTES[lang][kind]}/{slug}/"' + (' aria-current="page"' if lang == current else '') + f'>{label}</a>'
        for lang, label in labels.items()
    ) + '</nav>'


def reading_footer(lang):
    labels = {
        "pt": ("Sem cadastro. Localização opcional.", "Privacidade"),
        "en": ("No account. Location is optional.", "Privacy"),
        "es": ("Sin cuenta. Ubicación opcional.", "Privacidad"),
    }
    privacy_note, privacy = labels[lang]
    brand = f'<a class="footer-brand brand" href="/{lang}/" aria-label="Nocturna"><span class="brand-mark" aria-hidden="true">✦</span><span>NOCTURNA</span></a>'
    return f'<footer>{brand}<span>{privacy_note} <a href="/{lang}/privacidade.html">{privacy}</a></span></footer>'


def render_story(story, lang, locality_slug):
    copy = story["translations"][lang]
    slugs = {"pt": "historias", "en": "stories", "es": "historias"}
    labels = {
        "pt": ("Voltar ao atlas", "Fontes", "Classificação", "Documentado", "Relato não verificado", "Ficção"),
        "en": ("Back to the atlas", "Sources", "Classification", "Documented", "Unverified account", "Fiction"),
        "es": ("Volver al atlas", "Fuentes", "Clasificación", "Documentado", "Relato no verificado", "Ficción"),
    }
    back, sources_label, class_label, *types = labels[lang]
    classification = types[{"documented": 0, "unverified": 1, "fiction": 2}[story["classification"]]]
    source_items = "".join(f'<li><a href="{escape(item["url"], quote=True)}" rel="noopener noreferrer">{escape(item["title"])}</a></li>' for item in story["sources"])
    source_section = f"<h2>{sources_label}</h2><ul>{source_items}</ul>" if source_items else ""
    explore_labels = {
        "pt": ("Explore mais", "Estes links externos ajudam a investigar o contexto; eles não confirmam, por si só, as alegações da história.", {"document": "Documento", "image": "Imagem", "audio": "Áudio", "video": "Vídeo", "reading": "Leitura"}),
        "en": ("Explore further", "These external links help investigate the context; they do not, by themselves, confirm the story's claims.", {"document": "Document", "image": "Image", "audio": "Audio", "video": "Video", "reading": "Reading"}),
        "es": ("Explora más", "Estos enlaces externos ayudan a investigar el contexto; por sí solos no confirman las afirmaciones de la historia.", {"document": "Documento", "image": "Imagen", "audio": "Audio", "video": "Vídeo", "reading": "Lectura"}),
    }
    explore_heading, explore_note, explore_types = explore_labels[lang]
    explore_items = "".join(f'<li><span class="resource-kind">{escape(explore_types[item["kind"]])}</span><a href="{escape(item["url"], quote=True)}" target="_blank" rel="noopener noreferrer">{escape(item["labels"][lang])}</a></li>' for item in story.get("explore", []))
    explore_section = f'<section class="story-explore"><h2>{explore_heading}</h2><p>{explore_note}</p><ul>{explore_items}</ul></section>' if explore_items else ""
    body = "".join(f"<p>{escape(paragraph)}</p>" for paragraph in copy["body"].split("\n\n") if paragraph.strip())
    locale = {"pt": "pt-BR", "en": "en", "es": "es"}[lang]
    locality_label = {"pt": "Ver histórias deste lugar", "en": "See stories from this place", "es": "Ver historias de este lugar"}[lang]
    locality_href = f"/{lang}/{ROUTES[lang][1]}/{locality_slug}/"
    footer = reading_footer(lang)
    html = f'''<!doctype html><html lang="{locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,follow"><title>{escape(copy['title'])} — Nocturna</title><meta name="description" content="{escape(copy['summary'], quote=True)}"><link rel="stylesheet" href="../../../styles.css"><script type="module" src="../../../comments.js"></script></head><body><div class="shell"><header class="masthead"><a class="brand" href="/{lang}/"><span class="brand-mark" aria-hidden="true">✦</span><span>NOCTURNA</span></a>{language_links(0, story['slug'], lang)}</header><main class="legal"><a class="back" href="/{lang}/">← {back}</a><p class="eyebrow">{class_label}: {classification}</p><h1>{escape(copy['title'])}</h1><p>{escape(copy['summary'])}</p><p><a href="{locality_href}">{escape(story['place']['city'])}, {escape(story['place']['region'])}, {escape(story['place']['country'])} — {locality_label}</a></p>{body}{source_section}{explore_section}<section id="comments" class="comments" data-story="{escape(story['slug'])}" data-lang="{lang}"></section></main>{footer}</div></body></html>'''
    folder = ROOT / lang / slugs[lang] / story["slug"]
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "index.html").write_text(html, encoding="utf-8")


def render_locality(group, slug, lang):
    place = group[0]["place"]
    city = place["city"].strip()
    region = place["region"].strip()
    country = place["country"].strip()
    location = ", ".join((city, region, country))
    labels = {
        "pt": ("Histórias de", "Histórias publicadas", "Voltar ao atlas", "Documentado", "Relato não verificado", "Ficção"),
        "en": ("Stories from", "Published stories", "Back to the atlas", "Documented", "Unverified account", "Fiction"),
        "es": ("Historias de", "Historias publicadas", "Volver al atlas", "Documentado", "Relato no verificado", "Ficción"),
    }
    title_prefix, heading, back, *classifications = labels[lang]
    articles = []
    for story in sorted(group, key=lambda item: (item["publishedAt"], item["slug"]), reverse=True):
        copy = story["translations"][lang]
        category = classifications[{"documented": 0, "unverified": 1, "fiction": 2}[story["classification"]]]
        href = f"/{lang}/{ROUTES[lang][0]}/{story['slug']}/"
        articles.append(f'<article class="place-story"><p class="eyebrow">{category}</p><h2><a href="{href}">{escape(copy["title"])}</a></h2><p>{escape(copy["summary"])}</p></article>')
    locale = {"pt": "pt-BR", "en": "en", "es": "es"}[lang]
    title = f"{title_prefix} {location}"
    footer = reading_footer(lang)
    html = f'''<!doctype html><html lang="{locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,follow"><title>{escape(title)} — Nocturna</title><meta name="description" content="{escape(title + ' · ' + heading, quote=True)}"><link rel="stylesheet" href="../../../styles.css"></head><body><div class="shell"><header class="masthead"><a class="brand" href="/{lang}/"><span class="brand-mark" aria-hidden="true">✦</span><span>NOCTURNA</span></a>{language_links(1, slug, lang)}</header><main class="legal place-page"><a class="back" href="/{lang}/">← {back}</a><p class="eyebrow">{heading}</p><h1>{escape(title)}</h1><p>{len(group)} {heading.lower()}</p>{''.join(articles)}</main>{footer}</div></body></html>'''
    folder = ROOT / lang / ROUTES[lang][1] / slug
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "index.html").write_text(html, encoding="utf-8")


def add_locality_directory(groups, slugs, lang):
    if not groups:
        return
    heading = {"pt": "Explorar por local", "en": "Explore by place", "es": "Explorar por lugar"}[lang]
    page = ROOT / lang / "index.html"
    html = page.read_text(encoding="utf-8")
    cards = []
    for key, group in sorted(groups.items(), key=lambda entry: entry[0]):
        city, region, country = (group[0]["place"][field].strip() for field in ("city", "region", "country"))
        href = f"/{lang}/{ROUTES[lang][1]}/{slugs[key]}/"
        cards.append(f'<a href="{href}">{escape(city)}, {escape(region)}, {escape(country)} <span>({len(group)})</span></a>')
    section = f'<section class="locality-directory" aria-labelledby="locality-heading"><h2 id="locality-heading">{heading}</h2><div class="locality-list">{"".join(cards)}</div></section>'
    assert "</main>" in html
    page.write_text(html.replace("</main>", section + "</main>", 1), encoding="utf-8")


content_file = Path(__file__).parent / "content" / "stories.json"
# The remote deployment reads published stories from Postgres.  Keep the local
# catalog available for the offline Node server and editorial workflow.
static_catalog = os.environ.get("NOCTURNA_STATIC_CATALOG", "1") != "0"
stories = json.loads(content_file.read_text(encoding="utf-8")) if static_catalog and content_file.exists() else []
if not isinstance(stories, list):
    raise ValueError("stories.json must be an array")
seen = set()
for story in stories:
    validate_story(story)
    if story["slug"] in seen:
        raise ValueError(f"Duplicate story slug: {story['slug']}")
    seen.add(story["slug"])
groups = {}
for story in stories:
    if story["status"] == "published":
        groups.setdefault(place_key(story), []).append(story)
slugs = {}
used_slugs = set()
for key in sorted(groups):
    base = place_slug(key)
    slug = base
    index = 2
    while slug in used_slugs:
        slug = f"{base}-{index}"
        index += 1
    slugs[key] = slug
    used_slugs.add(slug)
for lang in ROUTES:
    for route in ROUTES[lang]:
        generated = ROOT / lang / route
        if generated.exists():
            shutil.rmtree(generated)
    for key, group in groups.items():
        render_locality(group, slugs[key], lang)
        for story in group:
            render_story(story, lang, slugs[key])
    add_locality_directory(groups, slugs, lang)

print(f"Generated pt, en, es pages, {sum(len(group) for group in groups.values())} stories and {len(groups)} places")
