"use client"

import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db, type LocalVaccination, type LocalAnimal } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  ShieldPlus,
  ShieldAlert,
  CalendarClock,
  CheckCircle2,
  Syringe,
  Bug,
  X,
  Plus,
  AlertTriangle,
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

function computeStatus(nextDueDate: string): LocalVaccination["status"] {
  if (!nextDueDate) return "pending"
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(nextDueDate)
  due.setHours(0, 0, 0, 0)
  return due < today ? "overdue" : "pending"
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status, t }: { status: LocalVaccination["status"]; t: (k: string) => string }) {
  const map = {
    overdue: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  }
  const labelKey = status === "overdue" ? "statusOverdue" : status === "pending" ? "statusPending" : "statusCompleted"
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${map[status]}`}>
      {status === "completed" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
      {t(labelKey)}
    </span>
  )
}

function TypeIcon({ type }: { type: LocalVaccination["type"] }) {
  return type === "vaccine"
    ? <Syringe className="h-4 w-4 text-blue-500 flex-shrink-0" />
    : <Bug className="h-4 w-4 text-amber-500 flex-shrink-0" />
}

function VaccinationCard({
  record,
  displayTag,
  t,
}: {
  record: LocalVaccination
  displayTag: string
  t: (k: string) => string
}) {
  const isOverdue = record.status === "overdue"
  return (
    <Card className={`flex flex-col gap-0 transition-shadow hover:shadow-md ${isOverdue ? "border-red-300 dark:border-red-700" : "border-border"}`}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <TypeIcon type={record.type} />
            <CardTitle className="text-base font-bold truncate">{record.name}</CardTitle>
          </div>
          <StatusBadge status={record.status} t={t} />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-1.5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t("animalId")}</p>
            {/* Show human-readable tag resolved from local animals table.
                Falls back to 'Unknown Animal' if the record is not in local DB. */}
            <p className="font-mono font-semibold text-gray-900 dark:text-gray-100 truncate">{displayTag}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t("treatmentType")}</p>
            <p className="font-medium capitalize">{t(record.type)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t("dueDate")}</p>
            <p className={`font-semibold ${isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-200"}`}>
              {formatDate(record.next_due_date)}
            </p>
          </div>
          {record.date_administered && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Last Given</p>
              <p className="font-medium text-gray-700 dark:text-gray-300">{formatDate(record.date_administered)}</p>
            </div>
          )}
        </div>
        {record.notes && (
          <p className="text-xs text-muted-foreground border-t pt-2 mt-2 line-clamp-2">{record.notes}</p>
        )}
      </CardContent>
    </Card>
  )
}

// ── Log Treatment Modal ────────────────────────────────────────────────────

const DEFAULT_FORM = {
  animal_id: "",
  type: "vaccine" as LocalVaccination["type"],
  name: "",
  date_administered: new Date().toISOString().split("T")[0],
  next_due_date: "",
  notes: "",
}

