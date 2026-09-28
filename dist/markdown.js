// Formatação dos textos das histórias: um subconjunto seguro de Markdown.
// Blocos separados por linha em branco; "## " e "### " viram subtítulos; linhas iniciadas por "- " ou "1. "
// viram listas; no texto, **negrito**, *itálico* e [link](https://...). O HTML digitado é sempre escapado.
// Usado pelas páginas geradas na Vercel (api/_lib/seo.mjs) e por story.html; build_pages.py tem a versão em Python.

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function renderInline(text) {
  let html = escapeHtml(text);
  html = html.replace(/\[([^\]\n]+)\]\((https:\/\/[^\s()<>"]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  html = html.replace(/\*\*(?=\S)([^*\n]*?\S)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^*\w])\*(?=\S)([^*\n]*?\S)\*(?![*\w])/g, '$1<em>$2</em>');
  html = html.replace(/(^|[^\w])_(?=\S)([^_\n]*?\S)_(?!\w)/g, '$1<em>$2</em>');
  // Marcas que sobraram sem par não devem aparecer para o leitor.
  return html.replace(/\*\*/g, '');
}

export function renderMarkdown(text) {
  const html = [];
  for (const block of String(text ?? '').replace(/\r\n?/g, '\n').split(/\n\s*\n/)) {
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
    let paragraph = [], list = null;
    const flushParagraph = () => { if (paragraph.length) html.push(`<p>${renderInline(paragraph.join(' '))}</p>`); paragraph = []; };
    const flushList = () => { if (list) html.push(`<${list.tag}>${list.items.map(item => `<li>${renderInline(item)}</li>`).join('')}</${list.tag}>`); list = null; };
    for (const line of lines) {
      const heading = /^(#{1,6})\s+(.+?)\s*#*$/.exec(line);
      const bullet = /^[-*•]\s+(.+)$/.exec(line);
      const numbered = /^\d+[.)]\s+(.+)$/.exec(line);
      if (heading) { flushParagraph(); flushList(); const level = Math.min(Math.max(heading[1].length, 2), 3); html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`); }
      else if (bullet || numbered) { flushParagraph(); const tag = bullet ? 'ul' : 'ol'; if (list?.tag !== tag) { flushList(); list = { tag, items: [] }; } list.items.push((bullet || numbered)[1]); }
      else { flushList(); paragraph.push(line); }
    }
    flushParagraph(); flushList();
  }
  return html.join('');
}

// Texto sem marcas, para títulos, resumos e metadados.
export function plainText(text) {
  return String(text ?? '')
    .replace(/\[([^\]\n]+)\]\((https:\/\/[^\s()]+)\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*|__/g, '')
    .replace(/(^|[^*\w])\*(?=\S)([^*\n]*?\S)\*(?![*\w])/g, '$1$2')
    .replace(/(^|[^\w])_(?=\S)([^_\n]*?\S)_(?!\w)/g, '$1$2');
}
