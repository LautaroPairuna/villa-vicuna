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
    ],
  },
  {
    id: "resenas",
    label: "Reseñas",
    fields: [
      { key: "reseñas.titulo", label: "Título de la sección", type: "text" },
      { key: "reseñas.descripcion", label: "Descripción", type: "textarea" },
      { key: "reseñas.gracias", label: "Texto de agradecimiento", type: "textarea" },
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
