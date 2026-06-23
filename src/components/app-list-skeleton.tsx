export function AppListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-lg border bg-white animate-pulse"
        >
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="flex gap-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 bg-gray-200 rounded flex-1" />
            <div className="h-9 bg-gray-200 rounded w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}
