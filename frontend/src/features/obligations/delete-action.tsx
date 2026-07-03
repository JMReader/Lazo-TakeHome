"use client";

import { useActionState } from "react";
import { deleteObligationAction } from "@/features/obligations/actions";
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

export function DeleteObligationButton({
  locale,
  obligationId,
}: {
  locale: Locale;
  obligationId: string;
}) {
  const dictionary = getDictionary(locale);
  const [state, formAction, pending] = useActionState(
    deleteObligationAction.bind(null, locale, obligationId),
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
          <Button type="button" variant="destructive">
            {dictionary.detail.deleteObligation}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.detail.deleteObligation}</AlertDialogTitle>
            <AlertDialogDescription>
              {dictionary.detail.confirmDelete}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline">
                {dictionary.form.cancel}
              </Button>
            </AlertDialogCancel>
            <form action={formAction}>
              <AlertDialogAction asChild>
                <Button type="submit" variant="destructive" disabled={pending}>
                  {pending ? dictionary.form.pending : dictionary.detail.deleteObligation}
                </Button>
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
