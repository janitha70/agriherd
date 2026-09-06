'use client'

import React from 'react'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AddExpensePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/expenses" 
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
          <p className="text-gray-500">නව වියදමක් ඇතුලත් කරන්න</p>
        </div>
      </div>

      <ExpenseForm />
    </div>
  )
}
