"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const formSchema = z.object({
  animal_id: z.string().min(1, {
    message: "Please select an animal.",
  }),
  temperature: z.preprocess(
    (val) => (val !== "" && val !== null && val !== undefined ? Number(val) : undefined),
    z.number().optional()
  ),
  feed_intake_kg: z.preprocess(
    (val) => (val !== "" && val !== null && val !== undefined ? Number(val) : undefined),
    z.number().optional()
  ),
  yield_amount_liters: z.preprocess(
    (val) => (val !== "" && val !== null && val !== undefined ? Number(val) : undefined),
    z.number().optional()
  ),
  weight_kg: z.preprocess(
    (val) => (val !== "" && val !== null && val !== undefined ? Number(val) : undefined),
    z.number().optional()
  ),
})

type FormValues = z.infer<typeof formSchema>

export default function LogVitalsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch all animals for the Select dropdown
  const animals = useLiveQuery(() => db.animals.toArray())

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      animal_id: "",
      temperature: undefined,
      feed_intake_kg: undefined,
      yield_amount_liters: undefined,
      weight_kg: undefined,
    },
  })

  const currentTemp = form.watch("temperature");

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const metricId = crypto.randomUUID()
      const now = new Date().toISOString()

      const payload = {
        id: metricId,
        livestock_id: values.animal_id,
        temperature: values.temperature || 0,
        feed_intake_kg: values.feed_intake_kg || 0,
        yield_amount_liters: values.yield_amount_liters || 0,
        weight_kg: values.weight_kg || 0,
        recorded_at: now,
      }

      // Add to local Dexie database for offline-first architecture
      await db.healthMetrics.add({
        livestock_id: values.animal_id, // Explicitly pass livestock_id for backend compatibility
        animalTagId: values.animal_id,
        temperature: values.temperature || 0,
        feedIntake: values.feed_intake_kg || 0,
        yieldAmount: values.yield_amount_liters || 0,
        weight_kg: values.weight_kg || 0,
        weightKg: values.weight_kg || 0,
        observations: "",
        syncStatus: 'pending',
        recordedAt: now,
      })

      // Queue the background sync operation
      await db.syncQueue.add({
        id: metricId,
        actionType: 'LOG_VITALS',
        table: 'health_metrics',
        payload: payload,
        timestamp: now,
      })

      if (navigator.onLine) {
        window.alert("Vitals saved and syncing to cloud.");
      } else {
        window.alert("Vitals logged locally. Will sync automatically when connection is restored.");
      }

      form.reset()
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to log vitals locally:", error)
      window.alert("Failed to log vitals locally. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("logDailyVitals")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="animal_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("animalTagEntity")}</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          {animals === undefined ? (
                            <div className="flex items-center text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Loading animals...
                            </div>
                          ) : (
                            <SelectValue placeholder="Select an animal" />
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {animals?.map((animal) => (
                          <SelectItem key={animal.id} value={animal.tagId}>
                            {animal.tagId} ({animal.species})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("tempOptional")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g. 38.5" 
                          {...field} 
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      {/* Proactive Fever Alert */}
                      {currentTemp && Number(currentTemp) > 39.5 && (
                        <p className="text-sm font-medium text-destructive mt-2">
                          {t("highFeverWarning")}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("weightOptional")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g. 450.0" 
                          {...field} 
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="feed_intake_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("feedOptional")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g. 24.5" 
                          {...field} 
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yield_amount_liters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("yieldOptional")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g. 15.2" 
                          {...field} 
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting || animals === undefined}>
                  {isSubmitting ? t("saving") : t("saveVitals")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
