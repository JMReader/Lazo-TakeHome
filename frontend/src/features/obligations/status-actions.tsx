"use client";

import { useActionState } from "react";
import type { ObligationDetail, ObligationStatus } from "@/entities/obligation/types";
import { statusTransitionAction } from "@/features/obligations/actions";
import { initialActionState } from "@/features/obligations/schemas";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Field, FieldLabel } from "@/shared/ui/field";
import { Textarea } from "@/shared/ui/textarea";

export function StatusActions({
  locale,
  obligation,
}: {
  locale: Locale;
  obligation: ObligationDetail;
}) {
  const dictionary = getDictionary(locale);
  const [state, formAction, pending] = useActionState(
    statusTransitionAction.bind(null, locale, obligation.id),
    initialActionState,
  );
  const showBlockedSubmitted =
    obligation.submitBlockedReason &&
    !obligation.availableTransitions.includes("submitted");

  return (
    <div className="grid gap-4">
      {state.status === "error" ? (
        <Alert className="border-danger/50">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      {obligation.availableTransitions.length === 0 ? (
        <p className="text-sm text-secondary-text">{dictionary.detail.noTransitions}</p>
      ) : (
        <form action={formAction} className="grid gap-3">
          <input
            type="hidden"
            name="expectedVersion"
            value={obligation.version}
            readOnly
          />
          <Field>
            <FieldLabel htmlFor="reason">{dictionary.detail.reason}</FieldLabel>
            <Textarea id="reason" name="reason" />
          </Field>
          <div className="flex flex-wrap gap-2">
            {obligation.availableTransitions.map((status) => (
              <TransitionButton
                key={status}
                status={status}
                label={dictionary.status[status]}
                disabled={pending}
              />
            ))}
          </div>
        </form>
      )}
      {showBlockedSubmitted ? (
        <Alert className="border-warning/60">
          <AlertDescription>
            {dictionary.detail.blockedSubmitted}: {obligation.submitBlockedReason}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

function TransitionButton({
  status,
  label,
  disabled,
}: {
  status: ObligationStatus;
  label: string;
  disabled: boolean;
}) {
  return (
    <Button type="submit" name="targetStatus" value={status} disabled={disabled}>
      {label}
    </Button>
  );
}
