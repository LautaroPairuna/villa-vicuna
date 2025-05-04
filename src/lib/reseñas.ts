export const reseñas = [
  {
    id: 1,
    nombreKey: "desayuno.nombre",
    textoKey: "desayuno.texto",
    // Imagen principal
    imagen: "el-desayuno.jpg",
    // Carpeta donde se encuentran las imágenes para esta reseña
    folder: "reseñas-desayuno",
    // Array de imágenes para el carrusel (sin incluir la carpeta)
    carrusel: [
      "desayuno-1.jpg",
      "desayuno-2.jpg",
      "desayuno-3.jpg",
      "desayuno-4.jpg",
    ],
  },
  {
    id: 2,
    nombreKey: "detalles.nombre",
    textoKey: "detalles.texto",
    imagen: "los-detalles.jpg",
    folder: "reseñas-detalles",
    carrusel: [
      "detalles-1.jpg",
      "detalles-2.jpeg",
      "detalles-3.jpg",
      "detalles-4.jpg",
    ],
  },
  {
    id: 3,
    nombreKey: "personal.nombre",
    textoKey: "personal.texto",
    imagen: "el-personal.jpg",
    folder: "reseñas-personal",
    carrusel: [
      "personal-1.jpg",
      "personal-2.jpeg",
      "personal-3.jpg",
      "personal-4.jpg",
    ],
  },
];

export const reseñasDetalles = {
  1: [
    { comentarioKey: "desayuno.reseñas.0", autor: "Sofia y Luca", pais: "Italia" },
    { comentarioKey: "desayuno.reseñas.1", autor: "Celia y Martina", pais: "España" },
    { comentarioKey: "desayuno.reseñas.2", autor: "Manuela y Cesar ", pais: "Chile" },
  ],
  2: [
    { comentarioKey: "detalles.reseñas.0", autor: "Alice y Enzo", pais: "Italia" },
    { comentarioKey: "detalles.reseñas.1", autor: "Christine y JP", pais: "Francia" },
    { comentarioKey: "detalles.reseñas.2", autor: "Celine y Arthur", pais: "EE.UU." },
  ],
  3: [
    { comentarioKey: "personal.reseñas.0", autor: "Roberta, Francesco y Alessandro", pais: "Italia" },
    { comentarioKey: "personal.reseñas.1", autor: "Flia  Lopez", pais: "España" },
    { comentarioKey: "personal.reseñas.2", autor: "Jane y Peter", pais: "EE.UU." },
  ],
};
