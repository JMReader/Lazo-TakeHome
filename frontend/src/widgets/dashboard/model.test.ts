import { describe, expect, it } from "vitest";
import type { ObligationListItem } from "@/entities/obligation/types";
import { deriveKpis, filterObligations } from "@/widgets/dashboard/model";

const base: ObligationListItem = {
  id: "obl_1",
  type: "annual_report",
  title: "Annual report",
  description: "",
  status: "pending",
  dueDate: "2026-07-10",
  owner: "Ana",
  requiresDocument: true,
  hasDocument: false,
  companyTaxIdMasked: "***-**-1234",
  isOverdue: false,
  isDueSoon: false,
  availableTransitions: ["in_progress"],
  submitBlockedReason: null,
  version: 1,
};

describe("dashboard model", () => {
  it("derives KPIs only from backend-provided flags and statuses", () => {
    const kpis = deriveKpis([
      { ...base, id: "1", status: "pending", isOverdue: true },
      { ...base, id: "2", status: "done", isDueSoon: true },
      { ...base, id: "3", status: "done" },
    ]);

    expect(kpis.total).toBe(3);
    expect(kpis.overdue).toBe(1);
    expect(kpis.dueSoon).toBe(1);
    expect(kpis.byStatus.pending).toBe(1);
    expect(kpis.byStatus.done).toBe(2);
  });

  it("filters constrained fields and free-text title or owner, then sorts by due date", () => {
    const result = filterObligations(
      [
        { ...base, id: "late", title: "Franchise", type: "franchise_tax", dueDate: "2026-07-20", owner: "Maria" },
        { ...base, id: "first", title: "BOI", type: "boi_report", dueDate: "2026-07-01", owner: "Carlos", isDueSoon: true },
        { ...base, id: "second", title: "Annual", type: "annual_report", dueDate: "2026-07-15", owner: "Ana", isDueSoon: true },
      ],
      {
        status: "all",
        type: "all",
        due: "due_soon",
        query: "a",
      },
    );

    expect(result.map((item) => item.id)).toEqual(["first", "second"]);
  });

  it("keeps upcoming active filter limited to non-overdue active statuses", () => {
    const result = filterObligations(
      [
        { ...base, id: "pending", status: "pending", dueDate: "2026-07-20" },
        { ...base, id: "progress", status: "in_progress", dueDate: "2026-07-21" },
        { ...base, id: "submitted", status: "submitted", dueDate: "2026-07-22" },
        { ...base, id: "done", status: "done", dueDate: "2026-07-23" },
        { ...base, id: "overdue", status: "pending", isOverdue: true },
      ],
      {
        status: "all",
        type: "all",
        due: "upcoming_or_active",
        query: "",
      },
    );

    expect(result.map((item) => item.id)).toEqual(["pending", "progress"]);
  });
});
