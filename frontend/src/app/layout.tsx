import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Manrope } from "next/font/google";

const manrope = Manrope({ subsets:["latin"], variable:"--font-manrope" });

export const metadata: Metadata = {
  title: "Murex — Tableau de bord",
  description: "Back-office moderne",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={manrope.variable}>
      <body className="font-[var(--font-manrope)]">{/* custom font */}
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
