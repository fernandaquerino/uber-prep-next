import type { Weekday } from "./schedule.types";

export const WEEKDAYS: readonly Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const PRODUCT_TIMEZONE = "America/Sao_Paulo";
