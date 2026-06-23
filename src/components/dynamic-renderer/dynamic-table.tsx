"use client";

import { useState, useEffect } from "react";
import { ComponentConfig, TableConfig, FieldConfig } from "@/types/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingState } from "./loading-state";
import { ErrorState } from "./error-state";
import { Pencil, Trash2, Plus, Search, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { CsvImportModal } from "./csv-import-modal";
import { DynamicForm } from "./dynamic-form";

interface DynamicTableProps {
  component: ComponentConfig;
  table?: TableConfig;
  appId: string;
  onRefresh: () => void;
}

export function DynamicTable({ component, table, appId, onRefresh }: DynamicTableProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);

  const fields = component.fields || table?.fields.map((f) => f.name) || [];
  const tableName = component.table || "";

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/dynamic/${appId}/list?table=${encodeURIComponent(tableName)}`
      );
      if (!res.ok) throw new Error("Failed to fetch data");
      const json = await res.json();
      setRecords(json.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [appId, tableName]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`/api/dynamic/${appId}/delete?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Record deleted");
      fetchData();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  const filteredRecords = records.filter((record) => {
    if (!search) return true;
    const data = record.data as Record<string, any>;
    return fields.some((field) => {
      const value = String(data[field] || "").toLowerCase();
      return value.includes(search.toLowerCase());
    });
  });

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!table) return <ErrorState message={`Table "${component.table}" not found in config`} />;

  // Get field configs for labels
  const fieldMap = new Map(table.fields.map((f) => [f.name, f]));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{component.label || component.name}</CardTitle>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4 mr-1" />
            Import CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                {fields.map((field) => (
                  <th key={field} className="px-4 py-3 text-left font-medium">
                    {fieldMap.get(field)?.label || field}
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={fields.length + 1}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const data = record.data as Record<string, any>;
                  return (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      {fields.map((field) => (
                        <td key={field} className="px-4 py-3">
                          {formatValue(data[field], fieldMap.get(field))}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingRecord(record)}
                            className="p-1 hover:bg-blue-100 rounded text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {showImport && (
        <CsvImportModal
          appId={appId}
          tableName={tableName}
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            setShowImport(false);
            fetchData();
            onRefresh();
          }}
        />
      )}

      {editingRecord && table && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <DynamicForm
              component={component}
              table={table}
              appId={appId}
              onRefresh={() => {
                fetchData();
                onRefresh();
              }}
              initialData={editingRecord.data as Record<string, any>}
              recordId={editingRecord.id}
              onCancel={() => setEditingRecord(null)}
            />
          </div>
        </div>
      )}
    </Card>
  );
}

function formatValue(value: any, field?: FieldConfig): string {
  if (value === null || value === undefined) return "-";
  if (field?.type === "boolean") {
    return value ? "Yes" : "No";
  }
  if (field?.type === "date") {
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return String(value);
    }
  }
  return String(value);
}
