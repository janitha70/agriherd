import { db } from './db'
import { supabase } from '@/lib/supabase'

export async function processSyncQueue() {
    // 1. Abort if the device is currently offline
    if (!navigator.onLine) {
        console.log('Device offline. Sync paused.')
        return
    }

    // 2. Grab everything waiting in the local Dexie queue
    const pendingActions = await db.syncQueue.toArray()

    if (pendingActions.length === 0) {
        return
    }

    console.log(`Attempting to sync ${pendingActions.length} pending actions...`)

    // 3. Process the queue sequentially
    for (const action of pendingActions) {
        try {
            if (action.actionType === 'REGISTER_ANIMAL') {
                const insertPayload: Record<string, any> = {
                    tag_number: action.payload.tagId, // Exclusively using tag_number to match Supabase
                    species: action.payload.species,
                    dob: action.payload.dob,
                }

                if (action.payload.breed) {
                    insertPayload.breed = action.payload.breed
                }

                let error: any = null

                // Retry loop: drop fields that do not exist in the remote Supabase schema cache
                while (true) {
                    const result = await supabase
                        .from('livestock')
                        .insert([insertPayload])

                    error = result.error
                    if (!error) break

                    // Match errors like: "Could not find the 'dob' column of 'livestock' in the schema cache"
                    const missingColMatch = error.message?.match(/Could not find the '([^']+)' column/i)
                    if (missingColMatch && missingColMatch[1] && missingColMatch[1] in insertPayload) {
                        const missingCol = missingColMatch[1]
                        console.warn(`Supabase 'livestock' table lacks '${missingCol}' column. Retrying insert without it...`)
                        delete insertPayload[missingCol]
                    } else {
                        break
                    }
                }

                if (error) {
                    throw new Error(error.message || error.details || 'Failed to insert livestock into Supabase')
                }

                await db.animals.update(action.payload.localId, { syncStatus: 'synced' })
            }

            else if (action.actionType === 'LOG_VITALS') {
                // Look up the UUID of the livestock using Tag Number or Tag ID
                let animalData: { id: string } | null = null
                let lookupError: any = null

                const tryTagNum = await supabase
                    .from('livestock')
                    .select('id')
                    .eq('tag_number', action.payload.animalTagId)
                    .maybeSingle()

                if (!tryTagNum.error && tryTagNum.data) {
                    animalData = tryTagNum.data
                } else {
                    const tryTagId = await supabase
                        .from('livestock')
                        .select('id')
                        .eq('tag_id', action.payload.animalTagId)
                        .maybeSingle()

                    if (!tryTagId.error && tryTagId.data) {
                        animalData = tryTagId.data
                    } else {
                        lookupError = tryTagNum.error || tryTagId.error
                    }
                }

                if (!animalData) {
                    const detail = lookupError?.message || `Could not find animal with Tag ID "${action.payload.animalTagId}" in the cloud.`
                    throw new Error(detail)
                }

                const livestockUuid = animalData.id

                // Now insert the health metric using the true UUID
                const { error: insertError } = await supabase
                    .from('health_metrics')
                    .insert([
                        {
                            livestock_id: livestockUuid,
                            temperature: action.payload.temperature,
                            feed_consumption: action.payload.feedIntake,
                            recorded_at: action.payload.recordedAt
                        }
                    ])

                if (insertError) {
                    throw new Error(insertError.message || insertError.details || 'Failed to insert health metric into Supabase')
                }

                await db.healthMetrics.update(action.payload.localId, { syncStatus: 'synced' })
            }

            // 4. Remove the action from the queue once successfully processed
            if (action.id) {
                await db.syncQueue.delete(action.id)
            }

        } catch (error: any) {
            const message = error instanceof Error ? error.message : (error?.message || error?.details || JSON.stringify(error))
            console.error(`Failed to sync action ${action.id}: ${message}`)
            // Stop the loop if an error occurs. The item remains in the queue for the next attempt.
            break
        }
    }
}

export async function hydrateLocalDatabase() {
    // 1. Abort if offline (we can't pull from the cloud without internet)
    if (!navigator.onLine) return

    console.log('Hydrating local database from Supabase...')

    try {
        // 2. Fetch all livestock from the cloud
        const { data: cloudLivestock, error } = await supabase
            .from('livestock')
            .select('*')

        if (error) {
            throw new Error(error.message || error.details || 'Failed to fetch livestock from Supabase')
        }

        if (cloudLivestock && cloudLivestock.length > 0) {
            // 3. Format the cloud data to match our local Dexie schema
            const localReadyAnimals = cloudLivestock.map(animal => ({
                tagId: animal.tag_number || animal.tag_id || 'UNKNOWN',
                species: animal.species,
                breed: animal.breed || 'Unknown',
                dob: animal.dob || animal.date_of_birth || animal.birth_date || new Date().toISOString(),
                syncStatus: 'synced' as const, // Already in the cloud!
                createdAt: animal.created_at
            }))

            // 4. Clear old synced animals and replace with cloud data
            await db.transaction('rw', db.animals, async () => {
                await db.animals.where('syncStatus').equals('synced').delete()
                await db.animals.bulkAdd(localReadyAnimals)
            })

            console.log('Local database successfully hydrated!')
        }
    } catch (error: any) {
        const message = error instanceof Error ? error.message : (error?.message || error?.details || JSON.stringify(error))
        console.error('Failed to hydrate local database:', message)
    }
}