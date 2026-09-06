'use client'

import React from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
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
  const expenses = useLiveQuery(() => db.expenses.orderBy('expense_date').reverse().toArray()) || []
  const income = useLiveQuery(() => db.farmIncome.orderBy('income_date').reverse().toArray()) || []

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0)
  const balance = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses & Income</h1>
          <p className="text-gray-500">වියදම් සහ ආදායම් කළමනාකරණය</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/expenses/income">
            <Button variant="outline" className="bg-white border-paddy text-paddy hover:bg-paddy/10">
              <TrendingUp className="w-4 h-4 mr-2" />
              Add Income (ආදායම)
            </Button>
          </Link>
          <Link href="/dashboard/expenses/new">
            <Button className="bg-turmeric hover:bg-turmeric/90 text-ink font-medium">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Expense (වියදම)
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ExpenseSummaryCard 
          title="Total Expenses"
          title_si="මුළු වියදම"
          amount={totalExpenses}
          type="expense"
          icon={Wallet}
        />
        <ExpenseSummaryCard 
          title="Total Income"
          title_si="මුළු ආදායම"
          amount={totalIncome}
          type="income"
          icon={TrendingUp}
        />
        <ExpenseSummaryCard 
          title="Net Balance"
          title_si="ශේෂය"
          amount={balance}
          type="balance"
          icon={HandCoins}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProfitLossChart expenses={expenses} income={income} />
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Expenses (මෑත කාලීන වියදම්)</h2>
            <ExpenseList expenses={expenses.slice(0, 10)} />
          </div>
        </div>

        <div className="space-y-6">
          <FinancialAlerts />
          <FinancialForecast />
          <CostPerLitre />
          <AnimalFinancials />
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h2>
            <div className="space-y-3">
              <Link href="/dashboard/expenses/reports" className="flex items-center p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors">
                <div className="bg-gray-100 p-2 rounded-lg mr-3 text-gray-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Financial Reports</h3>
                  <p className="text-xs text-gray-500">මූල්‍ය වාර්තා</p>
                </div>
              </Link>
              
              <Link href="/dashboard/expenses/budget" className="flex items-center p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors">
                <div className="bg-gray-100 p-2 rounded-lg mr-3 text-gray-600">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Budget Tracker</h3>
                  <p className="text-xs text-gray-500">අයවැය කළමනාකරණය</p>
                </div>
              </Link>
              
              <Link href="/dashboard/expenses/suppliers" className="flex items-center p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors">
                <div className="bg-gray-100 p-2 rounded-lg mr-3 text-gray-600">
                  <HandCoins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Suppliers & Vendors</h3>
                  <p className="text-xs text-gray-500">සැපයුම්කරුවන්</p>
                </div>
              </Link>
              <Link href="/dashboard/expenses/recurring" className="flex items-center p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors">
                <div className="bg-gray-100 p-2 rounded-lg mr-3 text-gray-600">
                  <RefreshCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Recurring Expenses</h3>
                  <p className="text-xs text-gray-500">පුනරාවර්තන වියදම්</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
