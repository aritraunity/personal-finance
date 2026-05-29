"use client";

import { useCallback } from "react";
import type { Category, TransactionFilters } from "../lib/types";
import Icon from "./Icon";

interface FilterBarProps {
  filters: TransactionFilters;
  categories: Category[];
  onChange: (filters: TransactionFilters) => void;
  onClear: () => void;
}

const inputBase =
  "w-full bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow";

export default function FilterBar({ filters, categories, onChange, onClear }: FilterBarProps) {
  const set = useCallback(
    (key: keyof TransactionFilters, value: string) => {
      onChange({ ...filters, [key]: value || undefined, page: 1 });
    },
    [filters, onChange]
  );

  const hasActive = Object.entries(filters).some(
    ([k, v]) => k !== "page" && v !== undefined && v !== ""
  );

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Name */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Name</label>
          <div className="relative">
            <Icon
              name="search"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search name…"
              value={filters.name ?? ""}
              onChange={(e) => set("name", e.target.value)}
              className={`${inputBase} pl-9 pr-3 py-2`}
            />
          </div>
        </div>

        {/* Merchant */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Merchant</label>
          <div className="relative">
            <Icon
              name="storefront"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search merchant…"
              value={filters.merchant ?? ""}
              onChange={(e) => set("merchant", e.target.value)}
              className={`${inputBase} pl-9 pr-3 py-2`}
            />
          </div>
        </div>

        {/* Category */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Category</label>
          <div className="relative">
            <Icon
              name="category"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              value={filters.category_id ?? ""}
              onChange={(e) => set("category_id", e.target.value)}
              className={`${inputBase} pl-9 pr-3 py-2 appearance-none`}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Type */}
        <div className="min-w-[130px]">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Type</label>
          <div className="relative">
            <Icon
              name="swap_vert"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              value={filters.type ?? ""}
              onChange={(e) => set("type", e.target.value)}
              className={`${inputBase} pl-9 pr-3 py-2 appearance-none`}
            >
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>

        {/* Date from */}
        <div className="min-w-[155px]">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">From</label>
          <div className="relative">
            <Icon
              name="calendar_today"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="date"
              value={filters.date_from ?? ""}
              onChange={(e) => set("date_from", e.target.value)}
              className={`${inputBase} pl-9 pr-3 py-2`}
            />
          </div>
        </div>

        {/* Date to */}
        <div className="min-w-[155px]">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">To</label>
          <div className="relative">
            <Icon
              name="event"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="date"
              value={filters.date_to ?? ""}
              onChange={(e) => set("date_to", e.target.value)}
              className={`${inputBase} pl-9 pr-3 py-2`}
            />
          </div>
        </div>

        {/* Clear */}
        {hasActive && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 border border-slate-300 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <Icon name="filter_list_off" size={15} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
