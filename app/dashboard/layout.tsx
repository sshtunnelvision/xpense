import { Navbar } from "@/components/ui/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
