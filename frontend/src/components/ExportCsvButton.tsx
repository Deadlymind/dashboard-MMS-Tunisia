"use client";

type Props = {
  href: string;                 // full URL to the export endpoint
  label?: string;
  className?: string;
};

export default function ExportCsvButton({ href, label = "Exporter CSV", className }: Props) {
  return (
    <a
      href={href}
      className={["btn", className].filter(Boolean).join(" ")}
      download
      // If you prefer opening in new tab, uncomment:
      // target="_blank" rel="noopener noreferrer"
    >
      {label}
    </a>
  );
}
