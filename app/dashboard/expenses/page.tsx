'use client'

import React from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useLanguage } from '@/contexts/LanguageContext'
import { ExpenseSummaryCard } from '@/components/expenses/ExpenseSummaryCard'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { ProfitLossChart } from '@/components/expenses/ProfitLossChart'
import { CostPerLitre } from '@/components/expenses/CostPerLitre'
import { AnimalFinancials } from '@/components/expenses/AnimalFinancials'
import { FinancialAlerts } from '@/components/expenses/FinancialAlerts'
import { FinancialForecast } from '@/components/expenses/FinancialForecast'
import { PlusCircle, Wallet, TrendingUp, HandCoins, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ExpensesDashboardPage() {
  const { t } = useLanguage()
  const expenses = useLiveQuery(() => db.expenses.orderBy('expense_date').reverse().toArray()) || []
  const income = useLiveQuery(() => db.farmIncome.orderBy('income_date').reverse().toArray()) || []

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0)
  const balance = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-emerald-300">{t('expensesTitle')}</h1>
          <p className="text-gray-500 dark:text-muted-foreground">{t('expensesSubtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/expenses/income">
            <Button variant="outline" className="bg-white dark:bg-transparent border-paddy dark:border-emerald-400 text-paddy dark:text-emerald-400 hover:bg-paddy/10 dark:hover:bg-emerald-950/40">
              <TrendingUp className="w-4 h-4 mr-2" />
              {t('addIncome')}
            </Button>
          </Link>
          <Link href="/dashboard/expenses/new">
            <Button className="bg-turmeric hover:bg-turmeric/90 text-ink font-medium">
              <PlusCircle className="w-4 h-4 mr-2" />
              {t('addExpense')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ExpenseSummaryCard 
          title={t('totalExpenses')}
          title_si=""
          amount={totalExpenses}
          type="expense"
          icon={Wallet}
        />
        <ExpenseSummaryCard 
          title={t('totalIncome')}
          title_si=""
          amount={totalIncome}
          type="income"
          icon={TrendingUp}
        />
        <ExpenseSummaryCard 
          title={t('netBalance')}
          title_si=""
          amount={balance}
          type="balance"
          icon={HandCoins}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <ProfitLossChart expenses={expenses} income={income} />
          
          <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-emerald-100">{t('recentExpenses')}</h2>
              <Link href="/dashboard/expenses/reports" className="text-xs text-paddy font-medium hover:underline">
                {t('viewAll')}
              </Link>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <ExpenseList expenses={expenses.slice(0, 5)} />
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <FinancialAlerts />
          <FinancialForecast />
          <CostPerLitre />
          <AnimalFinancials />
          
          <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-border p-5">
            <h2 className="text-base font-semibold text-gray-800 dark:text-emerald-100 mb-3">{t('quickLinks')}</h2>
            <div className="space-y-2">
              <Link href="/dashboard/expenses/reports" className="flex items-center p-3 rounded-xl border border-gray-100 dark:border-border hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors">
                <div className="bg-gray-100 dark:bg-emerald-950/40 p-2 rounded-lg mr-3 text-gray-600 dark:text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-emerald-100">{t('financialReports')}</h3>
                </div>
              </Link>
              
              <Link href="/dashboard/expenses/budget" className="flex items-center p-3 rounded-xl border border-gray-100 dark:border-border hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors">
                <div className="bg-gray-100 dark:bg-emerald-950/40 p-2 rounded-lg mr-3 text-gray-600 dark:text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-emerald-100">{t('budgetTracker')}</h3>
                </div>
              </Link>
              
              <Link href="/dashboard/expenses/suppliers" className="flex items-center p-3 rounded-xl border border-gray-100 dark:border-border hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors">
                <div className="bg-gray-100 dark:bg-emerald-950/40 p-2 rounded-lg mr-3 text-gray-600 dark:text-emerald-400">
                  <HandCoins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-emerald-100">{t('suppliersVendors')}</h3>
                </div>
              </Link>

              <Link href="/dashboard/expenses/recurring" className="flex items-center p-3 rounded-xl border border-gray-100 dark:border-border hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors">
                <div className="bg-gray-100 dark:bg-emerald-950/40 p-2 rounded-lg mr-3 text-gray-600 dark:text-emerald-400">
                  <RefreshCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-emerald-100">{t('recurringExpenses')}</h3>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
