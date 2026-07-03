"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/shared/i18n/config";
import { nextLocale } from "@/shared/i18n/config";
import { Button } from "@/shared/ui/button";

export function LocaleSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const alternateLocale = nextLocale(locale);
  const segments = pathname.split("/");
  segments[1] = alternateLocale;
  const query = searchParams.toString();
  const href = `${segments.join("/") || `/${alternateLocale}`}${query ? `?${query}` : ""}`;

  return (
    <Button asChild variant="ghost" size="sm">
      <Link href={href}>{alternateLocale.toUpperCase()}</Link>
    </Button>
  );
}
