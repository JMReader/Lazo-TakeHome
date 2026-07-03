import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "@/widgets/app-shell/theme-toggle";

const setTheme = vi.fn();
let resolvedTheme = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme,
    setTheme,
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    resolvedTheme = "light";
    setTheme.mockClear();
  });

  it("toggles from light to dark through next-themes", async () => {
    render(<ThemeToggle label="Theme" />);

    await userEvent.click(screen.getByRole("button", { name: "Theme" }));

    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("toggles from dark to light through next-themes", async () => {
    resolvedTheme = "dark";
    render(<ThemeToggle label="Theme" />);

    await userEvent.click(screen.getByRole("button", { name: "Theme" }));

    expect(setTheme).toHaveBeenCalledWith("light");
  });
});
