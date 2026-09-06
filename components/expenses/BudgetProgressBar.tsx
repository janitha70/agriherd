import React from 'react'
import { ALL_CATEGORIES, IconMap } from '@/lib/constants/categories'
import { CircleDot } from 'lucide-react'

interface BudgetProgressBarProps {
  categoryId: string
  budgetAmount: number
  spentAmount: number
}

export function BudgetProgressBar({ categoryId, budgetAmount, spentAmount }: BudgetProgressBarProps) {
  const category = ALL_CATEGORIES.find(c => c.id === categoryId)
  const Icon = category && IconMap[category.icon] ? IconMap[category.icon] : CircleDot
  const name = category?.name || 'Unknown'

  const percent = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0
  const isOverBudget = percent >= 100
  const isNearBudget = percent >= 80 && percent < 100

  // Clamped for progress bar width
  const clampedPercent = Math.min(percent, 100)

  let colorClass = 'bg-emerald-500'
  if (isOverBudget) colorClass = 'bg-rose-500'
  else if (isNearBudget) colorClass = 'bg-amber-500'

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="p-1.5 rounded-md"
            style={{ backgroundColor: `${category?.color || '#94a3b8'}20`, color: category?.color || '#94a3b8' }}
          >
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-semibold text-gray-800 text-sm">{name}</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900">
            Rs. {spentAmount.toLocaleString()} <span className="text-gray-400 font-normal">/ Rs. {budgetAmount.toLocaleString()}</span>
          </p>
        </div>
      </div>

      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={`${isOverBudget ? 'text-rose-600 font-medium' : isNearBudget ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
          {percent.toFixed(0)}% used
        </span>
        <span className="text-gray-500">
          Rs. {Math.max(budgetAmount - spentAmount, 0).toLocaleString()} remaining
        </span>
      </div>
    </div>
  )
}
