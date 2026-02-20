type Block =
  | { type: 'h2'; content: string }
  | { type: 'h3'; content: string }
  | { type: 'signature'; content: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'p'; content: string };

const NUMBERED_LIST_REGEX = /^\d+\.\s+/;

/**
 * Renders article body with optional structure:
 * - Lines starting with "## " are rendered as h2 (section title)
 * - Lines starting with "### " are rendered as h3 (subtitle)
 * - Lines starting with "~ " are rendered as signature
 * - Blocks starting with "- " are rendered as bullet list items (consecutive ones in one <ul>)
 * - Blocks starting with "1. ", "2. ", etc. are rendered as ordered list items (consecutive ones in one <ol>)
 * - Other blocks are paragraphs
 */
export function InsightsArticleBody({ body }: { body: string }) {
  const blocks = body
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  const elements: Block[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.startsWith('### ')) {
      elements.push({ type: 'h3', content: block.slice(4).trim() });
      continue;
    }
    if (block.startsWith('## ')) {
      elements.push({ type: 'h2', content: block.slice(3).trim() });
      continue;
    }
    if (block.startsWith('~ ')) {
      elements.push({ type: 'signature', content: block.slice(2).trim() });
      continue;
    }
    if (block.startsWith('- ')) {
      const items: string[] = [block.slice(2).trim()];
      while (i + 1 < blocks.length && blocks[i + 1].trim().startsWith('- ')) {
        i++;
        items.push(blocks[i].trim().slice(2).trim());
      }
      elements.push({ type: 'ul', items });
      continue;
    }
    if (NUMBERED_LIST_REGEX.test(block)) {
      const items: string[] = [block.replace(NUMBERED_LIST_REGEX, '').trim()];
      while (
        i + 1 < blocks.length &&
        NUMBERED_LIST_REGEX.test(blocks[i + 1].trim())
      ) {
        i++;
        items.push(
          blocks[i].trim().replace(NUMBERED_LIST_REGEX, '').trim(),
        );
      }
      elements.push({ type: 'ol', items });
      continue;
    }
    elements.push({ type: 'p', content: block });
  }

  const bodyTextClass =
    'text-foreground text-base leading-relaxed md:text-[1.0625rem] md:leading-8';

  return (
    <article className="w-full">
      <div className="space-y-5 md:space-y-6">
        {elements.map((el, i) => {
          if (el.type === 'h2') {
            return (
              <h2
                key={i}
                className="text-foreground mt-8 border-l-4 border-l-[#3390ff] pl-4 font-semibold first:mt-0 md:mt-10 md:pl-5 text-base md:text-lg"
              >
                {el.content}
              </h2>
            );
          }
          if (el.type === 'h3') {
            return (
              <h3
                key={i}
                className="text-foreground mt-6 text-base font-semibold first:mt-4"
              >
                {el.content}
              </h3>
            );
          }
          if (el.type === 'signature') {
            return (
              <p
                key={i}
                className="text-muted-foreground pt-6 text-right text-base italic"
              >
                {el.content}
              </p>
            );
          }
          if (el.type === 'ul') {
            return (
              <ul
                key={i}
                className={`${bodyTextClass} list-disc space-y-2 pl-6 md:pl-8`}
              >
                {el.items.map((item, j) => (
                  <li key={j} className="pl-1">
                    {item}
                  </li>
                ))}
              </ul>
            );
          }
          if (el.type === 'ol') {
            return (
              <ol
                key={i}
                className={`${bodyTextClass} list-decimal space-y-3 pl-6 md:pl-8 marker:font-semibold marker:text-primary`}
              >
                {el.items.map((item, j) => (
                  <li key={j} className="pl-2">
                    {item}
                  </li>
                ))}
              </ol>
            );
          }
          return (
            <p key={i} className={bodyTextClass}>
              {el.content}
            </p>
          );
        })}
      </div>
    </article>
  );
}
