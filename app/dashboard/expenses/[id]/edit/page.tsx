'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useParams } from 'next/navigation'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditExpensePage() {
  const { id } = useParams()
  const expenseId = parseInt(id as string, 10)
  const expense = useLiveQuery(() => db.expenses.get(expenseId))

  if (expense === undefined) return <div className="p-8 text-center text-gray-500">Loading...</div>
  if (expense === null) return <div className="p-8 text-center text-rose-500">Expense not found</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/expenses/${expenseId}`}>
          <Button variant="ghost" size="icon" className="text-gray-500 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Expense</h1>
          <p className="text-gray-500 text-sm">Update expense details and attachments.</p>
        </div>
      </div>

      <ExpenseForm initialData={expense} />
    </div>
  )
}
