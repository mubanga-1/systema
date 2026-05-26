import { setRequestLocale } from 'next-intl/server';
import { HomeCarousel } from '@/components/HomeCarousel';

export default async function HomePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <HomeCarousel />
  );
}
