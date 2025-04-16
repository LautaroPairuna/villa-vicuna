"use client";

import dynamic from "next/dynamic";

// Importamos tu Contacto original pero solo en cliente
const ContactoNoSSR = dynamic(
  () => import("./Contacto"),
  { ssr: false }
);

export default function ContactoClient() {
  return <ContactoNoSSR />;
}
