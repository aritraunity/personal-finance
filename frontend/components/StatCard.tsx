"use client";

import Icon from "./Icon";

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  trend?: "positive" | "negative" | "neutral";
}

const config = {
  positive: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    valueColor: "text-emerald-700",
  },
  negative: {
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    valueColor: "text-rose-700",
  },
  neutral: {
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    valueColor: "text-slate-900",
  },
};

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 flex items-center gap-4 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-slate-100 rounded w-24" />
        <div className="h-6 bg-slate-100 rounded w-32" />
      </div>
    </div>
  );
}

export default function StatCard({ label, value, icon, trend = "neutral" }: StatCardProps) {
  const { iconBg, iconColor, valueColor } = config[trend];

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${iconBg}`}>
        <Icon name={icon} size={22} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate">
          {label}
        </p>
        <p className={`text-xl font-bold tracking-tight mt-0.5 font-mono ${valueColor}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
