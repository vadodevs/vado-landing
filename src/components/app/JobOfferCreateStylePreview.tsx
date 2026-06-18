import { type ReactNode } from 'react';
import { isProbablyHtml, sanitizeOverviewHtmlForDisplay } from '@/lib/jobOverviewHtml';
import { cn } from '@/lib/utils';

function renderInlineFormatting(text: string): ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).filter(Boolean);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return <strong key={`${idx}-${token}`}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('__') && token.endsWith('__') && token.length > 4) {
      return <u key={`${idx}-${token}`}>{token.slice(2, -2)}</u>;
    }
    return <span key={`${idx}-${token}`}>{token}</span>;
  });
}

function renderParagraphWithLg(text: string): ReactNode {
  const re = /\[lg\]([\s\S]*?)\[\/lg\]/g;
  const parts: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(
        <span key={`lg-o-${k++}`}>{renderInlineFormatting(text.slice(last, m.index))}</span>,
      );
    }
    const inner = m[1] ?? '';
    parts.push(
      <span
        key={`lg-i-${k++}`}
        className="text-lg font-medium leading-relaxed text-zinc-900 sm:text-xl"
      >
        {renderInlineFormatting(inner)}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    parts.push(<span key={`lg-t-${k++}`}>{renderInlineFormatting(text.slice(last))}</span>);
  }
  if (parts.length === 0) {
    return <>{renderInlineFormatting(text)}</>;
  }
  return <>{parts}</>;
}

function renderRichText(text: string, emptyMessage: string) {
  const rows = text
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
  if (rows.length === 0) return <p className="text-sm text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>;

  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200">
      {rows.map((row, idx) => {
        if (row.startsWith('- ')) {
          return (
            <div key={`${idx}-${row}`} className="flex items-start gap-2">
              <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-zinc-700 dark:bg-zinc-300" />
              <p className="min-w-0 flex-1">{renderParagraphWithLg(row.slice(2))}</p>
            </div>
          );
        }
        return (
          <p key={`${idx}-${row}`} className="max-w-3xl">
            {renderParagraphWithLg(row)}
          </p>
        );
      })}
    </div>
  );
}


export function JobOverviewBody({
  overview,
  emptyMessage,
}: {
  overview: string;
  emptyMessage: string;
}) {
  if (!overview.trim()) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>;
  }
  if (isProbablyHtml(overview)) {
    return (
      <div
        className="job-overview-display space-y-3 text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200 [&_a]:text-sky-800 dark:[&_a]:text-sky-300 [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-4 [&_blockquote]:border-zinc-200 dark:[&_blockquote]:border-zinc-700 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-zinc-100 dark:[&_code]:bg-zinc-800 [&_code]:px-1 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:my-0.5 [&_p]:my-1 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-zinc-100 dark:[&_pre]:bg-zinc-800 [&_pre]:p-3 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_span[data-job-lg]]:text-lg [&_span[data-job-lg]]:font-medium sm:[&_span[data-job-lg]]:text-xl"
        
        dangerouslySetInnerHTML={{ __html: sanitizeOverviewHtmlForDisplay(overview) }}
      />
    );
  }
  return renderRichText(overview, emptyMessage);
}

export type JobOfferCreateStylePreviewProps = {
  title: string;
  location: string;
  industry: string;
  
  overview: string;
  
  previewLabel?: string | null;
  
  roundedClass?: 'rounded-xl' | 'rounded-2xl';
  className?: string;
  showPreviewLabel?: boolean;
  titleFallback?: string;
  titleSupplement?: ReactNode;
  locationLabel: string;
  industryLabel: string;
  overviewLabel: string;
  emptyOverviewMessage: string;
  companyName?: string | null;
  companyLabel?: string;
  
  locationFallback?: string;
  industryFallback?: string;
};


export function JobOfferCreateStylePreview({
  title,
  location,
  industry,
  overview,
  previewLabel = 'Vista previa',
  roundedClass = 'rounded-xl',
  className,
  showPreviewLabel = true,
  titleFallback = 'LLM Engineer (AI Engineer)',
  titleSupplement,
  locationLabel,
  industryLabel,
  overviewLabel,
  emptyOverviewMessage,
  companyName,
  companyLabel = 'Company',
  locationFallback = 'Mexico / Remote',
  industryFallback = 'Data and Analytics',
}: JobOfferCreateStylePreviewProps) {
  const displayTitle = title.trim() || titleFallback;
  const displayLocation = location.trim() || locationFallback;
  const displayIndustry = industry.trim() || industryFallback;
  const company = companyName?.trim();

  return (
    <div
      className={cn(
        'border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40',
        roundedClass,
        className,
      )}
    >
      {showPreviewLabel && previewLabel ? (
        <h4 className="mb-3 text-sm font-semibold uppercase text-zinc-700 dark:text-zinc-300">
          {previewLabel}
        </h4>
      ) : null}
      <h1 className="text-3xl font-black tracking-tight text-[#0f172a] dark:text-zinc-100">{displayTitle}</h1>
      {titleSupplement ? <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{titleSupplement}</div> : null}
      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <aside className="w-full lg:w-[220px]">
          {company ? (
            <>
              <div>
                <h5 className="text-[18px] font-bold text-[#262835] dark:text-zinc-200">{companyLabel}</h5>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{company}</p>
              </div>
              <div className="my-5 h-px bg-zinc-200 dark:bg-zinc-800" />
            </>
          ) : null}
          <div>
            <h5 className="text-[18px] font-bold text-[#262835] dark:text-zinc-200">{locationLabel}</h5>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{displayLocation}</p>
          </div>
          <div className="my-5 h-px bg-zinc-200 dark:bg-zinc-800" />
          <div>
            <h5 className="text-[18px] font-bold text-[#262835] dark:text-zinc-200">{industryLabel}</h5>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{displayIndustry}</p>
          </div>
        </aside>
        <section className="min-w-0 flex-1">
          <div className="border-b border-zinc-200 pb-3 text-[18px] font-bold text-[#262835] dark:border-zinc-800 dark:text-zinc-200">
            {overviewLabel}
          </div>
          <div className="pt-5">
            <JobOverviewBody overview={overview} emptyMessage={emptyOverviewMessage} />
          </div>
        </section>
      </div>
    </div>
  );
}
