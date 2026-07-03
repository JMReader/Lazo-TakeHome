import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ObligationDetail } from "@/entities/obligation/types";
import { ObligationDetailView } from "@/widgets/obligation-detail/detail-view";

vi.mock("@/features/obligations/delete-action", () => ({
  DeleteObligationButton: () => <button type="button">Delete obligation</button>,
}));

vi.mock("@/features/obligations/document-actions", () => ({
  DocumentAttachForm: () => <form aria-label="attach document" />,
  RemoveDocumentButton: () => <button type="button">Remove document</button>,
}));

vi.mock("@/features/obligations/status-actions", () => ({
  StatusActions: () => <div>status actions</div>,
}));

const obligation: ObligationDetail = {
  id: "obl_1",
  type: "annual_report",
  title: "Annual report",
  description: "Filed yearly.",
  status: "pending",
  dueDate: "2026-07-10",
  owner: "Ana",
  requiresDocument: true,
  hasDocument: false,
  companyTaxIdMasked: "***-**-1234",
  isOverdue: false,
  isDueSoon: false,
  availableTransitions: [],
  submitBlockedReason: null,
  version: 1,
  document: null,
  auditHistory: [],
};

describe("ObligationDetailView", () => {
  it("shows the masked tax id and does not expose a raw tax id", () => {
    render(<ObligationDetailView locale="en" obligation={obligation} />);

    expect(screen.getByText("***-**-1234")).toBeInTheDocument();
    expect(screen.queryByText("12-3456789")).not.toBeInTheDocument();
  });
});
