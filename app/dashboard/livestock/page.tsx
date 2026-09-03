"use client"

import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CloudOff, CheckCircle2, Search, Filter, AlertCircle, PawPrint } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function LivestockRegistryPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewFilter, setViewFilter] = useState<'active' | 'exited' | 'all'>("active")
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const animals = useLiveQuery(() => db.animals.reverse().toArray())

  const handleStatusChange = async (animal: any, newStatus: string) => {
    if (!animal.id) return;
    try {
      // 1. Local IndexedDB update
      await db.animals.update(animal.id, {
        status: newStatus,
        syncStatus: 'pending',
      })

      // 2. Queue for cloud synchronization
      await db.syncQueue.add({
        id: crypto.randomUUID(),
        actionType: 'UPDATE',
        table: 'livestock',
        payload: {
          localId: animal.id,
          tagId: animal.tagId,
          status: newStatus,
        },
        timestamp: Date.now(),
      })

      // 3. User feedback
      const formattedStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
      setToastMsg(`Animal status updated to "${formattedStatus}" (Queued for sync)`)
      setTimeout(() => setToastMsg(null), 3500)
    } catch (error) {
      console.error("Failed to update animal status:", error)
    }
  }

  // Filter animals based on herd status and search query
  const filteredAnimals = (animals || []).filter((animal) => {
    const animalStatus = (animal.status || 'active').toLowerCase()

    // 1. Status Filter Logic
    const matchesView =
      viewFilter === 'all'
        ? true
        : viewFilter === 'active'
        ? animalStatus === 'active'
        : animalStatus !== 'active' // 'exited' includes sold, deceased, culled

    if (!matchesView) return false

    // 2. Search Query Logic (case-insensitive on tagId, tag_number, species, breed)
    if (!searchQuery.trim()) return true

    const query = searchQuery.trim().toLowerCase()
    const tag = String(animal.tagId || (animal as any).tag_number || '').toLowerCase()
    const species = String(animal.species || '').toLowerCase()
    const breed = String(animal.breed || '').toLowerCase()

    return tag.includes(query) || species.includes(query) || breed.includes(query)
  })

  // Quick stats for view selector labels
  const activeCount = (animals || []).filter((a) => (a.status || 'active').toLowerCase() === 'active').length
  const exitedCount = (animals || []).filter((a) => (a.status || 'active').toLowerCase() !== 'active').length

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Alert Feedback */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-emerald-950 text-emerald-100 px-4 py-3 rounded-xl shadow-lg border border-emerald-700/50 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("livestockTitle")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("livestockSubtitle")}
        </p>
      </div>

      {/* Controls Container: Search Bar & View Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-card p-4 rounded-xl border shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 h-10 w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
          <Select
            value={viewFilter}
            onValueChange={(val) => {
              if (val) setViewFilter(val as 'active' | 'exited' | 'all')
            }}
          >
            <SelectTrigger className="w-full sm:w-[200px] h-10 min-h-[40px] text-sm font-medium">
              <SelectValue placeholder="Filter Herd View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active Herd ({activeCount})</SelectItem>
              <SelectItem value="exited">Exited Herd ({exitedCount})</SelectItem>
              <SelectItem value="all">All Animals ({(animals || []).length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Livestock Grid */}
      {!animals ? (
        <div className="text-center py-10 text-muted-foreground">
          Loading livestock data...
        </div>
      ) : filteredAnimals.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-60" />
          <p className="text-muted-foreground font-medium">No livestock found.</p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery
              ? `No animals match your search "${searchQuery}".`
              : viewFilter === 'exited'
              ? "No exited animals (sold, deceased, culled) recorded yet."
              : "Register a new animal to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAnimals.map((animal) => {
            const currentStatus = (animal.status || 'active').toLowerCase()

            return (
              <Card key={animal.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  {animal.photo_data && typeof animal.photo_data === 'string' && animal.photo_data.startsWith('data:image') ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img 
                      src={animal.photo_data} 
                      alt={`Livestock Tag ${animal.tagId}`} 
                      className="w-full h-48 object-cover rounded-t-lg" 
                    />
                  ) : (
                    <div className="h-24 w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 flex items-center justify-center border-b border-emerald-100/50 dark:border-emerald-800/20">
                      <PawPrint className="h-8 w-8 text-emerald-500/20 dark:text-emerald-400/10" />
                    </div>
                  )}
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("tagId")}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          currentStatus === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          currentStatus === 'sold' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          currentStatus === 'deceased' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {currentStatus}
                        </span>
                      </div>
                      <CardTitle className="text-xl font-bold tracking-tight">
                        {animal.tagId}
                      </CardTitle>
                    </div>
                    {animal.syncStatus === 'pending' ? (
                      <span className="flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                        <CloudOff className="h-3.5 w-3.5" />
                        {t("pendingSyncStatus")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t("synced")}
                      </span>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                      <div className="space-y-1">
                        <dt className="text-muted-foreground font-medium">{t("speciesLabel")}</dt>
                        <dd className="font-semibold capitalize flex items-center gap-2">
                          <span className="text-lg">
                            {animal.species.toLowerCase() === 'bovine' ? '🐄' : 
                             animal.species.toLowerCase() === 'porcine' ? '🐖' : 
                             animal.species.toLowerCase() === 'poultry' ? '🐔' : '🐑'}
                          </span>
                          {animal.species}
                        </dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-muted-foreground font-medium">{t("breedLabel")}</dt>
                        <dd className="font-semibold capitalize">{animal.breed}</dd>
                      </div>
                      <div className="space-y-1 col-span-2 pt-2 border-t">
                        <dt className="text-muted-foreground font-medium">{t("dob")}</dt>
                        <dd className="font-semibold">
                          {new Date(animal.dob).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </dd>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Status Dropdown Control for Herd Exit Management */}
                <div className="p-4 pt-3 border-t mt-4 bg-muted/10 space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium flex items-center justify-between">
                    <span>{t("herdStatus")}</span>
                  </label>
                  <Select
                    value={animal.status || "active"}
                    onValueChange={(newStatus) => {
                      if (animal.id && newStatus) {
                        handleStatusChange(animal, newStatus)
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-10 min-h-[44px] text-sm font-medium border-input bg-background focus:ring-2 focus:ring-emerald-900">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active (In Herd)</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="deceased">Deceased</SelectItem>
                      <SelectItem value="culled">Culled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}