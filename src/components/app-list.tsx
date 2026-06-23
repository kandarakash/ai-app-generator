"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppConfig } from "@/types/config";
import { Trash2, ExternalLink, Code } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface AppListProps {
  apps: Array<{
    id: string;
    name: string;
    description: string | null;
    config: any;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export function AppList({ apps }: AppListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this app? This cannot be undone.")) return;
    
    setDeleting(id);
    try {
      const res = await fetch(`/api/apps?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("App deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  }

  if (apps.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border">
        <Code className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No apps yet</h3>
        <p className="text-gray-500 mt-1 mb-4">Create your first app using the config builder</p>
        <a
          href="/builder"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Create App
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {apps.map((app) => {
        const config = app.config as AppConfig;
        return (
          <Card key={app.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{app.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {app.description || config.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <span>{config.pages?.length || 0} pages</span>
                <span>•</span>
                <span>{config.database?.length || 0} tables</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/apps/${app.id}`}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open App
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(app.id)}
                  disabled={deleting === app.id}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
