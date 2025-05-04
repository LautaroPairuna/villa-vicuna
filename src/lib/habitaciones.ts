// lib/habitaciones.ts
"use client";

// Definición de la interfaz para una habitación
export interface Habitacion {
  id: number;
  categoria: string;
  key: string;
  imagen: string;
  folder: string;        // Carpeta donde se almacenan las imágenes del carrusel
  carrusel: string[];    // Array de imágenes para el carrusel
  amenities: {
    nombre: string;
    icono: string;
  }[];
}

// La función devuelve las claves y datos estáticos (imagen, amenities, folder, carrusel, etc.)
export function Habitaciones(): Habitacion[] {
  return [
    {
      id: 1,
      categoria: "superior",
      key: "twin_interna", // clave base para las traducciones
      imagen: "twin-interna.jpg",
      folder: "habitaciones-twin-interna",
      carrusel: [
        "interna-1.jpg",
        "interna-2.png",
        "interna-3.jpg",
      ],
      amenities: [
        { nombre: "wifi", icono: "ico-wifi.svg" },
        { nombre: "shampoo", icono: "ico-shampoo.svg" },
        { nombre: "caja-fuerte", icono: "ico-caja-fuerte.svg" },
        { nombre: "ducha", icono: "ico-ducha.svg" },
        { nombre: "aire", icono: "ico-aire.svg" },
        { nombre: "tetera", icono: "ico-tetera.svg" },
        { nombre: "minibar", icono: "ico-minibar.svg" },
      ],
    },
    {
      id: 2,
      categoria: "standard",
      key: "matrimonial",
      imagen: "standard-matrimonial.jpg",
      folder: "habitaciones-matrimonial",
      carrusel: [
        "matrimonial-1.png",
        "matrimonial-2.jpeg",
        "matrimonial-3.jpeg",
        "matrimonial-4.jpeg",
      ],
      amenities: [
        { nombre: "wifi", icono: "ico-wifi.svg" },
        { nombre: "aire", icono: "ico-aire.svg" },
        { nombre: "shampoo", icono: "ico-shampoo.svg" },
        { nombre: "caja-fuerte", icono: "ico-caja-fuerte.svg" },
        { nombre: "smart-tv", icono: "ico-smart-tv.svg" },
        { nombre: "minibar", icono: "ico-minibar.svg" },
        { nombre: "ducha", icono: "ico-ducha.svg" },
        { nombre: "tetera", icono: "ico-tetera.svg" },
      ],
    },
    {
      id: 3,
      categoria: "standard",
      key: "triple",
      imagen: "standard-mat-triple.jpg",
      folder: "habitaciones-triple",
      carrusel: [
        "triple-1.png",
        "triple-2.png",
        "triple-3.png",
      ],
      amenities: [
        { nombre: "wifi", icono: "ico-wifi.svg" },
        { nombre: "aire", icono: "ico-aire.svg" },
        { nombre: "shampoo", icono: "ico-shampoo.svg" },
        { nombre: "caja-fuerte", icono: "ico-caja-fuerte.svg" },
        { nombre: "smart-tv", icono: "ico-smart-tv.svg" },
        { nombre: "minibar", icono: "ico-minibar.svg" },
        { nombre: "ducha", icono: "ico-ducha.svg" },
        { nombre: "tetera", icono: "ico-tetera.svg" },
      ],
    },
    {
      id: 4,
      categoria: "superior",
      key: "balcon",
      imagen: "superior-balcon.jpg",
      folder: "habitaciones-balcon",
      carrusel: [
        "balcon-1.png",
        "balcon-2.png",
        "balcon-3.png",
      ],
      amenities: [
        { nombre: "wifi", icono: "ico-wifi.svg" },
        { nombre: "aire", icono: "ico-aire.svg" },
        { nombre: "smart-tv", icono: "ico-smart-tv.svg" },
        { nombre: "shampoo", icono: "ico-shampoo.svg" },
        { nombre: "caja-fuerte", icono: "ico-caja-fuerte.svg" },
        { nombre: "minibar", icono: "ico-minibar.svg" },
        { nombre: "bata", icono: "ico-bata.svg" },
        { nombre: "ducha", icono: "ico-ducha.svg" },
        { nombre: "tetera", icono: "ico-tetera.svg" },
      ],
    },
    {
      id: 5,
      categoria: "superior",
      key: "jardin",
      imagen: "superior-jardin.jpg",
      folder: "habitaciones-jardin",
      carrusel: [
        "jardin-1.png",
        "jardin-2.jpeg",
        "jardin-3.jpeg",
      ],
      amenities: [
        { nombre: "wifi", icono: "ico-wifi.svg" },
        { nombre: "aire", icono: "ico-aire.svg" },
        { nombre: "smart-tv", icono: "ico-smart-tv.svg" },
        { nombre: "shampoo", icono: "ico-shampoo.svg" },
        { nombre: "caja-fuerte", icono: "ico-caja-fuerte.svg" },
        { nombre: "minibar", icono: "ico-minibar.svg" },
        { nombre: "bata", icono: "ico-bata.svg" },
        { nombre: "ducha", icono: "ico-ducha.svg" },
        { nombre: "tetera", icono: "ico-tetera.svg" },
      ],
    },
    {
      id: 6,
      categoria: "superior",
      key: "twin_externa",
      imagen: "twin-externa.jpg",
      folder: "habitaciones-twin-externa",
      carrusel: [
        "externa-1.png",
        "externa-2.png",
        "externa-3.png",
      ],
      amenities: [
        { nombre: "wifi", icono: "ico-wifi.svg" },
        { nombre: "aire", icono: "ico-aire.svg" },
        { nombre: "smart-tv", icono: "ico-smart-tv.svg" },
        { nombre: "shampoo", icono: "ico-shampoo.svg" },
        { nombre: "caja-fuerte", icono: "ico-caja-fuerte.svg" },
        { nombre: "minibar", icono: "ico-minibar.svg" },
        { nombre: "bata", icono: "ico-bata.svg" },
        { nombre: "banera", icono: "ico-banera.svg" },
        { nombre: "tetera", icono: "ico-tetera.svg" },
      ],
    },
  ];
}
