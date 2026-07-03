import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ObligationListItem } from "@/entities/obligation/types";
import { RiskBadges, StatusBadge } from "@/entities/obligation/ui";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { formatDate } from "@/shared/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Empty, EmptyDescription, EmptyTitle } from "@/shared/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { DashboardFilterBar } from "@/widgets/dashboard/filter-bar";
import {
  deriveKpis,
  filterObligations,
  type DashboardFilters,
} from "@/widgets/dashboard/model";

export function DashboardView({
  locale,
  items,
  filters,
}: {
  locale: Locale;
  items: ObligationListItem[];
  filters: DashboardFilters;
}) {
  const dictionary = getDictionary(locale);
  const kpis = deriveKpis(items);
  const filteredItems = filterObligations(items, filters);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">
            {dictionary.app.title}
          </h1>
          <p className="mt-1 text-sm text-secondary-text">
            {dictionary.app.subtitle}
          </p>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        <KpiCard label={dictionary.dashboard.total} value={kpis.total} />
        <KpiCard
          label={dictionary.dashboard.overdue}
          value={kpis.overdue}
          tone="danger"
        />
        <KpiCard
          label={dictionary.dashboard.dueSoon}
          value={kpis.dueSoon}
          tone="warning"
        />
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.dashboard.byStatus}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(kpis.byStatus).map(([status, count]) => (
              <span key={status} className="text-sm text-secondary-text">
                {dictionary.status[status as keyof typeof kpis.byStatus]}{" "}
                <strong className="text-primary-text">{count}</strong>
              </span>
            ))}
          </CardContent>
        </Card>
      </section>

      <DashboardFilterBar locale={locale} filters={filters} />

      {items.length === 0 ? (
        <Empty>
          <div>
            <EmptyTitle>{dictionary.dashboard.noObligations}</EmptyTitle>
            <EmptyDescription>
              {dictionary.dashboard.noObligationsDescription}
            </EmptyDescription>
          </div>
        </Empty>
      ) : filteredItems.length === 0 ? (
        <Empty>
          <div>
            <EmptyTitle>{dictionary.dashboard.noMatches}</EmptyTitle>
            <EmptyDescription>
              {dictionary.dashboard.noMatchesDescription}
            </EmptyDescription>
          </div>
        </Empty>
      ) : (
        <ObligationsTable locale={locale} items={filteredItems} />
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "danger" | "warning";
}) {
  const toneClass =
    tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "";
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-secondary-text">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-semibold ${toneClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function ObligationsTable({
  locale,
  items,
}: {
  locale: Locale;
  items: ObligationListItem[];
}) {
  const dictionary = getDictionary(locale);
  return (
    <Card>
      <Table className="min-w-[56rem]" aria-label={dictionary.app.title}>
        <TableHeader>
          <TableRow>
            <TableHead>{dictionary.dashboard.title}</TableHead>
            <TableHead>{dictionary.dashboard.status}</TableHead>
            <TableHead>{dictionary.dashboard.type}</TableHead>
            <TableHead>{dictionary.dashboard.owner}</TableHead>
            <TableHead>{dictionary.dashboard.dueDate}</TableHead>
            <TableHead>{dictionary.dashboard.document}</TableHead>
            <TableHead className="text-right">{dictionary.dashboard.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              className={
                item.isOverdue
                  ? "bg-danger/5"
                  : item.isDueSoon
                    ? "bg-warning/5"
                    : undefined
              }
            >
              <TableCell>
                <div className="grid gap-1">
                  <span className="font-medium">{item.title}</span>
                  <RiskBadges item={item} locale={locale} />
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} locale={locale} />
              </TableCell>
              <TableCell>{dictionary.type[item.type]}</TableCell>
              <TableCell>{item.owner}</TableCell>
              <TableCell>{formatDate(item.dueDate, locale)}</TableCell>
              <TableCell>
                {item.hasDocument ? dictionary.app.yes : dictionary.app.no}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/${locale}/obligations/${item.id}`}>
                    <ArrowRight />
                    {dictionary.app.detail}
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export function DashboardApiError({
  locale,
  message,
}: {
  locale: Locale;
  message: string;
}) {
  const dictionary = getDictionary(locale);
  return (
    <Alert className="border-danger/50">
      <AlertTitle>{dictionary.dashboard.apiErrorTitle}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
