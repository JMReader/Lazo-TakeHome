import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  isVersionConflictState,
  VersionConflictDialog,
} from "@/features/obligations/version-conflict-dialog";

const navigation = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: navigation.refresh }),
}));

describe("VersionConflictDialog", () => {
  beforeEach(() => {
    navigation.refresh.mockClear();
  });

  it("detects optimistic-locking conflicts by API code", () => {
    expect(
      isVersionConflictState({
        status: "error",
        errorCode: "OBLIGATION_VERSION_CONFLICT",
        message: "Conflict",
        fieldErrors: {},
      }),
    ).toBe(true);

    expect(
      isVersionConflictState({
        status: "error",
        errorCode: "VALIDATION_ERROR",
        message: "Invalid",
        fieldErrors: {},
      }),
    ).toBe(false);
  });

  it("shows a refresh popup when the obligation has a newer version", async () => {
    const user = userEvent.setup();

    render(
      <VersionConflictDialog locale="en" />,
    );

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("A newer version is available")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Refresh obligation/ }));

    expect(navigation.refresh).toHaveBeenCalledTimes(1);
  });
});
