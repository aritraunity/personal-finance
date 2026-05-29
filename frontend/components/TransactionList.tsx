"use client";

import type { Transaction } from "../lib/types";
import Icon from "./Icon";

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100 animate-pulse">
      <td className="py-3.5 px-4">
        <div className="h-3.5 bg-slate-100 rounded w-20" />
      </td>
      <td className="py-3.5 px-4">
        <div className="h-3.5 bg-slate-100 rounded w-40 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-24" />
      </td>
      <td className="py-3.5 px-4 hidden sm:table-cell">
        <div className="h-3.5 bg-slate-100 rounded w-24" />
      </td>
      <td className="py-3.5 px-4 hidden md:table-cell">
        <div className="h-5 bg-slate-100 rounded-full w-20" />
      </td>
      <td className="py-3.5 px-4 hidden lg:table-cell">
        <div className="h-5 bg-slate-100 rounded-full w-16" />
      </td>
      <td className="py-3.5 px-4 text-right">
        <div className="h-3.5 bg-slate-100 rounded w-16 ml-auto" />
      </td>
      <td className="py-3.5 px-4 w-20" />
    </tr>
  );
}

function MobileCard({ tx, onEdit, onDelete }: { tx: Transaction; onEdit: () => void; onDelete: () => void }) {
  const isIncome = tx.type === "income";
  return (
    <div className="p-4 border-b border-slate-100 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 text-sm truncate">{tx.name}</p>
          {tx.merchant && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{tx.merchant}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-slate-400">{formatDate(tx.date)}</span>
            {tx.category_name && (
              <span className="inline-flex px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                {tx.category_name}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`font-semibold font-mono text-sm ${isIncome ? "text-emerald-700" : "text-rose-700"}`}>
            {isIncome ? "+" : "−"}{formatCurrency(tx.amount)}
          </span>
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Icon name="edit" size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Icon name="delete" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransactionList({
  transactions,
  loading,
  onEdit,
  onDelete,
}: TransactionListProps) {
  if (loading) {
    return (
      <>
        {/* Desktop skeleton */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Merchant</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Type</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="py-3 px-4 w-20" />
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        </div>
        {/* Mobile skeleton */}
        <div className="sm:hidden divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-100 rounded w-36" />
                  <div className="h-3 bg-slate-100 rounded w-24" />
                </div>
                <div className="h-4 bg-slate-100 rounded w-16 ml-4" />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Icon name="receipt_long" size={28} className="text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">No transactions found</p>
        <p className="text-xs text-slate-400 mt-1">Adjust filters or add a new entry</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/60">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Merchant</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Category</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Type</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="py-3 px-4 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isIncome = tx.type === "income";
              return (
                <tr key={tx.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-900 truncate max-w-[180px]">{tx.name}</p>
                    {tx.description && (
                      <p className="text-xs text-slate-400 truncate max-w-[180px] mt-0.5">
                        {tx.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-sm hidden sm:table-cell">
                    {tx.merchant ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-3.5 px-4 hidden md:table-cell">
                    {tx.category_name ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                        {tx.category_name}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 hidden lg:table-cell">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        isIncome
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      <Icon
                        name={isIncome ? "trending_up" : "trending_down"}
                        size={12}
                      />
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span
                      className={`font-semibold font-mono ${
                        isIncome ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {isIncome ? "+" : "−"}
                      {formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <Icon name="edit" size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete"
                      >
                        <Icon name="delete" size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden divide-y divide-slate-100">
        {transactions.map((tx) => (
          <MobileCard
            key={tx.id}
            tx={tx}
            onEdit={() => onEdit(tx)}
            onDelete={() => onDelete(tx)}
          />
        ))}
      </div>
    </>
  );
}
