import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Receipt {
  id: string;
  imageUrl: string;
  amount: number | null;
  date: string;
  category: string | null;
  notes: string | null;
  createdAt: string;
}

interface ReceiptCardProps {
  receipt: Receipt;
  onDelete: () => void;
}

export default function ReceiptCard({ receipt, onDelete }: ReceiptCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow">
      <div className="relative aspect-[4/3]">
        <Image
          src={receipt.imageUrl}
          alt="Receipt"
          fill
          className="object-cover"
        />
        <div className="absolute bottom-2 right-2">
          <Button
            size="icon"
            variant="destructive"
            onClick={onDelete}
            className="h-8 w-8 rounded-full"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {new Date(receipt.date).toLocaleDateString()}
          </div>
          {receipt.amount && (
            <div className="font-medium">${receipt.amount.toFixed(2)}</div>
          )}
        </div>
        {receipt.category && (
          <div className="mt-2 text-sm text-gray-600">
            Category: {receipt.category}
          </div>
        )}
        {receipt.notes && (
          <div className="mt-1 text-sm text-gray-600">
            Notes: {receipt.notes}
          </div>
        )}
      </div>
    </div>
  );
}
