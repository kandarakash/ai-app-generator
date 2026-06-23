"use client";

import { useState, useCallback } from "react";
import { ComponentConfig, TableConfig } from "@/types/config";
import { DynamicTable } from "./dynamic-table";
import { DynamicForm } from "./dynamic-form";
import { DynamicStats } from "./dynamic-stats";
import { DynamicCard } from "./dynamic-card";
import { UnknownComponent } from "./unknown-component";
import { LoadingState } from "./loading-state";
import { ErrorState } from "./error-state";

interface DynamicRendererProps {
  components: ComponentConfig[];
  tables: TableConfig[];
  appId: string;
}

export function DynamicRenderer({ components, tables, appId }: DynamicRendererProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  if (!components || components.length === 0) {
    return <ErrorState message="No components configured for this page" />;
  }

  return (
    <div key={refreshKey} className="space-y-6">
      {components.map((component) => (
        <ComponentWrapper
          key={component.id}
          component={component}
          tables={tables}
          appId={appId}
          onRefresh={handleRefresh}
        />
      ))}
    </div>
  );
}

function ComponentWrapper({
  component,
  tables,
  appId,
  onRefresh,
}: {
  component: ComponentConfig;
  tables: TableConfig[];
  appId: string;
  onRefresh: () => void;
}) {
  const [error, setError] = useState<Error | null>(null);

  // If component has an error, show error state but don't crash the whole app
  if (error) {
    return (
      <ErrorState
        message={`Error rendering ${component.name || component.id}: ${error.message}`}
        onRetry={() => setError(null)}
      />
    );
  }

  const table = tables.find((t) => t.name === component.table);

  try {
    switch (component.type) {
      case "table":
        return (
          <DynamicTable
            component={component}
            table={table}
            appId={appId}
            onRefresh={onRefresh}
          />
        );
      case "form":
        return (
          <DynamicForm
            component={component}
            table={table}
            appId={appId}
            onRefresh={onRefresh}
          />
        );
      case "stats":
        return <DynamicStats component={component} table={table} appId={appId} />;
      case "card":
        return <DynamicCard component={component} table={table} appId={appId} />;
      case "text":
      case "number":
      case "email":
      case "select":
      case "date":
      case "boolean":
      case "textarea":
        // These are usually nested in forms, but if standalone, render as a simple field
        return (
          <div className="p-4 border rounded-lg bg-card">
            <label className="block text-sm font-medium mb-2">
              {component.label || component.name}
            </label>
            <DynamicField component={component} />
          </div>
        );
      case "chart":
        return (
          <div className="p-4 border rounded-lg bg-card">
            <h3 className="font-semibold mb-4">{component.label || component.name}</h3>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Charts coming soon - data visualization placeholder
            </div>
          </div>
        );
      case "unknown":
      default:
        return <UnknownComponent component={component} />;
    }
  } catch (err) {
    setError(err as Error);
    return null;
  }
}

function DynamicField({ component }: { component: ComponentConfig }) {
  const baseClasses = "w-full p-2 border rounded-md bg-background";

  switch (component.type) {
    case "text":
      return <input type="text" className={baseClasses} placeholder={component.label} readOnly />;
    case "number":
      return <input type="number" className={baseClasses} placeholder={component.label} readOnly />;
    case "email":
      return <input type="email" className={baseClasses} placeholder={component.label} readOnly />;
    case "date":
      return <input type="date" className={baseClasses} readOnly />;
    case "boolean":
      return (
        <label className="flex items-center space-x-2">
          <input type="checkbox" className="rounded" readOnly />
          <span className="text-sm">{component.label}</span>
        </label>
      );
    case "textarea":
      return <textarea className={baseClasses} placeholder={component.label} readOnly rows={3} />;
    case "select":
      return (
        <select className={baseClasses} disabled>
          <option>{component.label}</option>
        </select>
      );
    default:
      return <UnknownComponent component={component} />;
  }
}

export { LoadingState, ErrorState, UnknownComponent };
