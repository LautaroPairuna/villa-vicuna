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
      "detalles-2.jpg",
      "detalles-3.jpg",
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
      "personal-2.jpg",
      "personal-3.jpg",
    ],
  },
];

export const reseñasDetalles = {
  1: [
    { comentarioKey: "desayuno.reseñas.0", autor: "Carlos Pérez", pais: "España" },
    { comentarioKey: "desayuno.reseñas.1", autor: "María López", pais: "Argentina" },
    { comentarioKey: "desayuno.reseñas.2", autor: "John Doe", pais: "EE.UU." },
  ],
  2: [
    { comentarioKey: "detalles.reseñas.0", autor: "Luciana Gómez", pais: "Chile" },
    { comentarioKey: "detalles.reseñas.1", autor: "Fernando Costa", pais: "Brasil" },
    { comentarioKey: "detalles.reseñas.2", autor: "Anna Smith", pais: "Canadá" },
  ],
  3: [
    { comentarioKey: "personal.reseñas.0", autor: "Mercedes", pais: "Argentina" },
    { comentarioKey: "personal.reseñas.1", autor: "Laura Fernández", pais: "Colombia" },
    { comentarioKey: "personal.reseñas.2", autor: "Emma Wilson", pais: "Reino Unido" },
  ],
};
