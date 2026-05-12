"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Prerender en build (`scripts/generate-world-map-dots.mjs`); evita ~400 KiB de JS de `dotted-map` en runtime. */
const WORLD_MAP_DOTS_SRC = "/generated/world-map-dots.svg";

export type MapLabelAlign = "left" | "right";

export interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string; labelAlign?: MapLabelAlign };
    end: { lat: number; lng: number; label?: string; labelAlign?: MapLabelAlign };
  }>;
  lineColor?: string;
  pointColor?: string;
  variant?: "card" | "fill";
  className?: string;
}

const DEFAULT_POINT_COLOR = "#93c5fd";

type LabelPlacement = {
  textAnchor: "start" | "end" | "middle";
  dx: number;
  dy: number;
};

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
  const reactId = useId().replace(/:/g, "");
  const gradId = `wm-path-grad-${reactId}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [linesVisible, setLinesVisible] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (typeof IntersectionObserver === "undefined") {
      setLinesVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setLinesVisible(true);
            io.disconnect();
            return;
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number },
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
      ref={rootRef}
      className={cn(
        "relative bg-black font-sans",
        variant === "card" && "aspect-[2/1] w-full rounded-lg",
        variant === "fill" && "size-full min-h-0 min-w-0 rounded-none",
        className,
      )}
    >
      <img
        src={WORLD_MAP_DOTS_SRC}
        className={cn(
          "pointer-events-none h-full w-full select-none",
          "[mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent),linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] [mask-composite:intersect] [-webkit-mask-composite:source-in]",
        )}
        alt=""
        width={143}
        height={72}
        draggable={false}
        decoding="async"
        fetchPriority="high"
        aria-hidden
      />
      <svg
        viewBox="0 0 800 400"
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <g key={`path-group-${i}`}>
              <path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke={`url(#${gradId})`}
                strokeWidth="1"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={linesVisible ? 1 : 1}
              >
                {linesVisible ? (
                  <animate
                    attributeName="stroke-dashoffset"
                    from="1"
                    to="0"
                    dur="1s"
                    begin={`${0.5 * i}s`}
                    fill="freeze"
                    calcMode="spline"
                    keySplines="0.22 1 0.36 1"
                    keyTimes="0;1"
                  />
                ) : null}
              </path>
            </g>
          );
        })}

        {dots.map((dot, i) => (
          <g key={`points-group-${i}`}>
            <g key={`start-${i}`}>
              <circle
                cx={projectPoint(dot.start.lat, dot.start.lng).x}
                cy={projectPoint(dot.start.lat, dot.start.lng).y}
                r="2.5"
                fill={pointColor}
              />
              {linesVisible ? (
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
              ) : null}
            </g>
            <g key={`end-${i}`}>
              <circle
                cx={projectPoint(dot.end.lat, dot.end.lng).x}
                cy={projectPoint(dot.end.lat, dot.end.lng).y}
                r="2.5"
                fill={pointColor}
              />
              {linesVisible ? (
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
              ) : null}
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
