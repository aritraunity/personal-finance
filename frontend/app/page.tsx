"use client";

import { useCallback, useEffect, useState } from "react";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import FilterBar from "../components/FilterBar";
import Icon from "../components/Icon";
import StatCard, { StatCardSkeleton } from "../components/StatCard";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import { api } from "../lib/api";
import type {
  Category,
  Transaction,
  TransactionFilters,
  TransactionListResponse,
  TransactionPayload,
} from "../lib/types";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [response, setResponse] = useState<TransactionListResponse | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      let cats = await api.categories.list();
      if (cats.length === 0) {
        await api.categories.seed();
        cats = await api.categories.list();
      }
      setCategories(cats);
    } catch {
      // non-fatal
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResponse(await api.transactions.list(filters));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const handleCreate = async (payload: TransactionPayload) => {
    await api.transactions.create(payload);
    setShowForm(false);
    await loadTransactions();
  };

  const handleUpdate = async (payload: TransactionPayload) => {
    if (!editTarget) return;
    await api.transactions.update(editTarget.id, payload);
    setEditTarget(null);
    setShowForm(false);
    await loadTransactions();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.transactions.delete(deleteTarget.id);
      setDeleteTarget(null);
      await loadTransactions();
    } finally {
      setDeleting(false);
    }
  };

  const transactions = response?.data ?? [];
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-screen-xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transactions</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {response
              ? `${response.total} entr${response.total === 1 ? "y" : "ies"} total`
              : "Loading…"}
          </p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200"
        >
          <Icon name="add" size={18} />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Income" value={formatCurrency(totalIncome)} icon="trending_up" trend="positive" />
            <StatCard label="Expenses" value={formatCurrency(totalExpenses)} icon="trending_down" trend="negative" />
            <StatCard
              label="Net Balance"
              value={formatCurrency(netBalance)}
              icon="account_balance"
              trend={netBalance >= 0 ? "positive" : "negative"}
            />
            <StatCard
              label="Entries"
              value={String(response?.total ?? 0)}
              icon="receipt_long"
              trend="neutral"
            />
          </>
        )}
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        categories={categories}
        onChange={setFilters}
        onClear={() => setFilters({ page: 1 })}
      />

      {/* Transaction table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {error ? (
          <div className="flex items-center gap-3 p-6 text-rose-700">
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
              <Icon name="error" size={18} className="text-rose-500" />
            </div>
            <div>
              <p className="font-medium text-sm">{error}</p>
              <button
                onClick={loadTransactions}
                className="text-xs text-indigo-600 hover:text-indigo-700 mt-0.5 underline"
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <TransactionList
            transactions={transactions}
            loading={loading}
            onEdit={(tx) => { setEditTarget(tx); setShowForm(true); }}
            onDelete={setDeleteTarget}
          />
        )}

        {/* Pagination */}
        {response && response.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Page <span className="font-medium text-slate-700">{response.page}</span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">{response.pages}</span>
            </p>
            <div className="flex gap-2">
              <button
                disabled={response.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white border border-slate-200 rounded-lg transition-colors"
              >
                <Icon name="arrow_back" size={13} />
                Prev
              </button>
              <button
                disabled={response.page >= response.pages}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white border border-slate-200 rounded-lg transition-colors"
              >
                Next
                <Icon name="arrow_forward" size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <TransactionForm
          initial={editTarget}
          categories={categories}
          onSubmit={editTarget ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          label={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}
    </div>
  );
}
