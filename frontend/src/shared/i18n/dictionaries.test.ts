import { describe, expect, it } from "vitest";
import { obligationStatuses, obligationTypes } from "@/entities/obligation/types";
import { knownApiErrorCodes } from "@/shared/api/errors";
import { dictionaries } from "@/shared/i18n/dictionaries";

describe("dictionaries", () => {
  it("covers statuses, types, known errors, and dashboard labels in en/es", () => {
    for (const dictionary of Object.values(dictionaries)) {
      for (const status of obligationStatuses) {
        expect(dictionary.status[status]).toBeTruthy();
      }
      for (const type of obligationTypes) {
        expect(dictionary.type[type]).toBeTruthy();
      }
      for (const code of knownApiErrorCodes) {
        expect(dictionary.errors[code]).toBeTruthy();
      }
      expect(dictionary.dashboard.total).toBeTruthy();
      expect(dictionary.dashboard.overdue).toBeTruthy();
    }
  });
});
