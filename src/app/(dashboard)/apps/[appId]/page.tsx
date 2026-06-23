"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DynamicRenderer } from "@/components/dynamic-renderer/dynamic-renderer";
import { AppConfig } from "@/types/config";
import { useState } from "react";
import { LoadingState } from "@/components/dynamic-renderer/loading-state";
import { ErrorState } from "@/components/dynamic-renderer/error-state";
import { ArrowLeft, Download, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AppPage({ params }: { params: { appId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!session) return;

    async function fetchApp() {
      try {
        const res = await fetch(`/api/apps?id=${params.appId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to fetch app");
        
        setApp(json.data);
        setConfig(json.data.config as AppConfig);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchApp();
  }, [session, params.appId]);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this app? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/apps?id=${params.appId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("App deleted");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message);
      setDeleting(false);
    }
  }

  function handleExport() {
    if (!config) return;
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.name.replace(/\s+/g, "-").toLowerCase()}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Config exported!");
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState />
      </div>
    );
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!config) return <ErrorState message="No configuration found" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Apps
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center px-3 py-2 rounded-md border text-sm font-medium hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center px-3 py-2 rounded-md border text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? "Deleting..." : "Delete App"}
          </button>
        </div>
      </div>

      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">{config.name}</h1>
        <p className="text-gray-600 mt-1">{config.description}</p>
      </div>

      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {config.pages.map((page) => (
            <Link
              key={page.id}
              href={`/apps/${params.appId}/${page.id}`}
              className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-50 text-sm font-medium whitespace-nowrap"
            >
              {page.name}
            </Link>
          ))}
        </div>

        <div className="p-8 bg-white rounded-lg border text-center">
          <p className="text-gray-600">Select a page above to view the app</p>
          <p className="text-sm text-gray-400 mt-2">
            This app has {config.pages.length} pages and {config.database.length} tables
          </p>
        </div>
      </div>
    </div>
  );
}
