'use client'

import React from 'react'
import { Check, CircleDot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEFAULT_CATEGORIES, IconMap } from '@/lib/constants/categories'

interface ExpenseCategoryPickerProps {
  value: string
  onChange: (value: string) => void
  categories?: typeof DEFAULT_CATEGORIES
}

export function ExpenseCategoryPicker({ value, onChange, categories = DEFAULT_CATEGORIES }: ExpenseCategoryPickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {categories.map((cat) => {
        const Icon = IconMap[cat.icon] || CircleDot
        const isSelected = value === cat.id

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={cn(
              "relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200",
              isSelected
                ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                : "border-gray-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/50 text-gray-600"
            )}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-0.5 text-white">
                <Check className="w-3 h-3" />
              </div>
            )}
            <div
              className="p-2 rounded-lg mb-2"
              style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
            >
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-center">{cat.name}</span>
            <span className="text-[10px] text-gray-400 text-center">{cat.name_si}</span>
          </button>
        )
      })}
    </div>
  )
}
