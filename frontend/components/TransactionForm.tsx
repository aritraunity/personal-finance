"use client";

import { useEffect, useState } from "react";
import type { Category, Transaction, TransactionPayload } from "../lib/types";
import Icon from "./Icon";

interface TransactionFormProps {
  initial?: Transaction | null;
  categories: Category[];
  onSubmit: (payload: TransactionPayload) => Promise<void>;
  onCancel: () => void;
}

const empty: TransactionPayload = {
  name: "",
  amount: "",
  type: "expense",
  category_id: "",
  date: new Date().toISOString().slice(0, 10),
  merchant: "",
  description: "",
};

const inputBase =
  "w-full bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow px-3 py-2.5";

const inputOk = `${inputBase} border-slate-300 focus:ring-indigo-500`;
const inputErr = `${inputBase} border-rose-400 focus:ring-rose-500`;

export default function TransactionForm({
  initial,
  categories,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const [form, setForm] = useState<TransactionPayload>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        amount: initial.amount,
        type: initial.type,
        category_id: initial.category_id,
        date: initial.date,
        merchant: initial.merchant ?? "",
        description: initial.description ?? "",
      });
    } else {
      setForm(empty);
    }
    setErrors({});
    setSubmitError(null);
  }, [initial]);

  const setField = (key: keyof TransactionPayload, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!String(form.name).trim()) errs.name = "Name is required";
    const amt = Number(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) errs.amount = "Enter a positive amount";
    if (!form.category_id) errs.category_id = "Select a category";
    if (!form.date) errs.date = "Date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const doSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setSubmitError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const isEditing = !!initial;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Icon name={isEditing ? "edit" : "add"} size={18} className="text-indigo-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              {isEditing ? "Edit Transaction" : "New Transaction"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={(e) => { e.preventDefault(); doSubmit(); }}
          className="px-6 py-5 space-y-4"
        >
          {submitError && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              <Icon name="error" size={16} className="text-rose-500 shrink-0" />
              {submitError}
            </div>
          )}

          {/* Type toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Type</label>
            <div className="flex rounded-xl overflow-hidden border border-slate-200">
              {(["expense", "income"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setField("type", t)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors capitalize ${
                    form.type === t
                      ? t === "income"
                        ? "bg-emerald-600 text-white"
                        : "bg-rose-600 text-white"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {t === "income" ? "Income" : "Expense"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Grocery run"
                value={String(form.name)}
                onChange={(e) => setField("name", e.target.value)}
                className={errors.name ? inputErr : inputOk}
              />
              {errors.name && (
                <p className="text-xs text-rose-600 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Amount <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setField("amount", e.target.value)}
                  className={`${errors.amount ? inputErr : inputOk} pl-7 font-mono`}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-rose-600 mt-1">{errors.amount}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
                className={errors.date ? inputErr : inputOk}
              />
              {errors.date && (
                <p className="text-xs text-rose-600 mt-1">{errors.date}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.category_id}
                onChange={(e) => setField("category_id", e.target.value)}
                className={errors.category_id ? inputErr : inputOk}
              >
                <option value="">Select…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-xs text-rose-600 mt-1">{errors.category_id}</p>
              )}
            </div>

            {/* Merchant */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Merchant</label>
              <input
                type="text"
                placeholder="e.g. Whole Foods"
                value={String(form.merchant ?? "")}
                onChange={(e) => setField("merchant", e.target.value)}
                className={inputOk}
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                placeholder="Optional note…"
                value={String(form.description ?? "")}
                onChange={(e) => setField("description", e.target.value)}
                className={`${inputOk} resize-none`}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 pb-5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={doSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            {saving ? (
              <>
                <Icon name="sync" size={16} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Icon name="check" size={16} />
                {isEditing ? "Update" : "Add"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
