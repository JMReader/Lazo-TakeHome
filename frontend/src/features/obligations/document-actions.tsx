"use client";

import { useActionState } from "react";
import {
  attachDocumentAction,
  removeDocumentAction,
} from "@/features/obligations/actions";
import { initialActionState } from "@/features/obligations/schemas";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

export function DocumentAttachForm({
  locale,
  obligationId,
  version,
}: {
  locale: Locale;
  obligationId: string;
  version: number;
}) {
  const dictionary = getDictionary(locale);
  const [state, formAction, pending] = useActionState(
    attachDocumentAction.bind(null, locale, obligationId),
    initialActionState,
  );
  const sizeError = state.fieldErrors.sizeBytes;
  return (
    <form action={formAction} className="grid gap-4">
      {state.status === "error" ? (
        <Alert className="border-danger/50">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <input type="hidden" name="expectedVersion" value={version} readOnly />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="fileName">{dictionary.form.fileName}</FieldLabel>
          <Input id="fileName" name="fileName" required />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="contentType">
              {dictionary.form.contentType}
            </FieldLabel>
            <Input id="contentType" name="contentType" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="sizeBytes">{dictionary.form.sizeBytes}</FieldLabel>
            <Input
              id="sizeBytes"
              name="sizeBytes"
              type="number"
              min={1}
              required
              aria-invalid={Boolean(sizeError)}
            />
            <FieldError>
              {sizeError === "positiveSize" ? dictionary.form.positiveSize : sizeError}
            </FieldError>
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="storageKey">{dictionary.form.storageKey}</FieldLabel>
          <Input id="storageKey" name="storageKey" />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={pending}>
        {pending ? dictionary.form.pending : dictionary.detail.attachDocument}
      </Button>
    </form>
  );
}

export function RemoveDocumentButton({
  locale,
  obligationId,
  version,
}: {
  locale: Locale;
  obligationId: string;
  version: number;
}) {
  const dictionary = getDictionary(locale);
  const [state, formAction, pending] = useActionState(
    removeDocumentAction.bind(null, locale, obligationId),
    initialActionState,
  );
  return (
    <div className="grid gap-3">
      {state.status === "error" ? (
        <Alert className="border-danger/50">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="outline">
            {dictionary.detail.removeDocument}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.detail.removeDocument}</AlertDialogTitle>
            <AlertDialogDescription>
              {dictionary.detail.confirmRemoveDocument}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" type="button">
                {dictionary.form.cancel}
              </Button>
            </AlertDialogCancel>
            <form action={formAction}>
              <input type="hidden" name="expectedVersion" value={version} readOnly />
              <AlertDialogAction asChild>
                <Button type="submit" variant="destructive" disabled={pending}>
                  {pending ? dictionary.form.pending : dictionary.detail.removeDocument}
                </Button>
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
