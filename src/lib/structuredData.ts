import "server-only";
import { getTranslations } from "next-intl/server";
import { Habitaciones as getStaticRooms } from "./habitaciones";
import { reseñasDetalles } from "./reseñas";

// Datos verificables del hotel (sin tarifas ni disponibilidad: eso vive en Cloudbeds).
const BASE_URL = "https://villavicuna.com.ar";
const HOTEL_NAME = "Villa Vicuña Hotel Boutique";
const TELEPHONE = "+5493874649748";
const EMAIL = "salta@villavicuna.com.ar";
const CLOUDBEDS_RESERVATION = "https://hotels.cloudbeds.com/reservation/pwSXnD";
const MAPS_URL = "https://maps.app.goo.gl/HkENdi1r48xMmqpp6";
const SAME_AS = [
  "https://instagram.com/villavicunasalta",
  "https://facebook.com/villavicunasalta",
];

// ⚠️ Coordenadas APROXIMADAS de Caseros 266, Salta. Verificá las exactas en
// Google Maps y reemplazalas (lat/long del pin del hotel).
const GEO = { latitude: -24.7918, longitude: -65.4087 };

// Nombres de amenities en inglés (universal para que los entiendan los LLMs).
const AMENITY_LABELS: Record<string, string> = {
  wifi: "Free Wi-Fi",
  aire: "Air conditioning",
  minibar: "Minibar",
  "smart-tv": "Smart TV",
  "caja-fuerte": "In-room safe",
  ducha: "Shower",
  tetera: "Electric kettle",
  bata: "Bathrobe",
  banera: "Bathtub",
  shampoo: "Bath toiletries",
};

// Preguntas frecuentes localizadas (solo datos verificables).
const FAQ: Record<string, { q: string; a: string }[]> = {
  es: [
    { q: "¿Dónde está ubicado el Hotel Villa Vicuña?", a: "En Caseros 266, en pleno centro histórico de Salta capital, Argentina, a pocos metros de la plaza principal." },
    { q: "¿Cuántas habitaciones tiene?", a: "12 habitaciones en una casona colonial restaurada, en categorías Standard y Superior." },
    { q: "¿El hotel ofrece desayuno?", a: "Sí, se sirve un desayuno casero muy elogiado por los huéspedes." },
    { q: "¿Qué servicios incluyen las habitaciones?", a: "Wi-Fi gratis, aire acondicionado, minibar, caja fuerte, Smart TV (según categoría) y artículos de baño." },
    { q: "¿En qué idiomas atienden?", a: "Español, inglés y francés." },
    { q: "¿Cómo se reserva?", a: "Online a través del motor de reservas oficial (Cloudbeds) o por WhatsApp." },
  ],
  en: [
    { q: "Where is Hotel Villa Vicuña located?", a: "At Caseros 266, in the historic center of Salta city, Argentina, a few steps from the main square." },
    { q: "How many rooms does it have?", a: "12 rooms in a restored colonial mansion, in Standard and Superior categories." },
    { q: "Does the hotel offer breakfast?", a: "Yes, a homemade breakfast that guests consistently praise." },
    { q: "What amenities do the rooms include?", a: "Free Wi-Fi, air conditioning, minibar, safe, Smart TV (depending on category) and bath toiletries." },
    { q: "What languages does the staff speak?", a: "Spanish, English and French." },
    { q: "How do I book?", a: "Online through the official booking engine (Cloudbeds) or via WhatsApp." },
  ],
  fr: [
    { q: "Où se trouve l'Hôtel Villa Vicuña ?", a: "Au Caseros 266, dans le centre historique de la ville de Salta, Argentine, à quelques pas de la place principale." },
    { q: "Combien de chambres possède-t-il ?", a: "12 chambres dans une demeure coloniale restaurée, en catégories Standard et Supérieure." },
    { q: "L'hôtel propose-t-il le petit-déjeuner ?", a: "Oui, un petit-déjeuner maison très apprécié des clients." },
    { q: "Quels équipements incluent les chambres ?", a: "Wi-Fi gratuit, climatisation, minibar, coffre-fort, Smart TV (selon la catégorie) et articles de toilette." },
    { q: "Quelles langues parle le personnel ?", a: "Espagnol, anglais et français." },
    { q: "Comment réserver ?", a: "En ligne via le moteur de réservation officiel (Cloudbeds) ou par WhatsApp." },
  ],
};

export async function getStructuredData(locale: string) {
  const t = await getTranslations({ locale });
  const tRooms = await getTranslations({ locale, namespace: "rooms" });
  const tMeta = await getTranslations({ locale, namespace: "metadata" });

  const rooms = getStaticRooms();
  const numberOfRooms = rooms.reduce((sum, r) => sum + (Number(r.cantidad) || 0), 0);

  const amenityNames = Array.from(
    new Set(rooms.flatMap((r) => r.amenities.map((a) => a.nombre))),
  );
  const amenityFeature = amenityNames.map((n) => ({
    "@type": "LocationFeatureSpecification",
    name: AMENITY_LABELS[n] ?? n,
    value: true,
  }));

  const makesOffer = rooms.map((r) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "HotelRoom",
      name: tRooms(`${r.key}.nombre`),
    },
    url: CLOUDBEDS_RESERVATION,
  }));

  // Reseñas reales mostradas en el sitio (todas 5★).
  const reviewEntries = Object.values(reseñasDetalles).flat();
  const review = reviewEntries.slice(0, 6).map((d) => {
    let body = "";
    try {
      body = t(d.comentarioKey);
    } catch {
      body = "";
    }
    return {
      "@type": "Review",
      author: { "@type": "Person", name: d.autor.trim() },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      ...(body ? { reviewBody: body } : {}),
    };
  });

  const hotel = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "@id": `${BASE_URL}/#hotel`,
    name: HOTEL_NAME,
    description: tMeta("description"),
    url: `${BASE_URL}/${locale}`,
    telephone: TELEPHONE,
    email: EMAIL,
    image: [`${BASE_URL}/opengraph.jpg`],
    logo: `${BASE_URL}/images/logo-villa-vicuna-2.svg`,
    starRating: { "@type": "Rating", ratingValue: "3" },
    numberOfRooms,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Caseros 266",
      addressLocality: "Salta",
      addressRegion: "Salta",
      postalCode: "4400",
      addressCountry: "AR",
    },
    geo: { "@type": "GeoCoordinates", ...GEO },
    hasMap: MAPS_URL,
    sameAs: SAME_AS,
    amenityFeature,
    makesOffer,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      bestRating: "5",
      reviewCount: reviewEntries.length,
    },
    review,
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: CLOUDBEDS_RESERVATION,
        inLanguage: locale,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      result: { "@type": "LodgingReservation", name: `Reserva en ${HOTEL_NAME}` },
    },
  };

  const faqItems = FAQ[locale] ?? FAQ.es;
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return { hotel, faq };
}
