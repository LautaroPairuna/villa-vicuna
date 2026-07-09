import Image from "next/image";
import Link from "next/link";
import Navbar from "./Navbar";
import FloatingEditorialActions from "./FloatingEditorialActions";
import {
  editorialBody,
  editorialEyebrow,
  editorialPrimaryButton,
  editorialSecondaryButton,
} from "./editorialUi";

const RESERVATION_URL = "https://hotels.cloudbeds.com/reservation/pwSXnD";

export default function PublicEditorialLayout({
  eyebrow,
  title,
  description,
  children,
  topHero,
  hideIntro = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  topHero?: React.ReactNode;
  hideIntro?: boolean;
}) {
  return (
    <>
      <Navbar />
      <main className={`min-h-screen bg-white pb-16 text-black ${topHero ? "" : "pt-20"}`}>
        {topHero}

        {!hideIntro && (
          <section className="relative overflow-hidden bg-white px-4 py-14 md:px-12 md:py-18">
            <div className="pointer-events-none absolute left-1/2 top-10 h-[320px] w-[320px] -translate-x-1/2 opacity-55 sm:h-[420px] sm:w-[420px] lg:top-0 lg:h-[620px] lg:w-[780px]">
              <Image
                src="/images/fondo-carta-2.svg"
                alt=""
                fill
                className="object-contain"
              />
            </div>
            <div className="relative mx-auto max-w-[1200px]">
              <p className={`text-center ${editorialEyebrow}`}>{eyebrow}</p>
              <h1 className="mx-auto mt-6 max-w-5xl text-center text-4xl uppercase tracking-[0.2em] text-black sm:text-5xl lg:text-[4.3rem] lg:leading-[1.15]">
                {title}
              </h1>
              <p className={`mx-auto mt-8 max-w-3xl text-center ${editorialBody}`}>
                {description}
              </p>
            </div>
          </section>
        )}

        <div className="mx-auto max-w-[1200px] px-4 md:px-12">
          <div className={`${hideIntro ? "mt-14" : "mt-8"}`}>{children}</div>

          <section className="relative mt-16 overflow-hidden bg-white px-6 py-10 md:px-10 md:py-14">
            <div className="pointer-events-none absolute bottom-[-8%] right-[-6%] h-[220px] w-[220px] opacity-60 sm:h-[320px] sm:w-[320px] lg:h-[420px] lg:w-[560px]">
              <Image
                src="/images/fondo-carta-6.svg"
                alt=""
                fill
                className="object-contain"
              />
            </div>
            <div className="relative max-w-4xl">
              <p className={editorialEyebrow}>Villa Vicuña</p>
              <h2 className="mt-5 text-3xl uppercase tracking-[0.2em] text-black md:text-5xl md:leading-[1.2]">
                Hospedate en el corazón de Salta Capital
              </h2>
              <p className={`mt-5 max-w-3xl ${editorialBody}`}>
                Combiná estas experiencias con una estadía en Villa Vicuña, a pasos del centro histórico
                y con acceso rápido a los principales paseos de la ciudad.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/" className={editorialSecondaryButton}>
                  Conocer el hotel
                </Link>
                <a
                  href={RESERVATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={editorialPrimaryButton}
                >
                  Reservar
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <FloatingEditorialActions />
    </>
  );
}
