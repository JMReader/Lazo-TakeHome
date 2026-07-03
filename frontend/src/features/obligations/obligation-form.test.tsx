import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ObligationDetail } from "@/entities/obligation/types";
import { ObligationForm } from "@/features/obligations/obligation-form";

vi.mock("@/features/obligations/actions", () => ({
  createObligationAction: vi.fn(),
  editObligationAction: vi.fn(),
}));

const obligation: ObligationDetail = {
  id: "obl_1",
  type: "annual_report",
  title: "Annual report",
  description: "",
  status: "pending",
  dueDate: "2026-07-10",
  owner: "Ana",
  requiresDocument: false,
  hasDocument: false,
  companyTaxIdMasked: "***-**-1234",
  isOverdue: false,
  isDueSoon: false,
  availableTransitions: [],
  submitBlockedReason: null,
  version: 3,
  document: null,
  auditHistory: [],
};

describe("ObligationForm", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not expose workflow status in create or edit forms", () => {
    const { rerender } = render(<ObligationForm mode="create" locale="en" />);
    expect(screen.queryByLabelText("Status")).not.toBeInTheDocument();

    rerender(<ObligationForm mode="edit" locale="en" obligation={obligation} />);
    expect(screen.queryByLabelText("Status")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("3")).toHaveAttribute("name", "expectedVersion");
  });

  it("prevents selecting a past due date in the date control", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 3));

    render(<ObligationForm mode="create" locale="en" />);

    expect(screen.getByLabelText("Due date")).toHaveAttribute("min", "2026-07-03");
  });
});
