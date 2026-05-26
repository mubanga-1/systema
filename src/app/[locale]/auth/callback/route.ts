import { createClient } from '@utils/supabase/server';
import { routing } from '@/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string }> }
) {
  const { locale: localeParam } = await context.params;
  const locale = routing.locales.includes(localeParam as 'ru' | 'en')
    ? localeParam
    : routing.defaultLocale;

  const code = request.nextUrl.searchParams.get('code');
  const next = request.nextUrl.searchParams.get('next') ?? 'checkout';
  const nextPath = next.startsWith('/') ? next : `/${next}`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(
        new URL(`/${locale}${nextPath}`, request.url)
      );
    }
  }

  return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
}
