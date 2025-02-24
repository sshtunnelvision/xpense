"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CameraCapture from "@/components/CameraCapture";
import { Loader2 } from "lucide-react";

interface ReceiptData {
  imageUrl: string;
  amount: string;
  date: string;
  category: string;
  notes: string;
  company: string;
  time: string;
  items: string;
  subtotal: string;
  tax: string;
  tip: string;
  total: string;
}

export default function CaptureReceiptPage() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ReceiptData>({
    imageUrl: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    notes: "",
    company: "",
    time: "",
    items: "",
    subtotal: "",
    tax: "",
    tip: "",
    total: "",
  });

  const handleImageCapture = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const { url } = await response.json();
      setImageUrl(url);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
      // Remove auto-trigger of analysis
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    }
  };

  const handleAnalyze = async (url?: string) => {
    const imageToAnalyze = url || imageUrl;
    if (!imageToAnalyze) return;

    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/receipts/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: imageToAnalyze }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze receipt");
      }

      const data = await response.json();

      setFormData((prev) => ({
        ...prev,
        amount: data.amount?.toString() || prev.amount,
        date: data.date || prev.date,
        category: data.category || prev.category,
        notes: data.notes || prev.notes,
        company: data.company || prev.company,
        time: data.time || prev.time,
        items: data.items || prev.items,
        subtotal: data.subtotal?.toString() || prev.subtotal,
        tax: data.tax?.toString() || prev.tax,
        tip: data.tip?.toString() || prev.tip,
        total: data.total?.toString() || prev.total,
      }));

      // Show the form after successful analysis
      setShowForm(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze receipt"
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/receipts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save receipt");
      }

      // Reset the form for a new receipt
      setImageUrl(null);
      setShowForm(false);
      setFormData({
        imageUrl: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        category: "",
        notes: "",
        company: "",
        time: "",
        items: "",
        subtotal: "",
        tax: "",
        tip: "",
        total: "",
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save receipt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Capture Receipt</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <CameraCapture onCapture={handleImageCapture} />
            {imageUrl && (
              <div className="mt-2">
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={imageUrl}
                    alt="Captured receipt"
                    fill
                    className="object-contain rounded-lg"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="mt-4 flex justify-center">
                  {analyzing ? (
                    <div className="text-center">
                      <Loader2 className="w-6 h-6 animate-spin inline-block" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Analyzing your receipt...
                      </p>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => handleAnalyze()}
                      disabled={analyzing}
                    >
                      Analyze Receipt
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {showForm && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="company">Company/Business Name</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                  placeholder="Enter business name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, time: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="items">Items</Label>
                <Textarea
                  id="items"
                  value={formData.items}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, items: e.target.value }))
                  }
                  placeholder="List of items purchased"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="subtotal">Subtotal</Label>
                  <Input
                    id="subtotal"
                    type="number"
                    step="0.01"
                    value={formData.subtotal}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subtotal: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="tax">Tax</Label>
                  <Input
                    id="tax"
                    type="number"
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tax: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="tip">Tip</Label>
                  <Input
                    id="tip"
                    type="number"
                    step="0.01"
                    value={formData.tip}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tip: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="total">Total</Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    value={formData.total}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        total: e.target.value,
                        amount: e.target.value, // Keep amount in sync with total
                      }))
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="Enter category"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Add any notes about this receipt"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !imageUrl}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save and Add Another"
                )}
              </Button>
            </div>
          )}

          {error && <div className="text-red-500 text-sm">{error}</div>}
        </form>
      </div>
    </div>
  );
}
