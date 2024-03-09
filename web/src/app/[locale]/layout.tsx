import "./globals.css";

import { Inter } from "next/font/google";
import {NextIntlClientProvider, useMessages} from 'next-intl';
import {getTranslations, unstable_setRequestLocale} from 'next-intl/server';
import {useTranslations} from "next-intl";
import {ReactNode} from 'react';
import {locales, defaultLocale} from "@/i18n";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export function generateStaticParams() {
  return locales.map((locale: any) => ({locale}));
}

export async function generateMetadata({
  params: {locale}
}: Omit<Props, 'children'>) {
  const t = await getTranslations({locale, namespace: 'layout'});

  return {
    title: t("title")
  };
}


export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
  params: {locale}
}: Props) {
  // Enable static rendering
  unstable_setRequestLocale(locale);
  // Receive messages provided in `i18n.ts`
  const messages = useMessages();

  // const t = useTranslations('Index');
  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} font-sans text-default bg-background`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
