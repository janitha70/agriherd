'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Camera, FileText, Loader2, Image as ImageIcon, X } from 'lucide-react'
import { ExpenseCategoryPicker } from './ExpenseCategoryPicker'
import { DEFAULT_CATEGORIES } from '@/lib/constants/categories'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { db } from '@/lib/db'
import { toast } from 'sonner'
import Tesseract from 'tesseract.js'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { useLanguage } from '@/contexts/LanguageContext'

interface ExpenseFormProps {
  initialData?: any
}

export function ExpenseForm({ initialData }: ExpenseFormProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const suppliers = useLiveQuery(() => db.suppliers.toArray()) || []
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOcrProcessing, setIsOcrProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    amount: initialData?.amount?.toString() || '',
    category_id: initialData?.category_id || DEFAULT_CATEGORIES[0].id,
    expense_date: initialData?.expense_date || new Date().toISOString().split('T')[0],
    payment_method: initialData?.payment_method || 'cash',
    payment_status: initialData?.payment_status || 'paid',
    paid_amount: initialData?.paid_amount?.toString() || '',
    supplier_id: initialData?.supplier_id || 'none',
    invoice_number: initialData?.invoice_number || '',
    notes: initialData?.notes || '',
    is_recurring: initialData?.is_recurring || false,
    recurrence_interval: initialData?.recurrence_interval || 'monthly',
    receipt_data: initialData?.receipt_data || ''
  })

  // OCR Confirmation State
  const [ocrPending, setOcrPending] = useState<{ amount: string, date: string, rawText: string } | null>(null)

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Convert to base64 for local storage
    const reader = new FileReader()
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, receipt_data: event.target?.result as string }))
    }
    reader.readAsDataURL(file)

    setIsOcrProcessing(true)
    toast.info("Analyzing receipt...")

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => console.log(m)
      })
      
      const text = result.data.text
      console.log("OCR Result: ", text)
      
      // Extract amount
      let extractedAmount = ''
      const amountMatches = text.match(/(?:rs\.?|lkr|total|sum|amount)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/gi)
      if (amountMatches && amountMatches.length > 0) {
        const amounts = amountMatches.map(m => {
          const numStr = m.replace(/[^\d.]/g, '')
          return parseFloat(numStr)
        }).filter(n => !isNaN(n))
        
        if (amounts.length > 0) {
          extractedAmount = Math.max(...amounts).toString()
        }
      }

      // Extract Date (very simple regex for YYYY-MM-DD or DD/MM/YYYY)
      let extractedDate = ''
      const dateMatch = text.match(/(\d{2,4}[-/]\d{1,2}[-/]\d{1,4})/)
      if (dateMatch) {
         // Attempt to format to YYYY-MM-DD for input field
         try {
            const d = new Date(dateMatch[1])
            if (!isNaN(d.getTime())) {
                extractedDate = d.toISOString().split('T')[0]
            }
         } catch(e){}
      }

      setOcrPending({
          amount: extractedAmount,
          date: extractedDate,
          rawText: text
      })
      
      toast.success("Receipt scanned. Please review extracted data.")
    } catch (error) {
      console.error("OCR Error:", error)
      toast.error("Failed to read receipt.")
    } finally {
      setIsOcrProcessing(false)
    }
  }

  const applyOcrData = () => {
      if (!ocrPending) return
      setFormData(prev => ({
          ...prev,
          amount: ocrPending.amount || prev.amount,
          expense_date: ocrPending.date || prev.expense_date,
      }))
      setOcrPending(null)
      toast.success("Applied extracted values.")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.amount || !formData.category_id) {
      toast.error("Please fill required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const record_id = initialData?.record_id || uuidv4()
      const now = new Date().toISOString()
      
      const payload: any = {
        record_id,
        title: formData.title,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id,
        expense_date: formData.expense_date,
        payment_method: formData.payment_method,
        payment_status: formData.payment_status,
        supplier_id: formData.supplier_id === 'none' ? undefined : formData.supplier_id,
        invoice_number: formData.invoice_number,
        notes: formData.notes,
        is_recurring: formData.is_recurring,
        receipt_data: formData.receipt_data,
        syncStatus: 'pending',
        updatedAt: now
      }
      
      if (formData.payment_method === 'credit' && formData.paid_amount) {
          payload.paid_amount = parseFloat(formData.paid_amount)
      } else if (formData.payment_method !== 'credit') {
          payload.paid_amount = parseFloat(formData.amount)
          payload.payment_status = 'paid'
      }

      if (formData.is_recurring) {
          payload.recurrence_interval = formData.recurrence_interval
      }

      if (initialData?.id) {
          // Update
          await db.expenses.update(initialData.id, payload)
          await db.syncQueue.add({
            actionType: 'UPDATE_EXPENSE',
            table: 'expenses',
            payload: { ...payload, id: initialData.id },
            timestamp: now
          })
          toast.success("Expense updated offline")
      } else {
          // Add
          payload.createdAt = now
          await db.expenses.add(payload)
          await db.syncQueue.add({
            actionType: 'ADD_EXPENSE',
            table: 'expenses',
            payload,
            timestamp: now
          })
          toast.success("Expense saved offline")
      }

      if (navigator.onLine) {
        toast.info("Syncing to cloud in background...")
      }

      router.push('/dashboard/expenses')
      
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save expense.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      
      {/* OCR Quick Upload & Preview */}
      <div className="bg-paddy/10 p-4 rounded-xl border border-paddy/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-ink">Receipt Scanner</h3>
            <p className="text-xs text-ink/70">රිසිට්පතක් උඩුගත කර ස්වයංක්‍රීයව පුරවන්න</p>
          </div>
          <div className="flex items-center gap-2">
              {formData.receipt_data && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFormData(p => ({...p, receipt_data: ''}))} className="text-rose-500 hover:text-rose-600">
                      <X className="w-4 h-4 mr-1" /> Remove
                  </Button>
              )}
              <Button 
                type="button" 
                variant="outline" 
                className="bg-turmeric hover:bg-turmeric/90 text-ink border-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isOcrProcessing}
              >
                {isOcrProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                {isOcrProcessing ? 'Reading...' : (formData.receipt_data ? 'Change Receipt' : 'Scan Receipt')}
              </Button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleReceiptUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {ocrPending && (
            <div className="bg-white p-3 rounded-lg border border-paddy/30 shadow-sm mt-3 animate-in fade-in slide-in-from-top-2">
                <h4 className="text-sm font-bold text-ink mb-2">Review Extracted Data</h4>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                        <span className="text-ink/70">Amount: </span>
                        <span className="font-semibold text-paddy">{ocrPending.amount ? `Rs. ${ocrPending.amount}` : 'Not found'}</span>
                    </div>
                    <div>
                        <span className="text-ink/70">Date: </span>
                        <span className="font-semibold text-paddy">{ocrPending.date || 'Not found'}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button type="button" onClick={applyOcrData} className="w-full bg-turmeric hover:bg-turmeric/90 text-ink text-xs py-1 h-8">
                        Apply Values
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setOcrPending(null)} className="w-full text-xs py-1 h-8">
                        Dismiss
                    </Button>
                </div>
            </div>
        )}

        {formData.receipt_data && !ocrPending && (
            <div className="mt-3 flex items-center gap-2 text-sm text-paddy bg-paddy/10 p-2 rounded-lg w-fit">
                <ImageIcon className="w-4 h-4" /> Receipt attached
            </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('formAmount')}</Label>
            <Input 
              type="number" 
              step="0.01" 
              required
              placeholder="0.00"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              className="text-lg font-semibold"
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('formExpenseTitle')}</Label>
            <Input 
              required
              placeholder="e.g. Tomato Seeds 5kg"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('formCategory')}</Label>
          <ExpenseCategoryPicker 
            value={formData.category_id} 
            onChange={id => setFormData({ ...formData, category_id: id })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t('formDate')}</Label>
            <Input 
              type="date" 
              required
              value={formData.expense_date}
              onChange={e => setFormData({ ...formData, expense_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('formPaymentMethod')}</Label>
            <Select 
              value={formData.payment_method} 
              onValueChange={v => setFormData({ ...formData, payment_method: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">{t('payCash')}</SelectItem>
                <SelectItem value="bank_transfer">{t('payBank')}</SelectItem>
                <SelectItem value="card">{t('payCard')}</SelectItem>
                <SelectItem value="credit">{t('payCredit')}</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.payment_method === 'credit' && (
              <div className="space-y-2">
                <Label>{t('formPaymentStatus')}</Label>
                <Select 
                  value={formData.payment_status} 
                  onValueChange={v => setFormData({ ...formData, payment_status: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('statusPendingPay')}</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                    <SelectItem value="paid">Fully Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
          )}
        </div>

        {formData.payment_method === 'credit' && formData.payment_status === 'partially_paid' && (
            <div className="space-y-2 bg-rose-50 p-3 rounded-lg border border-rose-100">
                <Label className="text-rose-800">Amount Paid So Far (Rs.)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  value={formData.paid_amount}
                  onChange={e => setFormData({ ...formData, paid_amount: e.target.value })}
                  className="bg-white border-rose-200"
                />
                {parseFloat(formData.amount) > 0 && parseFloat(formData.paid_amount) > 0 && (
                    <p className="text-xs text-rose-600 font-medium mt-1">
                        Outstanding: Rs. {(parseFloat(formData.amount) - parseFloat(formData.paid_amount)).toFixed(2)}
                    </p>
                )}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('formSupplier')}</Label>
              <Select 
                value={formData.supplier_id} 
                onValueChange={v => setFormData({ ...formData, supplier_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- No Supplier --</SelectItem>
                  {suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id!.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{t('formInvoiceNumber')}</Label>
              <Input 
                placeholder="e.g. INV-1002"
                value={formData.invoice_number}
                onChange={e => setFormData({ ...formData, invoice_number: e.target.value })}
              />
            </div>
        </div>

        <div className="space-y-2">
          <Label>{t('formNotes')}</Label>
          <Input 
            placeholder="Additional details..."
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-turmeric hover:bg-turmeric/90 text-ink font-medium"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
          {initialData ? 'Update Expense' : 'Save Expense'}
        </Button>
      </div>
    </form>
  )
}
