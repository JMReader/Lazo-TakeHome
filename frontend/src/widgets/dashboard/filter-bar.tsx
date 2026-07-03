"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { obligationStatuses, obligationTypes } from "@/entities/obligation/types";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { DashboardFilters, DueFilter } from "@/widgets/dashboard/model";

const dueFilters: DueFilter[] = ["all", "overdue", "due_soon", "upcoming_or_active"];

export function DashboardFilterBar({
  locale,
  filters,
}: {
  locale: Locale;
  filters: DashboardFilters;
}) {
  const dictionary = getDictionary(locale);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="grid gap-3 rounded-lg border bg-surface p-4 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
      <label className="relative block">
        <span className="sr-only">{dictionary.dashboard.query}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary-text" />
        <Input
          defaultValue={filters.query}
          placeholder={dictionary.dashboard.query}
          className="pl-9"
          onChange={(event) => setFilter("query", event.target.value)}
        />
      </label>
      <Select
        value={filters.status}
        onValueChange={(value) => setFilter("status", value)}
      >
        <SelectTrigger aria-label={dictionary.dashboard.status}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{dictionary.dashboard.all}</SelectItem>
          {obligationStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              {dictionary.status[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.type} onValueChange={(value) => setFilter("type", value)}>
        <SelectTrigger aria-label={dictionary.dashboard.type}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{dictionary.dashboard.all}</SelectItem>
          {obligationTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {dictionary.type[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.due} onValueChange={(value) => setFilter("due", value)}>
        <SelectTrigger aria-label={dictionary.dashboard.due}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {dueFilters.map((due) => (
            <SelectItem key={due} value={due}>
              {due === "all"
                ? dictionary.dashboard.all
                : due === "overdue"
                  ? dictionary.dashboard.overdue
                  : due === "due_soon"
                    ? dictionary.dashboard.dueSoon
                    : dictionary.dashboard.upcomingOrActive}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
