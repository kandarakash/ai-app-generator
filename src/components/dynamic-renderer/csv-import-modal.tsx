"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload } from "lucide-react";
import toast from "react-hot-toast";

interface CsvImportModalProps {
  appId: string;
  tableName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CsvImportModal({ appId, tableName, onClose, onSuccess }: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  async function handleUpload() {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("appId", appId);
    formData.append("tableName", tableName);

    try {
      const res = await fetch("/api/csv/import", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");

      setResults(json.results);
      toast.success(`Imported ${json.results.imported} records`);
      if (json.results.failed === 0) {
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Import CSV into {tableName}</CardTitle>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>CSV File</Label>
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-muted-foreground">
              CSV headers should match field names: firstName, lastName, email, etc.
            </p>
          </div>

          <Button onClick={handleUpload} disabled={loading || !file} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            {loading ? "Importing..." : "Import CSV"}
          </Button>

          {results && (
            <div className="p-4 rounded-lg bg-gray-50 text-sm">
              <p className="font-medium">Import Results:</p>
              <p className="text-green-600">Imported: {results.imported}</p>
              <p className="text-red-600">Failed: {results.failed}</p>
              <p>Total: {results.total}</p>
              {results.errors.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto">
                  <p className="font-medium text-red-600">Errors:</p>
                  {results.errors.map((err: any, i: number) => (
                    <p key={i} className="text-xs text-red-500">
                      Row {err.row}: {Object.values(err.errors).join(", ")}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
