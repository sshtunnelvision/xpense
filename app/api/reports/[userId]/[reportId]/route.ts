import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { userId: string; reportId: string } }
) {
  try {
    // Get the format from the URL
    const format = request.url.endsWith('report.pdf') ? 'pdf' : 
                  request.url.endsWith('report.csv') ? 'csv' : 
                  request.url.endsWith('report.excel') ? 'excel' : null;

    if (!format) {
      return NextResponse.json({ error: "Invalid report format" }, { status: 400 });
    }

    // Verify the authenticated user
    const authenticatedUserId = await getUserFromToken();
    if (!authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user is requesting their own report
    if (authenticatedUserId !== params.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find the report
    const report = await prisma.report.findFirst({
      where: {
        id: params.reportId,
        userId: params.userId,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.status !== "completed") {
      return NextResponse.json(
        { error: "Report is not ready yet" },
        { status: 400 }
      );
    }

    // Generate report data
    const receipts = await prisma.receipt.findMany({
      where: {
        userId: params.userId,
        date: {
          gte: report.startDate,
          lte: report.endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Generate report based on format
    if (format === "csv") {
      const reportData = "Date,Amount,Category,Notes\n" + 
        receipts.map((receipt) => 
          `${receipt.date.toISOString().split('T')[0]},${receipt.amount || 0},"${receipt.category || ''}","${receipt.notes || ''}"`)
        .join('\n');

      return new NextResponse(reportData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="expense-report-${report.startDate.toISOString().split('T')[0]}-to-${report.endDate.toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === "pdf") {
      // For now, return error for PDF format
      return NextResponse.json(
        { error: "PDF format is not supported yet" },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: "Unsupported format" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
} 