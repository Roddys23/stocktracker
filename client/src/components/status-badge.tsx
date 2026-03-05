import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase().trim();

  if (normalized === "change") {
    return (
      <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-2.5 py-1 gap-1.5 no-default-active-elevate" data-testid="badge-status-change">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span className="font-medium">Change</span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2.5 py-1 gap-1.5 no-default-active-elevate" data-testid="badge-status-no-change">
      <CheckCircle2 className="w-3.5 h-3.5" />
      <span className="font-medium">No Change</span>
    </Badge>
  );
}
