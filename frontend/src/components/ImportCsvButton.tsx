"use client";

import { useRef, useState } from "react";

type Props = {
  endpoint?: string;                 // override if needed
  defaultDuplicate?: "error" | "ignore" | "update"; // reserved for future behavior
  label?: string;
  className?: string;
};

export default function ImportCsvButton({
  endpoint = "http://127.0.0.1:8000/api/v1/exploitation/clients/import/",
  defaultDuplicate = "error",
  label = "Importer CSV",
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [lastSummary, setLastSummary] = useState<{ created: number; errors: number } | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const openPicker = () => {
    setLastError(null);
    inputRef.current?.click();
  };

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    setBusy(true);
    setLastError(null);
    setLastSummary(null);

    try {
      const fd = new FormData();
      fd.append("file", f, f.name);
      // If you later add backend switches like ?duplicate=ignore/update, tack them on here:
      // const url = new URL(endpoint); url.searchParams.set("duplicate", defaultDuplicate); …

      const res = await fetch(endpoint, {
        method: "POST",
        body: fd,
      });

      const isJson = (res.headers.get("content-type") || "").includes("application/json");
      const payload = isJson ? await res.json() : null;

      if (!res.ok) {
        const msg = payload && typeof payload === "object" ? JSON.stringify(payload) : await res.text();
        throw new Error(msg || `Import échoué (HTTP ${res.status})`);
      }

      // Expected shape: { created: number[] , errors: {row, errors}[] }
      const createdCount = Array.isArray(payload?.created) ? payload.created.length : 0;
      const errorsCount = Array.isArray(payload?.errors) ? payload.errors.length : 0;
      setLastSummary({ created: createdCount, errors: errorsCount });

      // Optional: simple refresh to show new rows immediately
      // location.reload();

    } catch (err: any) {
      setLastError(err?.message || "Import échoué.");
    } finally {
      setBusy(false);
      // reset input so selecting the same file again triggers change
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={onPick}
      />

      <button
        type="button"
        onClick={openPicker}
        className={["btn", className].filter(Boolean).join(" ")}
        disabled={busy}
        title="Importer une liste de clients au format CSV"
      >
        {busy ? "Import…" : label}
      </button>

      {/* tiny inline feedback */}
      {lastSummary && (
        <span className="text-xs text-[color:var(--muted)]">
          Créés: <b>{lastSummary.created}</b>
          {lastSummary.errors ? (
            <> • Erreurs: <b>{lastSummary.errors}</b></>
          ) : null}
        </span>
      )}
      {lastError && (
        <span className="text-xs text-red-600">
          {lastError.length > 120 ? lastError.slice(0, 120) + "…" : lastError}
        </span>
      )}
    </div>
  );
}
