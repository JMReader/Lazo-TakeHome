import type {
  ObligationListItem,
  ObligationStatus,
  ObligationType,
} from "@/entities/obligation/types";
import { obligationStatuses } from "@/entities/obligation/types";

export type DueFilter = "all" | "overdue" | "due_soon" | "upcoming_or_active";

export type DashboardFilters = {
  status: ObligationStatus | "all";
  type: ObligationType | "all";
  due: DueFilter;
  query: string;
};

export type DashboardKpis = {
  total: number;
  overdue: number;
  dueSoon: number;
  byStatus: Record<ObligationStatus, number>;
};

export function deriveKpis(items: ObligationListItem[]): DashboardKpis {
  const byStatus = Object.fromEntries(
    obligationStatuses.map((status) => [status, 0]),
  ) as Record<ObligationStatus, number>;

  for (const item of items) {
    byStatus[item.status] += 1;
  }

  return {
    total: items.length,
    overdue: items.filter((item) => item.isOverdue).length,
    dueSoon: items.filter((item) => item.isDueSoon).length,
    byStatus,
  };
}

export function sortByDueDate(items: ObligationListItem[]) {
  return [...items].sort((left, right) =>
    left.dueDate.localeCompare(right.dueDate),
  );
}

export function filterObligations(
  items: ObligationListItem[],
  filters: DashboardFilters,
) {
  const query = filters.query.trim().toLowerCase();
  return sortByDueDate(
    items.filter((item) => {
      if (filters.status !== "all" && item.status !== filters.status) return false;
      if (filters.type !== "all" && item.type !== filters.type) return false;
      if (filters.due === "overdue" && !item.isOverdue) return false;
      if (filters.due === "due_soon" && !item.isDueSoon) return false;
      if (
        filters.due === "upcoming_or_active" &&
        (item.isOverdue || item.isDueSoon)
      ) {
        return false;
      }
      if (!query) return true;
      return (
        item.title.toLowerCase().includes(query) ||
        item.owner.toLowerCase().includes(query)
      );
    }),
  );
}

export function filtersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): DashboardFilters {
  const status = stringParam(searchParams.status);
  const type = stringParam(searchParams.type);
  const due = stringParam(searchParams.due);

  return {
    status: isStatusFilter(status) ? status : "all",
    type: isTypeFilter(type) ? type : "all",
    due: isDueFilter(due) ? due : "all",
    query: stringParam(searchParams.query) ?? "",
  };
}

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isStatusFilter(value: string | undefined): value is DashboardFilters["status"] {
  return value === "all" || obligationStatuses.includes(value as ObligationStatus);
}

function isTypeFilter(value: string | undefined): value is DashboardFilters["type"] {
  return (
    value === "all" ||
    value === "annual_report" ||
    value === "franchise_tax" ||
    value === "boi_report" ||
    value === "registered_agent_renewal"
  );
}

function isDueFilter(value: string | undefined): value is DueFilter {
  return (
    value === "all" ||
    value === "overdue" ||
    value === "due_soon" ||
    value === "upcoming_or_active"
  );
}