function LogTreatmentModal({ onClose, t }: { onClose: () => void; t: (k: string) => string }) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const animals = useLiveQuery(() => db.animals.orderBy("tagId").toArray())

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.animal_id.trim()) { setError("Animal ID is required."); return }
    if (!form.name.trim()) { setError("Treatment name is required."); return }
    if (!form.next_due_date) { setError("Next due date is required."); return }

    setIsSaving(true)
    setError("")
    try {
      // 1. Stable UUID — shared between the local record and the sync payload
      //    so the sync engine can match them on the way up to Supabase.
      const record_id = crypto.randomUUID()

      // 2. Derive status by comparing due date to today
      const status = computeStatus(form.next_due_date)

      // 3. Persist to local IndexedDB; capture the Dexie auto-increment id
      //    so the sync engine can partial-update syncStatus after a push.
      const localId = await db.vaccinations.add({
        record_id,
        animal_id: form.animal_id.trim(),
        type: form.type,
        name: form.name.trim(),
        date_administered: form.date_administered,
        next_due_date: form.next_due_date,
        status,
        notes: form.notes.trim() || undefined,
        syncStatus: "pending",
      })

      // 4. Route to the background sync engine.
      //    `localId` lets processSyncQueue flip syncStatus: 'synced' on success
      //    without overwriting the full record.
      await db.syncQueue.add({
        actionType: "LOG_VACCINATION",
        table: "vaccinations",
        payload: {
          record_id,
          animal_id: form.animal_id.trim(),
          type: form.type,
          name: form.name.trim(),
          date_administered: form.date_administered,
          next_due_date: form.next_due_date,
          status,
          notes: form.notes.trim() || undefined,
          localId,
        },
        timestamp: new Date().toISOString(),
      })

      // 5. Reset form state and close the modal
      setForm(DEFAULT_FORM)
      setError("")
      onClose()
    } catch (err) {
      console.error("Failed to log treatment:", err)
      setError("Failed to save. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 dark:bg-emerald-950 p-2 rounded-lg">
              <ShieldPlus className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("logTreatment")}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Animal */}
          <div className="space-y-1.5">
            <Label htmlFor="animal_id">{t("animalId")} *</Label>
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
                  <option key={a.id} value={a.tagId}>{a.tagId} ({a.species})</option>
                ))}
              </select>
            ) : (
              <Input
                id="animal_id"
                name="animal_id"
                value={form.animal_id}
                onChange={handleChange}
                placeholder="e.g. TX-8482-R"
              />
            )}
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label htmlFor="type">{t("treatmentType")} *</Label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-900"
            >
              <option value="vaccine">{t("vaccine")}</option>
              <option value="deworming">{t("deworming")}</option>
            </select>
          </div>

          {/* Treatment Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Treatment Name *</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. FMD, HS, Albendazole"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date_administered">Date Administered</Label>
              <Input
                id="date_administered"
                name="date_administered"
                type="date"
                value={form.date_administered}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="next_due_date">Next Due Date *</Label>
              <Input
                id="next_due_date"
                name="next_due_date"
                type="date"
                value={form.next_due_date}
                onChange={handleChange}
              />
            </div>
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
              placeholder="Dosage, batch number, or observations..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 resize-none"
            />
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSaving}>
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-emerald-900 hover:bg-emerald-800 text-white font-bold"
            >
              {isSaving ? t("saving") : t("logTreatment")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function HealthTrackerPage() {
  const { t } = useLanguage()
  const [showModal, setShowModal] = useState(false)

  // Re-compute status on every read so overdue state is always live
  const allRecords = useLiveQuery(async () => {
    const records = await db.vaccinations.orderBy("next_due_date").toArray()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // Reconcile stored status against today's date in case time has passed
    return records.map((r) => ({
      ...r,
      status: r.status === "completed" ? "completed" : computeStatus(r.next_due_date),
    } as LocalVaccination))
  })

  // Fetch all animals to resolve tagIds for display
  const animals = useLiveQuery(() => db.animals.toArray())

  // Build a Map keyed by tagId for O(1) lookups in the render loop.
  // animal_id in vaccinations stores the tagId (e.g. "B-2050") locally,
  // so we key by tagId — not by the numeric Dexie auto-increment id.
  const animalByTagId = new Map<string, LocalAnimal>(
    (animals ?? []).map((a) => [a.tagId, a])
  )

  // Helper: resolve a vaccination's animal_id to a display label
  const resolveTag = (animal_id: string): string => {
    const match = animalByTagId.get(animal_id)
    return match?.tagId ?? "Unknown Animal"
  }

  const overdue = allRecords?.filter((r) => r.status === "overdue") ?? []
  const upcoming = allRecords?.filter((r) => r.status === "pending") ?? []
  const completed = allRecords?.filter((r) => r.status === "completed") ?? []

  const isLoading = allRecords === undefined || animals === undefined

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t("healthTrackerTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("healthTrackerSubtitle")}</p>
        </div>
        <Button
          id="log-treatment-btn"
          onClick={() => setShowModal(true)}
          className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold shrink-0 gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("logTreatment")}
        </Button>
      </div>

      {/* Summary Stat Pills */}
      {!isLoading && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <span className="text-sm font-bold text-red-700 dark:text-red-400">{overdue.length} Overdue</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2">
            <CalendarClock className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{upcoming.length} Upcoming</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{completed.length} Completed</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground text-sm animate-pulse">Loading health records...</div>
      ) : (
        <div className="space-y-8">

          {/* ── Section 1: Overdue / Action Required ─────────────────── */}
          <section aria-label="Overdue treatments">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{t("overdueAlerts")}</h2>
              {overdue.length > 0 && (
                <span className="ml-auto text-xs font-bold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">
                  {overdue.length}
                </span>
              )}
            </div>

            {overdue.length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/10 px-5 py-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{t("noOverdue")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overdue.map((record) => (
                  <VaccinationCard key={record.id} record={record} displayTag={resolveTag(record.animal_id)} t={t} />
                ))}
              </div>
            )}
          </section>

          {/* ── Section 2: Upcoming Schedule ─────────────────────────── */}
          <section aria-label="Upcoming treatments">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="h-5 w-5 text-amber-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{t("upcomingSchedule")}</h2>
              {upcoming.length > 0 && (
                <span className="ml-auto text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">
                  {upcoming.length}
                </span>
              )}
            </div>

            {upcoming.length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-5 py-4">
                <CalendarClock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{t("noUpcoming")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map((record) => (
                  <VaccinationCard key={record.id} record={record} displayTag={resolveTag(record.animal_id)} t={t} />
                ))}
              </div>
            )}
          </section>

          {/* ── Section 3: Completed ─────────────────────────────────── */}
          {completed.length > 0 && (
            <section aria-label="Completed treatments">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{t("statusCompleted")}</h2>
                <span className="ml-auto text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                  {completed.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map((record) => (
                  <VaccinationCard key={record.id} record={record} displayTag={resolveTag(record.animal_id)} t={t} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}

      {/* Log Treatment Modal */}
      {showModal && <LogTreatmentModal onClose={() => setShowModal(false)} t={t} />}
    </div>
  )
}
