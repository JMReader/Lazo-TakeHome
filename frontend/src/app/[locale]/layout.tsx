import { notFound } from "next/navigation";
import { isLocale } from "@/shared/i18n/config";
import { AppShell } from "@/widgets/app-shell/app-shell";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AppShell locale={locale}>{children}</AppShell>;
}
