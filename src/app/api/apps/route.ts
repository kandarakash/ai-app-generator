import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { AppConfig, normalizeConfig } from "@/types/config";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const app = await prisma.app.findFirst({
        where: { id, userId: user.id },
      });
      if (!app) {
        return NextResponse.json({ error: "App not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: app });
    }

    const apps = await prisma.app.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: apps });
  } catch (error) {
    console.error("Apps GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  try {
    const body = await request.json();
    const { name, description, config } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const normalizedConfig = config ? normalizeConfig(config) : {};

    const app = await prisma.app.create({
      data: {
        name,
        description,
        config: normalizedConfig as any,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, data: app }, { status: 201 });
  } catch (error) {
    console.error("Apps POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  try {
    const body = await request.json();
    const { id, name, description, config } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.app.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    const normalizedConfig = config ? normalizeConfig(config) : undefined;

    const app = await prisma.app.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(normalizedConfig && { config: normalizedConfig as any }),
      },
    });

    return NextResponse.json({ success: true, data: app });
  } catch (error) {
    console.error("Apps PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.app.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    await prisma.app.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Apps DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
