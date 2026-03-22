import { cn } from '../../utils/cn';

/** SVG ring — value 0–100 */
export default function RingProgress({ value = 0, size = 88, stroke = 8, className, trackClassName, progressClassName }) {
  const pct = Math.min(100, Math.max(0, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <svg width={size} height={size} className={cn('-rotate-90', className)} aria-hidden>
      <circle
        className={cn('text-slate-100', trackClassName)}
        stroke="currentColor"
        strokeWidth={stroke}
        fill="none"
        r={r}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className={cn('text-warning-500 transition-[stroke-dashoffset] duration-500', progressClassName)}
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        r={r}
        cx={size / 2}
        cy={size / 2}
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}
