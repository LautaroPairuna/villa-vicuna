"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
// Iconos para datos de contacto y redes
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaFacebookF } from "react-icons/fa";

export default function Contacto() {
  const t = useTranslations("contact");

  // Title extraído desde el JSON
  const tituloHTML = t.raw("titulo");
  const match = tituloHTML.match(/<h2><span>(.*?)<\/span>(.*?)<\/h2>/);
  const tituloParte1 = match ? match[1] : "ERROR";
  const tituloParte2 = match ? match[2] : "";

  // Tracking dinámico (SOLO se usa en desktop)
  const calculateTracking = (text: string) => {
    const length = text.length;
    if (length <= 5) return "tracking-[1em]";
    if (length <= 8) return "tracking-[0.95em]";
    if (length <= 10) return "tracking-[1.1em]";
    if (length <= 12) return "tracking-[0.90em]";
    if (length <= 15) return "tracking-[0.70em]";
    return "tracking-[0.40em]";
  };

  // Título completo
  const tituloCompleto = `${tituloParte1}${tituloParte2}`;

  return (
    <section id="contact" className="relative bg-white text-black px-6 sm:px-12 lg:px-20 py-4">
      <div className="max-w-[1400px] mx-auto relative">
        {/* TÍTULO para pantallas pequeñas (todo negro, sin absoluto) */}
        <h2 className="block md:hidden text-4xl text-center uppercase mb-6">
          {tituloCompleto}
        </h2>

        {/* TÍTULO para pantallas grandes (con absoluto, tracking dinámico, parcial blanco/negro) */}
        <h2
          className={`
            hidden md:block
            absolute top-[20px] left-1/2
            -translate-x-1/2
            text-4xl md:text-6xl lg:text-6xl
            uppercase
            ${calculateTracking(tituloCompleto)}
            text-center
            z-10
            w-full
          `}
        >
          <span className="text-white drop-shadow-[0px_0px_4px_rgba(0,0,0,1)]">{tituloParte1}</span>
          <span className="text-black">{tituloParte2}</span>
        </h2>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-center md:justify-end mt-4 md:mt-10">
          {/* IMAGEN (más alta) */}
          <div className="relative w-full md:w-1/2 flex justify-center">
            <Image
              src="/images/contactenos.jpg"
              alt="Hotel Interior"
              width={800}
              height={1000} // Alto para ser más vertical
              className="w-full max-w-lg object-cover shadow-lg rounded-lg"
            />
          </div>
          {/* BOTÓN en pantallas pequeñas (bloque normal) */}
          <div className="block md:hidden my-6 items-center mx-auto justify-center text-center">
            {/* FONDO-CARTA-4 (visible SOLO en pantallas md+, oculto en móviles para simplificar) */}
            <div className="flex flex-col top-[50%] left-[50%] translate-x-[10%] w-[300px] h-[200px] lg:w-[400px] lg:h-[300px] opacity-65 z-20 text-center items-center justify-center">
              <Image
                src="/images/fondo-carta-4.svg"
                alt="Fondo Carta 4"
                fill
                className="object-contain"
              />
            </div>
            <button className="bg-[#e3d6b5] text-black px-6 py-2 text-lg font-semibold shadow-md hover:bg-[#d6c3a2] transition-all rounded-xl mt-4 items-center my-0 mx-auto justify-center text-center">
              <a href="https://goo.su/4Nkqe" target="_blank">{t("boton")}</a>
            </button>
          </div>
          {/* INFORMACIÓN de contacto */}
          <div className="md:w-1/2 px-4 pb-16">
            <div className="md:grid md:grid-cols-2 gap-8">
              {/* Datos de contacto */}
              <div className="space-y-4 text-lg sm:text-xl lg:text-lg mb-4">
                <p className="flex items-center gap-3">
                  <FaPhoneAlt className="text-2xl text-black" />
                  <span className="font-medium">{t("telefono")}</span>
                </p>
                <p className="flex items-center gap-3">
                  <FaEnvelope className="text-2xl text-black" />
                  <span className="font-medium">{t("email")}</span>
                </p>
                <p className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-2xl text-black" />
                  <span className="font-medium">{t("direccion")}</span>
                </p>
              </div>

              {/* Redes sociales */}
              <div className="space-y-4 text-lg sm:text-xl lg:text-lg">
                <a
                  href="https://instagram.com/villavicunasalta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-gray-500 transition"
                >
                  <FaInstagram className="text-2xl text-black" />
                  <span className="font-medium">Villa Vicuña Salta</span>
                </a>
                <a
                  href="https://facebook.com/villavicunasalta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-gray-500 transition"
                >
                  <FaFacebookF className="text-2xl text-black" />
                  <span className="font-medium">Villa Vicuña Salta</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* FONDO-CARTA-4 (visible SOLO en pantallas md+, oculto en móviles para simplificar) */}
        <div className="hidden md:block absolute bottom-[45%] left-[75%] -translate-x-1/2 w-[300px] h-[200px] lg:w-[400px] lg:h-[300px] opacity-55 z-20">
          <Image
            src="/images/fondo-carta-4.svg"
            alt="Fondo Carta 4"
            fill
            className="object-contain"
          />
        </div>

        {/* BOTÓN en pantallas grandes (absoluto) */}
        <div className="hidden md:block absolute md:bottom-[35%] left-[73%] -translate-x-1/2 z-30">
          <button className="bg-[#e3d6b5] text-black px-10 py-4 text-2xl font-semibold shadow-md hover:bg-[#d6c3a2] transition-all rounded-xl">
            <a href="https://l.instagram.com/?u=https%3A%2F%2Fbit.ly%2FHotelVillaVicunaSalta%3Ffbclid%3DPAZXh0bgNhZW0CMTEAAaamd9CRPAuow6S4uxSlihGrS9YlCKqv1NJb6AKvkN9t-FrdzY0dV78iC_o_aem_uIWTqhxX6ty-fEk2j1ltuQ&e=AT3YvuML_9hdM51KtKLsk-0xSrMN9h8R4G7ARisMP6sFozHr3e8GbOYvNVMK4oThHsWuQS_5hDzlhSLzxLDW9OEykvBwXYaUVlojg1gYshfa-7PE7nk4gA" target="_blank">{t("boton")}</a>
          </button>
        </div>
      </div>
    </section>
  );
}
