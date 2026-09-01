import { db } from './db';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Processes the Dexie syncQueue sequentially.
 * Implements a self-healing column fallback to bypass PGRST204 errors.
 */
export async function processSyncQueue() {
    if (typeof window === 'undefined' || !navigator.onLine || !isSupabaseConfigured) return;

    try {
        const pendingQueue = await db.syncQueue.orderBy('timestamp').toArray();

        for (const item of pendingQueue) {
            const insertPayload = { ...item.payload };
            const localId = insertPayload.localId;
            delete insertPayload.localId; // Strip local-only identifiers before pushing
            delete insertPayload.id; // Strip local auto-incremented id if present

            let error: any = null;
            const targetTable = item.actionType === 'REGISTER_ANIMAL' ? 'livestock' : 'health_metrics';

            // Map frontend camelCase to Supabase snake_case schema to avoid missing column errors
            if (item.actionType === 'REGISTER_ANIMAL') {
                if (insertPayload.tagId) {
                    insertPayload.tag_number = insertPayload.tagId;
                    delete insertPayload.tagId;
                }
                if (insertPayload.dob) {
                    insertPayload.date_of_birth = insertPayload.dob;
                    delete insertPayload.dob;
                }
                if (insertPayload.createdAt) {
                    insertPayload.created_at = insertPayload.createdAt;
                    delete insertPayload.createdAt;
                }
                // syncStatus is internal to local DB, safe to delete if Supabase doesn't want it
                delete insertPayload.syncStatus;
            } else if (item.actionType === 'LOG_VITALS') {
                if (insertPayload.animalTagId) {
                    insertPayload.animal_tag_id = insertPayload.animalTagId;
                    delete insertPayload.animalTagId;
                }
                if (insertPayload.feedIntake) {
                    insertPayload.feed_intake = insertPayload.feedIntake;
                    delete insertPayload.feedIntake;
                }
                if (insertPayload.yieldAmount) {
                    insertPayload.yield_amount = insertPayload.yieldAmount;
                    delete insertPayload.yieldAmount;
                }
                if (insertPayload.recordedAt) {
                    insertPayload.recorded_at = insertPayload.recordedAt;
                    delete insertPayload.recordedAt;
                }
                delete insertPayload.syncStatus;
            }

            // The Schema Recovery Loop
            while (true) {
                const result = await supabase.from(targetTable).insert([insertPayload]);
                error = result.error;

                if (!error) {
                    // Insertion successful: Update local store and clear queue item
                    if (item.actionType === 'REGISTER_ANIMAL') {
                        await db.animals.update(localId, { syncStatus: 'synced' });
                    } else if (item.actionType === 'LOG_VITALS') {
                        await db.healthMetrics.update(localId, { syncStatus: 'synced' });
                    }
                    await db.syncQueue.delete(item.id);
                    break;
                }

                // Intercept Supabase PGRST204 errors for missing schema columns
                const missingColMatch = error.message?.match(/Could not find the '([^']+)' column/i);

                if (missingColMatch && missingColMatch[1] && missingColMatch[1] in insertPayload) {
                    const missingCol = missingColMatch[1];
                    console.warn(`Supabase '${targetTable}' table lacks '${missingCol}' column. Retrying...`);
                    delete insertPayload[missingCol]; // Prune un-cached column and loop again
                } else {
                    console.error(`Unresolvable sync error for item ${item.id}:`, error);
                    break; // Abort this item to prevent infinite loops
                }
            }
        }

        // Hydrate local database after mutations are complete
        await hydrateLocalDatabase();
    } catch (err) {
        console.error('Failed to process sync queue:', err);
    }
}

/**
 * Pulls remote records from Supabase to synchronize local IndexedDB state.
 */
export async function hydrateLocalDatabase() {
    if (typeof window === 'undefined' || !navigator.onLine || !isSupabaseConfigured) return;

    try {
        const { data: cloudLivestock, error } = await supabase
            .from('livestock')
            .select('*');

        if (error || !cloudLivestock || cloudLivestock.length === 0) return;

        const localReadyAnimals = cloudLivestock.map((animal: any) => ({
            tagId: animal.tag_number || animal.tag_id || 'UNKNOWN',
            species: animal.species,
            breed: animal.breed || 'Unknown',
            dob: animal.dob || animal.date_of_birth || animal.birth_date || new Date().toISOString(),
            syncStatus: 'synced' as const,
            createdAt: animal.created_at
        }));

        // Perform a read-write transaction to replace synced records safely
        await db.transaction('rw', db.animals, async () => {
            await db.animals.where('syncStatus').equals('synced').delete();
            await db.animals.bulkAdd(localReadyAnimals);
        });
    } catch (err) {
        console.error('Failed to hydrate local database:', err);
    }
}