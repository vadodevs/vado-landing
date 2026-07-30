import { cn } from "@/lib/utils";

type LeadEngineFlagSvgProps = {
  iso: "MX" | "US";
  className?: string;
};

/**
 * Banderas 4:3 desde [lipis/flag-icons](https://github.com/lipis/flag-icons) (MIT), en `public/flags/`.
 * Se sirven como `<img>` para compatibilidad con Windows y buen render del escudo mexicano.
 */
export function LeadEngineFlagSvg({ iso, className }: LeadEngineFlagSvgProps) {
  const src = iso === "MX" ? "/flags/mx.svg" : "/flags/us.svg";

  return (
    <img
      src={src}
      alt=""
      width={40}
      height={30}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={cn(
        "h-7 w-auto max-h-7 object-contain object-center rounded-sm shadow-sm ring-1 ring-black/10",
        className
      )}
    />
  );
}
