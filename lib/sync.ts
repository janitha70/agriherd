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
            let targetTable = '';

            // 1. Examine the Queue Item and Route
            if (item.actionType === 'REGISTER_ANIMAL' || item.table === 'livestock') {
                targetTable = 'livestock';
            } else if (item.actionType === 'LOG_VITALS' || item.table === 'health_metrics') {
                targetTable = 'health_metrics';
            } else if (item.actionType === 'LOG_VACCINATION' || item.table === 'vaccinations') {
                targetTable = 'vaccinations';
            } else if (item.actionType === 'LOG_YIELD' || item.table === 'production_yields') {
                targetTable = 'production_yields';
            } else {
                // 5. Fallback for unknown action types
                console.error(`Unknown action type or table encountered for item ${item.id}. Deleting to unblock sync queue.`);
                if (item.id) {
                    await db.syncQueue.delete(item.id);
                }
                continue;
            }

            // Map frontend camelCase to Supabase snake_case schema to avoid missing column errors
            if (targetTable === 'livestock') {
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
            } else if (targetTable === 'health_metrics') {
                // ── Normalise animal identifier ──────────────────────────────
                // Old form sends `animalTagId`, new log-vitals form sends `animal_id`
                const animalRef = insertPayload.animalTagId || insertPayload.animal_id || insertPayload.animal_tag_id || insertPayload.livestock_id;
                if (animalRef) {
                    insertPayload.livestock_id = animalRef;
                }
                delete insertPayload.animalTagId;
                delete insertPayload.animal_tag_id;
                delete insertPayload.animal_id;

                // ── Normalise feed consumption ────────────────────────────────
                // Old form sends `feedIntake`, new form sends `feed_intake_kg`,
                // Supabase column is `feed_consumption`.
                const feedValue = insertPayload.feedIntake ?? insertPayload.feed_intake_kg ?? insertPayload.feed_intake ?? insertPayload.feed_consumption;
                if (feedValue !== undefined) {
                    insertPayload.feed_consumption = feedValue;
                }
                delete insertPayload.feedIntake;
                delete insertPayload.feed_intake_kg;
                delete insertPayload.feed_intake;

                // ── Normalise recorded_at ─────────────────────────────────────
                if (insertPayload.recordedAt) {
                    insertPayload.recorded_at = insertPayload.recordedAt;
                    delete insertPayload.recordedAt;
                }

                // ── Strip fields the cloud schema does not have ──────────────
                // yield and weight are stored locally only until schema is updated
                delete insertPayload.yieldAmount;
                delete insertPayload.yield_amount;
                delete insertPayload.yield_amount_liters;
                delete insertPayload.weightKg;
                delete insertPayload.weight_kg;

                delete insertPayload.syncStatus;
            } else if (targetTable === 'vaccinations') {
                // ── Vaccinations normalisation ────────────────────────────────
                // `record_id` is the stable UUID used as the Supabase conflict key.
                // Strip all Dexie-local fields before pushing to the cloud.
                delete insertPayload.syncStatus;
                // `id` is the Dexie auto-increment PK — already stripped above,
                // but guard explicitly to be safe.
                delete insertPayload.id;

                // ── Resolve animal_id from tagId → Supabase UUID ──────────────
                // Local DB stores the human-readable tag (e.g. "B-2050") in animal_id,
                // but the Supabase vaccinations.animal_id column is typed as UUID.
                // We must look up the livestock row's UUID before pushing.
                const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (insertPayload.animal_id && !UUID_RE.test(insertPayload.animal_id)) {
                    const { data: lsRow, error: lsErr } = await supabase
                        .from('livestock')
                        .select('id')
                        .eq('tag_number', insertPayload.animal_id)
                        .single();

                    if (lsErr || !lsRow?.id) {
                        // Livestock record not yet synced to Supabase — skip this
                        // vaccination item and leave it in the queue to retry later.
                        console.warn(
                            `Vaccination sync skipped: livestock "${insertPayload.animal_id}" not found in Supabase yet. Will retry on next sync.`
                        );
                        continue; // move to the next queue item
                    }
                    insertPayload.animal_id = lsRow.id;
                }
            } else if (targetTable === 'production_yields') {
                // ── Production Yields normalisation ──────────────────────────────
                // `record_id` is the stable UUID used as the Supabase conflict key.
                delete insertPayload.syncStatus;
                delete insertPayload.id;
            }

            // The Schema Recovery Loop
            // vacConflictKey tracks whether `record_id` still exists in the Supabase schema.
            // If the self-healing loop prunes it, we fall back to a plain insert so the
            // upsert's onConflict clause never references a non-existent column.
            let vacConflictKey: string | null = 'record_id';

            while (true) {
                // Route each table to the correct Supabase operation
                let result;
                if (targetTable === 'livestock') {
                    result = await supabase.from('livestock').upsert(insertPayload, { onConflict: 'tag_number' });
                } else if (targetTable === 'health_metrics') {
                    result = await supabase.from('health_metrics').upsert(insertPayload, { onConflict: 'id' });
                } else if (targetTable === 'vaccinations' || targetTable === 'production_yields') {
                    // Both tables use record_id as the stable upsert conflict key
                    if (vacConflictKey) {
                        result = await supabase.from(targetTable).upsert(insertPayload, { onConflict: vacConflictKey });
                    } else {
                        console.warn(`Supabase '${targetTable}' table is missing 'record_id'. Falling back to plain insert.`);
                        result = await supabase.from(targetTable).insert(insertPayload);
                    }
                } else {
                    // Should not reach here — all known tables are handled above
                    result = { error: { message: `Unknown targetTable: ${targetTable}` } } as any;
                }
                error = result.error;

                if (!error) {
                    // Insertion successful: partial-update local store and clear queue item
                    if (targetTable === 'livestock' && localId) {
                        await db.animals.update(localId, { syncStatus: 'synced' });
                    } else if (targetTable === 'health_metrics' && localId) {
                        await db.healthMetrics.update(localId, { syncStatus: 'synced' });
                    } else if (targetTable === 'vaccinations' && localId) {
                        // Partial update — only flip syncStatus; do not overwrite the full record
                        await db.vaccinations.update(localId, { syncStatus: 'synced' });
                    } else if (targetTable === 'production_yields' && localId) {
                        await db.production_yields.update(localId, { syncStatus: 'synced' });
                    }
                    if (item.id) {
                        await db.syncQueue.delete(item.id);
                    }
                    break;
                }

                // Intercept Supabase PGRST204 / 42703 errors for missing schema columns
                const missingColMatch =
                    error.message?.match(/Could not find the '([^']+)' column/i) ||
                    error.message?.match(/column "([^"]+)" does not exist/i);

                if (missingColMatch && missingColMatch[1] && missingColMatch[1] in insertPayload) {
                    const missingCol = missingColMatch[1];
                    console.warn(`Supabase '${targetTable}' table lacks '${missingCol}' column. Retrying...`);
                    delete insertPayload[missingCol]; // Prune the unknown column and retry

                    // If the pruned column was the conflict key, drop it from onConflict too
                    // so the next iteration does not reference a non-existent column.
                    if (missingCol === vacConflictKey) {
                        vacConflictKey = null;
                    }
                } else {
                    console.error(`Unresolvable sync error for item ${item.id}:`, error);
                    if (item.id) {
                        await db.syncQueue.delete(item.id);
                    }
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
            // Explicitly carry photo_data from the cloud record.
            // Omitting this field is what caused down-sync to silently erase photos.
            photo_data: animal.photo_data ?? undefined,
            syncStatus: 'synced' as const,
            createdAt: animal.created_at
        }));

        // Use put() per record rather than delete-then-bulkAdd.
        // The old pattern wiped ALL synced records first, meaning any fields not
        // returned by the cloud (or not mapped above) were permanently lost.
        // put() does a safe upsert keyed on Dexie's primary key (tagId index).
        await db.transaction('rw', db.animals, async () => {
            for (const animal of localReadyAnimals) {
                const existing = await db.animals
                    .where('tagId')
                    .equals(animal.tagId)
                    .first();

                if (existing?.id) {
                    // Patch only cloud-owned fields; leave any local-only fields intact
                    await db.animals.update(existing.id, {
                        species: animal.species,
                        breed: animal.breed,
                        dob: animal.dob,
                        photo_data: animal.photo_data,
                        syncStatus: 'synced',
                        createdAt: animal.createdAt,
                    });
                } else {
                    // New record from cloud that doesn't exist locally yet
                    await db.animals.add(animal);
                }
            }
        });

        // ── Pull vaccinations from Supabase ──────────────────────────────────
        // Runs independently so a livestock fetch error does not block this.
        const { data: cloudVaccinations, error: vacError } = await supabase
            .from('vaccinations')
            .select('*');

        if (!vacError && cloudVaccinations && cloudVaccinations.length > 0) {
            await db.transaction('rw', db.vaccinations, async () => {
                for (const v of cloudVaccinations) {
                    // Look up by the stable UUID that survives across devices
                    const existing = await db.vaccinations
                        .where('record_id')
                        .equals(v.record_id)
                        .first();

                    if (existing?.id) {
                        // Non-destructive patch — only update cloud-owned fields
                        await db.vaccinations.update(existing.id, {
                            animal_id: v.animal_id,
                            type: v.type,
                            name: v.name,
                            date_administered: v.date_administered,
                            next_due_date: v.next_due_date,
                            status: v.status,
                            notes: v.notes ?? undefined,
                            syncStatus: 'synced',
                        });
                    } else {
                        // New record from another device — add it locally
                        await db.vaccinations.add({
                            record_id: v.record_id,
                            animal_id: v.animal_id,
                            type: v.type,
                            name: v.name,
                            date_administered: v.date_administered,
                            next_due_date: v.next_due_date,
                            status: v.status,
                            notes: v.notes ?? undefined,
                            syncStatus: 'synced',
                        });
                    }
                }
            });
        }

        // ── Pull production_yields from Supabase ─────────────────────────────
        // Standalone block — a vaccinations error does not block this.
        try {
            const { data: cloudYields, error: yieldError } = await supabase
                .from('production_yields')
                .select('*');

            if (!yieldError && cloudYields && cloudYields.length > 0) {
                await db.transaction('rw', db.production_yields, async () => {
                    for (const y of cloudYields) {
                        const existing = await db.production_yields
                            .where('record_id')
                            .equals(y.record_id)
                            .first();

                        if (existing?.id) {
                            // Non-destructive patch — only update cloud-owned fields
                            await db.production_yields.update(existing.id, {
                                animal_id: y.animal_id,
                                product_type: y.product_type,
                                quantity: y.quantity,
                                unit: y.unit,
                                collection_date: y.collection_date,
                                notes: y.notes ?? undefined,
                                syncStatus: 'synced',
                            });
                        } else {
                            // New record from another device — add it locally
                            await db.production_yields.add({
                                record_id: y.record_id,
                                animal_id: y.animal_id,
                                product_type: y.product_type,
                                quantity: y.quantity,
                                unit: y.unit,
                                collection_date: y.collection_date,
                                notes: y.notes ?? undefined,
                                syncStatus: 'synced',
                            });
                        }
                    }
                });
            }
        } catch (yieldErr) {
            console.error('Failed to hydrate production_yields:', yieldErr);
        }
    } catch (err) {
        console.error('Failed to hydrate local database:', err);
    }
}