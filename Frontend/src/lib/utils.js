import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

// Combineert conditionele classes en dedupliceert conflicterende Tailwind classes.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
