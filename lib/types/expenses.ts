export interface LocalExpenseCategory {
  id: string
  name: string
  name_si?: string // Sinhala name
  icon?: string
  color?: string
  syncStatus: 'pending' | 'synced'
}

export interface LocalSupplier {
  id?: number
  record_id: string // UUID
  name: string
  phone?: string
  address?: string
  notes?: string
  syncStatus: 'pending' | 'synced'
  createdAt: string
}

export interface LocalRecurringExpense {
  id?: number
  record_id: string // UUID
  title: string
  category_id: string
  amount: number
  recurrence_interval: 'daily' | 'weekly' | 'monthly' | 'yearly'
  start_date?: string
  next_due_date: string
  is_active: boolean
  notes?: string
  syncStatus: 'pending' | 'synced'
  createdAt: string
}

export interface LocalExpense {
  id?: number
  record_id: string // UUID
  category_id: string
  title: string
  amount: number
  expense_date: string
  payment_method: 'cash' | 'bank_transfer' | 'credit' | 'card' | 'other'
  payment_status?: 'paid' | 'pending' | 'partially_paid'
  paid_amount?: number
  supplier_id?: string
  invoice_number?: string
  notes?: string
  animal_tag_id?: string
  receipt_url?: string
  receipt_data?: string // Base64 image data
  is_recurring: boolean
  recurrence_interval?: 'weekly' | 'monthly' | 'yearly'
  syncStatus: 'pending' | 'synced'
  createdAt: string
  updatedAt: string
}

export interface LocalFarmIncome {
  id?: number
  record_id: string // UUID
  source: string
  amount: number
  income_date: string
  notes?: string
  syncStatus: 'pending' | 'synced'
  createdAt: string
  updatedAt?: string
}

export interface LocalBudget {
  id?: number
  record_id: string // UUID
  category_id: string
  month?: string
  budget_amount: number
  syncStatus: 'pending' | 'synced'
  createdAt: string
}
