import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DocumentAttachForm,
  RemoveDocumentButton,
} from "@/features/obligations/document-actions";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/features/obligations/actions", () => ({
  attachDocumentAction: vi.fn(),
  removeDocumentAction: vi.fn(),
}));

describe("DocumentAttachForm", () => {
  beforeEach(() => {
    HTMLFormElement.prototype.requestSubmit = vi.fn();
  });

  it("attaches metadata derived from a selected local file", () => {
    render(
      <DocumentAttachForm
        locale="en"
        obligationId="obl_1"
        version={7}
        hasDocument={false}
      />,
    );

    expect(screen.queryByLabelText("File name")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Content type")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Size in bytes")).not.toBeInTheDocument();

    const file = new File(["hello"], "evidence.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(screen.getByLabelText("Choose a document from your computer"), {
      target: { files: [file] },
    });

    expect(screen.getByDisplayValue("evidence.pdf")).toHaveAttribute(
      "name",
      "fileName",
    );
    expect(screen.getByDisplayValue("application/pdf")).toHaveAttribute(
      "name",
      "contentType",
    );
    expect(screen.getByDisplayValue(String(file.size))).toHaveAttribute(
      "name",
      "sizeBytes",
    );
    expect(HTMLFormElement.prototype.requestSubmit).toHaveBeenCalled();
  });

  it("requires confirmation before replacing existing document metadata", () => {
    render(
      <DocumentAttachForm
        locale="en"
        obligationId="obl_1"
        version={7}
        hasDocument
      />,
    );

    const file = new File(["hello"], "replacement.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(screen.getByLabelText("Choose a document from your computer"), {
      target: { files: [file] },
    });

    expect(HTMLFormElement.prototype.requestSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Replace document metadata?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Replace document metadata" }));

    expect(HTMLFormElement.prototype.requestSubmit).toHaveBeenCalled();
  });
});

describe("RemoveDocumentButton", () => {
  it("asks for confirmation and submits the expected version", () => {
    HTMLFormElement.prototype.requestSubmit = vi.fn();
    render(
      <RemoveDocumentButton
        locale="en"
        obligationId="obl_1"
        version={9}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove document" }));

    expect(screen.getByText("This removes the document metadata from the obligation.")).toBeInTheDocument();
    const expectedVersion = document.querySelector(
      'input[name="expectedVersion"]',
    );
    expect(expectedVersion).toHaveValue("9");
    fireEvent.click(screen.getAllByRole("button", { name: "Remove document" }).at(-1)!);

    expect(HTMLFormElement.prototype.requestSubmit).toHaveBeenCalled();
  });
});
