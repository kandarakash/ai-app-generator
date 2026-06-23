"use client";

import { useState } from "react";
import { ComponentConfig, TableConfig, FieldConfig } from "@/types/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { Pencil, Plus, Save, X } from "lucide-react";

interface DynamicFormProps {
  component: ComponentConfig;
  table?: TableConfig;
  appId: string;
  onRefresh: () => void;
  initialData?: Record<string, any>;
  recordId?: string;
  onCancel?: () => void;
}

export function DynamicForm({
  component,
  table,
  appId,
  onRefresh,
  initialData,
  recordId,
  onCancel,
}: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, any>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = !!recordId;

  if (!table) return <div className="p-4 border rounded bg-red-50">Table not found</div>;

  const fields = component.fields
    ? table.fields.filter((f) => component.fields?.includes(f.name))
    : table.fields;

  function handleChange(field: FieldConfig, value: any) {
    setValues((prev) => ({ ...prev, [field.name]: value }));
    setErrors((prev) => ({ ...prev, [field.name]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = isEditMode
        ? `/api/dynamic/${appId}/update`
        : `/api/dynamic/${appId}/create`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: table.name,
          data: values,
          ...(isEditMode && { id: recordId }),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.details) {
          setErrors(json.details);
        }
        throw new Error(json.error || "Failed to save");
      }

      toast.success(isEditMode ? "Record updated!" : "Record created!");
      setValues({});
      setErrors({});
      onRefresh();
      if (onCancel) onCancel();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{isEditMode ? "Edit Record" : component.label || component.name}</CardTitle>
        {isEditMode && onCancel && (
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label || field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <FormField
                  field={field}
                  value={values[field.name]}
                  onChange={handleChange}
                />
                {errors[field.name] && (
                  <p className="text-sm text-red-600">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {isEditMode ? (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  {submitting ? "Saving..." : "Update Record"}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  {submitting ? "Creating..." : "Create Record"}
                </>
              )}
            </Button>
            {isEditMode && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function FormField({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: any;
  onChange: (field: FieldConfig, value: any) => void;
}) {
  const commonClasses =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  switch (field.type) {
    case "textarea":
      return (
        <textarea
          className={commonClasses + " min-h-[80px]"}
          value={value || ""}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={field.label}
        />
      );
    case "number":
      return (
        <input
          type="number"
          className={commonClasses}
          value={value ?? ""}
          onChange={(e) =>
            onChange(field, e.target.valueAsNumber || e.target.value)
          }
          placeholder={field.label}
        />
      );
    case "email":
      return (
        <input
          type="email"
          className={commonClasses}
          value={value || ""}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={field.label}
        />
      );
    case "date":
      // Handle date values - might be ISO string, need to convert to YYYY-MM-DD for input
      const dateValue = value
        ? typeof value === "string"
          ? value.split("T")[0]
          : new Date(value).toISOString().split("T")[0]
        : "";
      return (
        <input
          type="date"
          className={commonClasses}
          value={dateValue}
          onChange={(e) => onChange(field, e.target.value)}
        />
      );
    case "boolean":
      return (
        <label className="flex items-center space-x-2 h-10">
          <input
            type="checkbox"
            className="rounded border-gray-300"
            checked={value === true || value === "true"}
            onChange={(e) => onChange(field, e.target.checked)}
          />
          <span className="text-sm">{field.label}</span>
        </label>
      );
    case "enum":
      return (
        <select
          className={commonClasses}
          value={value || ""}
          onChange={(e) => onChange(field, e.target.value)}
        >
          <option value="">Select {field.label}</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case "string":
    default:
      return (
        <input
          type="text"
          className={commonClasses}
          value={value || ""}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={field.label}
        />
      );
  }
}
