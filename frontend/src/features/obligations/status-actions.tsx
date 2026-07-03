"use client";

import { ArrowRight, CheckCircle2, Circle, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import type { ObligationDetail, ObligationStatus } from "@/entities/obligation/types";
import { obligationStatuses } from "@/entities/obligation/types";
import { statusTransitionAction } from "@/features/obligations/actions";
import { initialActionState } from "@/features/obligations/schemas";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { cn } from "@/shared/lib/utils";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Field, FieldLabel } from "@/shared/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

export function StatusActions({
  locale,
  obligation,
}: {
  locale: Locale;
  obligation: ObligationDetail;
}) {
  const dictionary = getDictionary(locale);
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    statusTransitionAction.bind(null, locale, obligation.id),
    initialActionState,
  );
  const [selectedStatus, setSelectedStatus] = useState<ObligationStatus | "">(
    obligation.availableTransitions[0] ?? "",
  );
  const selectedLabel = selectedStatus ? dictionary.status[selectedStatus] : "";
  const showBlockedSubmitted =
    obligation.submitBlockedReason &&
    !obligation.availableTransitions.includes("submitted");

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <div className="grid gap-5">
      {state.status === "error" ? (
        <Alert className="border-danger/50">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <ol
        className="grid gap-3"
        aria-label={dictionary.detail.workflowOrder}
      >
        {obligationStatuses.map((status, index) => (
          <li key={status} className="grid gap-3">
            <WorkflowStep
              status={status}
              currentStatus={obligation.status}
              available={obligation.availableTransitions.includes(status)}
              blockedReason={
                status === "submitted" && showBlockedSubmitted
                  ? obligation.submitBlockedReason
                  : null
              }
              label={dictionary.status[status]}
              position={index + 1}
              total={obligationStatuses.length}
              dictionary={dictionary}
            />
            {index < obligationStatuses.length - 1 ? (
              <div
                aria-hidden="true"
                className="flex items-center gap-2 pl-3 text-secondary-text"
              >
                <span className="h-6 border-l" />
                <ArrowRight className="size-4 rotate-90" />
              </div>
            ) : null}
          </li>
        ))}
      </ol>

      <form action={formAction} className="grid gap-4">
        <input
          type="hidden"
          name="expectedVersion"
          value={obligation.version}
          readOnly
        />
        <input type="hidden" name="targetStatus" value={selectedStatus} readOnly />
        {obligation.availableTransitions.length === 0 ? (
          <p className="rounded-md border bg-surface p-3 text-sm text-secondary-text">
            {dictionary.detail.noTransitions}
          </p>
        ) : (
          <>
            <Field>
              <FieldLabel htmlFor="targetStatus">
                {dictionary.detail.selectNextStatus}
              </FieldLabel>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as ObligationStatus)}
              >
                <SelectTrigger id="targetStatus" aria-label={dictionary.detail.selectNextStatus}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {obligation.availableTransitions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {dictionary.status[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="reason">{dictionary.detail.optionalReason}</FieldLabel>
              <Textarea
                id="reason"
                name="reason"
                placeholder={dictionary.detail.reason}
              />
            </Field>
            <div className="rounded-md border bg-card p-4">
              <p className="text-xs font-medium uppercase text-secondary-text">
                {dictionary.detail.selectedTransition}
              </p>
              <Button
                type="submit"
                disabled={pending || !selectedStatus}
                className="mt-3 h-12 w-full justify-between text-base"
              >
                <span>
                  {pending
                    ? dictionary.form.pending
                    : `${dictionary.detail.changeStatus}: ${selectedLabel}`}
                </span>
                <ArrowRight />
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

function WorkflowStep({
  status,
  currentStatus,
  available,
  blockedReason,
  label,
  position,
  total,
  dictionary,
}: {
  status: ObligationStatus;
  currentStatus: ObligationStatus;
  available: boolean;
  blockedReason: string | null;
  label: string;
  position: number;
  total: number;
  dictionary: ReturnType<typeof getDictionary>;
}) {
  const current = status === currentStatus;
  const blocked = Boolean(blockedReason);
  return (
    <div
      className={cn(
        "rounded-md border bg-surface p-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
        current && "border-accent bg-accent/10",
        available && !current && "border-in-progress/45 bg-in-progress/10",
        blocked && "border-warning/50 bg-warning/10",
      )}
      aria-label={`${dictionary.detail.workflowStep} ${position} ${dictionary.detail.of} ${total}: ${label}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-secondary-text",
            current && "border-accent text-accent",
            available && !current && "border-in-progress text-in-progress",
            blocked && "border-warning text-warning",
          )}
        >
          {current ? (
            <CheckCircle2 aria-hidden="true" />
          ) : blocked ? (
            <LockKeyhole aria-hidden="true" />
          ) : (
            <Circle aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-primary-text">{label}</p>
            <span className="rounded-full border px-2 py-0.5 text-xs text-secondary-text">
              {current
                ? dictionary.detail.currentStatus
                : available
                  ? dictionary.detail.availableNow
                  : dictionary.detail.unavailableStatus}
            </span>
          </div>
          {blockedReason ? (
            <p className="mt-2 text-sm text-warning">
              {dictionary.detail.blockedSubmitted}: {blockedReason}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
