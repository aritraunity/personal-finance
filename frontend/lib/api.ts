import type {
  Budget,
  BudgetPayload,
  Category,
  Transaction,
  TransactionFilters,
  TransactionListResponse,
  TransactionPayload,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return body as T;
}

function toQuery(params: Record<string, string | number | undefined>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "" && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return q ? `?${q}` : "";
}

export const api = {
  categories: {
    list: () => request<Category[]>("/api/categories"),
    create: (name: string) =>
      request<Category>("/api/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    delete: (id: number) =>
      request<{ message: string }>(`/api/categories/${id}`, { method: "DELETE" }),
    seed: () =>
      request<{ message: string }>("/api/categories/seed", { method: "POST" }),
  },

  transactions: {
    list: (filters: TransactionFilters = {}) =>
      request<TransactionListResponse>(
        `/api/transactions${toQuery(filters as Record<string, string | number | undefined>)}`
      ),
    get: (id: number) => request<Transaction>(`/api/transactions/${id}`),
    create: (payload: TransactionPayload) =>
      request<Transaction>("/api/transactions", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: number, payload: TransactionPayload) =>
      request<Transaction>(`/api/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    delete: (id: number) =>
      request<{ message: string }>(`/api/transactions/${id}`, {
        method: "DELETE",
      }),
  },

  budgets: {
    list: () => request<Budget[]>("/api/budgets"),
    create: (payload: BudgetPayload) =>
      request<Budget>("/api/budgets", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: number, payload: Partial<BudgetPayload>) =>
      request<Budget>(`/api/budgets/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    delete: (id: number) =>
      request<{ message: string }>(`/api/budgets/${id}`, { method: "DELETE" }),
  },
};
