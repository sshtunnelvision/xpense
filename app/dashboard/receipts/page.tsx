"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Receipt {
  id: string;
  imageUrl: string;
  amount: number | null;
  date: string;
  category: string | null;
  notes: string | null;
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const response = await fetch("/api/receipts");
      if (!response.ok) {
        throw new Error("Failed to fetch receipts");
      }
      const data = await response.json();
      setReceipts(data.receipts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/receipts?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete receipt");
      }
      // Refresh receipts list
      fetchReceipts();
    } catch (err) {
      console.error("Error deleting receipt:", err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading receipts...</div>
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
        <h1 className="text-3xl font-bold">Your Receipts</h1>
        <Button onClick={() => router.push("/receipts/capture")}>
          Capture New Receipt
        </Button>
      </div>

      {receipts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No receipts found. Start by capturing a new receipt!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {receipts.map((receipt) => (
            <div
              key={receipt.id}
              className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              <div className="relative aspect-[3/4] mb-4">
                <Image
                  src={receipt.imageUrl}
                  alt="Receipt"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="space-y-2">
                <p className="font-semibold">
                  Amount: ${receipt.amount?.toFixed(2) || "N/A"}
                </p>
                <p className="text-gray-600">
                  Date: {new Date(receipt.date).toLocaleDateString()}
                </p>
                {receipt.category && (
                  <p className="text-gray-600">Category: {receipt.category}</p>
                )}
                {receipt.notes && (
                  <p className="text-gray-600 text-sm">
                    Notes: {receipt.notes}
                  </p>
                )}
                <div className="flex justify-end mt-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(receipt.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
