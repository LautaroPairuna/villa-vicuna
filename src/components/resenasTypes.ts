import type { ReviewContent } from "@/lib/contentTypes";

// -----------------------------------------------------------------------------
// Tipos e Interfaces
// -----------------------------------------------------------------------------
// La reseña con imágenes ya resueltas (URLs completas desde DB o fallback).
export type ReseñaItem = ReviewContent;

export interface ReseñaDetalle {
  comentarioKey: string;
  autor: string;
  pais: string;
}

export interface Translations {
  (key: string, options?: Record<string, unknown>): string;
  raw: (key: string) => string;
}
