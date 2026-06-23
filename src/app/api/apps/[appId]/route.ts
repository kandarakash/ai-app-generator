import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: { appId: string } }
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  try {
    const app = await prisma.app.findFirst({
      where: { id: params.appId, userId: user.id },
    });

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: app });
  } catch (error) {
    console.error("App GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
