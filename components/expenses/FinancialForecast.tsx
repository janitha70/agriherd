'use client'

import React, { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { TrendingUp, Calculator } from 'lucide-react'

export function FinancialForecast() {
  const expenses = useLiveQuery(() => db.expenses.toArray()) || []
  const incomes = useLiveQuery(() => db.farmIncome.toArray()) || []

  const forecast = useMemo(() => {
    // Very simple moving average forecast for the next month based on the last 3 months
    const now = new Date()
    
    let totalExpLast3 = 0
    let totalIncLast3 = 0
    let monthsFound = 0
    
    for (let i = 1; i <= 3; i++) {
        const m = new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString().slice(0, 7)
        const expMonth = expenses.filter(e => e.expense_date.startsWith(m)).reduce((s, e) => s + e.amount, 0)
        const incMonth = incomes.filter(inc => inc.income_date.startsWith(m)).reduce((s, inc) => s + inc.amount, 0)
        
        if (expMonth > 0 || incMonth > 0) {
            totalExpLast3 += expMonth
            totalIncLast3 += incMonth
            monthsFound++
        }
    }
    
    const divisor = monthsFound > 0 ? monthsFound : 1
    const predictedExp = totalExpLast3 / divisor
    const predictedInc = totalIncLast3 / divisor

    return {
      predictedExp,
      predictedInc,
      predictedProfit: predictedInc - predictedExp,
      hasData: monthsFound > 0
    }
  }, [expenses, incomes])

  return (
    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-2xl shadow-sm text-white h-full flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-emerald-100" />
        <h3 className="font-bold">Next Month Forecast</h3>
      </div>
      
      {!forecast.hasData ? (
          <p className="text-emerald-100 text-sm">Not enough historical data to generate a forecast.</p>
      ) : (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                  <p className="text-emerald-200 text-sm">Projected Income</p>
                  <p className="text-2xl font-bold">Rs. {forecast.predictedInc.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                  <p className="text-emerald-200 text-sm">Projected Expenses</p>
                  <p className="text-xl font-medium text-emerald-100">Rs. {forecast.predictedExp.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="pt-4 border-t border-emerald-500/50">
                  <p className="text-emerald-200 text-sm">Estimated Profit</p>
                  <p className="text-2xl font-black">Rs. {forecast.predictedProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
          </div>
      )}
    </div>
  )
}
