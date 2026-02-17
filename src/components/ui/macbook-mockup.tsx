/**
 * Laptop mock-up (MacBook Pro style).
 * Adapted from Cuicui - https://cuicui.day/other/mock-ups
 * Inspired by Devices CSS - https://devicescss.xyz
 */
import { cn } from '@/lib/utils';

type MacbookMockupProps = {
  className?: string;
  children?: React.ReactNode;
  src?: string;
};

export function MacbookMockup({
  className,
  children,
  src,
}: Readonly<MacbookMockupProps>) {
  return (
    <div
      className={cn(
        'relative z-1 mx-auto my-4 w-[640px]',
        className,
      )}
    >
      {/* Screen + bezel — proporción más parecida a laptop real (16:10) */}
      <div className="relative z-1 mx-auto w-full overflow-hidden rounded-[16px] border-2 border-[rgb(200,202,203)] px-[8px] pt-[8px] pb-[10px] [background:rgb(13,13,13)]">
        {children ?? (
          src ? (
            <img
              alt=""
              className="relative h-[340px] w-full rounded-t-[8px] border-2 border-solid border-[rgb(18,18,18)] bg-amber-200 object-cover object-top"
              loading="lazy"
              src={src}
            />
          ) : (
            <div className="bg-muted/30 flex h-[340px] w-full items-center justify-center rounded-t-[8px] border-2 border-solid border-[rgb(18,18,18)]" />
          )
        )}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-linear-to-b from-[#272727] to-[#0d0d0d]" />
      </div>

      {/* Notch */}
      <div className="-ml-6 absolute left-2/4 top-[8px] z-2 h-2.5 w-14 rounded-bl rounded-br bg-[rgb(13,13,13)]" />

      {/* Base / keyboard — más delgado para proporción tipo MacBook */}
      <div className="-mt-1.5 relative z-9 h-5 w-full max-w-[640px] rounded-[2px_2px_10px_10px] border-[1px_2px_0px] border-solid border-[rgb(160,163,167)] shadow-[rgb(108,112,116)_0px_-2px_8px_0px_inset] [background:radial-gradient(circle,rgb(226,227,228)_85%,rgb(200,202,203)_100%)] [border-image:initial]">
        <div className="absolute left-1/2 top-0 ml-[-50px] h-2 w-[100px] rounded-b-[8px] shadow-[inset_0_0_4px_2px_#babdbf]" />
      </div>

      {/* Feet */}
      <div className="-bottom-0.5 absolute left-10 h-0.5 w-8 rounded-b-full bg-neutral-600" />
      <div className="-bottom-0.5 absolute right-10 h-0.5 w-8 rounded-b-full bg-neutral-600" />
    </div>
  );
}
