'use client'

import React, { useState } from 'react'
import { ArrowLeft, Loader2, Save, Trash2, Edit, Plus, CheckCircle2, CloudOff } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { db } from '@/lib/db'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { LocalFarmIncome } from '@/lib/types/expenses'

export default function IncomePage() {
  const router = useRouter()
  const incomes = useLiveQuery(() => db.farmIncome.toArray()) || []
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<LocalFarmIncome | null>(null)
  const [incomeToDelete, setIncomeToDelete] = useState<LocalFarmIncome | null>(null)
  
  const [formData, setFormData] = useState({
    source: 'Milk Sales',
    amount: '',
    income_date: new Date().toISOString().split('T')[0],
    notes: '',
    season: 'Maha 2026'
  })

  const handleOpenForm = (income?: LocalFarmIncome) => {
      if (income) {
          setEditingIncome(income)
          setFormData({
              source: income.source,
              amount: income.amount.toString(),
              income_date: income.income_date,
              notes: income.notes || '',
              season: income.season || 'Maha 2026'
          })
      } else {
          setEditingIncome(null)
          setFormData({
              source: 'Milk Sales',
              amount: '',
              income_date: new Date().toISOString().split('T')[0],
              notes: '',
              season: 'Maha 2026'
          })
      }
      setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.source) {
      toast.error("Please fill required fields (කරුණාකර අත්‍යවශ්‍ය තොරතුරු පුරවන්න)")
      return
    }

    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()
      
      const payload: any = {
        record_id: editingIncome?.record_id || uuidv4(),
        source: formData.source,
        amount: parseFloat(formData.amount),
        income_date: formData.income_date,
        notes: formData.notes,
        season: formData.season,
        syncStatus: 'pending',
      }

      if (editingIncome?.id) {
          payload.updatedAt = now
          await db.farmIncome.update(editingIncome.id, payload)
          await db.syncQueue.add({
            actionType: 'UPDATE_INCOME',
            table: 'farm_income',
            payload: { ...payload, id: editingIncome.id },
            timestamp: now
          })
          toast.success("Income updated offline (ආදායම යාවත්කාලීන කරන ලදී)")
      } else {
          payload.createdAt = now
          await db.farmIncome.add(payload)
          await db.syncQueue.add({
            actionType: 'ADD_INCOME',
            table: 'farm_income',
            payload,
            timestamp: now
          })
          toast.success("Income saved offline (ආදායම සුරකින ලදී)")
      }

      setIsFormOpen(false)
      
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save income.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async () => {
      if (!incomeToDelete) return
      try {
          if (incomeToDelete.id) {
             await db.farmIncome.delete(incomeToDelete.id)
          }
          await db.syncQueue.add({
              actionType: 'DELETE_INCOME',
              table: 'farm_income',
              payload: { ...incomeToDelete },
              timestamp: new Date().toISOString()
          })
          toast.success("Income deleted")
      } catch(e) {
          toast.error("Failed to delete income")
      } finally {
          setIncomeToDelete(null)
      }
  }

  // Sync Status Icon
  const SyncIcon = ({ status }: { status: string }) => {
    if (status === 'synced') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    return <CloudOff className="w-4 h-4 text-amber-500" />
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
              <h1 className="text-2xl font-bold text-gray-900">Farm Income</h1>
              <p className="text-gray-500 text-sm">Manage farm income sources</p>
            </div>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Record Income
          </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Date (දිනය)</th>
                <th className="px-6 py-4 font-medium">Source (මාර්ගය)</th>
                <th className="px-6 py-4 font-medium">Notes (සටහන්)</th>
                <th className="px-6 py-4 font-medium text-right">Amount (මුදල)</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {incomes.length === 0 ? (
                  <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                          No income records found.
                      </td>
                  </tr>
              ) : incomes.sort((a,b) => new Date(b.income_date).getTime() - new Date(a.income_date).getTime()).map((income) => (
                  <tr key={income.id || income.record_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      <div className="flex items-center gap-2">
                        <SyncIcon status={income.syncStatus} />
                        {format(new Date(income.income_date), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{income.source}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-[200px] truncate">
                      {income.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-emerald-600">
                      Rs. {income.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => handleOpenForm(income)} className="text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => setIncomeToDelete(income)} className="text-gray-500 hover:text-rose-600 hover:bg-rose-50">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                  <DialogTitle>{editingIncome ? 'Edit Income' : 'Record Income'}</DialogTitle>
                  <DialogDescription>
                      {editingIncome ? 'Update existing income details' : 'Add new farm income'}
                  </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                      <Label>Amount (මුදල) * Rs.</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        required
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        className="text-lg font-semibold text-emerald-600"
                      />
                  </div>
                  
                  <div className="space-y-2">
                      <Label>Income Source (ආදායම් මාර්ගය) *</Label>
                      <Select 
                        value={formData.source} 
                        onValueChange={(v) => v && setFormData({ ...formData, source: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Milk Sales">Milk Sales (කිරි)</SelectItem>
                          <SelectItem value="Crop Sales">Crop Sales (බෝග)</SelectItem>
                          <SelectItem value="Livestock Sale">Livestock Sale (සතුන් විකිණීම)</SelectItem>
                          <SelectItem value="Manure/Fertilizer">Manure/Fertilizer (පොහොර අලෙවිය)</SelectItem>
                          <SelectItem value="Calf Sales">Calf Sales (පැටවුන් විකිණීම)</SelectItem>
                          <SelectItem value="Subsidy">Gov Subsidy / Grant (සහනාධාර)</SelectItem>
                          <SelectItem value="Other">Other (වෙනත්)</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label>Date (දිනය)</Label>
                          <Input 
                            type="date" 
                            required
                            value={formData.income_date}
                            onChange={e => setFormData({ ...formData, income_date: e.target.value })}
                          />
                      </div>
                      <div className="space-y-2">
                          <Label>Season (කන්නය)</Label>
                          <Select 
                            value={formData.season} 
                            onValueChange={(v) => v && setFormData({ ...formData, season: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select season" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Maha 2025/26">Maha 2025/26</SelectItem>
                              <SelectItem value="Yala 2026">Yala 2026</SelectItem>
                              <SelectItem value="Maha 2026/27">Maha 2026/27</SelectItem>
                            </SelectContent>
                          </Select>
                      </div>
                  </div>

                  <div className="space-y-2">
                      <Label>Notes (සටහන්)</Label>
                      <Input 
                        placeholder="Additional details..."
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      />
                  </div>

                  <DialogFooter className="pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          {editingIncome ? 'Update' : 'Save'}
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!incomeToDelete} onOpenChange={(open) => !open && setIncomeToDelete(null)}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Delete Income?</DialogTitle>
                  <DialogDescription>
                      Are you sure you want to delete this {incomeToDelete?.source} record (Rs. {incomeToDelete?.amount})? This action cannot be undone.
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setIncomeToDelete(null)}>Cancel</Button>
                  <Button variant="destructive" onClick={confirmDelete}>Delete Income</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  )
}
