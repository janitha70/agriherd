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
            } else if (item.actionType === 'ADD_EXPENSE' || item.actionType === 'UPDATE_EXPENSE' || item.actionType === 'DELETE_EXPENSE' || item.table === 'expenses') {
                targetTable = 'expenses';
            } else if (item.actionType === 'ADD_INCOME' || item.actionType === 'UPDATE_INCOME' || item.actionType === 'DELETE_INCOME' || item.table === 'farm_income') {
                targetTable = 'farm_income';
            } else if (item.actionType === 'SET_BUDGET' || item.actionType === 'UPDATE_BUDGET' || item.table === 'budgets') {
                targetTable = 'budgets';
            } else if (item.actionType === 'ADD_SUPPLIER' || item.actionType === 'UPDATE_SUPPLIER' || item.actionType === 'DELETE_SUPPLIER' || item.table === 'suppliers') {
                targetTable = 'suppliers';
            } else if (item.actionType === 'ADD_RECURRING_EXPENSE' || item.actionType === 'UPDATE_RECURRING_EXPENSE' || item.actionType === 'DELETE_RECURRING_EXPENSE' || item.table === 'recurring_expenses') {
                targetTable = 'recurring_expenses';
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
            } else if (targetTable === 'production_yields' || targetTable === 'expenses' || targetTable === 'farm_income' || targetTable === 'budgets' || targetTable === 'suppliers' || targetTable === 'recurring_expenses') {
                // ── Common normalisation for record_id based tables ──────────────────────────────
                // `record_id` is the stable UUID used as the Supabase conflict key.
                delete insertPayload.syncStatus;
                delete insertPayload.id;
                delete insertPayload.createdAt;
                delete insertPayload.updatedAt;
            }

            // The Schema Recovery Loop
            // vacConflictKey tracks whether `record_id` still exists in the Supabase schema.
            // If the self-healing loop prunes it, we fall back to a plain insert so the
            // upsert's onConflict clause never references a non-existent column.
            let vacConflictKey: string | null = 'record_id';

            while (true) {
                // Route each table to the correct Supabase operation
                let result;
                if (item.actionType && item.actionType.startsWith('DELETE_')) {
                    const deleteId = insertPayload.record_id || insertPayload.id;
                    if (!deleteId) {
                        result = { error: { message: `Missing record_id for deletion in ${targetTable}` } } as any;
                    } else {
                        result = await supabase.from(targetTable).delete().eq('id', deleteId);
                    }
                } else if (targetTable === 'livestock') {
                    result = await supabase.from('livestock').upsert(insertPayload, { onConflict: 'tag_number' });
                } else if (targetTable === 'health_metrics') {
                    result = await supabase.from('health_metrics').upsert(insertPayload, { onConflict: 'id' });
                } else if (targetTable === 'vaccinations' || targetTable === 'production_yields' || targetTable === 'expenses' || targetTable === 'farm_income' || targetTable === 'budgets' || targetTable === 'suppliers' || targetTable === 'recurring_expenses') {
                    // These tables use record_id (or similar) as the stable upsert conflict key
                    // For expenses tables, we use id instead of record_id on Supabase (since we map record_id to id)
                    // Let's ensure id is mapped correctly if it's the uuid
                    if (targetTable === 'expenses' || targetTable === 'farm_income' || targetTable === 'budgets' || targetTable === 'suppliers' || targetTable === 'recurring_expenses') {
                        if (insertPayload.record_id) {
                            insertPayload.id = insertPayload.record_id;
                            delete insertPayload.record_id;
                        }
                        result = await supabase.from(targetTable).upsert(insertPayload, { onConflict: 'id' });
                    } else if (vacConflictKey) {
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
                    if (!item.actionType || !item.actionType.startsWith('DELETE_')) {
                        if (targetTable === 'livestock' && localId) {
                            await db.animals.update(localId, { syncStatus: 'synced' });
                        } else if (targetTable === 'health_metrics' && localId) {
                            await db.healthMetrics.update(localId, { syncStatus: 'synced' });
                        } else if (targetTable === 'vaccinations' && localId) {
                            // Partial update — only flip syncStatus; do not overwrite the full record
                            await db.vaccinations.update(localId, { syncStatus: 'synced' });
                        } else if (targetTable === 'production_yields' && localId) {
                            await db.production_yields.update(localId, { syncStatus: 'synced' });
                        } else if (targetTable === 'expenses' && localId) {
                            await db.expenses.update(localId, { syncStatus: 'synced' });
                        } else if (targetTable === 'farm_income' && localId) {
                            await db.farmIncome.update(localId, { syncStatus: 'synced' });
                        } else if (targetTable === 'budgets' && localId) {
                            await db.budgets.update(localId, { syncStatus: 'synced' });
                        } else if (targetTable === 'suppliers' && localId) {
                            await db.suppliers.update(localId, { syncStatus: 'synced' });
                        } else if (targetTable === 'recurring_expenses' && localId) {
                            await db.recurringExpenses.update(localId, { syncStatus: 'synced' });
                        }
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
            flock_size: animal.flock_size ?? undefined,
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
                        flock_size: animal.flock_size,
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

        // ── Pull expenses from Supabase ─────────────────────────────
        try {
            const { data: cloudExpenses, error: expensesError } = await supabase.from('expenses').select('*');
            if (!expensesError && cloudExpenses && cloudExpenses.length > 0) {
                await db.transaction('rw', db.expenses, async () => {
                    for (const e of cloudExpenses) {
                        const existing = await db.expenses.where('record_id').equals(e.id).first();
                        const payload = {
                            record_id: e.id,
                            category_id: e.category_id,
                            title: e.title,
                            amount: e.amount,
                            expense_date: e.expense_date,
                            payment_method: e.payment_method,
                            notes: e.notes ?? undefined,
                            animal_tag_id: e.animal_tag_id ?? undefined,
                            receipt_url: e.receipt_url ?? undefined,
                            receipt_data: e.receipt_data ?? undefined,
                            supplier_id: e.supplier_id ?? undefined,
                            invoice_number: e.invoice_number ?? undefined,
                            payment_status: e.payment_status ?? undefined,
                            paid_amount: e.paid_amount ?? undefined,
                            is_recurring: e.is_recurring ?? false,
                            recurrence_interval: e.recurrence_interval ?? undefined,
                            syncStatus: 'synced' as const,
                            createdAt: e.created_at,
                            updatedAt: e.updated_at
                        };
                        if (existing?.id) {
                            await db.expenses.update(existing.id, payload);
                        } else {
                            await db.expenses.add(payload);
                        }
                    }
                });
            }
        } catch (err) {
            console.error('Failed to hydrate expenses:', err);
        }
        
        // ── Pull expense categories from Supabase ─────────────────────────────
        try {
            const { data: cloudCategories, error: categoriesError } = await supabase.from('expense_categories').select('*');
            if (!categoriesError && cloudCategories && cloudCategories.length > 0) {
                await db.transaction('rw', db.expenseCategories, async () => {
                    for (const c of cloudCategories) {
                        const existing = await db.expenseCategories.where('id').equals(c.id).first();
                        const payload = {
                            id: c.id,
                            name: c.name,
                            icon: c.icon ?? undefined,
                            color: c.color ?? undefined,
                            syncStatus: 'synced' as const
                        };
                        if (existing?.id) {
                            await db.expenseCategories.update(existing.id, payload);
                        } else {
                            await db.expenseCategories.add(payload);
                        }
                    }
                });
            }
        } catch (err) {
            console.error('Failed to hydrate expense categories:', err);
        }

        // ── Pull farm income from Supabase ─────────────────────────────
        try {
            const { data: cloudIncome, error: incomeError } = await supabase.from('farm_income').select('*');
            if (!incomeError && cloudIncome && cloudIncome.length > 0) {
                await db.transaction('rw', db.farmIncome, async () => {
                    for (const i of cloudIncome) {
                        const existing = await db.farmIncome.where('record_id').equals(i.id).first();
                        const payload = {
                            record_id: i.id,
                            source: i.source,
                            amount: i.amount,
                            income_date: i.income_date,
                            notes: i.notes ?? undefined,
                            syncStatus: 'synced' as const,
                            createdAt: i.created_at
                        };
                        if (existing?.id) {
                            await db.farmIncome.update(existing.id, payload);
                        } else {
                            await db.farmIncome.add(payload);
                        }
                    }
                });
            }
        } catch (err) {
            console.error('Failed to hydrate farm income:', err);
        }

        // ── Pull suppliers from Supabase ─────────────────────────────
        try {
            const { data: cloudSuppliers, error: suppliersError } = await supabase.from('suppliers').select('*');
            if (!suppliersError && cloudSuppliers && cloudSuppliers.length > 0) {
                await db.transaction('rw', db.suppliers, async () => {
                    for (const s of cloudSuppliers) {
                        const existing = await db.suppliers.where('record_id').equals(s.id).first();
                        const payload = {
                            record_id: s.id,
                            name: s.name,
                            phone: s.phone ?? undefined,
                            address: s.address ?? undefined,
                            notes: s.notes ?? undefined,
                            syncStatus: 'synced' as const,
                            createdAt: s.created_at
                        };
                        if (existing?.id) {
                            await db.suppliers.update(existing.id, payload);
                        } else {
                            await db.suppliers.add(payload);
                        }
                    }
                });
            }
        } catch (err) {
            console.error('Failed to hydrate suppliers:', err);
        }

        // ── Pull recurring expenses from Supabase ─────────────────────────────
        try {
            const { data: cloudRecurring, error: recurringError } = await supabase.from('recurring_expenses').select('*');
            if (!recurringError && cloudRecurring && cloudRecurring.length > 0) {
                await db.transaction('rw', db.recurringExpenses, async () => {
                    for (const r of cloudRecurring) {
                        const existing = await db.recurringExpenses.where('record_id').equals(r.id).first();
                        const payload = {
                            record_id: r.id,
                            title: r.title,
                            category_id: r.category_id,
                            amount: r.amount,
                            recurrence_interval: r.frequency ?? r.recurrence_interval ?? 'monthly',
                            start_date: r.start_date,
                            next_due_date: r.next_due_date,
                            is_active: r.is_active ?? true,
                            notes: r.notes ?? undefined,
                            syncStatus: 'synced' as const,
                            createdAt: r.created_at
                        };
                        if (existing?.id) {
                            await db.recurringExpenses.update(existing.id, payload);
                        } else {
                            await db.recurringExpenses.add(payload);
                        }
                    }
                });
            }
        } catch (err) {
            console.error('Failed to hydrate recurring expenses:', err);
        }

    } catch (err) {
        console.error('Failed to hydrate local database:', err);
    }
}