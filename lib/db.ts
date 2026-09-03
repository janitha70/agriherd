import Dexie, { type Table } from 'dexie'

export interface LocalAnimal {
  id?: number
  tagId: string
  species: string
  breed: string
  dob: string
  photoStr?: string
  photo_data?: string
  status?: 'active' | 'sold' | 'deceased' | 'culled' | string
  syncStatus: 'pending' | 'synced'
  createdAt: string
}

export interface LocalHealthMetric {
  id?: number
  animalTagId: string
  livestock_id?: string
  temperature: number
  feedIntake: number
  yieldAmount: number
  weight_kg?: number
  weightKg?: number
  observations: string
  syncStatus: 'pending' | 'synced'
  recordedAt: string
}

export interface SyncAction {
  id?: number | string
  actionType: 'REGISTER_ANIMAL' | 'LOG_VITALS' | 'UPDATE' | string
  table?: string
  payload: any
  timestamp: string | number
}

export interface LocalVaccination {
  id?: number          // Dexie auto-increment PK
  record_id: string    // UUID — stable identifier for sync
  animal_id: string    // References LocalAnimal.tagId
  type: 'vaccine' | 'deworming'
  name: string         // e.g. 'FMD', 'HS', 'Albendazole'
  date_administered: string
  next_due_date: string
  status: 'completed' | 'pending' | 'overdue'
  notes?: string
  syncStatus: 'pending' | 'synced'
}

export interface LocalProductionYield {
  id?: number           // Dexie auto-increment PK
  record_id: string     // UUID — stable identifier for sync
  animal_id: string     // References LocalAnimal.tagId
  product_type: 'milk' | 'eggs' | 'meat'
  quantity: number
  unit: 'liters' | 'count' | 'kg'
  collection_date: string
  notes?: string
  syncStatus: 'pending' | 'synced'
}

export class AgriHerdDatabase extends Dexie {
  animals!: Table<LocalAnimal>
  healthMetrics!: Table<LocalHealthMetric>
  syncQueue!: Table<SyncAction>
  vaccinations!: Table<LocalVaccination>
  production_yields!: Table<LocalProductionYield>

  constructor() {
    super('AgriHerdDB')

    // Version 3 — keep for safe migration (do not remove)
    this.version(3).stores({
      animals: '++id, tagId, species, breed, dob, syncStatus',
      healthMetrics: '++id, animalTagId, temperature, feedIntake, yieldAmount, syncStatus, recordedAt',
      syncQueue: '++id, actionType, timestamp'
    })

    // Version 4 — adds the vaccinations table
    this.version(4).stores({
      animals: '++id, tagId, species, breed, dob, syncStatus',
      healthMetrics: '++id, animalTagId, temperature, feedIntake, yieldAmount, syncStatus, recordedAt',
      syncQueue: '++id, actionType, timestamp',
      vaccinations: '++id, record_id, animal_id, type, status, next_due_date, syncStatus'
    })

    // Version 5 — adds the production_yields table
    this.version(5).stores({
      animals: '++id, tagId, species, breed, dob, syncStatus',
      healthMetrics: '++id, animalTagId, temperature, feedIntake, yieldAmount, syncStatus, recordedAt',
      syncQueue: '++id, actionType, timestamp',
      vaccinations: '++id, record_id, animal_id, type, status, next_due_date, syncStatus',
      production_yields: '++id, record_id, animal_id, product_type, collection_date, syncStatus'
    })
  }
}

export const db = new AgriHerdDatabase()