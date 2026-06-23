import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { AppConfig, validateRecord, coerceValue } from "@/types/config";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const pathParts = params.path;
  if (pathParts.length < 2) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const appId = pathParts[0];
  const action = pathParts[1]; // list, get, etc.

  try {
    const app = await prisma.app.findFirst({
      where: { id: appId, userId: user.id },
    });

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    const config = app.config as unknown as AppConfig;
    const tableName = request.nextUrl.searchParams.get("table") || "";

    if (action === "list") {
      const records = await prisma.dynamicRecord.findMany({
        where: { appId, tableName },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, data: records });
    }

    if (action === "get") {
      const id = request.nextUrl.searchParams.get("id");
      if (!id) {
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      }
      const record = await prisma.dynamicRecord.findFirst({
        where: { id, appId, tableName },
      });
      if (!record) {
        return NextResponse.json({ error: "Record not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: record });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Dynamic GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const pathParts = params.path;
  if (pathParts.length < 2) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const appId = pathParts[0];
  const action = pathParts[1];

  try {
    const app = await prisma.app.findFirst({
      where: { id: appId, userId: user.id },
    });

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    const config = app.config as unknown as AppConfig;
    const body = await request.json();
    const tableName = body.table || "";
    const table = config.database?.find((t) => t.name === tableName);

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    if (action === "create") {
      // Coerce values to correct types
      const recordData: Record<string, unknown> = {};
      for (const field of table.fields) {
        const value = body.data?.[field.name];
        recordData[field.name] = coerceValue(value, field.type);
      }

      // Validate
      const validation = validateRecord(recordData, table);
      if (!validation.valid) {
        return NextResponse.json(
          { error: "Validation failed", details: validation.errors },
          { status: 400 }
        );
      }

      const record = await prisma.dynamicRecord.create({
        data: {
          appId,
          tableName,
          data: recordData,
        },
      });

      return NextResponse.json({ success: true, data: record });
    }

    if (action === "update") {
      const id = body.id;
      if (!id) {
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      }

      const existing = await prisma.dynamicRecord.findFirst({
        where: { id, appId, tableName },
      });

      if (!existing) {
        return NextResponse.json({ error: "Record not found" }, { status: 404 });
      }

      const existingData = existing.data as Record<string, unknown>;
      const recordData: Record<string, unknown> = { ...existingData };

      for (const field of table.fields) {
        if (body.data?.[field.name] !== undefined) {
          recordData[field.name] = coerceValue(body.data[field.name], field.type);
        }
      }

      const validation = validateRecord(recordData, table);
      if (!validation.valid) {
        return NextResponse.json(
          { error: "Validation failed", details: validation.errors },
          { status: 400 }
        );
      }

      const record = await prisma.dynamicRecord.update({
        where: { id },
        data: { data: recordData },
      });

      return NextResponse.json({ success: true, data: record });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Dynamic POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const pathParts = params.path;
  if (pathParts.length < 2) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const appId = pathParts[0];

  try {
    const app = await prisma.app.findFirst({
      where: { id: appId, userId: user.id },
    });

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.dynamicRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dynamic DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
