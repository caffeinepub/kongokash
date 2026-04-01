interface StatusBadgeProps {
  status: "success" | "pending" | "error" | "info" | "cancelled";
  label: string;
  size?: "sm" | "md";
}

const STATUS_STYLES: Record<StatusBadgeProps["status"], string> = {
  success: "text-emerald-400 bg-emerald-900/20 border border-emerald-500/30",
  pending: "text-amber-400 bg-amber-900/20 border border-amber-500/30",
  error: "text-red-400 bg-red-900/20 border border-red-500/30",
  info: "text-blue-400 bg-blue-900/20 border border-blue-500/30",
  cancelled: "text-slate-400 bg-slate-800/50 border border-slate-700",
};

const STATUS_DOTS: Record<StatusBadgeProps["status"], string> = {
  success: "bg-emerald-400",
  pending: "bg-amber-400 animate-pulse",
  error: "bg-red-400",
  info: "bg-blue-400",
  cancelled: "bg-slate-400",
};

export function StatusBadge({ status, label, size = "sm" }: StatusBadgeProps) {
  const baseClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${baseClass} ${STATUS_STYLES[status]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOTS[status]}`}
      />
      {label}
    </span>
  );
}
