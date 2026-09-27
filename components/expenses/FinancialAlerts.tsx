'use client'

import React, { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export function FinancialAlerts() {
  const { t } = useLanguage()
  const expenses = useLiveQuery(() => db.expenses.toArray()) || []
  const budgets = useLiveQuery(() => db.budgets.toArray()) || []
  const recurring = useLiveQuery(() => db.recurringExpenses.toArray()) || []

  const alerts = useMemo(() => {
    const list: { id: string; type: 'warning' | 'info' | 'success'; message: string; title: string }[] = []
    
    // 1. Budget Alerts
    const currentMonth = new Date().toISOString().slice(0, 7)
    const currentBudgets = budgets.filter(b => b.month === currentMonth)
    const currentExpenses = expenses.filter(e => e.expense_date.startsWith(currentMonth))
    
    currentBudgets.forEach(b => {
      const spent = currentExpenses.filter(e => e.category_id === b.category_id).reduce((sum, e) => sum + e.amount, 0)
      if (b.budget_amount > 0) {
        const percent = (spent / b.budget_amount) * 100
        if (percent >= 100) {
          list.push({
            id: `budget-exceeded-${b.category_id}`,
            type: 'warning',
            title: 'budgetExceeded',
            message: `You have exceeded the budget for ${b.category_id}.`
          })
        } else if (percent >= 80) {
          list.push({
            id: `budget-near-${b.category_id}`,
            type: 'info',
            title: 'nearBudgetLimit',
            message: `You have used ${percent.toFixed(0)}% of the budget for ${b.category_id}.`
          })
        }
      }
    })

    // 2. Unpaid Supplier Invoices
    const unpaid = expenses.filter(e => e.payment_method === 'credit' && e.payment_status === 'partially_paid')
    if (unpaid.length > 0) {
      list.push({
        id: 'unpaid-invoices',
        type: 'warning',
        title: 'unpaidInvoices',
        message: `You have ${unpaid.length} partially paid invoices that need attention.`
      })
    }

    // 3. Upcoming Recurring Expenses
    const now = new Date()
    const upcoming = recurring.filter(r => {
      if (!r.is_active || !r.next_due_date) return false
      const due = new Date(r.next_due_date)
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24))
      return diffDays >= 0 && diffDays <= 7
    })

    if (upcoming.length > 0) {
      list.push({
        id: 'upcoming-recurring',
        type: 'info',
        title: 'upcomingExpenses',
        message: `You have ${upcoming.length} recurring expenses due within the next 7 days.`
      })
    }

    return list
  }, [expenses, budgets, recurring])

  if (alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-border h-full">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-gray-400 dark:text-muted-foreground" />
          <h3 className="font-bold text-gray-900 dark:text-emerald-100">{t('financialAlerts')}</h3>
        </div>
        <div className="flex items-center justify-center h-[200px] flex-col bg-gray-50 dark:bg-emerald-950/10 rounded-xl text-sm text-gray-500 dark:text-muted-foreground">
          <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-400" />
          {t('noAlerts')}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-border h-full">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-gray-900 dark:text-emerald-100">{t('financialAlerts')}</h3>
        <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full text-xs font-bold ml-auto">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[250px] pr-2">
        {alerts.map(alert => (
          <div key={alert.id} className={`p-4 rounded-xl border flex gap-3 ${
            alert.type === 'warning' ? 'bg-rose-50 border-rose-100 text-rose-900 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400' :
            'bg-blue-50 border-blue-100 text-blue-900 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400'
          }`}>
            <div className="mt-0.5 shrink-0">
              {alert.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" /> : <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />}
            </div>
            <div>
              <p className="font-semibold text-sm">{t(alert.title)}</p>
              <p className={`text-xs mt-0.5 ${alert.type === 'warning' ? 'text-rose-700 dark:text-rose-300' : 'text-blue-700 dark:text-blue-300'}`}>
                {alert.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
