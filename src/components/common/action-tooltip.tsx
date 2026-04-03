import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";

export function ActionTooltip({
  children,
  label,
  side,
  align
}: {
  children: React.ReactNode;
  label: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}) {
  return (
    <Tooltip>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align}>
        <p className="text-base font-medium">{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
