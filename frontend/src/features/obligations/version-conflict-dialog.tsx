"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/features/obligations/schemas";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";

const versionConflictCode = "OBLIGATION_VERSION_CONFLICT";

export function isVersionConflictState(state: ActionState) {
  return state.status === "error" && state.errorCode === versionConflictCode;
}

export function VersionConflictDialog({
  locale,
}: {
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const router = useRouter();

  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {dictionary.detail.versionConflictTitle}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {dictionary.detail.versionConflictDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button
              type="button"
              onClick={() => {
                router.refresh();
              }}
            >
              <RefreshCw />
              {dictionary.detail.versionConflictRefresh}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
