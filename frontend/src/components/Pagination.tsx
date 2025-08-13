"use client";

import Link from "next/link";

type Props = {
  page: number;               // current page (1-based)
  pageSize: number;           // items per page
  total: number;              // total items
  hrefBase: string;           // base path, e.g. "/exploitation/structure/clients"
  extraQuery?: Record<string, string | undefined>; // e.g. { q }
};

export default function Pagination({ page, pageSize, total, hrefBase, extraQuery = {} }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(Math.max(1, page), totalPages);

  const makeHref = (target: number) => {
    const q = new URLSearchParams({
      ...extraQuery,
      page: String(target),
      page_size: String(pageSize),
    } as Record<string, string>);
    return `${hrefBase}?${q.toString()}`;
  };

  return (
    <nav className="flex items-center justify-between gap-2">
      <div className="text-sm opacity-70">
        Page {p} / {totalPages} • {total} résultat{total>1?"s":""}
      </div>
      <div className="flex items-center gap-1">
        <Link
          href={makeHref(1)}
          aria-disabled={p===1}
          className={`btn btn-sm ${p===1 ? "pointer-events-none opacity-50" : ""}`}
        >
          « Premier
        </Link>
        <Link
          href={makeHref(Math.max(1, p-1))}
          aria-disabled={p===1}
          className={`btn btn-sm ${p===1 ? "pointer-events-none opacity-50" : ""}`}
        >
          ‹ Précédent
        </Link>
        <span className="px-2 text-sm">p.{p}</span>
        <Link
          href={makeHref(Math.min(totalPages, p+1))}
          aria-disabled={p===totalPages}
          className={`btn btn-sm ${p===totalPages ? "pointer-events-none opacity-50" : ""}`}
        >
          Suivant ›
        </Link>
        <Link
          href={makeHref(totalPages)}
          aria-disabled={p===totalPages}
          className={`btn btn-sm ${p===totalPages ? "pointer-events-none opacity-50" : ""}`}
        >
          Dernier »
        </Link>
      </div>
    </nav>
  );
}
