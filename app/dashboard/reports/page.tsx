"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Report {
  id: string;
  startDate: string;
  endDate: string;
  format: string;
  status: string;
  url: string | null;
  createdAt: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports");
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }
      const data = await response.json();
      setReports(data.reports);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Button onClick={() => router.push("/reports/new")}>
          Generate New Report
        </Button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No reports found. Generate your first report!
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="border rounded-lg p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Report {formatDate(report.startDate)} -{" "}
                    {formatDate(report.endDate)}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Format: {report.format.toUpperCase()}
                  </p>
                  <p className="text-gray-600">
                    Created: {formatDate(report.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      report.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {report.status.charAt(0).toUpperCase() +
                      report.status.slice(1)}
                  </span>
                  {report.status === "completed" && report.url && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(report.url!, "_blank")}
                    >
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
