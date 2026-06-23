import { LoadingState } from "@/components/dynamic-renderer/loading-state";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState />
    </div>
  );
}
