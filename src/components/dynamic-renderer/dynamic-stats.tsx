"use client";

import { useState, useEffect } from "react";
import { ComponentConfig, TableConfig } from "@/types/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "./loading-state";
import { ErrorState } from "./error-state";

interface DynamicStatsProps {
  component: ComponentConfig;
  table?: TableConfig;
  appId: string;
}

export function DynamicStats({ component, table, appId }: DynamicStatsProps) {
  const [count, setCount] = useState(0);
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
        setCount(json.data?.length || 0);
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {component.label || component.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {component.table || "Total records"}
        </p>
      </CardContent>
    </Card>
  );
}
