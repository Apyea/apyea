import Image from "next/image";
import Link from "next/link";
import { APYEA_LOGO_ALT, APYEA_LOGO_SRC } from "@/lib/brand";

/** Matches `AppTopBar` (`h-14` / 3.5rem). */
export const APP_NAVBAR_HEIGHT_CLASS = "h-14";

export function ApyeaBrand({
  href = "/",
  layout = "inline",
  showWordmark = true,
  className = "",
}: {
  href?: string;
  layout?: "inline" | "bar";
  showWordmark?: boolean;
  className?: string;
}) {
  const size = layout === "bar" ? 36 : 32;
  const imageClass =
    layout === "bar" ? "h-9 w-9 object-contain" : "h-8 w-8 object-contain";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-lg transition hover:opacity-90 ${
        layout === "bar" ? "h-full max-h-14" : ""
      } ${className}`}
    >
      <span
        className={`flex shrink-0 items-center justify-center ${
          layout === "bar" ? "h-9 w-9" : "h-8 w-8"
        }`}
      >
        <Image
          src={APYEA_LOGO_SRC}
          alt={APYEA_LOGO_ALT}
          width={size}
          height={size}
          className={imageClass}
          priority
        />
      </span>
      {showWordmark ? (
        <span className="text-sm font-semibold text-[#1B3D32] sm:text-base">APYEA</span>
      ) : null}
    </Link>
  );
}