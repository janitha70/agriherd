'use client'

import React, { useState } from 'react'
import { ArrowLeft, Plus, Save, Loader2, Edit, Phone, MapPin, Search } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { useLiveQuery } from 'dexie-react-hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { LocalSupplier } from '@/lib/types/expenses'

export default function SuppliersPage() {
  const suppliers = useLiveQuery(() => db.suppliers.toArray()) || []
  const expenses = useLiveQuery(() => db.expenses.toArray()) || []
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<LocalSupplier | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  })

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.phone && s.phone.includes(searchTerm))
  )

  const handleOpenForm = (supplier?: LocalSupplier) => {
    if (supplier) {
        setEditingSupplier(supplier)
        setFormData({
            name: supplier.name,
            phone: supplier.phone || '',
            address: supplier.address || '',
            notes: supplier.notes || ''
        })
    } else {
        setEditingSupplier(null)
        setFormData({ name: '', phone: '', address: '', notes: '' })
    }
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return

    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()
      
      const payload: any = {
        record_id: editingSupplier?.record_id || uuidv4(),
        name: formData.name,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        notes: formData.notes || undefined,
        syncStatus: 'pending',
      }

      if (editingSupplier?.id) {
          payload.createdAt = editingSupplier.createdAt
          await db.suppliers.update(editingSupplier.id, payload)
          await db.syncQueue.add({
            actionType: 'UPDATE_SUPPLIER',
            table: 'suppliers',
            payload: { ...payload, id: editingSupplier.id },
            timestamp: now
          })
          toast.success("Supplier updated")
      } else {
          payload.createdAt = now
          await db.suppliers.add(payload)
          await db.syncQueue.add({
            actionType: 'ADD_SUPPLIER',
            table: 'suppliers',
            payload,
            timestamp: now
          })
          toast.success("Supplier added")
      }
      
      setIsFormOpen(false)
    } catch (error) {
      toast.error("Failed to save supplier.")
    } finally {
      setIsSubmitting(false)
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
              <h1 className="text-2xl font-bold text-gray-900">Suppliers & Vendors</h1>
              <p className="text-gray-500 text-sm">Manage farm suppliers and track their expenses</p>
            </div>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-paddy hover:bg-paddy/90 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Supplier
          </Button>
      </div>

      <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search suppliers by name or phone..." 
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
      </div>

      {filteredSuppliers.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
              <p className="text-gray-500 mb-4">No suppliers found.</p>
              <Button variant="outline" onClick={() => handleOpenForm()}>Add First Supplier</Button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuppliers.map(supplier => {
                  const supplierExpenses = expenses.filter(e => e.supplier_id === supplier.record_id)
                  const totalSpent = supplierExpenses.reduce((sum, e) => sum + e.amount, 0)
                  const outstanding = supplierExpenses
                      .filter(e => e.payment_method === 'credit' && e.payment_status === 'partially_paid')
                      .reduce((sum, e) => sum + (e.amount - (e.paid_amount || 0)), 0)
                  
                  return (
                      <Link href={`/dashboard/expenses/suppliers/${supplier.record_id}`} key={supplier.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:border-turmeric transition-colors group">
                          <div className="flex justify-between items-start mb-3">
                              <h3 className="font-semibold text-gray-900 truncate pr-2 group-hover:text-paddy transition-colors">{supplier.name}</h3>
                              <Button 
                                variant="ghost" 
                                size="icon-sm" 
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleOpenForm(supplier)
                                }} 
                                className="text-gray-400 hover:text-blue-600 -mt-1 -mr-1"
                              >
                                  <Edit className="w-4 h-4" />
                              </Button>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600 mb-4 flex-1">
                              {supplier.phone && (
                                  <div className="flex items-center gap-2">
                                      <Phone className="w-4 h-4 text-gray-400" />
                                      {supplier.phone}
                                  </div>
                              )}
                              {supplier.address && (
                                  <div className="flex items-start gap-2">
                                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                      <span className="line-clamp-2">{supplier.address}</span>
                                  </div>
                              )}
                          </div>

                          <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                              <div>
                                  <p className="text-xs text-gray-500 mb-1">Purchases: {supplierExpenses.length}</p>
                                  <p className="font-bold text-gray-900">Rs. {totalSpent.toLocaleString()}</p>
                              </div>
                              {outstanding > 0 && (
                                  <div className="text-right">
                                      <p className="text-xs text-alert-red mb-1 font-medium">Outstanding</p>
                                      <p className="font-bold text-alert-red">Rs. {outstanding.toLocaleString()}</p>
                                  </div>
                              )}
                          </div>
                      </Link>
                  )
              })}
          </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                  <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                      <Label>Name (නම) *</Label>
                      <Input 
                        required
                        placeholder="e.g. ABC Farm Supplies"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                  </div>
                  
                  <div className="space-y-2">
                      <Label>Phone (දුරකථන අංකය)</Label>
                      <Input 
                        type="tel"
                        placeholder="07X XXX XXXX"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                  </div>

                  <div className="space-y-2">
                      <Label>Address (ලිපිනය)</Label>
                      <Input 
                        placeholder="Store address..."
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                      />
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
                      <Button type="submit" disabled={isSubmitting} className="bg-paddy hover:bg-paddy/90 text-white">
                          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          Save Supplier
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  )
}
