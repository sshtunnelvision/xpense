import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      // Invalid token or user no longer exists
      const cookieStore = await cookies();
      cookieStore.delete('auth-token');
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Auth check error:', error);
    // Invalid token
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
    return NextResponse.json({ user: null }, { status: 200 });
  }
} 