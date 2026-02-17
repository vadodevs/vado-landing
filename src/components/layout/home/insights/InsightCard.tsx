import { Link } from 'wouter';
import { cn } from '@/lib/utils';

export type InsightCardProps = {
  imageSrc: string;
  imageAlt: string;
  date: string;
  category: string;
  title: string;
  author: string;
  href?: string;
  className?: string;
};

export function InsightCard({
  imageSrc,
  imageAlt,
  date,
  category,
  title,
  author,
  href,
  className,
}: InsightCardProps) {
  const content = (
    <>
      <div className="aspect-video w-full shrink-0 overflow-hidden rounded-t-xl p-4">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="block h-full w-full rounded-lg object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col py-5">
        <p className="text-muted-foreground mb-2 px-6 text-sm">{date}</p>
        <p className="text-primary mb-3 px-6 text-xs font-semibold tracking-wider uppercase">
          {category}
        </p>
        <div className="flex min-h-0 w-full flex-1 gap-4 pr-6">
          <span className="bg-primary mr-1 w-1 shrink-0 self-stretch rounded-full" aria-hidden />
          <h3 className="min-w-0 text-sm leading-snug font-bold text-[#19314c] uppercase md:text-base">
            {title}
          </h3>
        </div>
        <p className="text-muted-foreground mt-4 px-6 text-sm">{author}</p>
      </div>
    </>
  );

  const cardClasses = cn(
    'flex h-full flex-col overflow-hidden rounded-xl bg-white p-0 shadow-lg transition-shadow hover:shadow-xl',
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
