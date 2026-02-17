export const ZENQR_ACCENT = '#10b981';

export function Accent({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-semibold" style={{ color: ZENQR_ACCENT }}>
      {children}
    </span>
  );
}

export function ZenqrCaseSection({
  label,
  title,
  children,
  reverse,
  variant = 'default',
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  reverse?: boolean;
  variant?: 'default' | 'minimal';
}) {
  const titleClass = 'text-xl font-bold tracking-tight text-slate-700 md:text-2xl lg:text-2xl';
  return (
    <section className="w-full py-12 md:py-16 lg:py-20">
      <div className="w-full min-w-0">
        <div
          className={`flex w-full flex-col gap-10 lg:items-center lg:gap-16 ${
            reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
          }`}
        >
          <div className="min-w-0 flex-1 space-y-4">
            {variant === 'default' ? (
              <>
                <span
                  className="text-sm font-semibold tracking-wider uppercase"
                  style={{ color: ZENQR_ACCENT }}
                >
                  {label}
                </span>
                <h2 className={titleClass}>{title}</h2>
              </>
            ) : (
              <h2 className={`border-l-4 pl-4 ${titleClass}`} style={{ borderColor: ZENQR_ACCENT }}>
                {title}
              </h2>
            )}
            <div className="text-muted-foreground min-w-0 space-y-4 text-base leading-relaxed md:text-lg">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
