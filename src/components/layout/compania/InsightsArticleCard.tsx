import { Link } from 'wouter';
import { cn } from '@/lib/utils';

export type InsightsArticleCardProps = {
  imageSrc: string;
  imageAlt: string;
  date: string;
  tag: string;
  title: string;
  description: string;
  href?: string;
  className?: string;
};

export function InsightsArticleCard({
  imageSrc,
  imageAlt,
  date,
  tag,
  title,
  description,
  href,
  className,
}: InsightsArticleCardProps) {
  const content = (
    <>
      <div className="aspect-video w-full shrink-0 overflow-hidden rounded-t-xl bg-muted">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="block h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3 py-3 sm:px-4 sm:py-3">
        <p className="text-muted-foreground text-xs">{date}</p>
        <p className="text-primary text-[10px] font-semibold tracking-wider uppercase sm:text-xs">
          {tag}
        </p>
        <div className="flex min-h-0 w-full gap-2">
          <span
            className="bg-primary w-1.5 shrink-0 self-stretch rounded-sm"
            aria-hidden
          />
          <h3 className="text-foreground line-clamp-2 min-w-0 text-sm font-bold leading-snug sm:text-base">
            {title}
          </h3>
        </div>
        <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
          {description}
        </p>
      </div>
    </>
  );

  const cardClasses = cn(
    'flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cardClasses}>
        {content}
      </Link>
    );
  }

  return <article className={cardClasses}>{content}</article>;
}
