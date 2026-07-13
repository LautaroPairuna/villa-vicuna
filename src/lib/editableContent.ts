// Registro de textos editables desde el panel. Es un módulo plano (sin DB ni
// server-only): lo usan tanto las páginas del admin como el editor cliente.
//
// Cada campo apunta a una clave de next-intl (punteada). Los títulos con
// markup <span> se editan como dos partes y se recomponen al guardar.

export type FieldType = "text" | "textarea" | "splitTitle";

export interface SplitWrap {
  before: string;
  mid: string;
  after: string;
  labelA?: string;
  labelB?: string;
}

export interface EditableField {
  key: string; // clave punteada, p.ej. "about_us.parrafo1"
  label: string;
  type: FieldType;
  wrap?: SplitWrap; // solo para splitTitle
}

export interface EditableSection {
  id: string; // coincide con la ruta del admin (/admin/<id>)
  label: string;
  fields: EditableField[];
}

const TITLE: SplitWrap = { before: "", mid: "<span>", after: "</span>", labelA: "Parte 1", labelB: "Parte 2 (resaltada)" };
const H2_TITLE: SplitWrap = { before: "<h2>", mid: "<span>", after: "</span></h2>", labelA: "Parte 1", labelB: "Parte 2 (resaltada)" };
const H3_TITLE: SplitWrap = { before: "<h3>", mid: "<span>", after: "</span></h3>", labelA: "Parte 1", labelB: "Parte 2 (resaltada)" };

const ROOM_FIELDS = [
  { key: "matrimonial", label: "Matrimonial" },
  { key: "triple", label: "Triple" },
  { key: "twin_interna", label: "Twin interna" },
  { key: "balcon", label: "Balcón" },
  { key: "jardin", label: "Jardín" },
  { key: "twin_externa", label: "Twin externa" },
] as const;

const REVIEW_BLOCKS = [
  { key: "desayuno", label: "Desayuno" },
  { key: "detalles", label: "Detalles" },
  { key: "personal", label: "Personal" },
] as const;

const EXPERIENCE_FORMATS = [
  { key: "intima", label: "Degustación Íntima" },
  { key: "terroir", label: "Recorrido por el Terroir" },
  { key: "atardecer", label: "Atardecer Íntimo" },
] as const;

