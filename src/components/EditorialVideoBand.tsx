import Reveal from "./Reveal";
import { videoSources } from "@/lib/videoSources";

/**
 * Banda a sangre completa con video de fondo y texto encima.
 *
 * Es el mismo recurso que ya usan las dos bandas de Experiencias (la cita de la
 * enóloga y el testimonio): fondo negro, video en `object-cover`, un velo
 * oscuro para que el texto se lea sobre cualquier fotograma, y el contenido
 * centrado por encima.
 *
 * El velo no es decorativo: sin él el contraste del texto depende de qué esté
 * pasando en el video en ese instante, que es justamente lo que no se puede
 * controlar.
 *
 * Va fuera del contenedor de 1200 px de PublicEditorialLayout (prop
 * `afterIntro`), porque la gracia de la banda es cortar el ancho de la página.
 */
export default function EditorialVideoBand({
  videoUrl,
  posterUrl = "/images/hero-poster.webp",
  text,
  caption,
}: {
  videoUrl?: string;
  posterUrl?: string;
  text: string;
  caption?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-black py-24 md:py-32">
      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={posterUrl}
        // Decorativo: el contenido real es el texto de encima, así que el
        // lector de pantalla no gana nada anunciando el video.
        aria-hidden="true"
      >
        {videoSources(videoUrl).map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative mx-auto max-w-3xl px-6 text-center md:px-10">
        <Reveal
          as="p"
          duration={1000}
          className="text-2xl italic leading-relaxed tracking-[0.06em] text-white md:text-3xl"
        >
          {text}
        </Reveal>
        {caption && (
          <Reveal
            as="p"
            delay={200}
            className="mt-8 text-xs uppercase tracking-[0.35em] text-white/70"
          >
            {caption}
          </Reveal>
        )}
      </div>
    </section>
  );
}
