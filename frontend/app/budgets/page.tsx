"use client";

import { useCallback, useEffect, useState } from "react";
import BudgetCard, { BudgetCardSkeleton } from "../../components/BudgetCard";
import BudgetForm from "../../components/BudgetForm";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import Icon from "../../components/Icon";
import { api } from "../../lib/api";
import type { Budget, BudgetPayload, Category } from "../../lib/types";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Budget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [b, c] = await Promise.all([api.budgets.list(), api.categories.list()]);
      setBudgets(b);
      if (c.length === 0) {
        await api.categories.seed();
        setCategories(await api.categories.list());
      } else {
        setCategories(c);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (payload: BudgetPayload) => {
    await api.budgets.create(payload);
    setShowForm(false);
    await load();
  };

  const handleUpdate = async (payload: BudgetPayload) => {
    if (!editTarget) return;
    await api.budgets.update(editTarget.id, payload);
    setEditTarget(null);
    setShowForm(false);
    await load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.budgets.delete(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } finally {
      setDeleting(false);
    }
  };

  const totalLimit = budgets.reduce((s, b) => s + b.limit_amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.current_spent, 0);
  const overallPct = totalLimit > 0 ? Math.min(100, (totalSpent / totalLimit) * 100) : 0;
  const isOverall = totalSpent > totalLimit;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-screen-xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Budgets</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading
              ? "Loading…"
              : `${budgets.length} budget${budgets.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200"
        >
          <Icon name="add" size={18} />
          <span className="hidden sm:inline">New Budget</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Overall spend summary */}
      {!loading && budgets.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 tracking-tight">Overall spend</p>
              <p className="text-xs text-slate-500 mt-0.5">Across all budgets this period</p>
            </div>
            <div className="text-right">
              <p className="font-bold font-mono text-base tracking-tight text-slate-900">
                <span className={isOverall ? "text-rose-700" : "text-emerald-700"}>
                  {formatCurrency(totalSpent)}
                </span>
                <span className="text-slate-400 font-normal text-sm mx-1">/</span>
                {formatCurrency(totalLimit)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{overallPct.toFixed(1)}% used</p>
            </div>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isOverall ? "bg-rose-500" : overallPct >= 80 ? "bg-amber-400" : "bg-emerald-500"
              }`}
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-rose-700">
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
            <Icon name="error" size={18} className="text-rose-500" />
          </div>
          <div>
            <p className="font-medium text-sm">{error}</p>
            <button
              onClick={load}
              className="text-xs text-indigo-600 hover:text-indigo-700 mt-0.5 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <BudgetCardSkeleton key={i} />)}
        </div>
      ) : !error && budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Icon name="savings" size={28} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700">No budgets yet</p>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            Create a budget to start tracking your spending limits
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            <Icon name="add" size={16} />
            Create first budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={(budget) => { setEditTarget(budget); setShowForm(true); }}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <BudgetForm
          initial={editTarget}
          categories={categories}
          onSubmit={editTarget ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          label={`${deleteTarget.category_name ?? "Budget"} budget`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}
    </div>
  );
}
