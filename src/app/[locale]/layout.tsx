// src/app/[locale]/layout.tsx
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import SwRegister from "@/components/SwRegister";
import { getStructuredData } from "@/lib/structuredData";
import "../../styles/globals.css";

/*─── CONFIG GENERAL ───────────────────────────────────────────*/
// Sin force-dynamic: el layout se cachea (ISR). Ver revalidate en page.tsx.
const BASE_URL = "https://villavicuna.com.ar"; // dominio del sitio
const FAV_VERSION = "20250730"; // cambia al actualizar favicon
const LOCALES = ["es", "en", "fr"] as const; // locales permitidos

/*─── METADATA (fuente única de verdad para el SEO, localizado) ─*/
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "website",
      siteName: "Hotel Villa Vicuña",
      title,
      description,
      url: `${BASE_URL}/${locale}`,
      locale,
      images: ["/opengraph.jpg"],
    },
    icons: {
      icon: `/favicon.ico?v=${FAV_VERSION}`,
      apple: `/apple-touch-icon.png?v=${FAV_VERSION}`,
    },
    other: {
      "facebook-domain-verification": "4ufy7e1ckl75tdmrfpqn7qcsqbtlmo",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/*─── LAYOUT ─────────────────────────────────────────────────*/
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: (typeof LOCALES)[number] };

  if (!LOCALES.includes(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages({ locale });
  const { hotel, faq } = await getStructuredData(locale);

  return (
    <html lang={locale}>
      <head>
        {/* Datos estructurados (GEO/SEO): Hotel + FAQ en JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(hotel) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
        />

        {/* Solo recursos que la Metadata API no maneja: preloads y preconexiones.
            El SEO (title, description, canonical, hreflang, OG, favicons) lo
            genera generateMetadata. */}

        {/* Preload crítico (above-the-fold) */}
        <link rel="preload" as="image" href="/images/hero-poster.webp" />
        <link
          rel="preload"
          as="image"
          href="/images/logo-villa-vicuna-2.svg"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="font"
          href="/fonts/cinzel.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          href="/fonts/montserrat.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          href="/fonts/monotype-cursiva.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          href="/fonts/migra.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Preconexiones para reducir latencia de terceros críticos */}
        <link
          rel="preconnect"
          href="https://static1.cloudbeds.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://static1.cloudbeds.com" />
        <link
          rel="preconnect"
          href="https://hotels.cloudbeds.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://hotels.cloudbeds.com" />
        <link
          rel="preconnect"
          href="https://clientstream.launchdarkly.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://clientstream.launchdarkly.com" />
        <link
          rel="preconnect"
          href="https://clientsdk.launchdarkly.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://clientsdk.launchdarkly.com" />
        <link
          rel="preconnect"
          href="https://www.clarity.ms"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
        <link
          rel="preconnect"
          href="https://www.googletagmanager.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        <Script
          id="ga4-external"
          src="https://www.googletagmanager.com/gtag/js?id=G-4QKFY4E0VW"
          strategy="afterInteractive"
        />
        <Script id="ga4-inline" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4QKFY4E0VW', { cookie_domain: 'villavicuna.com.ar' });
          `}
        </Script>

        {/* Clarity – menos crítico, lo mandamos a lazyOnload */}
        <Script id="ms-clarity" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "u847b35c9j");
          `}
        </Script>

        {/* Facebook Pixel – también lazyOnload para no pegarle tanto al main thread */}
        <Script id="fb-pixel" strategy="lazyOnload">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');

            fbq('init', '1303096650960204');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>

      <body>
        {/* Facebook Pixel (noscript): usar <img>, no <Image /> */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            alt="Facebook Pixel"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1303096650960204&ev=PageView&noscript=1"
          />
        </noscript>

        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>

        {/* Registro del Service Worker */}
        <SwRegister />
      </body>
    </html>
  );
}
