import { cn } from '@/lib/utils';

type PhoneMockupProps = {
  /** Ruta de la imagen a mostrar dentro de la pantalla (ej. /ruta/imagen.png) */
  src?: string;
  /** Alt para la imagen (si se usa src) */
  alt?: string;
  /** Contenido custom en lugar de imagen (ej. placeholder o otro componente) */
  children?: React.ReactNode;
  className?: string;
};

/**
 * Mockup de smartphone reutilizable. Estilo iPhone con notch y barra inferior.
 * Muestra una imagen o children dentro del área de pantalla.
 */
export function PhoneMockup({ src, alt = '', children, className }: PhoneMockupProps) {
  return (
    <div
      className={cn('relative mx-auto w-[min(260px,80vw)]', className)}
      aria-hidden
    >
      {/* Marco del teléfono: bisel negro con bordes redondeados, sin borde */}
      <div className="relative rounded-[2.75rem] bg-neutral-900 p-2 shadow-xl shadow-black/20">
        {/* Área de pantalla */}
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2rem] bg-white">
          {/* Contenido de la pantalla */}
          {src ? (
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            children ?? (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <svg
                  className="h-14 w-14 text-muted-foreground/35"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )
          )}

          {/* Notch (corte tipo iPhone) - encima del contenido */}
          <div
            className="absolute left-1/2 top-0 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-neutral-900"
            style={{ boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.1)' }}
          />

          {/* Barra inferior / home indicator (tipo iPhone) */}
          <div className="absolute bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-neutral-400/80" />
        </div>
      </div>
    </div>
  );
}
