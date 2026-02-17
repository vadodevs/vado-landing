import { CenterContainer } from '@/components/layout/CenterContainer';

const STACK_BASE = '/stack';

export type ProjectStackItem = {
  /** Nombre para mostrar (ej: "Vue", "Node.js") */
  name: string;
  /** Nombre del archivo en public/stack sin extensión (ej: "vue", "node-js") */
  icon: string;
};

export type ProjectStackVariant = 'inline' | 'logos-row' | 'logos-grid' | 'pills';

export type ProjectStackProps = {
  /** Items del stack: name + icon (archivo en public/stack) */
  items: ProjectStackItem[];
  /** Estilo de visualización */
  variant?: ProjectStackVariant;
  /** Color de acento para label "Stack" (opcional) */
  accentColor?: string;
  /** Label de la sección */
  label?: string;
};

function StackIcon({ icon, name: _name, size = 'default' }: { icon: string; name: string; size?: 'sm' | 'default' | 'lg' | 'xl' }) {
  const sizeClasses =
    size === 'sm'
      ? 'h-6 w-6'
      : size === 'default'
        ? 'h-8 w-8'
        : size === 'lg'
          ? 'h-12 w-12'
          : 'h-14 w-14'; /* xl */
  return (
    <img
      src={`${STACK_BASE}/${icon}.svg`}
      alt=""
      aria-hidden
      className={`${sizeClasses} shrink-0 object-contain`}
    />
  );
}

export function ProjectStack({
  items,
  variant = 'logos-row',
  accentColor,
  label = 'Stack',
}: ProjectStackProps) {
  if (items.length === 0) return null;

  return (
    <section className="border-border bg-muted/10 border-b py-10 md:py-12">
      <CenterContainer>
        <p className="text-muted-foreground mb-8 text-center text-lg font-semibold md:mb-10 md:text-xl">
          <span style={accentColor ? { color: accentColor } : undefined}>
            {label}
          </span>
        </p>

        {variant === 'inline' && (
          <p className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-sm">
            {items.map((item, i) => (
              <span key={item.icon} className="inline-flex items-center gap-1.5">
                <StackIcon icon={item.icon} name={item.name} size="sm" />
                <span>{item.name}</span>
                {i < items.length - 1 && <span className="text-muted-foreground/60">·</span>}
              </span>
            ))}
          </p>
        )}

        {variant === 'logos-row' && (
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-10 lg:gap-12">
            {items.map((item) => (
              <div
                key={item.icon}
                className="flex flex-col items-center gap-3 transition-opacity hover:opacity-90"
                title={item.name}
              >
                <div className="bg-background ring-border/50 flex h-20 w-20 items-center justify-center rounded-2xl p-3 ring-1 shadow-sm md:h-24 md:w-24 lg:h-28 lg:w-28">
                  <StackIcon icon={item.icon} name={item.name} size="xl" />
                </div>
                <span className="text-muted-foreground text-sm font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        )}

        {variant === 'logos-grid' && (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {items.map((item) => (
              <div
                key={item.icon}
                className="bg-background ring-border/50 flex flex-col items-center gap-3 rounded-2xl p-5 ring-1 shadow-sm transition-shadow hover:shadow-md md:p-6"
                title={item.name}
              >
                <StackIcon icon={item.icon} name={item.name} size="xl" />
                <span className="text-muted-foreground text-center text-sm font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        )}

        {variant === 'pills' && (
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {items.map((item) => (
              <span
                key={item.icon}
                className="bg-muted/80 text-foreground inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-medium ring-1 ring-border/50"
                title={item.name}
              >
                <StackIcon icon={item.icon} name={item.name} size="default" />
                {item.name}
              </span>
            ))}
          </div>
        )}
      </CenterContainer>
    </section>
  );
}
