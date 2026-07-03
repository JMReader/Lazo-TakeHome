import Link from "next/link";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/dictionaries";
import { AppIcon } from "@/shared/ui/app-icon";
import { Button } from "@/shared/ui/button";
import { LocaleSwitch } from "@/widgets/app-shell/locale-switch";
import { ThemeToggle } from "@/widgets/app-shell/theme-toggle";

export function AppShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const dictionary = getDictionary(locale);
  return (
    <div className="min-h-screen bg-background text-primary-text">
      <header className="border-b bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}`} className="flex min-w-0 items-center gap-3">
            <AppIcon className="size-9 shrink-0" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {dictionary.app.title}
              </span>
              <span className="hidden truncate text-xs text-secondary-text sm:block">
                {dictionary.app.subtitle}
              </span>
            </span>
          </Link>
          <nav className="flex shrink-0 items-center gap-2">
            <LocaleSwitch locale={locale} />
            <ThemeToggle label={dictionary.app.theme} />
            <Button asChild size="sm">
              <Link href={`/${locale}/obligations/new`}>
                {dictionary.app.newObligation}
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
