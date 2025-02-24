"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleCaptureReceipt = () => {
    router.push("dashboard/receipts/capture");
  };

  const handleViewReceipts = () => {
    router.push("dashboard/receipts");
  };

  const handleCreateReport = () => {
    router.push("dashboard/reports/new");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome to Xpense</h1>
        <Button onClick={handleSignOut} variant="outline">
          Sign Out
        </Button>
      </div>
      <div className="mt-8">
        <p className="text-gray-600">
          Welcome back, {user?.email}! Start managing your expenses efficiently.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border p-6 hover:border-primary/50 transition-colors">
            <h2 className="text-xl font-semibold">Capture Receipt</h2>
            <p className="mt-2 text-gray-600">
              Quickly capture and process your receipts
            </p>
            <Button
              className="mt-4"
              variant="secondary"
              onClick={handleCaptureReceipt}
            >
              Capture Now
            </Button>
          </div>
          <div className="rounded-lg border p-6 hover:border-primary/50 transition-colors">
            <h2 className="text-xl font-semibold">View Receipts</h2>
            <p className="mt-2 text-gray-600">
              Browse and manage your captured receipts
            </p>
            <Button
              className="mt-4"
              variant="secondary"
              onClick={handleViewReceipts}
            >
              View Gallery
            </Button>
          </div>
          <div className="rounded-lg border p-6 hover:border-primary/50 transition-colors">
            <h2 className="text-xl font-semibold">Generate Report</h2>
            <p className="mt-2 text-gray-600">
              Create expense reports for reimbursement
            </p>
            <Button
              className="mt-4"
              variant="secondary"
              onClick={handleCreateReport}
            >
              Create Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
