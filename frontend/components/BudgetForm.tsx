"use client";

import { useEffect, useState } from "react";
import type { Budget, BudgetPayload, BudgetPeriod, Category } from "../lib/types";
import Icon from "./Icon";

interface BudgetFormProps {
  initial?: Budget | null;
  categories: Category[];
  onSubmit: (payload: BudgetPayload) => Promise<void>;
  onCancel: () => void;
}

const empty: BudgetPayload = {
  category_id: "",
  limit_amount: "",
  current_spent: "",
  period: "monthly",
};

const inputBase =
  "w-full bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow px-3 py-2.5";
const inputOk = `${inputBase} border-slate-300 focus:ring-indigo-500`;
const inputErr = `${inputBase} border-rose-400 focus:ring-rose-500`;

export default function BudgetForm({ initial, categories, onSubmit, onCancel }: BudgetFormProps) {
  const [form, setForm] = useState<BudgetPayload>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setForm({
        category_id: initial.category_id,
        limit_amount: initial.limit_amount,
        current_spent: initial.current_spent,
        period: initial.period,
      });
    } else {
      setForm(empty);
    }
    setErrors({});
    setSubmitError(null);
  }, [initial]);

  const setField = (key: keyof BudgetPayload, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.category_id) errs.category_id = "Select a category";
    const lim = Number(form.limit_amount);
    if (!form.limit_amount || isNaN(lim) || lim <= 0) errs.limit_amount = "Enter a positive limit";
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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Icon name="savings" size={18} className="text-indigo-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              {isEditing ? "Edit Budget" : "New Budget"}
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

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.category_id}
              onChange={(e) => setField("category_id", e.target.value)}
              disabled={isEditing}
              className={`${errors.category_id ? inputErr : inputOk} disabled:opacity-50 disabled:cursor-not-allowed`}
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

          <div className="grid grid-cols-2 gap-4">
            {/* Limit */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Limit <span className="text-rose-500">*</span>
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
                  value={form.limit_amount}
                  onChange={(e) => setField("limit_amount", e.target.value)}
                  className={`${errors.limit_amount ? inputErr : inputOk} pl-7 font-mono`}
                />
              </div>
              {errors.limit_amount && (
                <p className="text-xs text-rose-600 mt-1">{errors.limit_amount}</p>
              )}
            </div>

            {/* Current spent */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Spent so far
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.current_spent}
                  onChange={(e) => setField("current_spent", e.target.value)}
                  className={`${inputOk} pl-7 font-mono`}
                />
              </div>
            </div>
          </div>

          {/* Period */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Period</label>
            <div className="flex rounded-xl overflow-hidden border border-slate-200">
              {(["monthly", "yearly"] as BudgetPeriod[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setField("period", p)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors capitalize ${
                    form.period === p
                      ? "bg-indigo-600 text-white"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
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
                {isEditing ? "Update" : "Create"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
