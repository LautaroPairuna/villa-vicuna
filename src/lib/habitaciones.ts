// lib/habitaciones.ts
"use client";

// La función devuelve las claves y datos estáticos (imagen, amenities, etc.)
export function Habitaciones() {
  return [
    {
      id: 1,
      categoria: "superior",
      key: "twin_interna", // clave base para las traducciones
      imagen: "twin-interna.jpg",
      amenities: [
        { nombre: "wifi", icono: "ico-wifi.svg" },
        { nombre: "aire", icono: "ico-aire.svg" },
        { nombre: "smart-tv", icono: "ico-smart-tv.svg" },
        { nombre: "minibar", icono: "ico-minibar.svg" },
        { nombre: "bata", icono: "ico-bata.svg" },
        { nombre: "ducha", icono: "ico-ducha.svg" },
        { nombre: "caja-fuerte", icono: "ico-caja-fuerte.svg" },
        { nombre: "shampoo", icono: "ico-shampoo.svg" },
        { nombre: "tetera", icono: "ico-tetera.svg" },
      ],
    },
    {
      id: 2,
      categoria: "standard",
      key: "matrimonial",
      imagen: "standard-matrimonial.jpg",
      amenities: [
        { nombre: "wifi", icono: "ico-wifi.svg" },
        { nombre: "aire", icono: "ico-aire.svg" },
        { nombre: "smart-tv", icono: "ico-smart-tv.svg" },
        { nombre: "minibar", icono: "ico-minibar.svg" },
        { nombre: "ducha", icono: "ico-ducha.svg" },
        { nombre: "caja-fuerte", icono: "ico-caja-fuerte.svg" },
        { nombre: "shampoo", icono: "ico-shampoo.svg" },
        { nombre: "tetera", icono: "ico-tetera.svg" },
      ],
    },
    {
      id: 3,
      categoria: "standard",
      key: "triple",
      imagen: "standard-mat-triple.jpg",
      amenities: [
        { nombre: "wifi", icono: "ico-wifi.svg" },
        { nombre: "aire", icono: "ico-aire.svg" },
        { nombre: "smart-tv", icono: "ico-smart-tv.svg" },
        { nombre: "minibar", icono: "ico-minibar.svg" },
        { nombre: "ducha", icono: "ico-ducha.svg" },
        { nombre: "caja-fuerte", icono: "ico-caja-fuerte.svg" },
        { nombre: "shampoo", icono: "ico-shampoo.svg" },
        { nombre: "tetera", icono: "ico-tetera.svg" },
      ],
    },
    {
      id: 4,
      categoria: "superior",
      key: "balcon",
      imagen: "superior-balcon.jpg",
      // Para "balcon" se usan los 9 íconos definidos en el JSON original
      amenities: [
        { nombre: "wifi", icono: "ico-wifi.svg" },
        { nombre: "aire", icono: "ico-aire.svg" },
        { nombre: "smart-tv", icono: "ico-smart-tv.svg" },
        { nombre: "minibar", icono: "ico-minibar.svg" },
        { nombre: "bata", icono: "ico-bata.svg" },
        { nombre: "ducha", icono: "ico-ducha.svg" },
        { nombre: "caja-fuerte", icono: "ico-caja-fuerte.svg" },
        { nombre: "shampoo", icono: "ico-shampoo.svg" },
        { nombre: "tetera", icono: "ico-tetera.svg" },
      ],
    },
    {
      id: 5,
      categoria: "superior",
      key: "jardin",
      imagen: "superior-jardin.jpg",
      // Para "jardin" se usan los 9 íconos definidos en el JSON original
      amenities: [
        { nombre: "wifi", icono: "ico-wifi.svg" },
        { nombre: "aire", icono: "ico-aire.svg" },
        { nombre: "smart-tv", icono: "ico-smart-tv.svg" },
        { nombre: "minibar", icono: "ico-minibar.svg" },
        { nombre: "bata", icono: "ico-bata.svg" },
        { nombre: "ducha", icono: "ico-ducha.svg" },
        { nombre: "caja-fuerte", icono: "ico-caja-fuerte.svg" },
        { nombre: "shampoo", icono: "ico-shampoo.svg" },
        { nombre: "tetera", icono: "ico-tetera.svg" },
      ],
    },
    {
      id: 6,
      categoria: "superior",
      key: "twin_externa",
      imagen: "twin-externa.jpg",
      amenities: [
        { nombre: "wifi", icono: "ico-wifi.svg" },
        { nombre: "aire", icono: "ico-aire.svg" },
        { nombre: "smart-tv", icono: "ico-smart-tv.svg" },
        { nombre: "minibar", icono: "ico-minibar.svg" },
        { nombre: "bata", icono: "ico-bata.svg" },
        { nombre: "banera", icono: "ico-banera.svg" },
        { nombre: "caja-fuerte", icono: "ico-caja-fuerte.svg" },
        { nombre: "shampoo", icono: "ico-shampoo.svg" },
        { nombre: "tetera", icono: "ico-tetera.svg" },
      ],
    },
  ];
}
