"use client";

import { useMemo, useRef } from "react";
import { motion, useInView } from "motion/react";
import DottedMap from "dotted-map";

import { cn } from "@/lib/utils";

export type MapLabelAlign = "left" | "right";

export interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string; labelAlign?: MapLabelAlign };
    end: { lat: number; lng: number; label?: string; labelAlign?: MapLabelAlign };
  }>;
  /** Color de las rutas (gradiente / trazo). */
  lineColor?: string;
  /** Color de los puntos (ciudad); por defecto azul claro. */
  pointColor?: string;
  /** `card`: ratio 2:1 con bordes redondeados. `fill`: ocupa todo el contenedor (p. ej. hero). */
  variant?: "card" | "fill";
  className?: string;
}

const DEFAULT_POINT_COLOR = "#93c5fd";

type LabelPlacement = {
  textAnchor: "start" | "end" | "middle";
  dx: number;
  dy: number;
};

/** Formato `"Ciudad, País"` desde i18n: país en negrita en el `<text>`. */
function splitCityCountryLabel(label: string): { city: string; country: string | null } {
  const idx = label.lastIndexOf(", ");
  if (idx <= 0) {
    return { city: label, country: null };
  }
  const country = label.slice(idx + 2).trim();
  return {
    city: label.slice(0, idx),
    country: country.length > 0 ? country : null,
  };
}

function placementFromAlign(align: MapLabelAlign): LabelPlacement {
  if (align === "left") {
    return { textAnchor: "end", dx: -10, dy: 4 };
  }
  return { textAnchor: "start", dx: 10, dy: 4 };
}

/** Evita que el texto tape el punto y se adapte a la posición en el mapa. */
function getLabelPlacement(lat: number, lng: number): LabelPlacement {
  if (lat < -22) {
    return { textAnchor: "middle", dx: 0, dy: -14 };
  }
  if (lng > -92) {
    return { textAnchor: "end", dx: -10, dy: 4 };
  }
  return { textAnchor: "start", dx: 10, dy: 4 };
}

export default function WorldMap({
  dots = [],
  lineColor = "#0ea5e9",
  pointColor = DEFAULT_POINT_COLOR,
  variant = "card",
  className,
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const isInView = useInView(svgRef, { once: true, amount: 0.35 });
  const map = new DottedMap({ height: 100, grid: "diagonal" });

  const svgMap = map.getSVG({
    radius: 0.22,
    color: "#9ca3af66",
    shape: "circle",
    backgroundColor: "transparent",
  });

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  const labeledPins = useMemo(() => {
    const byKey = new Map<
      string,
      { lat: number; lng: number; label: string } & LabelPlacement
    >();
    for (const dot of dots) {
      for (const p of [dot.start, dot.end]) {
        if (!p.label) continue;
        const key = `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;
        const placement = p.labelAlign
          ? placementFromAlign(p.labelAlign)
          : getLabelPlacement(p.lat, p.lng);
        if (!byKey.has(key)) {
          byKey.set(key, {
            lat: p.lat,
            lng: p.lng,
            label: p.label,
            ...placement,
          });
        }
      }
    }
    return [...byKey.values()];
  }, [dots]);

  return (
    <div
      className={cn(
        "relative bg-black font-sans",
        variant === "card" && "aspect-[2/1] w-full rounded-lg",
        variant === "fill" && "size-full min-h-0 min-w-0 rounded-none",
        className,
      )}
    >
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className={cn(
          'pointer-events-none h-full w-full select-none',
          '[mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent),linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] [mask-composite:intersect] [-webkit-mask-composite:source-in]',
        )}
        alt="world map"
        height="495"
        width="1056"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none select-none"
      >
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1"
                initial={{
                  pathLength: 0,
                }}
                animate={{
                  pathLength: isInView ? 1 : 0,
                }}
                transition={{
                  duration: 1,
                  delay: 0.5 * i,
                  ease: "easeOut",
                }}
                key={`start-upper-${i}`}
              ></motion.path>
            </g>
          );
        })}

        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {dots.map((dot, i) => (
          <g key={`points-group-${i}`}>
            <g key={`start-${i}`}>
              <circle
                cx={projectPoint(dot.start.lat, dot.start.lng).x}
                cy={projectPoint(dot.start.lat, dot.start.lng).y}
                r="2.5"
                fill={pointColor}
              />
              {isInView && (
                <circle
                  cx={projectPoint(dot.start.lat, dot.start.lng).x}
                  cy={projectPoint(dot.start.lat, dot.start.lng).y}
                  r="2.5"
                  fill={pointColor}
                  opacity="0.45"
                >
                  <animate
                    attributeName="r"
                    from="2"
                    to="8"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.5"
                    to="0"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
            <g key={`end-${i}`}>
              <circle
                cx={projectPoint(dot.end.lat, dot.end.lng).x}
                cy={projectPoint(dot.end.lat, dot.end.lng).y}
                r="2.5"
                fill={pointColor}
              />
              {isInView && (
                <circle
                  cx={projectPoint(dot.end.lat, dot.end.lng).x}
                  cy={projectPoint(dot.end.lat, dot.end.lng).y}
                  r="2.5"
                  fill={pointColor}
                  opacity="0.45"
                >
                  <animate
                    attributeName="r"
                    from="2"
                    to="8"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.5"
                    to="0"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          </g>
        ))}

        <g className="pointer-events-none">
          {labeledPins.map((pin) => {
            const { x, y } = projectPoint(pin.lat, pin.lng);
            const { city, country } = splitCityCountryLabel(pin.label);
            return (
              <text
                key={`${pin.lat}-${pin.lng}-${pin.label}`}
                x={x}
                y={y}
                dx={pin.dx}
                dy={pin.dy}
                textAnchor={pin.textAnchor}
                dominantBaseline="middle"
                className="fill-white font-sans text-[7px] font-normal sm:text-[8px] md:text-[9px]"
                style={{
                  paintOrder: "stroke fill",
                  stroke: "rgba(0,0,0,0.95)",
                  strokeWidth: 3,
                  strokeLinejoin: "round",
                }}
              >
                <tspan>{city}</tspan>
                {country ? (
                  <>
                    <tspan>, </tspan>
                    <tspan fontWeight={700}>{country}</tspan>
                  </>
                ) : null}
              </text>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
