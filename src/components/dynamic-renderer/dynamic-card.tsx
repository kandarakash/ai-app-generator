"use client";

import { useState, useEffect } from "react";
import { ComponentConfig, TableConfig } from "@/types/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "./loading-state";
import { ErrorState } from "./error-state";

interface DynamicCardProps {
  component: ComponentConfig;
  table?: TableConfig;
  appId: string;
}

export function DynamicCard({ component, table, appId }: DynamicCardProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `/api/dynamic/${appId}/list?table=${encodeURIComponent(component.table || "")}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setRecords(json.data?.slice(0, 5) || []); // Show last 5 records
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [appId, component.table]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!table) return <ErrorState message={`Table "${component.table}" not found`} />;

  const fields = component.fields || table.fields.map((f) => f.name).slice(0, 3);
  const fieldMap = new Map(table.fields.map((f) => [f.name, f]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{component.label || component.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {records.map((record) => {
            const data = record.data as Record<string, any>;
            return (
              <div
                key={record.id}
                className="p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {fields.map((field) => (
                  <div key={field} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {fieldMap.get(field)?.label || field}
                    </span>
                    <span className="font-medium">{String(data[field] || "-")}</span>
                  </div>
                ))}
              </div>
            );
          })}
          {records.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No records</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
