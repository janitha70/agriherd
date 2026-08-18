"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, CloudOff, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"

export default function LivestockDirectory() {
  // Watch the local Dexie database for any changes
  const animals = useLiveQuery(() => db.animals.reverse().toArray())

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Livestock Directory</h1>
          <p className="text-gray-500 mt-1">Manage and monitor active herd status.</p>
        </div>
        <Link href="/dashboard/livestock/new">
          <Button className="bg-emerald-900 hover:bg-emerald-800 text-white font-medium">
            <Plus className="h-4 w-4 mr-2" />
            Add New Animal
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search Tag ID, Species..." className="pl-9 bg-white" />
        </div>
        <select className="border-gray-200 rounded-md text-sm p-2 bg-white border outline-none focus:ring-2 focus:ring-emerald-900">
          <option>All Species</option>
          <option>Bovine</option>
          <option>Porcine</option>
          <option>Poultry</option>
        </select>
        <select className="border-gray-200 rounded-md text-sm p-2 bg-white border outline-none focus:ring-2 focus:ring-emerald-900">
          <option>All Status</option>
          <option>Healthy</option>
          <option>Pending Sync</option>
        </select>
      </div>

      {/* Livestock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">

        {/* Loading State */}
        {animals === undefined && (
          <div className="col-span-full py-12 text-center text-gray-500 font-medium">
            Loading local database...
          </div>
        )}

        {/* Empty State */}
        {animals?.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl border-gray-200 bg-gray-50">
            <p className="text-gray-500 font-medium">No livestock found in local storage.</p>
            <p className="text-sm text-gray-400 mt-1">Register a new animal to get started.</p>
          </div>
        )}

        {/* Dynamic Animal Cards */}
        {animals?.map((animal) => (
          <Card key={animal.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <p className="text-xs text-gray-500 font-medium">TAG ID</p>
                <CardTitle className="text-xl">{animal.tagId}</CardTitle>
              </div>

              {/* Sync Status Badge */}
              {animal.syncStatus === 'pending' ? (
                <span className="flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                  <CloudOff className="h-3 w-3" />
                  Offline
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  Synced
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xl">
                  {animal.species === 'Bovine' ? '🐄' : animal.species === 'Porcine' ? '🐖' : animal.species === 'Poultry' ? '🐔' : '🐑'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{animal.species} ({animal.breed})</p>
                  <p className="text-xs text-gray-500">DOB: {new Date(animal.dob).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

      </div>
    </div>
  )
}