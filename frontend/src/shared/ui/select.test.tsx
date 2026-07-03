import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

describe("Select", () => {
  it("renders content with popper positioning below the trigger", () => {
    render(
      <Select defaultValue="all" open>
        <SelectTrigger aria-label="Status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(screen.getByRole("option", { name: "All" })).toBeInTheDocument();
    const content = screen.getByRole("listbox");

    expect(content).toHaveAttribute("data-side", "bottom");
    expect(content.className).toContain("min-w-[var(--radix-select-trigger-width)]");
  });
});
