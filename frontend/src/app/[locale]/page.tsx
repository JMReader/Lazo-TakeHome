import { listObligations } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import { isLocale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { DashboardApiError, DashboardView } from "@/widgets/dashboard/dashboard";
import { filtersFromSearchParams } from "@/widgets/dashboard/model";
import { notFound } from "next/navigation";
import type { ObligationListResponse } from "@/entities/obligation/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const resolvedSearchParams = await searchParams;

  const response: ObligationListResponse | Error = await listObligations().catch(
    (error: unknown) => (error instanceof Error ? error : new Error("Unknown error")),
  );
  if (response instanceof Error) {
    const dictionary = getDictionary(locale);
    const message = isApiError(response)
      ? dictionary.errors[
          response.code in dictionary.errors
            ? (response.code as keyof typeof dictionary.errors)
            : "UNKNOWN"
        ]
      : dictionary.errors.UNKNOWN;
    return <DashboardApiError locale={locale} message={message} />;
  }

  return (
    <DashboardView
      locale={locale}
      items={response.obligations}
      filters={filtersFromSearchParams(resolvedSearchParams)}
    />
  );
}
