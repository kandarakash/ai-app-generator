"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppConfig, normalizeConfig } from "@/types/config";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Code, Eye, Wand2 } from "lucide-react";

export function ConfigBuilder() {
  const [jsonInput, setJsonInput] = useState("");
  const [preview, setPreview] = useState<AppConfig | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"json" | "preview">("json");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handlePreview() {
    try {
      const parsed = JSON.parse(jsonInput);
      const normalized = normalizeConfig(parsed);
      setPreview(normalized);
      setErrors([]);
      setMode("preview");
    } catch (err: any) {
      setErrors([err.message]);
      setPreview(null);
    }
  }

  function loadDemo() {
    const demoConfig = {
      name: "Task Manager",
      description: "Simple task management app",
      database: [
        {
          name: "tasks",
          fields: [
            { name: "title", type: "string", required: true, label: "Title" },
            { name: "description", type: "textarea", required: false, label: "Description" },
            { name: "priority", type: "enum", required: true, label: "Priority", options: ["Low", "Medium", "High"], default: "Medium" },
            { name: "completed", type: "boolean", required: false, label: "Completed", default: false },
            { name: "dueDate", type: "date", required: false, label: "Due Date" },
          ],
        },
      ],
      pages: [
        {
          id: "dashboard",
          name: "Dashboard",
          route: "/dashboard",
          layout: "dashboard",
          components: [
            { id: "stats-tasks", type: "stats", name: "Total Tasks", label: "Total Tasks", table: "tasks", config: { count: true } },
            { id: "tasks-table", type: "table", name: "All Tasks", label: "Tasks", table: "tasks", fields: ["title", "priority", "completed", "dueDate"] },
          ],
        },
        {
          id: "new-task",
          name: "New Task",
          route: "/new",
          layout: "form",
          table: "tasks",
          components: [
            { id: "task-form", type: "form", name: "Create Task", label: "Create New Task", table: "tasks", fields: ["title", "description", "priority", "completed", "dueDate"] },
          ],
        },
      ],
      apis: [
        { path: "/api/tasks/list", method: "GET", table: "tasks", action: "list" },
        { path: "/api/tasks/create", method: "POST", table: "tasks", action: "create" },
      ],
      settings: { theme: "light", requireAuth: true },
    };
    setJsonInput(JSON.stringify(demoConfig, null, 2));
    setName("Task Manager");
    setDescription("Simple task management app");
  }

  async function handleCreate() {
    if (!name) {
      toast.error("App name is required");
      return;
    }

    let config: AppConfig;
    try {
      const parsed = JSON.parse(jsonInput || "{}");
      config = normalizeConfig(parsed);
    } catch (err: any) {
      toast.error("Invalid JSON: " + err.message);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, config }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create app");

      toast.success("App created successfully!");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Config Builder</h1>
        <Button variant="outline" onClick={loadDemo}>
          <Wand2 className="w-4 h-4 mr-2" />
          Load Demo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>App Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>App Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My App" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this app do?"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>JSON Configuration</CardTitle>
              <div className="flex gap-2">
                <Button variant={mode === "json" ? "default" : "outline"} size="sm" onClick={() => setMode("json")}>
                  <Code className="w-4 h-4 mr-1" />
                  JSON
                </Button>
                <Button variant={mode === "preview" ? "default" : "outline"} size="sm" onClick={handlePreview}>
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {mode === "json" ? (
                <div className="space-y-4">
                  <Textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder={`{\n  "database": [...],\n  "pages": [...]\n}`}
                    className="font-mono min-h-[400px]"
                  />
                  {errors.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      {errors.map((e, i) => (
                        <p key={i}>{e}</p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded min-h-[400px]">
                  {preview ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold">{preview.name}</h3>
                      <p className="text-sm text-gray-600">{preview.description}</p>
                      <div className="space-y-2">
                        <p className="font-medium text-sm">Pages ({preview.pages.length}):</p>
                        {preview.pages.map((page) => (
                          <div key={page.id} className="p-2 bg-white rounded border text-sm">
                            <span className="font-medium">{page.name}</span> - {page.layout}
                            <span className="text-gray-500 ml-2">({page.components.length} components)</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-sm">Tables ({preview.database.length}):</p>
                        {preview.database.map((table) => (
                          <div key={table.name} className="p-2 bg-white rounded border text-sm">
                            <span className="font-medium">{table.name}</span>
                            <span className="text-gray-500 ml-2">({table.fields.length} fields)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">Click Preview to see configuration</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Button onClick={handleCreate} disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create App"}
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Database Tables</h4>
                <p className="text-gray-600">
                  Define your data model. Each table has fields with types: string, number, boolean, date, enum, email, textarea.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Pages</h4>
                <p className="text-gray-600">
                  Each page has a layout (dashboard, table, form) and components that render dynamically.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Components</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li><strong>table</strong> - Display records with search and delete</li>
                  <li><strong>form</strong> - Create new records with validation</li>
                  <li><strong>stats</strong> - Show count of records</li>
                  <li><strong>card</strong> - Show recent records as cards</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Example Structure</h4>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`{
  "database": [{
    "name": "contacts",
    "fields": [
      { "name": "email", "type": "email", "required": true },
      { "name": "status", "type": "enum", "options": ["Lead", "Customer"] }
    ]
  }],
  "pages": [{
    "id": "contacts",
    "name": "Contacts",
    "route": "/contacts",
    "components": [
      { "id": "table", "type": "table", "table": "contacts" }
    ]
  }]
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
