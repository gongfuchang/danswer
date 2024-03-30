import "../globals.css";

import {NextIntlClientProvider, useMessages} from 'next-intl';
import {getTranslations, unstable_setRequestLocale} from 'next-intl/server';
import {ReactNode} from 'react';
import {locales, defaultLocale} from "@/i18n";


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
    title: t("title"),
    icons: {
      icon: '/favicon.ico',
    },    
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

  return (
    <html lang={locale}>
      <body
        className={`font-sans text-default bg-[url('/bg.svg')]`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
