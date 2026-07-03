import { notFound } from "next/navigation";
import type { ObligationDetailResponse } from "@/entities/obligation/types";
import { ObligationForm } from "@/features/obligations/obligation-form";
import { getObligation } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import { isLocale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";

export const dynamic = "force-dynamic";

export default async function EditObligationPage({
  params,
}: {
  params: Promise<{ locale: string; obligationId: string }>;
}) {
  const { locale, obligationId } = await params;
  if (!isLocale(locale)) notFound();

  const response: ObligationDetailResponse | Error = await getObligation(
    obligationId,
  ).catch((error: unknown) =>
    error instanceof Error ? error : new Error("Unknown error"),
  );
  if (response instanceof Error) {
    const dictionary = getDictionary(locale);
    if (isApiError(response) && response.code === "OBLIGATION_NOT_FOUND") notFound();
    return (
      <Alert className="border-danger/50">
        <AlertTitle>{dictionary.errors.UNKNOWN}</AlertTitle>
        <AlertDescription>
          {isApiError(response)
            ? dictionary.errors[
                response.code in dictionary.errors
                  ? (response.code as keyof typeof dictionary.errors)
                  : "UNKNOWN"
              ]
            : dictionary.errors.UNKNOWN}
        </AlertDescription>
      </Alert>
    );
  }

  return <ObligationForm mode="edit" locale={locale} obligation={response.obligation} />;
}
