"use client";

import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error.message);
  }, [error]);

  return (
    <Alert className="border-danger/50">
      <AlertTitle>Unable to render this view</AlertTitle>
      <AlertDescription className="mb-4">
        The API or page state could not be resolved.
      </AlertDescription>
      <Button type="button" onClick={reset}>
        Retry
      </Button>
    </Alert>
  );
}
