"use client"

import { useState } from "react"
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

const formSchema = z.object({
  tag_number: z.string().min(2, {
    message: "Tag number must be at least 2 characters.",
  }),
  species: z.string().min(1, {
    message: "Species is required.",
  }),
  breed: z.string().optional(),
  dob: z.string().optional(),
})

export default function AddAnimalPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [base64Image, setBase64Image] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)

  // Use a raw input ref to guarantee access to the native files API
  // UI library wrappers (e.g. shadcn Input) can silently swallow the files list
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null)
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      // Sanity check: ensure we got a valid base64 data URL
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      tag_number: "",
      species: "",
      breed: "",
      dob: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Mandatory photo validation guard
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

      window.alert("Animal saved locally. Will sync when online.")

      form.reset()
      setBase64Image(null)
      setPhotoError(null)
      router.push("/dashboard/livestock")
    } catch (error) {
      console.error("Failed to add animal locally:", error)
      window.alert("Failed to save animal locally. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Register New Animal</CardTitle>
          <CardDescription>
            Enter the details of the new livestock. This will be saved offline and synced automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="tag_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tag Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. A-1029" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Species</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Bovine, Porcine" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="breed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breed (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Angus" {...field} />
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
                    <FormLabel>Date of Birth (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2 pt-2">
                <FormLabel>
                  Animal Photo <span className="text-destructive">*</span>
                </FormLabel>
                {/* Raw <input> — do NOT replace with the shadcn Input wrapper.
                    The UI wrapper component intercepts onChange and drops the
                    native files list, causing photo_data to always be null. */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                {photoError && (
                  <p className="text-sm font-medium text-destructive">{photoError}</p>
                )}
                {base64Image && (
                  <div className="mt-2 h-36 w-full overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={base64Image} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Animal"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
