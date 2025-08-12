"use client";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
