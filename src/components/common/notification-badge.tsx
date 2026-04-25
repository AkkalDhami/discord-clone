import { cn } from "@/lib/utils";

export function NotificationBadge({
  stat,
  className
}: {
  stat: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-primary-500 absolute -top-2 -right-3 z-1 flex size-6 items-center justify-center rounded-full p-1 text-xs text-white",
        className
      )}>
      {stat}
    </div>
  );
}
