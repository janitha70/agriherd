'use client'

import React, { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Beef, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export function AnimalFinancials() {
  const { t } = useLanguage()
  const expenses = useLiveQuery(() => db.expenses.toArray()) || []
  const animals = useLiveQuery(() => db.animals.toArray()) || []

  const animalExpenses = useMemo(() => {
    const map = new Map<string, number>()
    expenses.forEach(e => {
      if (e.animal_tag_id) {
        map.set(e.animal_tag_id, (map.get(e.animal_tag_id) || 0) + e.amount)
      }
    })

    return Array.from(map.entries())
      .map(([tagId, amount]) => {
        const animal = animals.find(a => a.tagId === tagId)
        return {
          tagId,
          amount,
          species: animal?.species || 'Unknown',
          breed: animal?.breed || 'Unknown'
        }
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5) // Top 5
  }, [expenses, animals])

  if (animalExpenses.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
        <div className="flex items-center gap-2 mb-4 text-gray-500">
          <Beef className="w-5 h-5" />
          <h3 className="font-bold text-gray-900">{t('highestCostAnimals')}</h3>
        </div>
        <div className="text-center py-6">
            <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{t('noAnimalExpenses')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-rose-500">
          <Beef className="w-5 h-5" />
          <h3 className="font-bold text-gray-900">{t('highestCostAnimals')}</h3>
        </div>
      </div>
      
      <div className="space-y-5">
        {animalExpenses.map((ae, idx) => (
          <div key={ae.tagId} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                #{idx + 1}
              </div>
              <div>
                <p className="font-medium text-gray-900">{ae.tagId}</p>
                <p className="text-xs text-gray-500">{ae.species} - {ae.breed}</p>
              </div>
            </div>
            <div className="font-bold text-gray-900">
              Rs. {ae.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
