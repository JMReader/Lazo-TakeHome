"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  attachObligationDocument,
  changeObligationStatus,
  createObligation,
  deleteObligation,
  deleteObligationDocument,
  updateObligation,
} from "@/shared/api/client";
import { fieldErrorsFromDetails, isApiError } from "@/shared/api/errors";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import {
  documentFormSchema,
  editObligationFormSchema,
  formDataValue,
  initialActionState,
  obligationFormSchema,
  statusActionSchema,
  type ActionState,
} from "@/features/obligations/schemas";

function errorState(error: unknown, locale: Locale): ActionState {
  const dictionary = getDictionary(locale);
  if (isApiError(error)) {
    const code = error.code in dictionary.errors ? error.code : "UNKNOWN";
    return {
      status: "error",
      message: dictionary.errors[code as keyof typeof dictionary.errors],
      fieldErrors: fieldErrorsFromDetails(error.details),
    };
  }
  return {
    status: "error",
    message: dictionary.errors.UNKNOWN,
    fieldErrors: {},
  };
}

function validationState(fieldErrors: Record<string, string>, locale: Locale): ActionState {
  return {
    status: "error",
    message: getDictionary(locale).form.apiError,
    fieldErrors,
  };
}

function zodFieldErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string") fieldErrors[field] = issue.message;
  }
  return fieldErrors;
}

export async function createObligationAction(
  locale: Locale,
  _previousState: ActionState,
  formData: FormData,
) {
  const parsed = obligationFormSchema.safeParse({
    type: formDataValue(formData, "type"),
    title: formDataValue(formData, "title"),
    description: formDataValue(formData, "description"),
    dueDate: formDataValue(formData, "dueDate"),
    owner: formDataValue(formData, "owner"),
    requiresDocument: formData.get("requiresDocument") === "on",
    companyTaxId: formDataValue(formData, "companyTaxId"),
  });

  if (!parsed.success) {
    return validationState(zodFieldErrors(parsed.error), locale);
  }

  let createdId: string;
  try {
    const response = await createObligation(parsed.data);
    createdId = response.obligation.id;
  } catch (error) {
    return errorState(error, locale);
  }
  revalidatePath(`/${locale}`);
  redirect(`/${locale}/obligations/${createdId}`);
}

export async function editObligationAction(
  locale: Locale,
  obligationId: string,
  _previousState: ActionState,
  formData: FormData,
) {
  const parsed = editObligationFormSchema.safeParse({
    expectedVersion: formDataValue(formData, "expectedVersion"),
    type: formDataValue(formData, "type"),
    title: formDataValue(formData, "title"),
    description: formDataValue(formData, "description"),
    dueDate: formDataValue(formData, "dueDate"),
    owner: formDataValue(formData, "owner"),
    requiresDocument: formData.get("requiresDocument") === "on",
    companyTaxId: formDataValue(formData, "companyTaxId"),
  });

  if (!parsed.success) {
    return validationState(zodFieldErrors(parsed.error), locale);
  }

  try {
    await updateObligation(obligationId, parsed.data);
  } catch (error) {
    return errorState(error, locale);
  }
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/obligations/${obligationId}`);
  redirect(`/${locale}/obligations/${obligationId}`);
}

export async function statusTransitionAction(
  locale: Locale,
  obligationId: string,
  _previousState: ActionState,
  formData: FormData,
) {
  const parsed = statusActionSchema.safeParse({
    targetStatus: formDataValue(formData, "targetStatus"),
    expectedVersion: formDataValue(formData, "expectedVersion"),
    reason: formDataValue(formData, "reason"),
  });

  if (!parsed.success) {
    return validationState(zodFieldErrors(parsed.error), locale);
  }

  try {
    await changeObligationStatus(obligationId, parsed.data);
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/obligations/${obligationId}`);
    return initialActionState;
  } catch (error) {
    return errorState(error, locale);
  }
}

export async function attachDocumentAction(
  locale: Locale,
  obligationId: string,
  _previousState: ActionState,
  formData: FormData,
) {
  const parsed = documentFormSchema.safeParse({
    fileName: formDataValue(formData, "fileName"),
    contentType: formDataValue(formData, "contentType"),
    sizeBytes: formDataValue(formData, "sizeBytes"),
    storageKey: formDataValue(formData, "storageKey") || undefined,
    expectedVersion: formDataValue(formData, "expectedVersion"),
  });

  if (!parsed.success) {
    return validationState(zodFieldErrors(parsed.error), locale);
  }

  try {
    await attachObligationDocument(obligationId, parsed.data);
    revalidatePath(`/${locale}/obligations/${obligationId}`);
    return initialActionState;
  } catch (error) {
    return errorState(error, locale);
  }
}

export async function removeDocumentAction(
  locale: Locale,
  obligationId: string,
  _previousState: ActionState,
  formData: FormData,
) {
  try {
    await deleteObligationDocument(
      obligationId,
      Number(formDataValue(formData, "expectedVersion")),
    );
    revalidatePath(`/${locale}/obligations/${obligationId}`);
    return initialActionState;
  } catch (error) {
    return errorState(error, locale);
  }
}

export async function deleteObligationAction(
  locale: Locale,
  obligationId: string,
  _previousState: ActionState,
  _formData: FormData,
) {
  void _previousState;
  void _formData;
  try {
    await deleteObligation(obligationId);
  } catch (error) {
    return errorState(error, locale);
  }
  revalidatePath(`/${locale}`);
  redirect(`/${locale}`);
}
