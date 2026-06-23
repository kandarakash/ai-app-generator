import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { AppConfig, validateRecord, coerceValue } from "@/types/config";
import Papa from "papaparse";
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const appId = formData.get("appId") as string;
    const tableName = formData.get("tableName") as string;
    if (!file || !appId || !tableName) {
      return NextResponse.json(
        { error: "Missing file, appId, or tableName" },
        { status: 400 }
      );
    }
    const app = await prisma.app.findFirst({
      where: { id: appId, userId: user.id },
    });
    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }
    const config = app.config as unknown as AppConfig;
    const table = config.database?.find((t) => t.name === tableName);
    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }
    const csvText = await file.text();
    const parseResult = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: "CSV parse error", details: parseResult.errors },
        { status: 400 }
      );
    }
    const rows = parseResult.data;
    const results = {
      total: rows.length,
      imported: 0,
      failed: 0,
      errors: [] as { row: number; errors: Record<string, string> }[],
    };
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const recordData: Record<string, unknown> = {};
      for (const field of table.fields) {
        const value = row[field.name] ?? row[field.label || ""] ?? "";
        recordData[field.name] = coerceValue(value, field.type);
      }
      const validation = validateRecord(recordData, table);
      if (!validation.valid) {
        results.failed++;
        results.errors.push({ row: i + 1, errors: validation.errors });
        continue;
      }
      await prisma.dynamicRecord.create({
        data: {
          appId,
          tableName,
          data: recordData as any,
        },
      });
      results.imported++;
    }
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "CSV Import Complete",
        message: Imported  of  rows into ,
        type: results.failed > 0 ? "warning" : "success",
      },
    });
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
