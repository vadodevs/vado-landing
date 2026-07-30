import type { ImgHTMLAttributes } from 'react';

type NextImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  fill?: boolean;
  unoptimized?: boolean;
};

/** Shim de next/image para Vite. */
export default function Image({ src, alt, width, height, className, style, ...rest }: NextImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Vite shim
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      {...rest}
    />
  );
}
