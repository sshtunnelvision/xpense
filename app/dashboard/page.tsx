"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

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
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div
          onClick={handleCaptureReceipt}
          className="group cursor-pointer rounded-xl bg-card p-6 shadow-sm hover:shadow transition-all"
        >
          <h2 className="text-xl font-semibold group-hover:text-primary">
            Capture Receipt
          </h2>
          <p className="mt-2 text-muted-foreground">
            Quickly capture and process your receipts
          </p>
          <Button className="mt-4" variant="secondary">
            Capture Now
          </Button>
        </div>

        <div
          onClick={handleViewReceipts}
          className="group cursor-pointer rounded-xl bg-card p-6 shadow-sm hover:shadow transition-all"
        >
          <h2 className="text-xl font-semibold group-hover:text-primary">
            View Receipts
          </h2>
          <p className="mt-2 text-muted-foreground">
            Browse and manage your captured receipts
          </p>
          <Button className="mt-4" variant="secondary">
            View Gallery
          </Button>
        </div>

        <div
          onClick={handleCreateReport}
          className="group cursor-pointer rounded-xl bg-card p-6 shadow-sm hover:shadow transition-all"
        >
          <h2 className="text-xl font-semibold group-hover:text-primary">
            Generate Report
          </h2>
          <p className="mt-2 text-muted-foreground">
            Create expense reports for reimbursement
          </p>
          <Button className="mt-4" variant="secondary">
            Create Report
          </Button>
        </div>
      </div>

      <div className="flex-1 rounded-xl bg-card p-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-muted-foreground">
          Your recent receipts and reports will appear here.
        </p>
      </div>
    </div>
  );
}
