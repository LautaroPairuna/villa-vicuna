// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import "../../styles/globals.css";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!routing.locales.includes(locale as "es" | "en" | "fr")) {
    notFound();
  }

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        {/* Meta tags importantes para el renderizado */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Preload de la imagen crítica (poster del hero) */}
        <link rel="preload" as="image" href="/images/hero-poster.jpg" />
        {/* Puedes agregar otros recursos críticos aquí */}
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
