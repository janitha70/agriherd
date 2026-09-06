'use client'

import React, { useState } from 'react'
import { ArrowLeft, Plus, Save, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { db } from '@/lib/db'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { useLiveQuery } from 'dexie-react-hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { ALL_CATEGORIES } from '@/lib/constants/categories'
import { BudgetProgressBar } from '@/components/expenses/BudgetProgressBar'

export default function BudgetPage() {
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedSeason, setSelectedSeason] = useState('Maha 2026') 

  const budgets = useLiveQuery(
      () => db.budgets.where('month').equals(selectedMonth).toArray(),
      [selectedMonth]
  ) || []

  const expenses = useLiveQuery(
      () => db.expenses.toArray(),
      []
  ) || []

  // Filter expenses for selected month
  const monthlyExpenses = expenses.filter(e => e.expense_date.startsWith(selectedMonth))

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    category_id: ALL_CATEGORIES[0].id,
    budget_amount: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.budget_amount || !formData.category_id) return

    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()
      
      // Check if budget for this category and month already exists
      const existing = budgets.find(b => b.category_id === formData.category_id)
      
      const payload: any = {
        record_id: existing?.record_id || uuidv4(),
        category_id: formData.category_id,
        season: selectedSeason,
        month: selectedMonth,
        budget_amount: parseFloat(formData.budget_amount),
        syncStatus: 'pending'
      }

      if (existing?.id) {
          payload.createdAt = existing.createdAt
          await db.budgets.update(existing.id, payload)
          await db.syncQueue.add({
            actionType: 'UPDATE_BUDGET',
            table: 'budgets',
            payload: { ...payload, id: existing.id },
            timestamp: now
          })
          toast.success("Budget updated")
      } else {
          payload.createdAt = now
          await db.budgets.add(payload)
          await db.syncQueue.add({
            actionType: 'SET_BUDGET',
            table: 'budgets',
            payload,
            timestamp: now
          })
          toast.success("Budget set")
      }
      
      setIsFormOpen(false)
      setFormData({ category_id: ALL_CATEGORIES[0].id, budget_amount: '' })
      
    } catch (error) {
      toast.error("Failed to save budget.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.budget_amount, 0)
  const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/expenses" 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Budget Tracker</h1>
              <p className="text-gray-500 text-sm">Monitor category spending limits</p>
            </div>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Set Category Budget
          </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-end gap-4">
          <div className="space-y-2 flex-1 max-w-[200px]">
              <Label>Month (මාසය)</Label>
              <Input 
                type="month" 
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
              />
          </div>
          
          <div className="ml-auto text-right">
              <p className="text-sm text-gray-500 font-medium mb-1">Total Budget Usage</p>
              <div className="flex items-end justify-end gap-2">
                  <span className={`text-2xl font-bold ${totalSpent > totalBudget && totalBudget > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      Rs. {totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-gray-400 mb-1">
                      / {totalBudget > 0 ? `Rs. ${totalBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'No Budget Set'}
                  </span>
              </div>
          </div>
      </div>

      {budgets.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
              <p className="text-gray-500 mb-4">No budgets set for {selectedMonth}.</p>
              <Button variant="outline" onClick={() => setIsFormOpen(true)}>Set First Budget</Button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map(budget => {
                  const spent = monthlyExpenses
                      .filter(e => e.category_id === budget.category_id)
                      .reduce((sum, e) => sum + e.amount, 0)
                  return (
                      <BudgetProgressBar 
                          key={budget.id}
                          categoryId={budget.category_id}
                          budgetAmount={budget.budget_amount}
                          spentAmount={spent}
                      />
                  )
              })}
          </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                  <DialogTitle>Set Category Budget</DialogTitle>
                  <DialogDescription>
                      Set a spending limit for a specific category in {selectedMonth}.
                  </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                      <Label>Category (වර්ගය) *</Label>
                      <Select 
                        value={formData.category_id} 
                        onValueChange={(v) => v && setFormData({ ...formData, category_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_CATEGORIES.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>

                  <div className="space-y-2">
                      <Label>Budget Amount (මුදල) * Rs.</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        required
                        placeholder="0.00"
                        value={formData.budget_amount}
                        onChange={e => setFormData({ ...formData, budget_amount: e.target.value })}
                        className="text-lg font-semibold"
                      />
                  </div>

                  <DialogFooter className="pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          Save Budget
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  )
}
