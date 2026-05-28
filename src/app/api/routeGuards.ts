export function hasValidCronSecret(request: Request) {
  const secret = process.env.NOW_PAYMENTS_CRON_SECRET;

  if (!secret) {
    return false;
  }

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const headerSecret = request.headers.get('x-cron-secret');

  return bearer === secret || headerSecret === secret;
}
