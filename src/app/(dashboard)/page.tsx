"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AppList } from "@/components/app-list";
import { Button } from "@/components/ui/button";
import { AppListSkeleton } from "@/components/app-list-skeleton";
import { LoadingState } from "@/components/dynamic-renderer/loading-state";
import {
  Code,
  Database,
  Zap,
  Shield,
  ArrowRight,
  Layers,
  FileJson,
} from "lucide-react";

export default function LandingPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  // If authenticated, show dashboard
  if (session) {
    return <DashboardHome />;
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
              Build Apps from{" "}
              <span className="text-primary">JSON Configuration</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              AI App Generator transforms your JSON schema into fully functional
              applications with dynamic UI, APIs, and database — all in real time.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="px-8">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="px-8">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything You Need to Build Fast
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              No-code configuration meets full-code flexibility
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileJson className="w-8 h-8 text-primary" />}
              title="JSON-Driven Config"
              description="Define your database schema, pages, and components in a single JSON file. The system does the rest."
            />
            <FeatureCard
              icon={<Database className="w-8 h-8 text-primary" />}
              title="Dynamic Database"
              description="PostgreSQL with JSONB storage means your schema evolves without migrations."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-primary" />}
              title="Auto-Generated APIs"
              description="CRUD endpoints are generated automatically from your configuration. No backend code needed."
            />
            <FeatureCard
              icon={<Layers className="w-8 h-8 text-primary" />}
              title="Dynamic UI Rendering"
              description="Tables, forms, stats, and cards render from config. Unknown components fail gracefully."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-primary" />}
              title="Multi-Auth Built-In"
              description="Email/password, Google OAuth, and GitHub OAuth all ready to use out of the box."
            />
            <FeatureCard
              icon={<Code className="w-8 h-8 text-primary" />}
              title="CSV Import & Export"
              description="Bulk import data via CSV. Notifications keep you informed of every operation."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              step="1"
              title="Write JSON Config"
              description="Define your tables, fields, pages, and components in a simple JSON structure."
            />
            <StepCard
              step="2"
              title="App Generates Instantly"
              description="The runtime creates your database schema, APIs, and frontend UI automatically."
            />
            <StepCard
              step="3"
              title="Use Your App"
              description="Open generated pages, create records, import CSV, and manage data in real time."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">
            Built with Next.js, TypeScript, PostgreSQL, and Prisma
          </p>
        </div>
      </footer>
    </div>
  );
}

function DashboardHome() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/apps")
      .then((r) => r.json())
      .then((d) => {
        setApps(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Apps</h1>
            <p className="text-gray-600 mt-1">
              Manage and launch your dynamically generated applications
            </p>
          </div>
          <a
            href="/builder"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            + New App
          </a>
        </div>
        <AppListSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Apps</h1>
          <p className="text-gray-600 mt-1">
            Manage and launch your dynamically generated applications
          </p>
        </div>
        <a
          href="/builder"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          + New App
        </a>
      </div>
      <AppList apps={apps} />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-white rounded-xl border hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mb-4">
        {step}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
