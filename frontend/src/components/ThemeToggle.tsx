"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : undefined;

  return (
    <button
      aria-label="Basculer le thème"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-sm"
    >
      {/* Render an invisible placeholder on the server; swap after mount */}
      <span aria-hidden suppressHydrationWarning>
        {mounted ? (isDark ? <Moon size={16} /> : <Sun size={16} />) : (
          <Sun size={16} style={{ opacity: 0 }} />
        )}
      </span>
      <span className="sr-only">Basculer le thème</span>
    </button>
  );
}
