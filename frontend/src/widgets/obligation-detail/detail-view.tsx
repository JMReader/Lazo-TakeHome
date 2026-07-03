import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import type { ObligationDetail } from "@/entities/obligation/types";
import { RiskBadges, StatusBadge } from "@/entities/obligation/ui";
import { DeleteObligationButton } from "@/features/obligations/delete-action";
import {
  DocumentAttachForm,
  RemoveDocumentButton,
} from "@/features/obligations/document-actions";
import { StatusActions } from "@/features/obligations/status-actions";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { formatBytes, formatDate, formatDateTime } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Empty, EmptyDescription, EmptyTitle } from "@/shared/ui/empty";

export function ObligationDetailView({
  locale,
  obligation,
}: {
  locale: Locale;
  obligation: ObligationDetail;
}) {
  const dictionary = getDictionary(locale);
  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="grid gap-3">
          <Button asChild variant="ghost" size="sm" className="w-fit">
            <Link href={`/${locale}`}>
              <ArrowLeft />
              {dictionary.app.back}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{obligation.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status={obligation.status} locale={locale} />
              <RiskBadges item={obligation} locale={locale} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/${locale}/obligations/${obligation.id}/edit`}>
              <Pencil />
              {dictionary.app.edit}
            </Link>
          </Button>
          <DeleteObligationButton locale={locale} obligationId={obligation.id} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.detail.summary}</CardTitle>
              <CardDescription>{dictionary.type[obligation.type]}</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 md:grid-cols-2">
                <Field label={dictionary.detail.description} value={obligation.description || "-"} />
                <Field label={dictionary.dashboard.owner} value={obligation.owner} />
                <Field
                  label={dictionary.dashboard.dueDate}
                  value={formatDate(obligation.dueDate, locale)}
                />
                <Field label={dictionary.detail.taxId} value={obligation.companyTaxIdMasked} />
                <Field
                  label={dictionary.detail.requiresDocument}
                  value={obligation.requiresDocument ? dictionary.app.yes : dictionary.app.no}
                />
                <Field
                  label={dictionary.detail.hasDocument}
                  value={obligation.hasDocument ? dictionary.app.yes : dictionary.app.no}
                />
                <Field
                  label={dictionary.detail.version}
                  value={String(obligation.version)}
                />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{dictionary.detail.documentMetadata}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              {obligation.document ? (
                <div className="grid gap-4">
                  <dl className="grid gap-4 md:grid-cols-2">
                    <Field label={dictionary.form.fileName} value={obligation.document.fileName} />
                    <Field label={dictionary.form.contentType} value={obligation.document.contentType} />
                    <Field
                      label={dictionary.form.sizeBytes}
                      value={formatBytes(obligation.document.sizeBytes, locale)}
                    />
                    <Field label={dictionary.form.storageKey} value={obligation.document.storageKey || "-"} />
                    <Field
                      label={dictionary.detail.changedAt}
                      value={formatDateTime(obligation.document.uploadedAt, locale)}
                    />
                    <Field label={dictionary.detail.changedBy} value={obligation.document.uploadedBy} />
                  </dl>
                  <RemoveDocumentButton
                    locale={locale}
                    obligationId={obligation.id}
                    version={obligation.version}
                  />
                </div>
              ) : (
                <Empty className="min-h-32">
                  <div>
                    <EmptyTitle>{dictionary.detail.noDocument}</EmptyTitle>
                    <EmptyDescription>
                      {obligation.requiresDocument
                        ? dictionary.errors.DOCUMENT_REQUIRED_FOR_SUBMISSION
                        : dictionary.detail.noDocument}
                    </EmptyDescription>
                  </div>
                </Empty>
              )}
              <DocumentAttachForm
                locale={locale}
                obligationId={obligation.id}
                version={obligation.version}
                hasDocument={Boolean(obligation.document)}
              />
            </CardContent>
          </Card>

          <Card>
            <details>
              <summary className="cursor-pointer list-none rounded-t-lg px-6 py-5">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{dictionary.detail.audit}</CardTitle>
                  <span className="rounded-full border px-2 py-1 text-xs text-secondary-text">
                    {obligation.auditHistory.length} {dictionary.detail.auditEvents}
                  </span>
                </div>
              </summary>
              <CardContent>
                {obligation.auditHistory.length === 0 ? (
                  <p className="text-sm text-secondary-text">{dictionary.detail.noAudit}</p>
                ) : (
                  <ol className="grid gap-3">
                    {obligation.auditHistory.map((event) => (
                      <li key={event.id} className="rounded-md border bg-surface p-4">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-medium">
                            {event.fromStatus
                              ? dictionary.status[event.fromStatus]
                              : "-"}{" "}
                            {"->"} {dictionary.status[event.toStatus]}
                          </span>
                          <span className="text-secondary-text">
                            {formatDateTime(event.changedAt, locale)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-secondary-text">
                          {dictionary.detail.changedBy}: {event.changedBy} -{" "}
                          {dictionary.detail.version}: {event.obligationVersion}
                        </p>
                        {event.reason ? (
                          <p className="mt-2 text-sm">{event.reason}</p>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </details>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{dictionary.detail.transitions}</CardTitle>
            <CardDescription>
              {obligation.availableTransitions.length > 0
                ? obligation.availableTransitions
                    .map((status) => dictionary.status[status])
                    .join(", ")
                : dictionary.detail.noTransitions}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusActions locale={locale} obligation={obligation} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-secondary-text">{label}</dt>
      <dd className="mt-1 text-sm text-primary-text">{value}</dd>
    </div>
  );
}
