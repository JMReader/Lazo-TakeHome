import { describe, expect, it, vi } from "vitest";
import { obligationFormSchema, todayDateString } from "@/features/obligations/schemas";

describe("obligation schemas", () => {
  it("rejects due dates in the past for create UX validation", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 3));

    const parsed = obligationFormSchema.safeParse({
      type: "annual_report",
      title: "Annual report",
      description: "",
      dueDate: "2026-07-02",
      owner: "Ana",
      requiresDocument: false,
      companyTaxId: "12-3456789",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("notPastDate");
    }
    expect(todayDateString()).toBe("2026-07-03");

    vi.useRealTimers();
  });
});
