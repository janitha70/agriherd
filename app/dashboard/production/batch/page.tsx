"use client"

import React, { useState, useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db, type LocalAnimal, type LocalProductionYield } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2, Info } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type BatchEntry = {
  animal_id: string
  quantity: string
}

export default function BatchProductionPage() {
  const router = useRouter()
  const [speciesFilter, setSpeciesFilter] = useState<"Bovine" | "Poultry">("Bovine")
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split("T")[0])
  const [entries, setEntries] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Fetch active animals
  const allAnimals = useLiveQuery(() => db.animals.toArray()) || []
  const activeAnimals = allAnimals.filter(a => a.status !== 'sold' && a.status !== 'deceased' && a.species === speciesFilter)

  // Clear entries when switching filter
  useEffect(() => {
    setEntries({})
  }, [speciesFilter])

  const handleQuantityChange = (tagId: string, val: string) => {
    setEntries(prev => ({ ...prev, [tagId]: val }))
  }

  const handleSaveBatch = async () => {
    // Collect all valid entries
    const validEntries = Object.entries(entries)
      .map(([animal_id, quantity]) => ({ animal_id, quantity: Number(quantity) }))
      .filter(e => e.quantity > 0)

    if (validEntries.length === 0) {
      toast.error("No yields entered. Please enter at least one value.")
      return
    }

    if (!collectionDate) {
      toast.error("Collection date is required.")
      return
    }

    setIsSaving(true)
    try {
      const productType = speciesFilter === "Bovine" ? "milk" : "eggs"
      const unit = productType === "milk" ? "liters" : "count"

      // Process in a loop to generate UUIDs and insert
      for (const entry of validEntries) {
        const record_id = crypto.randomUUID()
        
        const localId = await db.production_yields.add({
          record_id,
          animal_id: entry.animal_id,
          product_type: productType,
          quantity: entry.quantity,
          unit: unit,
          collection_date: collectionDate,
          syncStatus: "pending",
        })

        await db.syncQueue.add({
          actionType: "LOG_YIELD",
          table: "production_yields",
          payload: {
            record_id,
            animal_id: entry.animal_id,
            product_type: productType,
            quantity: entry.quantity,
            unit: unit,
            collection_date: collectionDate,
            localId,
          },
          timestamp: new Date().toISOString(),
        })
      }

      toast.success(`Successfully saved ${validEntries.length} yield records.`)
      router.push("/dashboard/production")
    } catch (err) {
      console.error("Batch save error:", err)
      toast.error("Failed to save batch yields.")
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/production" 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Batch Yield Entry</h1>
          <p className="text-gray-500 text-sm">කණ්ඩායම් වශයෙන් නිෂ්පාදන දත්ත ඇතුලත් කරන්න</p>
        </div>
      </div>

      {/* Controls */}
      <Card className="shadow-sm border-gray-100 dark:border-gray-800">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between md:items-center">
          <div className="flex items-center gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Herd / Flock</Label>
              <div className="flex bg-muted p-1 rounded-lg">
                <button
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${speciesFilter === "Bovine" ? "bg-white shadow-sm text-ink dark:bg-gray-800" : "text-muted-foreground hover:text-ink"}`}
                  onClick={() => setSpeciesFilter("Bovine")}
                >
                  🐄 Cattle (Milk)
                </button>
                <button
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${speciesFilter === "Poultry" ? "bg-white shadow-sm text-ink dark:bg-gray-800" : "text-muted-foreground hover:text-ink"}`}
                  onClick={() => setSpeciesFilter("Poultry")}
                >
                  🐔 Poultry (Eggs)
                </button>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Date</Label>
              <Input
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                className="h-9 w-40"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSaveBatch}
            disabled={isSaving}
            className="bg-turmeric hover:bg-turmeric/90 text-ink font-bold"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Batch
          </Button>
        </CardContent>
      </Card>

      {/* Grid */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {activeAnimals.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground flex flex-col items-center">
            <Info className="h-8 w-8 text-muted-foreground/50 mb-3" />
            <p>No active {speciesFilter} found in the registry.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-5 md:col-span-3">Tag ID</div>
              <div className="col-span-3 md:col-span-2 hidden md:block">Breed</div>
              <div className="col-span-7 md:col-span-7">Yield ({speciesFilter === "Bovine" ? "Liters" : "Count"})</div>
            </div>
            {activeAnimals.map(animal => (
              <div key={animal.tagId} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                <div className="col-span-5 md:col-span-3 font-mono font-bold text-sm text-gray-900 dark:text-gray-100">
                  {animal.tagId}
                </div>
                <div className="col-span-3 md:col-span-2 text-sm text-muted-foreground hidden md:block truncate">
                  {animal.breed}
                </div>
                <div className="col-span-7 md:col-span-7">
                  <Input
                    type="number"
                    min="0"
                    step={speciesFilter === "Bovine" ? "0.1" : "1"}
                    placeholder="0.0"
                    className="w-full md:w-48 bg-white dark:bg-gray-950"
                    value={entries[animal.tagId] || ""}
                    onChange={(e) => handleQuantityChange(animal.tagId, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
