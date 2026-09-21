import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import Navbar from "@/components/Navbar";
import FloatingEditorialActions from "@/components/FloatingEditorialActions";
import Reveal from "@/components/Reveal";
import {
  editorialBody,
  editorialEyebrow,
  editorialPrimaryButton,
  editorialSecondaryButton,
} from "@/components/editorialUi";

// Sin locale en los props: not-found.tsx no lo recibe de forma confiable en
// el App Router. Se toma del request (setRequestLocale ya corrió en
// [locale]/layout.tsx, que envuelve esta página).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notFound");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations("notFound");

  const homeHref = locale === "es" ? "/" : `/${locale}`;
  const promocionesHref = locale === "es" ? "/promociones" : `/${locale}/promociones`;

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden bg-white pb-16 pt-20 text-black">
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 opacity-40 sm:h-[480px] sm:w-[480px] lg:h-[620px] lg:w-[620px]">
          <Image src="/images/fondo-carta-4.svg" alt="" fill className="object-contain" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
          <Reveal as="p" className={editorialEyebrow}>
            {t("eyebrow")}
          </Reveal>
          <Reveal
            as="h1"
            delay={100}
            duration={900}
            className="mt-6 text-4xl uppercase tracking-[0.2em] text-black sm:text-5xl lg:text-6xl lg:leading-[1.15]"
          >
            {t("titulo")}
          </Reveal>
          <Reveal as="p" delay={220} className={`mt-8 max-w-xl ${editorialBody}`}>
            {t("descripcion")}
          </Reveal>
          <Reveal delay={320} className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href={homeHref} className={editorialPrimaryButton}>
              {t("ctaHome")}
            </Link>
            <Link href={promocionesHref} className={editorialSecondaryButton}>
              {t("ctaPromociones")}
            </Link>
          </Reveal>
        </div>
      </main>
      <FloatingEditorialActions />
    </>
  );
}
