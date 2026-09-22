"use client"

import { useState, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { z } from "zod"
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
import { ArrowLeft, Upload, CheckCircle2, Beef, Bird, Rabbit, Squirrel } from "lucide-react"

const SPECIES_OPTIONS = [
  { value: "Bovine",   label: "Cattle",  emoji: "🐄", icon: Beef,     color: "border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-700 text-orange-700 dark:text-orange-400" },
  { value: "Porcine",  label: "Swine",   emoji: "🐷", icon: Squirrel, color: "border-pink-300 bg-pink-50 dark:bg-pink-900/20 dark:border-pink-700 text-pink-700 dark:text-pink-400" },
  { value: "Poultry",  label: "Poultry", emoji: "🐔", icon: Bird,     color: "border-sky-300 bg-sky-50 dark:bg-sky-900/20 dark:border-sky-700 text-sky-700 dark:text-sky-400" },
  { value: "Ovine",    label: "Sheep",   emoji: "🐑", icon: Rabbit,   color: "border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700 text-purple-700 dark:text-purple-400" },
]

const formSchema = z.object({
  tag_number: z.string().min(2, { message: "Tag number must be at least 2 characters." }),
  species: z.string().min(1, { message: "Please select a species." }),
  breed: z.string().optional(),
  dob: z.string().optional(),
})

// Minimal toast state
type ToastType = "success" | "error" | null
interface ToastMsg { type: ToastType; message: string }

export default function AddAnimalPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [base64Image, setBase64Image]     = useState<string | null>(null)
  const [photoError, setPhotoError]       = useState<string | null>(null)
  const [isDragging, setIsDragging]       = useState(false)
  const [toast, setToast]                 = useState<ToastMsg>({ type: null, message: "" })

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message })
    setTimeout(() => setToast({ type: null, message: "" }), 3500)
  }

  function processFile(file: File) {
    setPhotoError(null)
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      if (result && result.startsWith('data:image')) {
        setBase64Image(result)
      } else {
        setPhotoError('Failed to read image. Please try again.')
        setBase64Image(null)
      }
    }
    reader.onerror = () => {
      setPhotoError('Error reading file. Please choose a different image.')
      setBase64Image(null)
    }
    reader.readAsDataURL(file)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) processFile(file)
    else setPhotoError("Please drop a valid image file.")
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: { tag_number: "", species: "", breed: "", dob: "" },
  })

  const selectedSpecies = form.watch("species")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!base64Image) {
      setPhotoError('A photo is required. Please select an image before saving.')
      return
    }
    setPhotoError(null)
    setIsSubmitting(true)
    try {
      const animalId = crypto.randomUUID()
      const now = new Date().toISOString()
      const payload = {
        id: animalId,
        tag_number: values.tag_number,
        species: values.species,
        breed: values.breed || "",
        dob: values.dob || now,
        photo_data: base64Image || undefined,
      }

      await db.animals.add({
        tagId: values.tag_number,
        species: values.species,
        breed: values.breed || "",
        dob: values.dob || now,
        photo_data: base64Image || undefined,
        syncStatus: 'pending',
        createdAt: now
      })

      await db.syncQueue.add({
        actionType: 'REGISTER_ANIMAL',
        payload: payload,
        timestamp: now
      })

      showToast("success", "Animal saved locally — will sync when online.")
      form.reset()
      setBase64Image(null)
      setTimeout(() => router.push("/dashboard/livestock"), 1200)
    } catch (error) {
      console.error("Failed to add animal locally:", error)
      showToast("error", "Failed to save animal locally. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-slide-up">

      {/* ── Toast notification ── */}
      {toast.type && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl animate-slide-in-right font-medium text-sm ${
          toast.type === "success"
            ? "bg-paddy text-white"
            : "bg-red-600 text-white"
        }`}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          {toast.message}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight gradient-text-paddy dark:text-emerald-300">
            Register New Animal
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Saved offline instantly — syncs automatically when connected.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── LEFT: Form ── */}
        <div className="lg:col-span-3 space-y-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* Tag Number */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  Identification
                </h3>
                <FormField
                  control={form.control}
                  name="tag_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground">Tag Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. A-1029"
                          className="rounded-xl border-border bg-background/60 focus:ring-2 focus:ring-paddy/30 dark:focus:ring-emerald-500/30 font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Species Visual Picker */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  Species
                </h3>
                <FormField
                  control={form.control}
                  name="species"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-2 gap-3">
                        {SPECIES_OPTIONS.map(opt => (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() => field.onChange(opt.value)}
                            className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 font-semibold text-sm hover:-translate-y-0.5 ${
                              field.value === opt.value
                                ? `${opt.color} border-2 shadow-md scale-[1.02]`
                                : "border-border bg-muted/30 text-muted-foreground hover:bg-accent"
                            }`}
                          >
                            <span className="text-2xl">{opt.emoji}</span>
                            <span>{opt.label}</span>
                            {field.value === opt.value && (
                              <span className="absolute top-2 right-2">
                                <CheckCircle2 className="w-4 h-4" />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Breed & DOB */}
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Additional Details
                </h3>
                <FormField
                  control={form.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground">
                        Breed <span className="text-muted-foreground font-normal">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Angus, Jersey"
                          className="rounded-xl border-border bg-background/60 focus:ring-2 focus:ring-paddy/30 dark:focus:ring-emerald-500/30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground">
                        Date of Birth <span className="text-muted-foreground font-normal">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="rounded-xl border-border bg-background/60 focus:ring-2 focus:ring-paddy/30 dark:focus:ring-emerald-500/30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl border-border hover:bg-accent"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-shimmer flex-1 rounded-xl bg-gradient-to-r from-paddy to-paddy-light text-white font-bold shadow-lg shadow-paddy/20 hover:shadow-paddy/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Saving...
                    </span>
                  ) : "Save Animal"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* ── RIGHT: Photo Upload + Preview ── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card rounded-2xl p-5 sticky top-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Animal Photo <span className="text-red-500">*</span>
            </h3>

            {/* Drag & Drop Zone */}
            {/* Raw <input> — do NOT replace with the shadcn Input wrapper.
                The UI wrapper component intercepts onChange and drops the
                native files list, causing photo_data to always be null. */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer ${
                isDragging
                  ? "border-paddy bg-paddy/5 dark:border-emerald-500 dark:bg-emerald-900/10 scale-[1.01]"
                  : base64Image
                      ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10"
                      : "border-border hover:border-paddy/50 hover:bg-muted/30 dark:hover:border-emerald-600/50"
              }`}
            >
              <label className="cursor-pointer w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="sr-only"
                />
                {base64Image ? (
                  <div className="space-y-3">
                    <div className="h-48 w-full overflow-hidden rounded-xl border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={base64Image} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                    <p className="text-xs text-muted-foreground">Click to change photo</p>
                  </div>
                ) : (
                  <div className="py-4 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-paddy/10 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-paddy dark:text-emerald-400" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {isDragging ? "Drop image here" : "Upload Photo"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Drag & drop or <span className="text-paddy dark:text-emerald-400 font-semibold">browse</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">PNG, JPG, WEBP supported</p>
                  </div>
                )}
              </label>
            </div>

            {photoError && (
              <p className="text-xs text-red-500 mt-2 font-medium">{photoError}</p>
            )}

            {/* Live Preview Card */}
            {(selectedSpecies || base64Image) && (
              <div className="mt-5 p-4 rounded-2xl border border-border bg-muted/30 space-y-2 animate-fade-slide-up">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preview</p>
                <div className="flex items-center gap-3">
                  {base64Image ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-border flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={base64Image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                      {SPECIES_OPTIONS.find(s => s.value === selectedSpecies)?.emoji || "🐄"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-sm text-foreground truncate">
                      {form.watch("tag_number") || "Tag #"}
                    </p>
                    <p className="text-xs text-muted-foreground">{selectedSpecies || "—"} {form.watch("breed") ? `· ${form.watch("breed")}` : ""}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
