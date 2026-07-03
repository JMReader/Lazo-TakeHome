import type { ObligationListItem, ObligationStatus } from "@/entities/obligation/types";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { Badge } from "@/shared/ui/badge";

export function StatusBadge({
  status,
  locale,
}: {
  status: ObligationStatus;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const variant =
    status === "in_progress"
      ? "inProgress"
      : status === "submitted"
        ? "submitted"
        : status === "done"
          ? "done"
          : "pending";

  return <Badge variant={variant}>{dictionary.status[status]}</Badge>;
}

export function RiskBadges({
  item,
  locale,
}: {
  item: Pick<ObligationListItem, "isOverdue" | "isDueSoon">;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  return (
    <span className="flex flex-wrap gap-2">
      {item.isOverdue ? (
        <Badge variant="overdue">{dictionary.dashboard.overdue}</Badge>
      ) : null}
      {item.isDueSoon ? (
        <Badge variant="dueSoon">{dictionary.dashboard.dueSoon}</Badge>
      ) : null}
    </span>
  );
}
