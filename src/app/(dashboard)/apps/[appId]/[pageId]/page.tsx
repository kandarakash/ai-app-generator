"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DynamicRenderer } from "@/components/dynamic-renderer/dynamic-renderer";
import { AppConfig } from "@/types/config";
import { LoadingState } from "@/components/dynamic-renderer/loading-state";
import { ErrorState } from "@/components/dynamic-renderer/error-state";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AppPageView({
  params,
}: {
  params: { appId: string; pageId: string };
}) {
  const { data: session } = useSession();
  const [app, setApp] = useState<any>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [pageConfig, setPageConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    async function fetchApp() {
      try {
        const res = await fetch(`/api/apps?id=${params.appId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to fetch app");

        const appConfig = json.data.config as AppConfig;
        setApp(json.data);
        setConfig(appConfig);

        const page = appConfig.pages.find((p: any) => p.id === params.pageId);
        if (!page) {
          throw new Error("Page not found in app config");
        }
        setPageConfig(page);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchApp();
  }, [session, params.appId, params.pageId]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState />
      </div>
    );
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!config || !pageConfig) return <ErrorState message="Configuration not found" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/apps/${params.appId}`}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to App
        </Link>
      </div>

      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">{config.name}</h1>
        <p className="text-gray-600 mt-1">
          {pageConfig.name} - {pageConfig.layout} layout
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {config.pages.map((page) => (
          <Link
            key={page.id}
            href={`/apps/${params.appId}/${page.id}`}
            className={`px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap ${
              page.id === params.pageId
                ? "bg-primary text-primary-foreground"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            {page.name}
          </Link>
        ))}
      </div>

      <DynamicRenderer
        components={pageConfig.components}
        tables={config.database}
        appId={params.appId}
      />
    </div>
  );
}
