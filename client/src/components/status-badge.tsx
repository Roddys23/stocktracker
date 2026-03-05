import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().trim();

  if (normalizedStatus === "in stock" || normalizedStatus === "new") {
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2.5 py-1 gap-1.5 no-default-active-elevate">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="font-medium">In Stock</span>
      </Badge>
    );
  }

  if (normalizedStatus === "out of stock") {
    return (
      <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 px-2.5 py-1 gap-1.5 no-default-active-elevate">
        <XCircle className="w-3.5 h-3.5" />
        <span className="font-medium">Out of Stock</span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 px-2.5 py-1 gap-1.5 no-default-active-elevate">
      <HelpCircle className="w-3.5 h-3.5" />
      <span className="font-medium">Unknown</span>
    </Badge>
  );
}