export const EDITABLE_SECTIONS: EditableSection[] = [
  {
    id: "nosotros",
    label: "Nosotros",
    fields: [
      { key: "about_us.titulo", label: "Título", type: "splitTitle", wrap: TITLE },
      { key: "about_us.parrafo1", label: "Párrafo 1", type: "textarea" },
      { key: "about_us.parrafo2", label: "Párrafo 2", type: "textarea" },
      { key: "about_us.parrafo3", label: "Párrafo 3", type: "textarea" },
      { key: "about_us.imagenAlt", label: "Texto alternativo de la imagen", type: "text" },
    ],
  },
  {
    id: "menu",
    label: "Menú",
    fields: [
      { key: "menu.titulo", label: "Título", type: "text" },
      { key: "menu.descripcion", label: "Descripción", type: "textarea" },
      { key: "menu.boton", label: "Botón (descargar PDF)", type: "text" },
      { key: "menu.menu_image_left", label: "Texto alternativo · imagen izquierda", type: "text" },
      { key: "menu.menu_image_right", label: "Texto alternativo · imagen derecha", type: "text" },
    ],
  },
  {
    id: "contacto",
    label: "Contacto",
    fields: [
      { key: "contact.titulo", label: "Título", type: "splitTitle", wrap: H2_TITLE },
      { key: "contact.telefono", label: "Teléfono", type: "text" },
      { key: "contact.email", label: "Email", type: "text" },
      { key: "contact.direccion", label: "Dirección", type: "textarea" },
      { key: "contact.boton", label: "Botón (reservar)", type: "text" },
    ],
  },
  {
    id: "habitaciones",
    label: "Habitaciones",
    fields: [
      { key: "rooms.titulo", label: "Título de la sección", type: "text" },
      { key: "rooms.ver_mas", label: 'Botón "Ver más"', type: "text" },
      { key: "rooms.standard", label: "Etiqueta categoría Standard", type: "splitTitle", wrap: H3_TITLE },
      { key: "rooms.superior", label: "Etiqueta categoría Superior", type: "splitTitle", wrap: H3_TITLE },
      ...ROOM_FIELDS.flatMap((room) => [
        { key: `rooms.${room.key}.nombre`, label: `${room.label} · nombre`, type: "text" as const },
        {
          key: `rooms.${room.key}.descripcion`,
          label: `${room.label} · descripción`,
          type: "textarea" as const,
        },
        { key: `rooms.${room.key}.detalles`, label: `${room.label} · detalle corto`, type: "text" as const },
        { key: `rooms.${room.key}.boton`, label: `${room.label} · botón reservar`, type: "text" as const },
        {
          key: `rooms.${room.key}.parrafo_minibar`,
          label: `${room.label} · texto minibar`,
          type: "textarea" as const,
        },
      ]),
    ],
  },
  {
    id: "resenas",
    label: "Reseñas",
    fields: [
      { key: "reseñas.titulo", label: "Título de la sección", type: "text" },
      { key: "reseñas.descripcion", label: "Descripción", type: "textarea" },
      { key: "reseñas.gracias", label: "Texto de agradecimiento", type: "textarea" },
      ...REVIEW_BLOCKS.flatMap((review) => [
        { key: `${review.key}.nombre`, label: `${review.label} · nombre`, type: "splitTitle" as const, wrap: TITLE },
        { key: `${review.key}.texto`, label: `${review.label} · texto principal`, type: "textarea" as const },
        { key: `${review.key}.reseñas.0`, label: `${review.label} · reseña 1`, type: "textarea" as const },
        { key: `${review.key}.reseñas.1`, label: `${review.label} · reseña 2`, type: "textarea" as const },
        { key: `${review.key}.reseñas.2`, label: `${review.label} · reseña 3`, type: "textarea" as const },
      ]),
    ],
  },
  {
    id: "promociones",
    label: "Promociones",
    fields: [
      { key: "promociones.eyebrow", label: "Etiqueta superior", type: "text" },
      { key: "promociones.titulo", label: "Título principal", type: "textarea" },
      { key: "promociones.descripcion", label: "Descripción principal", type: "textarea" },
    ],
  },
  {
    id: "salta",
    label: "Salta Capital",
    fields: [
      { key: "salta.eyebrow", label: "Etiqueta superior", type: "text" },
      { key: "salta.titulo", label: "Título principal", type: "textarea" },
      { key: "salta.descripcion", label: "Descripción principal", type: "textarea" },
    ],
  },
  {
    id: "experiencias",
    label: "Experiencias Barolo",
    fields: [
      // Intro
      { key: "experiences.eyebrow", label: "Etiqueta superior", type: "text" },
      { key: "experiences.titulo", label: "Título principal", type: "textarea" },
      { key: "experiences.descripcion", label: "Descripción principal", type: "textarea" },
      // Cita
      { key: "experiences.quote", label: "Cita · texto", type: "textarea" },
      { key: "experiences.quoteAuthor", label: "Cita · autora", type: "text" },
      { key: "experiences.quoteRole", label: "Cita · rol", type: "text" },
      // Encabezado de formatos
      { key: "experiences.formatosEyebrow", label: "Formatos · etiqueta", type: "text" },
      { key: "experiences.formatosTitulo", label: "Formatos · título", type: "text" },
      { key: "experiences.formatosDescripcion", label: "Formatos · descripción", type: "textarea" },
      { key: "experiences.incluyeLabel", label: "Formatos · etiqueta «Incluye»", type: "text" },
      ...EXPERIENCE_FORMATS.flatMap((f) => [
        { key: `experiences.formatos.${f.key}.nombre`, label: `${f.label} · nombre`, type: "text" as const },
        { key: `experiences.formatos.${f.key}.capacidad`, label: `${f.label} · capacidad`, type: "text" as const },
        { key: `experiences.formatos.${f.key}.precio`, label: `${f.label} · precio`, type: "text" as const },
        { key: `experiences.formatos.${f.key}.precioNota`, label: `${f.label} · nota de precio`, type: "text" as const },
        { key: `experiences.formatos.${f.key}.resumen`, label: `${f.label} · resumen`, type: "textarea" as const },
        { key: `experiences.formatos.${f.key}.incluye.0`, label: `${f.label} · incluye 1`, type: "text" as const },
        { key: `experiences.formatos.${f.key}.incluye.1`, label: `${f.label} · incluye 2`, type: "text" as const },
        { key: `experiences.formatos.${f.key}.incluye.2`, label: `${f.label} · incluye 3`, type: "text" as const },
        { key: `experiences.formatos.${f.key}.incluye.3`, label: `${f.label} · incluye 4`, type: "text" as const },
      ]),
      // Tapeo
      { key: "experiences.tapeoEyebrow", label: "Tapeo · etiqueta", type: "text" },
      { key: "experiences.tapeoTitulo", label: "Tapeo · título", type: "text" },
      { key: "experiences.tapeoDescripcion", label: "Tapeo · descripción", type: "textarea" },
      { key: "experiences.tapeo.0", label: "Tapeo · bocado 1", type: "text" },
      { key: "experiences.tapeo.1", label: "Tapeo · bocado 2", type: "text" },
      { key: "experiences.tapeo.2", label: "Tapeo · bocado 3", type: "text" },
      { key: "experiences.tapeo.3", label: "Tapeo · bocado 4", type: "text" },
      // Info práctica
      { key: "experiences.infoEyebrow", label: "Info · etiqueta", type: "text" },
      { key: "experiences.infoTitulo", label: "Info · título", type: "text" },
      { key: "experiences.reservaTitulo", label: "Reserva · título", type: "text" },
      { key: "experiences.reservaTexto", label: "Reserva · texto", type: "textarea" },
      { key: "experiences.idiomaTitulo", label: "Idioma · título", type: "text" },
      { key: "experiences.idiomaTexto", label: "Idioma · texto", type: "textarea" },
      { key: "experiences.botellaTitulo", label: "Botella · título", type: "text" },
      { key: "experiences.botellaTexto", label: "Botella · texto", type: "textarea" },
      // CTA de cierre
      { key: "experiences.ctaEyebrow", label: "CTA · etiqueta", type: "text" },
      { key: "experiences.ctaTitulo", label: "CTA · título", type: "textarea" },
      { key: "experiences.ctaTexto", label: "CTA · texto", type: "textarea" },
      { key: "experiences.ctaBotonPrimario", label: "CTA · botón primario", type: "text" },
      { key: "experiences.ctaBotonSecundario", label: "CTA · botón secundario", type: "text" },
      // SEO
      { key: "experiences.metaTitle", label: "SEO · título", type: "text" },
      { key: "experiences.metaDescription", label: "SEO · descripción", type: "textarea" },
    ],
  },
];

export function getSection(id: string): EditableSection | undefined {
  return EDITABLE_SECTIONS.find((s) => s.id === id);
}

export function composeSplit(wrap: SplitWrap, a: string, b: string): string {
  return `${wrap.before}${a}${wrap.mid}${b}${wrap.after}`;
}

export function decomposeSplit(wrap: SplitWrap, value: string): { a: string; b: string } {
  let v = value ?? "";
  if (wrap.before && v.startsWith(wrap.before)) v = v.slice(wrap.before.length);
  if (wrap.after && v.endsWith(wrap.after)) v = v.slice(0, v.length - wrap.after.length);
  const i = v.indexOf(wrap.mid);
  if (i === -1) return { a: v, b: "" };
  return { a: v.slice(0, i), b: v.slice(i + wrap.mid.length) };
}
