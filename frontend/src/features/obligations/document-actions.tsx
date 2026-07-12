"use client";

import { FileCheck2, FileUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  attachDocumentAction,
  removeDocumentAction,
} from "@/features/obligations/actions";
import { initialActionState } from "@/features/obligations/schemas";
import {
  isVersionConflictState,
  VersionConflictDialog,
} from "@/features/obligations/version-conflict-dialog";
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

export function DocumentAttachForm({
  locale,
  obligationId,
  version,
  hasDocument,
}: {
  locale: Locale;
  obligationId: string;
  version: number;
  hasDocument: boolean;
}) {
  const dictionary = getDictionary(locale);
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    attachDocumentAction.bind(null, locale, obligationId),
    initialActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileNameRef = useRef<HTMLInputElement>(null);
  const contentTypeRef = useRef<HTMLInputElement>(null);
  const sizeBytesRef = useRef<HTMLInputElement>(null);
  const storageKeyRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confirmReplaceOpen, setConfirmReplaceOpen] = useState(false);
  const versionConflict = isVersionConflictState(state);

  useEffect(() => {
    if (state.status !== "success") return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }, [router, state.status]);

  function setSelectedMetadata(file: File) {
    setSelectedFile(file);
    if (fileNameRef.current) fileNameRef.current.value = file.name;
    if (contentTypeRef.current) {
      contentTypeRef.current.value = file.type || "application/octet-stream";
    }
    if (sizeBytesRef.current) sizeBytesRef.current.value = String(file.size);
    if (storageKeyRef.current) storageKeyRef.current.value = "";
  }

  function attachSelectedFile(file: File) {
    setSelectedMetadata(file);
    if (hasDocument) {
      setConfirmReplaceOpen(true);
      return;
    }
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={formAction} className="grid gap-4">
      {versionConflict ? (
        <VersionConflictDialog locale={locale} />
      ) : null}
      {state.status === "error" && !versionConflict ? (
        <Alert className="border-danger/50">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <input type="hidden" name="expectedVersion" value={version} readOnly />
      <input ref={fileNameRef} type="hidden" name="fileName" readOnly />
      <input ref={contentTypeRef} type="hidden" name="contentType" readOnly />
      <input ref={sizeBytesRef} type="hidden" name="sizeBytes" readOnly />
      <input ref={storageKeyRef} type="hidden" name="storageKey" readOnly />
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        aria-label={dictionary.detail.chooseDocument}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) attachSelectedFile(file);
        }}
      />
      {selectedFile && state.status !== "success" ? (
        <div className="flex items-center gap-3 rounded-md border bg-surface p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-md border text-accent">
            <FileCheck2 />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-primary-text">
              {selectedFile.name}
            </p>
            <p className="text-xs text-secondary-text">
              {dictionary.detail.selectedDocument} · {dictionary.detail.documentMetadataOnly}
            </p>
          </div>
        </div>
      ) : null}
      <Button
        type="button"
        disabled={pending}
        onClick={() => fileInputRef.current?.click()}
      >
        <FileUp />
        {pending
          ? dictionary.detail.registeringDocument
          : hasDocument
            ? dictionary.detail.replaceDocumentMetadata
            : dictionary.detail.registerDocumentMetadata}
      </Button>
      <p className="text-xs text-secondary-text">
        {dictionary.detail.documentMetadataOnly}
      </p>
      <AlertDialog open={confirmReplaceOpen} onOpenChange={setConfirmReplaceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dictionary.detail.confirmReplaceDocumentTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dictionary.detail.confirmReplaceDocument}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" type="button">
                {dictionary.form.cancel}
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                type="button"
                disabled={pending}
                onClick={() => formRef.current?.requestSubmit()}
              >
                {pending
                  ? dictionary.detail.registeringDocument
                  : dictionary.detail.replaceDocumentMetadata}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    removeDocumentAction.bind(null, locale, obligationId),
    initialActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const versionConflict = isVersionConflictState(state);
  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <div className="grid gap-3">
      {versionConflict ? (
        <VersionConflictDialog locale={locale} />
      ) : null}
      {state.status === "error" && !versionConflict ? (
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
            <form ref={formRef} action={formAction}>
              <input type="hidden" name="expectedVersion" value={version} readOnly />
              <Button
                type="button"
                variant="destructive"
                disabled={pending}
                onClick={() => formRef.current?.requestSubmit()}
              >
                {pending ? dictionary.form.pending : dictionary.detail.removeDocument}
              </Button>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
