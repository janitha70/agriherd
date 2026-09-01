import Dexie, { type Table } from 'dexie'

export interface LocalAnimal {
  id?: number
  tagId: string
  species: string
  breed: string
  dob: string
  photoStr?: string
  syncStatus: 'pending' | 'synced'
  createdAt: string
}

export interface LocalHealthMetric {
  id?: number
  animalTagId: string
  temperature: number
  feedIntake: number
  yieldAmount: number
  observations: string
  syncStatus: 'pending' | 'synced'
  recordedAt: string
}

export interface SyncAction {
  id?: number
  actionType: 'REGISTER_ANIMAL' | 'LOG_VITALS'
  payload: any
  timestamp: string
}

export class AgriHerdDatabase extends Dexie {
  animals!: Table<LocalAnimal>
  healthMetrics!: Table<LocalHealthMetric>
  syncQueue!: Table<SyncAction>

  constructor() {
    super('AgriHerdDB')

    this.version(3).stores({
      animals: '++id, tagId, species, breed, dob, syncStatus',
      healthMetrics: '++id, animalTagId, temperature, feedIntake, yieldAmount, syncStatus, recordedAt',
      syncQueue: '++id, actionType, timestamp'
    })
  }
}

export const db = new AgriHerdDatabase()