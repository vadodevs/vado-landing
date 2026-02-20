type Block =
  | { type: 'h2'; content: string }
  | { type: 'signature'; content: string }
  | { type: 'ul'; items: string[] }
  | { type: 'p'; content: string; isLead: boolean };

/**
 * Renders article body with optional structure:
 * - Lines starting with "## " are rendered as h2
 * - Lines starting with "~ " are rendered as signature
 * - Blocks starting with "- " are rendered as bullet list items (consecutive ones in one <ul>)
 * - Other blocks are paragraphs
 */
export function InsightsArticleBody({ body }: { body: string }) {
  const blocks = body
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  const elements: Block[] = [];
  let firstParagraphSeen = false;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
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
    elements.push({ type: 'p', content: block, isLead: !firstParagraphSeen });
    firstParagraphSeen = true;
  }

  return (
    <article className="mx-auto">
      <div className="space-y-6 md:space-y-8">
        {elements.map((el, i) => {
          if (el.type === 'h2') {
            return (
              <h2
                key={i}
                className="text-foreground border-primary/20 mt-12 border-l-4 pl-4 font-semibold first:mt-0 md:mt-14 md:pl-5 md:text-xl"
              >
                {el.content}
              </h2>
            );
          }
          if (el.type === 'signature') {
            return (
              <p
                key={i}
                className="text-muted-foreground pt-4 text-right text-sm italic md:text-base"
              >
                {el.content}
              </p>
            );
          }
          if (el.type === 'ul') {
            return (
              <ul
                key={i}
                className="text-foreground/90 list-disc space-y-2 pl-6 leading-relaxed md:text-[1.0625rem] md:leading-8"
              >
                {el.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          }
          return (
            <p
              key={i}
              className={
                el.isLead
                  ? 'text-foreground text-lg leading-relaxed text-balance md:text-xl md:leading-8'
                  : 'text-foreground/90 leading-relaxed md:text-[1.0625rem] md:leading-8'
              }
            >
              {el.content}
            </p>
          );
        })}
      </div>
    </article>
  );
}
