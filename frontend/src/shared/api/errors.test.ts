import { describe, expect, it } from "vitest";
import { fieldErrorsFromDetails } from "@/shared/api/errors";

describe("fieldErrorsFromDetails", () => {
  it("maps structured API validation errors to form field names", () => {
    expect(
      fieldErrorsFromDetails({
        errors: [
          { loc: ["body", "due_date"], msg: "notPastDate", type: "value_error" },
          { loc: ["body", "company_tax_id"], msg: "required", type: "missing" },
        ],
      }),
    ).toEqual({
      dueDate: "notPastDate",
      companyTaxId: "required",
    });
  });
});
