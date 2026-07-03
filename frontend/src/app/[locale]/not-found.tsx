import Link from "next/link";
import { defaultLocale } from "@/shared/i18n/config";
import { Button } from "@/shared/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/shared/ui/empty";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-primary-text">
      <Empty className="max-w-md">
        <div>
          <EmptyTitle>Not found</EmptyTitle>
          <EmptyDescription>The requested compliance view does not exist.</EmptyDescription>
          <Button asChild className="mt-4">
            <Link href={`/${defaultLocale}`}>Back to dashboard</Link>
          </Button>
        </div>
      </Empty>
    </main>
  );
}
