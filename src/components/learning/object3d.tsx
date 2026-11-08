import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Thiings 3D object (thiings.co — see public/assets/thiings/README.md for
 * licensing). Rendered with a soft ground shadow so objects feel physical.
 */
export function Object3D({
  src,
  alt = "",
  size = 64,
  float = false,
  className,
}: {
  src: string;
  alt?: string;
  size?: number;
  float?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={cn(
        "pointer-events-none select-none drop-shadow-[0_16px_16px_rgba(15,23,42,0.18)]",
        float && "animate-float",
        className,
      )}
    />
  );
}
