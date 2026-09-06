'use client'

import React, { useState } from 'react'
import { ArrowLeft, Plus, Save, Loader2, Trash2, Calendar, RefreshCcw, Bell, Edit } from 'lucide-react'
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
import { LocalRecurringExpense } from '@/lib/types/expenses'
import { format } from 'date-fns'

export default function RecurringExpensesPage() {
  const recurring = useLiveQuery(() => db.recurringExpenses.toArray()) || []
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingItem, setEditingItem] = useState<LocalRecurringExpense | null>(null)
  
  const [formData, setFormData] = useState({
    category_id: ALL_CATEGORIES[0].id,
    amount: '',
    title: '',
    next_due_date: new Date().toISOString().split('T')[0],
    recurrence_interval: 'monthly',
  })

  const handleOpenForm = (item?: LocalRecurringExpense) => {
    if (item) {
        setEditingItem(item)
        setFormData({
            category_id: item.category_id,
            amount: item.amount?.toString() || '',
            title: item.title || '',
            next_due_date: item.next_due_date || new Date().toISOString().split('T')[0],
            recurrence_interval: item.recurrence_interval || 'monthly'
        })
    } else {
        setEditingItem(null)
        setFormData({
            category_id: ALL_CATEGORIES[0].id,
            amount: '',
            title: '',
            next_due_date: new Date().toISOString().split('T')[0],
            recurrence_interval: 'monthly'
        })
    }
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.category_id || !formData.next_due_date) return

    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()
      
      const payload: any = {
        record_id: editingItem?.record_id || uuidv4(),
        category_id: formData.category_id,
        title: formData.title || undefined,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        next_due_date: formData.next_due_date,
        recurrence_interval: formData.recurrence_interval as any,
        is_active: true,
        syncStatus: 'pending'
      }

      if (editingItem?.id) {
          payload.createdAt = editingItem.createdAt
          await db.recurringExpenses.update(editingItem.id, payload)
          await db.syncQueue.add({
            actionType: 'UPDATE_RECURRING',
            table: 'recurringExpenses',
            payload: { ...payload, id: editingItem.id },
            timestamp: now
          })
          toast.success("Recurring expense updated")
      } else {
          payload.createdAt = now
          await db.recurringExpenses.add(payload)
          await db.syncQueue.add({
            actionType: 'ADD_RECURRING',
            table: 'recurringExpenses',
            payload,
            timestamp: now
          })
          toast.success("Recurring expense added")
      }
      
      setIsFormOpen(false)
    } catch (error) {
      toast.error("Failed to save recurring expense.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleActive = async (item: LocalRecurringExpense) => {
      try {
          const payload = { ...item, is_active: !item.is_active }
          if (item.id) {
              await db.recurringExpenses.update(item.id, { is_active: !item.is_active })
              await db.syncQueue.add({
                  actionType: 'UPDATE_RECURRING',
                  table: 'recurringExpenses',
                  payload,
                  timestamp: new Date().toISOString()
              })
              toast.success(`Recurring expense ${payload.is_active ? 'activated' : 'paused'}`)
          }
      } catch (e) {
          toast.error("Failed to update status")
      }
  }

  const confirmDelete = async (item: LocalRecurringExpense) => {
      try {
          if (item.id) {
              await db.recurringExpenses.delete(item.id)
              await db.syncQueue.add({
                  actionType: 'DELETE_RECURRING',
                  table: 'recurringExpenses',
                  payload: item,
                  timestamp: new Date().toISOString()
              })
              toast.success("Recurring expense deleted")
          }
      } catch (e) {
          toast.error("Failed to delete")
      }
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Recurring Expenses</h1>
              <p className="text-gray-500 text-sm">Manage scheduled and recurring payments</p>
            </div>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Recurring
          </Button>
      </div>

      {recurring.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
              <RefreshCcw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No recurring expenses configured.</p>
              <Button variant="outline" onClick={() => handleOpenForm()}>Add First Recurring Expense</Button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recurring.map(item => {
                  const cat = ALL_CATEGORIES.find(c => c.id === item.category_id)
                  const isUpcoming = item.next_due_date && new Date(item.next_due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  
                  return (
                      <div key={item.id} className={`bg-white p-5 rounded-2xl shadow-sm border transition-colors ${!item.is_active ? 'opacity-60 border-gray-100 bg-gray-50' : isUpcoming ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'}`}>
                          <div className="flex justify-between items-start mb-4">
                              <div>
                                  <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-gray-900 truncate">{item.title || cat?.name || 'Recurring Expense'}</h3>
                                      {item.is_active && isUpcoming && (
                                          <span className="flex items-center text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                                              <Bell className="w-3 h-3 mr-1" /> Due Soon
                                          </span>
                                      )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">{cat?.name} • {item.recurrence_interval}</p>
                              </div>
                              <div className="text-right">
                                  {item.amount ? (
                                      <p className="font-bold text-gray-900">Rs. {item.amount.toLocaleString()}</p>
                                  ) : (
                                      <p className="text-xs text-gray-400 italic">Variable Amount</p>
                                  )}
                              </div>
                          </div>
                          
                          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  Next Due: <span className="font-medium text-gray-900">{item.next_due_date ? format(new Date(item.next_due_date), 'MMM dd, yyyy') : 'N/A'}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                  <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => toggleActive(item)}
                                      className={`h-8 px-2 text-xs font-medium ${item.is_active ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}`}
                                  >
                                      {item.is_active ? 'Pause' : 'Activate'}
                                  </Button>
                                  <Button variant="ghost" size="icon-sm" onClick={() => handleOpenForm(item)} className="text-gray-400 hover:text-blue-600">
                                      <Edit className="w-4 h-4" />
                                      <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button variant="ghost" size="icon-sm" onClick={() => {if(confirm('Delete this recurring expense?')) confirmDelete(item)}} className="text-gray-400 hover:text-rose-600">
                                      <Trash2 className="w-4 h-4" />
                                  </Button>
                              </div>
                          </div>
                      </div>
                  )
              })}
          </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Recurring Expense' : 'Add Recurring Expense'}</DialogTitle>
                  <DialogDescription>
                      Configure a recurring payment to get notified when it's due.
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
                      <Label>Title / Description</Label>
                      <Input 
                        placeholder="e.g. Monthly Electricity Bill"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                      />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label>Amount (Rs.)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="Leave empty if variable"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                          />
                      </div>
                      
                      <div className="space-y-2">
                          <Label>Interval</Label>
                          <Select 
                            value={formData.recurrence_interval} 
                            onValueChange={(v) => v && setFormData({ ...formData, recurrence_interval: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Interval" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                      </div>
                  </div>

                  <div className="space-y-2">
                      <Label>Next Due Date *</Label>
                      <Input 
                        type="date"
                        required
                        value={formData.next_due_date}
                        onChange={e => setFormData({ ...formData, next_due_date: e.target.value })}
                      />
                  </div>

                  <DialogFooter className="pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          Save Configuration
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  )
}
