"use client"

import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db, type LocalProductionYield, type LocalAnimal } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  TrendingUp,
  Milk,
  Egg,
  Beef,
  Plus,
  CalendarDays,
  CloudOff,
  CheckCircle2,
  Droplets,
  X,
} from "lucide-react"

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function groupByDate(records: LocalProductionYield[]) {
  const map = new Map<string, LocalProductionYield[]>()
  for (const r of records) {
    const key = r.collection_date
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  }
  // Sort descending by date
  return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a))
}

function sumByType(records: LocalProductionYield[], type: LocalProductionYield["product_type"]) {
  return records.filter((r) => r.product_type === type).reduce((acc, r) => acc + r.quantity, 0)
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ProductTypeIcon({ type }: { type: LocalProductionYield["product_type"] }) {
  if (type === "milk") return <Milk className="h-4 w-4 text-blue-500 flex-shrink-0" />
  if (type === "eggs") return <Egg className="h-4 w-4 text-amber-500 flex-shrink-0" />
  return <Beef className="h-4 w-4 text-rose-500 flex-shrink-0" />
}

function ProductTypeBadge({ type }: { type: LocalProductionYield["product_type"] }) {
  const styles = {
    milk: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    eggs: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    meat: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${styles[type]}`}>
      <ProductTypeIcon type={type} />
      {type}
    </span>
  )
}

function YieldRecordCard({
  record,
  displayTag,
}: {
  record: LocalProductionYield
  displayTag: string
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <ProductTypeIcon type={record.product_type} />
            <span className="font-mono font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
              {displayTag}
            </span>
          </div>
          <ProductTypeBadge type={record.product_type} />
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Quantity</p>
            <p className="font-bold text-gray-900 dark:text-gray-100">
              {record.quantity} <span className="text-xs font-normal text-muted-foreground">{record.unit}</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date</p>
            <p className="font-medium text-gray-700 dark:text-gray-300 text-xs">{formatDate(record.collection_date)}</p>
          </div>
          <div className="flex items-center justify-end">
            {record.syncStatus === "pending" ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                <CloudOff className="h-3 w-3" />
                Pending
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" />
                Synced
              </span>
            )}
          </div>
        </div>

        {record.notes && (
          <p className="text-xs text-muted-foreground border-t pt-2 mt-2 line-clamp-1">{record.notes}</p>
        )}
      </CardContent>
    </Card>
  )
}

function DailyGroupCard({
  date,
  records,
  animalByTagId,
}: {
  date: string
  records: LocalProductionYield[]
  animalByTagId: Map<string, LocalAnimal>
}) {
  const totalMilk = sumByType(records, "milk")
  const totalEggs = sumByType(records, "eggs")
  const totalMeat = sumByType(records, "meat")

  const resolveTag = (animal_id: string) =>
    animalByTagId.get(animal_id)?.tagId ?? animal_id

  return (
    <div className="space-y-3">
      {/* Date group header */}
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">{formatDate(date)}</h3>
        <div className="flex-1 h-px bg-border" />
        {/* Day totals */}
        <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
          {totalMilk > 0 && (
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <Droplets className="h-3 w-3" />{totalMilk}L
            </span>
          )}
          {totalEggs > 0 && (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Egg className="h-3 w-3" />{totalEggs} eggs
            </span>
          )}
          {totalMeat > 0 && (
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <Beef className="h-3 w-3" />{totalMeat}kg
            </span>
          )}
        </div>
      </div>

      {/* Records grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {records.map((r) => (
          <YieldRecordCard
            key={r.id}
            record={r}
            displayTag={resolveTag(r.animal_id)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Log Yield Modal ────────────────────────────────────────────────────────

// Default unit per product type — auto-switched when user changes the dropdown
const DEFAULT_UNIT: Record<LocalProductionYield["product_type"], LocalProductionYield["unit"]> = {
  milk: "liters",
  eggs: "count",
  meat: "kg",
}

const DEFAULT_FORM = {
  animal_id: "",
  product_type: "milk" as LocalProductionYield["product_type"],
  quantity: "",
  unit: "liters" as LocalProductionYield["unit"],
  collection_date: new Date().toISOString().split("T")[0],
  notes: "",
}

function LogYieldModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  // Fetch animals for the dropdown
  const animals = useLiveQuery(() => db.animals.orderBy("tagId").toArray())

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      // Auto-switch unit when product type changes
      if (name === "product_type") {
        next.unit = DEFAULT_UNIT[value as LocalProductionYield["product_type"]]
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.animal_id.trim()) { setError("Please select an animal."); return }
    if (!form.quantity || Number(form.quantity) <= 0) { setError("Quantity must be greater than 0."); return }
    if (!form.collection_date) { setError("Collection date is required."); return }

    setIsSaving(true)
    setError("")
    try {
      // 1. Stable UUID shared between the local record and the sync payload
      const record_id = crypto.randomUUID()
      const quantity = Number(form.quantity)

      // 2. Persist to IndexedDB; capture Dexie auto-increment id for the sync handler
      const localId = await db.production_yields.add({
        record_id,
        animal_id: form.animal_id.trim(),
        product_type: form.product_type,
        quantity,
        unit: form.unit,
        collection_date: form.collection_date,
        notes: form.notes.trim() || undefined,
        syncStatus: "pending",
      })

      // 3. Route to the background sync engine.
      //    `localId` lets processSyncQueue flip syncStatus: 'synced' after a push
      //    without overwriting the full record.
      await db.syncQueue.add({
        actionType: "LOG_YIELD",
        table: "production_yields",
        payload: {
          record_id,
          animal_id: form.animal_id.trim(),
          product_type: form.product_type,
          quantity,
          unit: form.unit,
          collection_date: form.collection_date,
          notes: form.notes.trim() || undefined,
          localId,
        },
        timestamp: new Date().toISOString(),
      })

      // 4. Reset and close — useLiveQuery on the page will update instantly
      setForm(DEFAULT_FORM)
      setError("")
      onClose()
    } catch (err) {
      console.error("Failed to log yield:", err)
      setError("Failed to save. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 dark:bg-emerald-950 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Log Yield</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Animal */}
          <div className="space-y-1.5">
            <Label htmlFor="animal_id">Animal *</Label>
            {animals && animals.length > 0 ? (
              <select
                id="animal_id"
                name="animal_id"
                value={form.animal_id}
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-900"
              >
                <option value="">— Select an animal —</option>
                {animals.map((a) => (
                  <option key={a.id} value={a.tagId}>
                    {a.tagId} ({a.species})
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="animal_id"
                name="animal_id"
                value={form.animal_id}
                onChange={handleChange}
                placeholder="e.g. B-2050"
              />
            )}
          </div>

          {/* Product Type */}
          <div className="space-y-1.5">
            <Label htmlFor="product_type">Product Type *</Label>
            <select
              id="product_type"
              name="product_type"
              value={form.product_type}
              onChange={handleChange}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-900"
            >
              <option value="milk">🥛 Milk</option>
              <option value="eggs">🥚 Eggs</option>
              <option value="meat">🥩 Meat</option>
            </select>
          </div>

          {/* Quantity + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                step="0.1"
                value={form.quantity}
                onChange={handleChange}
                placeholder="0.0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">Unit</Label>
              <select
                id="unit"
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-900"
              >
                <option value="liters">Liters</option>
                <option value="count">Count</option>
                <option value="kg">Kg</option>
              </select>
            </div>
          </div>

          {/* Collection Date */}
          <div className="space-y-1.5">
            <Label htmlFor="collection_date">Collection Date *</Label>
            <Input
              id="collection_date"
              name="collection_date"
              type="date"
              value={form.collection_date}
              onChange={handleChange}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Batch notes, quality observations..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 resize-none"
            />
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-emerald-900 hover:bg-emerald-800 text-white font-bold"
            >
              {isSaving ? "Saving..." : "Log Yield"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ProductionPage() {
  const { t } = useLanguage()
  const [showModal, setShowModal] = useState(false)

  const allYields = useLiveQuery(() =>
    db.production_yields.orderBy("collection_date").reverse().toArray()
  )

  const animals = useLiveQuery(() => db.animals.toArray())

  // Build O(1) lookup map from tagId → LocalAnimal
  const animalByTagId = new Map<string, LocalAnimal>(
    (animals ?? []).map((a) => [a.tagId, a])
  )

  const isLoading = allYields === undefined || animals === undefined

  // Summary totals across all records
  const totalMilk = sumByType(allYields ?? [], "milk")
  const totalEggs = sumByType(allYields ?? [], "eggs")
  const totalMeat = sumByType(allYields ?? [], "meat")

  const grouped = groupByDate(allYields ?? [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
            Production Yields
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Daily milk, egg, and meat collection records.
          </p>
        </div>
        <Button
          id="log-yield-btn"
          onClick={() => setShowModal(true)}
          className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold shrink-0 gap-2"
        >
          <Plus className="h-4 w-4" />
          Log Yield
        </Button>
      </div>

      {/* Summary Stat Pills */}
      {!isLoading && (allYields?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-3">
          {totalMilk > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                {totalMilk.toFixed(1)} L total milk
              </span>
            </div>
          )}
          {totalEggs > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2">
              <Egg className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                {totalEggs} eggs total
              </span>
            </div>
          )}
          {totalMeat > 0 && (
            <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-2">
              <Beef className="h-4 w-4 text-rose-500" />
              <span className="text-sm font-bold text-rose-700 dark:text-rose-400">
                {totalMeat.toFixed(1)} kg meat total
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground text-sm animate-pulse">
          Loading production records...
        </div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-muted/20 gap-3">
          <TrendingUp className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground font-medium">No yield records yet.</p>
          <p className="text-sm text-muted-foreground">
            Tap <strong>Log Yield</strong> to record your first collection.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([date, records]) => (
            <DailyGroupCard
              key={date}
              date={date}
              records={records}
              animalByTagId={animalByTagId}
            />
          ))}
        </div>
      )}

      {/* Log Yield Modal */}
      {showModal && <LogYieldModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
