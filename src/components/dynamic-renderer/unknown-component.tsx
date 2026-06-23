"use client";

import { ComponentConfig } from "@/types/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface UnknownComponentProps {
  component: ComponentConfig;
}

export function UnknownComponent({ component }: UnknownComponentProps) {
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-yellow-800">
          <AlertTriangle className="w-4 h-4" />
          Unknown Component: {component.type}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-yellow-700">
          The component <code className="font-mono bg-yellow-100 px-1 rounded">{component.name}</code>{" "}
          has an unknown type <code className="font-mono bg-yellow-100 px-1 rounded">{component.type}</code>.
        </p>
        <p className="text-xs text-yellow-600 mt-2">
          This component was skipped gracefully. Check your configuration.
        </p>
      </CardContent>
    </Card>
  );
}
