import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { AppConfig, normalizeConfig } from "@/types/config";

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

    const config = app.config as unknown as AppConfig;
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("Config GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
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

    const body = await request.json();
    const config = normalizeConfig(body);

    const updated = await prisma.app.update({
      where: { id: params.appId },
      data: { config: config as any },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Config PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
