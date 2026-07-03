"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";

export function ThemeToggle({ label }: { label: string }) {
  const [isDark, setIsDark] = useState(false);

  function toggleTheme() {
    document.documentElement.classList.toggle("dark");
    setIsDark(document.documentElement.classList.contains("dark"));
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={toggleTheme}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
