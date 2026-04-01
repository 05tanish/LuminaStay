import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  className?: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  loading,
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn("rounded-2xl border bg-card p-6 space-y-3", className)}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-6 flex flex-col gap-3 hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="p-2 rounded-lg bg-muted">{icon}</div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {trend && (
          <span
            className={cn(
              "text-sm font-medium mb-1",
              trend.positive ? "text-emerald-500" : "text-rose-500"
            )}
          >
            {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
