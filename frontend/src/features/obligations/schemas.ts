import { z } from "zod";
import { obligationStatuses, obligationTypes } from "@/entities/obligation/types";

const dateString = z
  .string()
  .min(1, "required")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "invalidDate");

export const obligationFormSchema = z.object({
  type: z.enum(obligationTypes),
  title: z.string().trim().min(1, "required"),
  description: z.string().trim().optional().default(""),
  dueDate: dateString,
  owner: z.string().trim().min(1, "required"),
  requiresDocument: z.boolean(),
  companyTaxId: z.string().trim().min(1, "required"),
});

export const editObligationFormSchema = z.object({
  expectedVersion: z.coerce.number().int().positive(),
  type: z.enum(obligationTypes),
  title: z.string().trim().min(1, "required"),
  description: z.string().trim().optional().default(""),
  dueDate: dateString,
  owner: z.string().trim().min(1, "required"),
  requiresDocument: z.boolean(),
  companyTaxId: z
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
});

export const statusActionSchema = z.object({
  targetStatus: z.enum(obligationStatuses),
  expectedVersion: z.coerce.number().int().positive(),
  reason: z.string().trim().optional(),
});

export const documentFormSchema = z.object({
  fileName: z.string().trim().min(1, "required"),
  contentType: z.string().trim().min(1, "required"),
  sizeBytes: z.coerce.number().int().positive("positiveSize"),
  storageKey: z.string().trim().optional(),
  expectedVersion: z.coerce.number().int().positive(),
});

export type FormFieldErrors = Record<string, string>;

export type ActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors: FormFieldErrors;
};

export const initialActionState: ActionState = {
  status: "idle",
  fieldErrors: {},
};

export function formDataValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
