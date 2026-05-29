"use client";

import type { Budget } from "../lib/types";
import Icon from "./Icon";

interface BudgetCardProps {
  budget: Budget;
  onEdit: (b: Budget) => void;
  onDelete: (b: Budget) => void;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function BudgetCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="h-4 bg-slate-100 rounded w-28" />
          <div className="h-3 bg-slate-100 rounded w-16" />
        </div>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full mb-4" />
      <div className="flex justify-between">
        <div className="space-y-1.5">
          <div className="h-3 bg-slate-100 rounded w-10" />
          <div className="h-4 bg-slate-100 rounded w-16" />
        </div>
        <div className="space-y-1.5 items-end flex flex-col">
          <div className="h-3 bg-slate-100 rounded w-10" />
          <div className="h-4 bg-slate-100 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export default function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const pct = Math.min(100, budget.utilization_pct);
  const isOver = budget.current_spent > budget.limit_amount;
  const isWarning = pct >= 80 && !isOver;

  const barColor = isOver ? "bg-rose-500" : isWarning ? "bg-amber-400" : "bg-emerald-500";
  const barBg = isOver ? "bg-rose-100" : isWarning ? "bg-amber-100" : "bg-emerald-100";
  const spentColor = isOver ? "text-rose-700" : isWarning ? "text-amber-700" : "text-emerald-700";

  return (
    <div className="group rounded-2xl bg-white border border-slate-200 shadow-sm p-5 hover:shadow-md hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold text-slate-900 text-sm tracking-tight">
            {budget.category_name}
          </p>
          <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600 capitalize">
            {budget.period}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <Icon name="edit" size={14} />
          </button>
          <button
            onClick={() => onDelete(budget)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Icon name="delete" size={14} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className={`w-full h-2 ${barBg} rounded-full overflow-hidden mb-1`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mb-3">
        <span className="text-xs text-slate-400">{pct.toFixed(0)}% used</span>
        {isOver && (
          <span className="text-xs font-medium text-rose-600 flex items-center gap-0.5">
            <Icon name="warning" size={11} />
            Over budget
          </span>
        )}
        {isWarning && (
          <span className="text-xs font-medium text-amber-600 flex items-center gap-0.5">
            <Icon name="warning" size={11} />
            Near limit
          </span>
        )}
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Spent</p>
          <p className={`font-bold font-mono text-sm tracking-tight ${spentColor}`}>
            {formatCurrency(budget.current_spent)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 mb-0.5">Limit</p>
          <p className="font-bold font-mono text-sm tracking-tight text-slate-700">
            {formatCurrency(budget.limit_amount)}
          </p>
        </div>
      </div>
    </div>
  );
}
