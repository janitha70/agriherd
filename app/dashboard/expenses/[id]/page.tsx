'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Trash2, Calendar, FileText, CheckCircle2, CloudOff, User, Hash } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ALL_CATEGORIES, IconMap } from '@/lib/constants/categories'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function ExpenseDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const expenseId = parseInt(id as string, 10)
  
  const expense = useLiveQuery(() => db.expenses.get(expenseId))
  const supplier = useLiveQuery(async () => {
    if (!expense?.supplier_id) return undefined;
    return await db.suppliers.where('record_id').equals(expense.supplier_id).first();
  }, [expense?.supplier_id])
  
  const [deleteOpen, setDeleteOpen] = useState(false)

  const confirmDelete = async () => {
      if (!expense) return
      try {
          await db.expenses.delete(expenseId)
          await db.syncQueue.add({
              actionType: 'DELETE_EXPENSE',
              table: 'expenses',
              payload: { ...expense },
              timestamp: new Date().toISOString()
          })
          toast.success('Expense deleted')
          router.push('/dashboard/expenses')
      } catch (err) {
          toast.error('Failed to delete expense')
      }
  }

  if (expense === undefined) return <div className="p-8 text-center text-gray-500">Loading...</div>
  if (expense === null) return <div className="p-8 text-center text-rose-500">Expense not found</div>

  const category = ALL_CATEGORIES.find(c => c.id === expense.category_id)
  const Icon = category && IconMap[category.icon] ? IconMap[category.icon] : FileText

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/expenses">
            <Button variant="ghost" size="icon" className="text-gray-500 rounded-full hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Expense Details</h1>
        </div>
        <div className="flex items-center gap-2">
            <Link href={`/dashboard/expenses/${expenseId}/edit`}>
                <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
            </Link>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">{expense.title}</h2>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(expense.expense_date), 'MMMM dd, yyyy')}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-rose-600">
                            Rs. {expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        {expense.payment_status && (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold uppercase tracking-wider rounded-md mt-2 ${
                                expense.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                expense.payment_status === 'partially_paid' ? 'bg-amber-100 text-amber-700' :
                                'bg-rose-100 text-rose-700'
                            }`}>
                                {expense.payment_status.replace('_', ' ')}
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Category</p>
                        <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-900">{category?.name || 'Unknown'}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Payment Method</p>
                        <p className="font-medium text-gray-900 capitalize">{expense.payment_method.replace('_', ' ')}</p>
                    </div>
                    {expense.supplier_id && (
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Supplier</p>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-900">{supplier?.name || 'Loading...'}</span>
                            </div>
                        </div>
                    )}
                    {expense.invoice_number && (
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Invoice Number</p>
                            <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-900">{expense.invoice_number}</span>
                            </div>
                        </div>
                    )}
                </div>

                {expense.notes && (
                    <div className="pt-6 mt-6 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                        <p className="text-gray-700">{expense.notes}</p>
                    </div>
                )}
            </div>

            {/* Receipt Viewer */}
            {expense.receipt_data && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipt Attachment</h3>
                    <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-gray-200">
                        <img 
                            src={expense.receipt_data} 
                            alt="Receipt" 
                            className="object-contain w-full h-full"
                        />
                    </div>
                </div>
            )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Sync Status</h3>
                <div className="flex items-center gap-3">
                    {expense.syncStatus === 'synced' ? (
                        <>
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            <div>
                                <p className="font-medium text-emerald-700">Synced to Cloud</p>
                                <p className="text-xs text-gray-500">Safely backed up</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <CloudOff className="w-8 h-8 text-amber-500" />
                            <div>
                                <p className="font-medium text-amber-700">Pending Sync</p>
                                <p className="text-xs text-gray-500">Stored locally only</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Metadata</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Recurring</span>
                        <span className="font-medium text-gray-900">{expense.is_recurring ? 'Yes' : 'No'}</span>
                    </div>
                    {expense.is_recurring && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Interval</span>
                            <span className="font-medium text-gray-900 capitalize">{expense.recurrence_interval}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Delete Expense?</DialogTitle>
                  <DialogDescription>
                      Are you sure you want to delete this expense? This action cannot be undone.
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  )
}
