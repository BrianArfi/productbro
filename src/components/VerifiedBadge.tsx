import { BadgeCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  compact?: boolean;
  className?: string;
}

const VerifiedBadge = ({ compact = false, className }: VerifiedBadgeProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground",
          compact ? "p-1" : "px-2.5 py-1 text-xs font-semibold",
          className
        )}
      >
        <BadgeCheck className={compact ? "h-4 w-4" : "h-3.5 w-3.5"} />
        {!compact && "Verified"}
      </span>
    </TooltipTrigger>
    <TooltipContent>Claimed and maintained by the PM themselves</TooltipContent>
  </Tooltip>
);

export default VerifiedBadge;
