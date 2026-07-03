import { notFound } from "next/navigation";
import { isLocale } from "@/shared/i18n/config";
import { ObligationForm } from "@/features/obligations/obligation-form";

export default async function NewObligationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <ObligationForm mode="create" locale={locale} />;
}
