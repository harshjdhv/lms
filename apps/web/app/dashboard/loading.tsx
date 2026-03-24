export default function DashboardLoading() {
  return (
    <div className="flex w-full min-w-0 flex-col">
      <div className="flex items-center justify-between gap-4 border-b bg-background px-6 py-5">
        <div className="space-y-2">
          <div className="h-7 w-56 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted/60" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-px border-b md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse bg-muted/40" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-px md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-48 animate-pulse bg-muted/30" />
        ))}
      </div>
    </div>
  );
}
