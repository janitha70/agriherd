'use client'

import React, { useState, useMemo } from 'react'
import { ArrowLeft, Download, FileText, Printer, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { format, parseISO } from 'date-fns'
import { CategoryPieChart } from '@/components/expenses/CategoryPieChart'
import { MonthlyTrendChart } from '@/components/expenses/MonthlyTrendChart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ALL_CATEGORIES } from '@/lib/constants/categories'

export default function ReportsPage() {
  const expenses = useLiveQuery(() => db.expenses.toArray()) || []
  const incomes = useLiveQuery(() => db.farmIncome.toArray()) || []

  const [dateFilter, setDateFilter] = useState('all')

  const { filteredExpenses, filteredIncome } = useMemo(() => {
      const now = new Date()
      let fe = expenses
      let fi = incomes

      if (dateFilter === 'this_month') {
          const prefix = now.toISOString().slice(0, 7)
          fe = fe.filter(e => e.expense_date.startsWith(prefix))
          fi = fi.filter(i => i.income_date.startsWith(prefix))
      } else if (dateFilter === 'last_month') {
          const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          const prefix = lm.toISOString().slice(0, 7)
          fe = fe.filter(e => e.expense_date.startsWith(prefix))
          fi = fi.filter(i => i.income_date.startsWith(prefix))
      } else if (dateFilter === 'this_year') {
          const prefix = now.toISOString().slice(0, 4)
          fe = fe.filter(e => e.expense_date.startsWith(prefix))
          fi = fi.filter(i => i.income_date.startsWith(prefix))
      }

      return { filteredExpenses: fe, filteredIncome: fi }
  }, [expenses, incomes, dateFilter])

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalIncome = filteredIncome.reduce((sum, i) => sum + i.amount, 0)
  const netProfit = totalIncome - totalExpenses

  // Pie chart data
  const pieDataMap = filteredExpenses.reduce((acc, e) => {
      acc[e.category_id] = (acc[e.category_id] || 0) + e.amount
      return acc
  }, {} as Record<string, number>)
  
  const pieData = Object.entries(pieDataMap).map(([category_id, amount]) => ({
      category_id, amount
  }))

  // Trend chart data (group by YYYY-MM)
  const trendDataMap = new Map<string, { income: number, expenses: number }>()
  filteredExpenses.forEach(e => {
      const month = e.expense_date.slice(0, 7)
      if (!trendDataMap.has(month)) trendDataMap.set(month, { income: 0, expenses: 0 })
      trendDataMap.get(month)!.expenses += e.amount
  })
  filteredIncome.forEach(i => {
      const month = i.income_date.slice(0, 7)
      if (!trendDataMap.has(month)) trendDataMap.set(month, { income: 0, expenses: 0 })
      trendDataMap.get(month)!.income += i.amount
  })

  const trendData = Array.from(trendDataMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += "Date,Type,Category/Source,Title/Notes,Payment Method,Supplier ID,Amount(Rs)\n"
    
    filteredIncome.forEach(i => {
      csvContent += `${format(parseISO(i.income_date), 'yyyy-MM-dd')},Income,${i.source},${i.notes || ''},,,${i.amount}\n`
    })

    filteredExpenses.forEach(e => {
      const cat = ALL_CATEGORIES.find(c => c.id === e.category_id)?.name || e.category_id
      csvContent += `${format(parseISO(e.expense_date), 'yyyy-MM-dd')},Expense,${cat},${e.title},${e.payment_method},${e.supplier_id||''},${e.amount}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `agriherd_report_${dateFilter}_${format(new Date(), 'yyyy_MM_dd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
      window.print()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 print:m-0 print:p-0">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/expenses" 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-500 text-sm">මූල්‍ය වාර්තා සහ විශ්ලේෂණය</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Select value={dateFilter} onValueChange={(v) => v && setDateFilter(v)}>
                <SelectTrigger className="w-[180px] bg-white">
                    <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Filter Date" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="this_year">This Year</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" /> Print PDF
            </Button>
            <Button onClick={handleExportCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Cards */}
          <div className="lg:col-span-1 space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-gray-300">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Income</h3>
                  <p className="text-3xl font-bold text-emerald-600">Rs. {totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-gray-300">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Expenses</h3>
                  <p className="text-3xl font-bold text-rose-600">Rs. {totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div className={`p-6 rounded-2xl shadow-sm border ${netProfit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                  <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      Net Profit / Loss
                  </h3>
                  <p className={`text-4xl font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {netProfit >= 0 ? '+' : '-'} Rs. {Math.abs(netProfit).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
              </div>
          </div>

          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Income vs Expense Trend</h3>
                  <MonthlyTrendChart data={trendData} />
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Expenses by Category</h3>
                  <CategoryPieChart data={pieData} />
              </div>
          </div>
      </div>

    </div>
  )
}
