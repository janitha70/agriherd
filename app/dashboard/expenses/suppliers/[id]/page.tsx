'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { ArrowLeft, Phone, MapPin, Search, Receipt, CreditCard, Save, Loader2, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function VendorLedgerPage() {
  const params = useParams()
  const supplierId = params.id as string

  const supplier = useLiveQuery(() => db.suppliers.get({ record_id: supplierId }), [supplierId])
  const expenses = useLiveQuery(() => db.expenses.where('supplier_id').equals(supplierId).toArray(), [supplierId]) || []
  const categories = useLiveQuery(() => db.expenseCategories.toArray()) || []

  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (supplier === undefined) return <div className="text-center py-10 animate-pulse text-muted-foreground">Loading ledger...</div>
  if (supplier === null) return <div className="text-center py-10 text-muted-foreground">Supplier not found.</div>

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalPaid = expenses.reduce((sum, e) => {
      if (e.payment_method !== 'credit') return sum + e.amount
      return sum + (e.paid_amount || 0)
  }, 0)
  const outstanding = totalSpent - totalPaid

  const handleOpenPayment = (expense: any) => {
      setSelectedExpense(expense)
      const remaining = expense.amount - (expense.paid_amount || 0)
      setPaymentAmount(remaining.toString())
      setPaymentModalOpen(true)
  }

  const handleProcessPayment = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selectedExpense || !paymentAmount) return
      
      const amountToPay = Number(paymentAmount)
      if (amountToPay <= 0) return

      setIsSubmitting(true)
      try {
          const currentPaid = selectedExpense.paid_amount || 0
          const newPaid = currentPaid + amountToPay
          const isFullyPaid = newPaid >= selectedExpense.amount

          const updates = {
              paid_amount: newPaid,
              payment_status: (isFullyPaid ? 'paid' : 'partially_paid') as 'paid' | 'partially_paid',
              updatedAt: new Date().toISOString()
          }

          if (selectedExpense.id) {
              await db.expenses.update(selectedExpense.id, updates)
              await db.syncQueue.add({
                  actionType: 'UPDATE_EXPENSE',
                  table: 'expenses',
                  payload: { ...selectedExpense, ...updates },
                  timestamp: new Date().toISOString()
              })
              toast.success(`Payment of Rs. ${amountToPay} logged successfully.`)
          }
          setPaymentModalOpen(false)
      } catch (err) {
          console.error(err)
          toast.error("Failed to process payment.")
      } finally {
          setIsSubmitting(false)
      }
  }

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Uncategorized'

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/expenses/suppliers" 
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
          <p className="text-gray-500 text-sm">Vendor Ledger & History</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 uppercase tracking-wider text-xs">Contact Details</h3>
              <div className="space-y-3 text-sm text-gray-600">
                  {supplier.phone ? (
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg"><Phone className="w-4 h-4 text-gray-500" /></div>
                          <span className="font-medium text-gray-900">{supplier.phone}</span>
                      </div>
                  ) : <div className="text-gray-400">No phone provided</div>}
                  
                  {supplier.address ? (
                      <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg shrink-0"><MapPin className="w-4 h-4 text-gray-500" /></div>
                          <span className="font-medium text-gray-900">{supplier.address}</span>
                      </div>
                  ) : <div className="text-gray-400">No address provided</div>}
              </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col justify-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Total Purchases</p>
                  <p className="text-2xl font-bold text-gray-900">Rs. {totalSpent.toLocaleString()}</p>
              </div>
              <div className="bg-paddy/10 p-5 rounded-2xl border border-paddy/20 flex flex-col justify-center">
                  <p className="text-xs text-paddy uppercase tracking-wider mb-1 font-semibold">Total Paid</p>
                  <p className="text-2xl font-bold text-paddy">Rs. {totalPaid.toLocaleString()}</p>
              </div>
              <div className="bg-alert-red/10 p-5 rounded-2xl border border-alert-red/20 flex flex-col justify-center">
                  <p className="text-xs text-alert-red uppercase tracking-wider mb-1 font-semibold">Outstanding</p>
                  <p className="text-2xl font-bold text-alert-red">Rs. {outstanding.toLocaleString()}</p>
              </div>
          </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Transaction History</h3>
              <div className="text-xs text-muted-foreground">{expenses.length} records</div>
          </div>
          
          {expenses.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                  <Receipt className="w-8 h-8 mx-auto text-gray-300 mb-3" />
                  No transactions found with this supplier.
              </div>
          ) : (
              <div className="divide-y divide-gray-100">
                  {expenses.sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()).map(expense => {
                      const isCredit = expense.payment_method === 'credit'
                      const isFullyPaid = isCredit ? expense.payment_status === 'paid' : true
                      const amountPaid = isCredit ? (expense.paid_amount || 0) : expense.amount
                      const balance = expense.amount - amountPaid

                      return (
                          <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                              <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                      <p className="font-bold text-gray-900">{expense.title}</p>
                                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                          {getCategoryName(expense.category_id)}
                                      </span>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                      {new Date(expense.expense_date).toLocaleDateString()} • {expense.payment_method.toUpperCase().replace('_', ' ')}
                                  </p>
                              </div>

                              <div className="text-right flex items-center gap-6">
                                  <div>
                                      <p className="font-bold text-gray-900">Rs. {expense.amount.toLocaleString()}</p>
                                      {isCredit && !isFullyPaid && (
                                          <p className="text-xs text-alert-red font-medium">Bal: Rs. {balance.toLocaleString()}</p>
                                      )}
                                      {isCredit && isFullyPaid && (
                                          <p className="text-xs text-paddy font-medium">Paid in full</p>
                                      )}
                                  </div>
                                  
                                  {isCredit && !isFullyPaid && (
                                      <Button 
                                          size="sm" 
                                          onClick={() => handleOpenPayment(expense)}
                                          className="bg-turmeric hover:bg-turmeric/90 text-ink font-bold shadow-sm"
                                      >
                                          Pay
                                      </Button>
                                  )}
                              </div>
                          </div>
                      )
                  })}
              </div>
          )}
      </div>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                  <DialogTitle>Make Repayment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleProcessPayment} className="space-y-4 pt-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                      <p className="text-gray-500 mb-1">Paying towards:</p>
                      <p className="font-bold text-gray-900">{selectedExpense?.title}</p>
                      <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                          <span className="text-gray-600">Total Invoice:</span>
                          <span className="font-medium text-gray-900">Rs. {selectedExpense?.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                          <span className="text-gray-600">Already Paid:</span>
                          <span className="font-medium text-gray-900">Rs. {(selectedExpense?.paid_amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mt-1 pt-1 border-t border-gray-200">
                          <span className="font-bold text-gray-900">Balance Due:</span>
                          <span className="font-bold text-alert-red">Rs. {(selectedExpense?.amount - (selectedExpense?.paid_amount || 0)).toLocaleString()}</span>
                      </div>
                  </div>

                  <div className="space-y-2">
                      <Label>Payment Amount (Rs.) *</Label>
                      <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input 
                              type="number"
                              required
                              min="1"
                              step="0.01"
                              max={selectedExpense?.amount - (selectedExpense?.paid_amount || 0)}
                              className="pl-9"
                              value={paymentAmount}
                              onChange={e => setPaymentAmount(e.target.value)}
                          />
                      </div>
                  </div>

                  <DialogFooter className="pt-4">
                      <Button type="button" variant="outline" onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting} className="bg-paddy hover:bg-paddy/90 text-white">
                          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                          Process Payment
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>

    </div>
  )
}
