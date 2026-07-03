"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ObligationDetail } from "@/entities/obligation/types";
import { obligationTypes } from "@/entities/obligation/types";
import {
  createObligationAction,
  editObligationAction,
} from "@/features/obligations/actions";
import {
  initialActionState,
  todayDateString,
} from "@/features/obligations/schemas";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

type Props =
  | {
      mode: "create";
      locale: Locale;
      obligation?: never;
    }
  | {
      mode: "edit";
      locale: Locale;
      obligation: ObligationDetail;
    };

export function ObligationForm(props: Props) {
  const dictionary = getDictionary(props.locale);
  const action =
    props.mode === "create"
      ? createObligationAction.bind(null, props.locale)
      : editObligationAction.bind(null, props.locale, props.obligation.id);
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const obligation = props.mode === "edit" ? props.obligation : null;

  function fieldError(name: string) {
    const error = state.fieldErrors[name];
    if (!error) return undefined;
    if (error === "required") return dictionary.form.required;
    if (error === "invalidDate") return dictionary.form.invalidDate;
    if (error === "notPastDate") return dictionary.form.notPastDate;
    return error;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {props.mode === "create"
            ? dictionary.app.newObligation
            : `${dictionary.app.edit}: ${obligation?.title}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-5">
          {state.status === "error" ? (
            <Alert className="border-danger/50">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          {obligation ? (
            <input
              type="hidden"
              name="expectedVersion"
              value={obligation.version}
              readOnly
            />
          ) : null}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">{dictionary.form.title}</FieldLabel>
              <Input
                id="title"
                name="title"
                defaultValue={obligation?.title ?? ""}
                required
                aria-invalid={Boolean(fieldError("title"))}
              />
              <FieldError>{fieldError("title")}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="description">
                {dictionary.form.description}
              </FieldLabel>
              <Textarea
                id="description"
                name="description"
                defaultValue={obligation?.description ?? ""}
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>{dictionary.form.type}</FieldLabel>
                <Select name="type" defaultValue={obligation?.type ?? obligationTypes[0]}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {obligationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {dictionary.type[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="dueDate">{dictionary.form.dueDate}</FieldLabel>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  defaultValue={obligation?.dueDate ?? ""}
                  min={todayDateString()}
                  required
                  aria-invalid={Boolean(fieldError("dueDate"))}
                  aria-describedby={fieldError("dueDate") ? "dueDate-error" : undefined}
                />
                <FieldError id="dueDate-error">{fieldError("dueDate")}</FieldError>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="owner">{dictionary.form.owner}</FieldLabel>
              <Input
                id="owner"
                name="owner"
                defaultValue={obligation?.owner ?? ""}
                required
                aria-invalid={Boolean(fieldError("owner"))}
              />
              <FieldError>{fieldError("owner")}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="companyTaxId">
                {dictionary.form.companyTaxId}
              </FieldLabel>
              <Input
                id="companyTaxId"
                name="companyTaxId"
                defaultValue=""
                required={props.mode === "create"}
                aria-invalid={Boolean(fieldError("companyTaxId"))}
              />
              <FieldError>{fieldError("companyTaxId")}</FieldError>
            </Field>
            <label className="flex items-center gap-2 text-sm text-primary-text">
              <input
                type="checkbox"
                name="requiresDocument"
                defaultChecked={obligation?.requiresDocument ?? false}
                className="size-4 accent-[var(--accent)]"
              />
              {dictionary.form.requiresDocument}
            </label>
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <Button asChild variant="outline">
              <Link href={obligation ? `/${props.locale}/obligations/${obligation.id}` : `/${props.locale}`}>
                {dictionary.form.cancel}
              </Link>
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? dictionary.form.pending
                : props.mode === "create"
                  ? dictionary.form.create
                  : dictionary.form.save}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
