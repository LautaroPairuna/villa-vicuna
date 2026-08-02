import type { RoomContent } from "@/lib/contentTypes";

// La habitación con imágenes ya resueltas (URLs completas desde DB o fallback).
export type Habitacion = RoomContent;

// Tipo para la función de traducción (next-intl).
export interface Translations {
  (key: string, options?: Record<string, unknown>): string;
  raw: (key: string) => string;
}
