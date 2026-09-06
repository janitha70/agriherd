'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowDownIcon, ArrowUpIcon, Wallet } from 'lucide-react'

interface ExpenseSummaryCardProps {
  title: string
  title_si?: string
  amount: number
  trend?: number // percentage
  type: 'expense' | 'income' | 'balance'
  icon?: React.ElementType
}

export function ExpenseSummaryCard({ title, title_si, amount, trend, type, icon: Icon = Wallet }: ExpenseSummaryCardProps) {
  const isPositive = trend ? trend >= 0 : true
  const formatLKR = (val: number) => `Rs. ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const colorStyles = {
    expense: {
      bg: 'bg-rose-50',
      icon: 'text-rose-600 bg-rose-100',
      text: 'text-rose-600',
      trendUp: 'text-rose-600',
      trendDown: 'text-emerald-600'
    },
    income: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600 bg-emerald-100',
      text: 'text-emerald-600',
      trendUp: 'text-emerald-600',
      trendDown: 'text-rose-600'
    },
    balance: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600 bg-blue-100',
      text: 'text-gray-900',
      trendUp: 'text-emerald-600',
      trendDown: 'text-rose-600'
    }
  }

  const style = colorStyles[type]

  return (
    <Card className={cn("overflow-hidden border-none shadow-sm", style.bg)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {title_si && <p className="text-[10px] text-gray-400 -mt-1 mb-1">{title_si}</p>}
            
            <h3 className={cn("text-2xl font-bold mt-1", style.text)}>
              {formatLKR(amount)}
            </h3>
          </div>
          <div className={cn("p-3 rounded-2xl", style.icon)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>

        {trend !== undefined && (
          <div className="mt-4 flex items-center text-sm">
            <span className={cn(
              "flex items-center font-medium",
              isPositive ? style.trendUp : style.trendDown
            )}>
              {isPositive ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
              {Math.abs(trend)}%
            </span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
