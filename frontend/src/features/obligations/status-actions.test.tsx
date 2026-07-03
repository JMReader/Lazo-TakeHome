import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ObligationDetail } from "@/entities/obligation/types";
import { StatusActions } from "@/features/obligations/status-actions";

vi.mock("@/features/obligations/actions", () => ({
  statusTransitionAction: vi.fn(),
}));

const obligation: ObligationDetail = {
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
  submitBlockedReason: "document_required",
  version: 1,
  document: null,
  auditHistory: [],
};

describe("StatusActions", () => {
  it("renders backend available transitions and blocks submitted when backend omits it", () => {
    render(<StatusActions locale="en" obligation={obligation} />);

    expect(screen.getByRole("button", { name: "In progress" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submitted" })).not.toBeInTheDocument();
    expect(screen.getByText(/Submission blocked/)).toBeInTheDocument();
  });
});
