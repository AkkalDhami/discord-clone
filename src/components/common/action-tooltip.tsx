import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ActionTooltip({
  children,
  label,
  side,
  align,
  size
}: {
  children: React.ReactNode;
  label: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  size?: "sm" | "lg";
}) {
  return (
    <Tooltip>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align}>
        <p
          className={cn(
            "text-base font-medium",
            size === "sm" && "text-sm font-normal"
          )}>
          {label}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
