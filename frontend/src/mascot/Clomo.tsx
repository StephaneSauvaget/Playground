import type { TranslationKey } from "../i18n/translations";
import { useI18n } from "../i18n/I18nContext";
import bravo from "../assets/clomo/clomo-bravo.webp";
import court from "../assets/clomo/clomo-court.webp";
import coucou from "../assets/clomo/clomo-coucou.webp";
import ordinateur from "../assets/clomo/clomo-ordinateur.webp";
import "./clomo.css";

/**
 * Intrinsic sizes are declared alongside each pose so the <img> can reserve the
 * right box before the file loads — without them the page reflows on load.
 */
const POSES = {
  coucou: { src: coucou, width: 684, height: 768, alt: "clomo.alt.coucou" },
  ordinateur: { src: ordinateur, width: 740, height: 768, alt: "clomo.alt.ordinateur" },
  bravo: { src: bravo, width: 484, height: 768, alt: "clomo.alt.bravo" },
  court: { src: court, width: 725, height: 768, alt: "clomo.alt.court" },
} satisfies Record<string, { src: string; width: number; height: number; alt: TranslationKey }>;

export type ClomoPose = keyof typeof POSES;

interface ClomoProps {
  pose: ClomoPose;
  /** Rendered height in px; width follows the pose's own aspect ratio. */
  height: number;
  className?: string;
}

export function Clomo({ pose, height, className }: ClomoProps) {
  const { t } = useI18n();
  const { src, width, height: h, alt } = POSES[pose];

  return (
    <img
      className={className ? `clomo ${className}` : "clomo"}
      src={src}
      alt={t(alt)}
      width={width}
      height={h}
      style={{ height }}
      draggable={false}
    />
  );
}
