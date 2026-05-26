import { initLogging } from '@/utils/logger';

initLogging();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
