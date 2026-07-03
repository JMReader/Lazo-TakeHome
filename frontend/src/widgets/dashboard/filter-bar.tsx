"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
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
  const [query, setQuery] = useState(filters.query);
  const [, startTransition] = useTransition();

  const setFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const nextQuery = params.toString();
    startTransition(() => {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    });
  }, [pathname, router, searchParams, startTransition]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (query !== filters.query) setFilter("query", query);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [filters.query, query, setFilter]);

  return (
    <div className="grid gap-3 rounded-lg border bg-surface p-4 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
      <label className="relative block">
        <span className="sr-only">{dictionary.dashboard.query}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary-text" />
        <Input
          placeholder={dictionary.dashboard.query}
          className="pl-9"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
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
