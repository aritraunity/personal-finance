export type TransactionType = "income" | "expense";
export type BudgetPeriod = "monthly" | "yearly";

export interface Category {
  id: number;
  name: string;
  is_system: boolean;
  icon: string | null;
}

export interface Transaction {
  id: number;
  name: string;
  amount: number;
  type: TransactionType;
  category_id: number;
  category_name: string | null;
  date: string;
  merchant: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionPayload {
  name: string;
  amount: number | string;
  type: TransactionType;
  category_id: number | string;
  date: string;
  merchant?: string;
  description?: string;
}

export interface TransactionListResponse {
  data: Transaction[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface Budget {
  id: number;
  category_id: number;
  category_name: string | null;
  limit_amount: number;
  current_spent: number;
  remaining: number;
  utilization_pct: number;
  period: BudgetPeriod;
}

export interface BudgetPayload {
  category_id: number | string;
  limit_amount: number | string;
  current_spent?: number | string;
  period?: BudgetPeriod;
}

export interface TransactionFilters {
  date_from?: string;
  date_to?: string;
  category_id?: string;
  type?: string;
  name?: string;
  merchant?: string;
  page?: number;
}
