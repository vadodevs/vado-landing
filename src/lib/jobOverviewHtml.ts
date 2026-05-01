import DOMPurify from 'dompurify';

/** Detecta si el guardado es HTML (Tiptap) o el formato antiguo (marcadores de texto). */
export function isProbablyHtml(overview: string): boolean {
  const t = overview.trim();
  if (!t.startsWith('<')) return false;
  if (/^<\s*[!?]/.test(t)) return false;
  // Cualquier etiqueta (p, a, h1, ul, div de ProseMirror, etc.); evitamos tratar **texto** plano como HTML
  return /<\/?[a-zA-Z][\w-]*\b/.test(t);
}

function escapeText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function boldAndUnderline(escaped: string): string {
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<u>$1</u>');
}

function formatInlineUnescaped(s: string): string {
  const re = /\[lg\]([\s\S]*?)\[\/lg\]/g;
  const parts: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) {
      parts.push(`<span>${boldAndUnderline(escapeText(s.slice(last, m.index)))}</span>`);
    }
    const inner = m[1] ?? '';
    parts.push(
      `<span data-job-lg="1" class="text-lg sm:text-xl font-medium leading-relaxed text-zinc-900">${boldAndUnderline(escapeText(inner))}</span>`,
    );
    last = m.index + m[0].length;
  }
  if (last < s.length) {
    parts.push(`<span>${boldAndUnderline(escapeText(s.slice(last)))}</span>`);
  }
  if (parts.length === 0) {
    return boldAndUnderline(escapeText(s));
  }
  return parts.join('');
}

/** Convierte el formato de texto con ** / __ / [lg] / - viñetas a HTML para Tiptap. */
export function legacyPlainToHtml(overview: string): string {
  if (!overview.trim()) return '<p></p>';
  if (isProbablyHtml(overview)) return overview;

  const lines = overview.split('\n');
  const blocks: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) {
      i += 1;
      continue;
    }
    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length) {
        const L = lines[i].trim();
        if (!L) {
          i += 1;
          break;
        }
        if (L.startsWith('- ')) {
          items.push(`<li><p>${formatInlineUnescaped(L.slice(2))}</p></li>`);
          i += 1;
        } else {
          break;
        }
      }
      blocks.push(`<ul>${items.join('')}</ul>`);
      continue;
    }
    blocks.push(`<p>${formatInlineUnescaped(line)}</p>`);
    i += 1;
  }
  return blocks.join('') || '<p></p>';
}

export function ensureEditorHtml(overview: string): string {
  if (!overview.trim()) return '<p></p>';
  if (isProbablyHtml(overview)) return overview;
  return legacyPlainToHtml(overview);
}

export function sanitizeOverviewHtmlForDisplay(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'div',
      'blockquote',
      'a',
      'code',
      'pre',
      'strong',
      'b',
      'em',
      'i',
      'u',
      'span',
    ],
    ALLOWED_ATTR: ['class', 'data-job-lg', 'data-placeholder', 'href', 'title', 'target', 'rel', 'id'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|sms):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
  }) as string;
}

export function htmlToSearchPlain(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function htmlToPreviewPlain(html: string, max = 220): string {
  const t = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function isOverviewHtmlEmpty(html: string): boolean {
  const t = htmlToSearchPlain(html);
  return t.length === 0;
}
