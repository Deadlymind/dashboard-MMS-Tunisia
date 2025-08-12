import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
export const metadata: Metadata={ title:"Dashboard", description:"Admin dashboard shell" };
export default function RootLayout({children}:{children:React.ReactNode}){
  return(<html lang="fr" suppressHydrationWarning><body><ThemeProvider>{children}</ThemeProvider></body></html>);
}
