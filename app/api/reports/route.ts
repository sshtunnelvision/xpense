import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

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

export async function GET() {
  try {
    const userId = await getUserFromToken();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserFromToken();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { startDate, endDate, format } = await request.json();

    // Validate dates
    if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { error: "Invalid date range" },
        { status: 400 }
      );
    }

    // Create report record
    const report = await prisma.report.create({
      data: {
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        format,
        status: "pending", // Initial status
      },
    });

    // In a real application, you would trigger a background job here
    // to generate the report asynchronously. For now, we'll just
    // simulate it by updating the status after a short delay
    setTimeout(async () => {
      await prisma.report.update({
        where: { id: report.id },
        data: {
          status: "completed",
          url: `/api/reports/${userId}/${report.id}/${format === 'csv' ? 'report.csv' : `report.${format}`}`,
        },
      });
    }, 5000);

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
} 