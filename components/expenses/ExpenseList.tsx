'use client'

import React, { useState } from 'react'
import { LocalExpense } from '@/lib/types/expenses'
import { format } from 'date-fns'
import { ALL_CATEGORIES, IconMap } from '@/lib/constants/categories'
import { CircleDot, Search, Eye, Edit, Trash2, CloudOff, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { db } from '@/lib/db'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'

interface ExpenseListProps {
  expenses: LocalExpense[]
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterSeason, setFilterSeason] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [expenseToDelete, setExpenseToDelete] = useState<LocalExpense | null>(null)

  // Handlers for deleting
  const confirmDelete = async () => {
    if (!expenseToDelete) return
    try {
      const now = new Date().toISOString()
      
      const payload = { ...expenseToDelete }
      
      if (expenseToDelete.id) {
         await db.expenses.delete(expenseToDelete.id)
      }
      
      await db.syncQueue.add({
        actionType: 'DELETE_EXPENSE',
        table: 'expenses',
        payload: payload,
        timestamp: now
      })
      toast.success("Expense deleted successfully")
    } catch (e) {
      toast.error("Failed to delete expense")
    } finally {
      setExpenseToDelete(null)
    }
  }

  // Filtering
  const filtered = expenses.filter(e => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!e.title.toLowerCase().includes(term) && !e.notes?.toLowerCase().includes(term)) return false
    }
    if (filterCategory !== 'all' && e.category_id !== filterCategory) return false
    if (filterSeason !== 'all' && e.season !== filterSeason) return false
    if (filterStatus !== 'all') {
       if (filterStatus === 'synced' && e.syncStatus !== 'synced') return false
       if (filterStatus === 'pending' && e.syncStatus !== 'pending') return false
    }
    return true
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
    if (sortBy === 'oldest') return new Date(a.expense_date).getTime() - new Date(b.expense_date).getTime()
    if (sortBy === 'highest') return b.amount - a.amount
    if (sortBy === 'lowest') return a.amount - b.amount
    return 0
  })

  // Sync Status Icon
  const SyncIcon = ({ status }: { status: string }) => {
    if (status === 'synced') return <CheckCircle2 className="w-4 h-4 text-paddy" />
    return <CloudOff className="w-4 h-4 text-amber-500" />
  }

  return (
    <div className="space-y-4">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search expenses..." 
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={(v) => v && setFilterCategory(v)}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {ALL_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSeason} onValueChange={(v) => v && setFilterSeason(v)}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seasons</SelectItem>
            <SelectItem value="Maha 2025/26">Maha 2025/26</SelectItem>
            <SelectItem value="Yala 2026">Yala 2026</SelectItem>
            <SelectItem value="Maha 2026/27">Maha 2026/27</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="highest">Highest Amount</SelectItem>
            <SelectItem value="lowest">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Date (දිනය)</th>
                <th className="px-6 py-4 font-medium">Category (වර්ගය)</th>
                <th className="px-6 py-4 font-medium">Description (විස්තරය)</th>
                <th className="px-6 py-4 font-medium">Status & Method</th>
                <th className="px-6 py-4 font-medium text-right">Amount (මුදල)</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                  <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                          No expenses match your filters.
                      </td>
                  </tr>
              ) : filtered.map((expense) => {
                const category = ALL_CATEGORIES.find(c => c.id === expense.category_id)
                const Icon = category ? IconMap[category.icon] || CircleDot : CircleDot
                
                return (
                  <tr key={expense.id || expense.record_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      <div className="flex items-center gap-2">
                        <SyncIcon status={expense.syncStatus} />
                        {format(new Date(expense.expense_date), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="p-1.5 rounded-md mr-3"
                          style={{ backgroundColor: `${category?.color || '#94a3b8'}20`, color: category?.color || '#94a3b8' }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{category?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-gray-500">{category?.name_si}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-[200px] truncate">
                      {expense.title}
                      {expense.notes && <p className="text-xs text-gray-400 truncate mt-0.5">{expense.notes}</p>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                          <span className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600 uppercase tracking-wide">
                            {expense.payment_method.replace('_', ' ')}
                          </span>
                          {expense.payment_method === 'credit' && (
                              <span className={`px-2.5 py-1 text-[10px] font-medium rounded-full uppercase tracking-wide
                                  ${expense.payment_status === 'paid' ? 'bg-paddy/10 text-paddy' : 
                                    expense.payment_status === 'partially_paid' ? 'bg-turmeric/10 text-turmeric' : 
                                    'bg-alert-red/10 text-alert-red'}`}>
                                  {expense.payment_status?.replace('_', ' ')}
                              </span>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <p className="font-semibold text-rose-600">
                          Rs. {expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      {expense.payment_method === 'credit' && expense.payment_status === 'partially_paid' && (
                          <p className="text-[10px] text-gray-500 mt-1">
                              Paid: Rs. {expense.paid_amount?.toLocaleString() || 0}
                          </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                            <Link href={`/dashboard/expenses/${expense.id}`}>
                                <Button variant="ghost" size="icon-sm" className="text-ink/60 hover:text-paddy hover:bg-paddy/10">
                                    <Eye className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Link href={`/dashboard/expenses/${expense.id}/edit`}>
                                <Button variant="ghost" size="icon-sm" className="text-ink/60 hover:text-paddy hover:bg-paddy/10">
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="icon-sm" 
                              onClick={() => setExpenseToDelete(expense)}
                              className="text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      {expenseToDelete && (
          <Dialog open={!!expenseToDelete} onOpenChange={(open) => !open && setExpenseToDelete(null)}>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Delete Expense?</DialogTitle>
                      <DialogDescription>
                          Are you sure you want to delete "{expenseToDelete.title}" (Rs. {expenseToDelete.amount})? This action cannot be undone.
                      </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4">
                      <Button variant="outline" onClick={() => setExpenseToDelete(null)}>Cancel</Button>
                      <Button variant="destructive" onClick={confirmDelete}>Delete Expense</Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
      )}
    </div>
  )
}
