import { localDate } from "@/lib/stats";
import type { Checkin } from "@/lib/types";

/** Datum und Uhrzeit in der Ortszeit des Check-ins. */
export function formatWhen(c: Pick<Checkin, "createdAt" | "tzOffset">): string {
  if (!c.createdAt) return "–";
  return localDate(c).toLocaleString("de-DE", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
