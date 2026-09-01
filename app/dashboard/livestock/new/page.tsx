"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UploadCloud, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { db } from "@/lib/db"
import { compressImageLocally } from "@/lib/imageUtils"

export default function RegisterAnimal() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        tagId: "",
        species: "",
        breed: "",
        dob: "",
    })
    const [photoBase64, setPhotoBase64] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCompressing, setIsCompressing] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Update state when user types
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    // Handle photo selection and compression
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsCompressing(true)
        try {
            // Compress file strictly to JPG format under 1MB before storing
            const safeBase64Photo = await compressImageLocally(file, 1)
            setPhotoBase64(safeBase64Photo)
        } catch (error) {
            console.error("Failed to compress image:", error)
            alert("Error processing the photo. Please try a different image.")
        } finally {
            setIsCompressing(false)
        }
    }

    // Handle saving the data locally
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // 1. Prepare the data object
            const newAnimal = {
                tagId: formData.tagId,
                species: formData.species,
                breed: formData.breed,
                dob: formData.dob,
                photoStr: photoBase64 || undefined,
                syncStatus: 'pending' as const,
                createdAt: new Date().toISOString(),
            }

            // 2. Save directly to the local IndexedDB using Dexie
            const localId = await db.animals.add(newAnimal)

            // 3. Add a record to the Sync Queue for when internet is restored
            await db.syncQueue.add({
                actionType: 'REGISTER_ANIMAL',
                payload: { ...newAnimal, localId },
                timestamp: new Date().toISOString()
            })

            // 4. Handle redirect or offline confirmation
            if (!navigator.onLine) {
                alert("Animal successfully saved to local queue! It will sync automatically when back online.")
                setFormData({
                    tagId: "",
                    species: "",
                    breed: "",
                    dob: "",
                })
                setPhotoBase64(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                }
            } else {
                router.push("/dashboard/livestock")
            }
        } catch (error) {
            console.error("Failed to save animal locally:", error)
            alert("Error saving data. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Register Animal</h1>
                <p className="text-gray-500 mt-1">Enter details to add a new entity to the active herd.</p>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl">Identification & Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="tagId">Tag ID</Label>
                            <Input
                                id="tagId"
                                placeholder="e.g., TX-8482-R"
                                value={formData.tagId}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="species">Species</Label>
                            <select
                                id="species"
                                value={formData.species}
                                onChange={handleChange}
                                required
                                className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="" disabled>Select Species</option>
                                <option value="Bovine">Bovine</option>
                                <option value="Porcine">Porcine</option>
                                <option value="Poultry">Poultry</option>
                                <option value="Ovine">Ovine</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="breed">Breed</Label>
                            <Input
                                id="breed"
                                placeholder="e.g., Angus"
                                value={formData.breed}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input
                                id="dob"
                                type="date"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pt-4">
                        <Label>Animal Photo</Label>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${photoBase64 ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:bg-gray-50'}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {isCompressing ? (
                                <p className="text-sm font-medium text-emerald-700 animate-pulse">Compressing photo...</p>
                            ) : photoBase64 ? (
                                <>
                                    <div className="bg-emerald-200 p-3 rounded-full mb-4">
                                        <CheckCircle2 className="h-6 w-6 text-emerald-800" />
                                    </div>
                                    <p className="text-sm font-medium text-emerald-900 mb-1">
                                        Photo compressed & ready
                                    </p>
                                    <p className="text-xs text-emerald-700">Click to change photo</p>
                                </>
                            ) : (
                                <>
                                    <div className="bg-emerald-100 p-3 rounded-full mb-4">
                                        <UploadCloud className="h-6 w-6 text-emerald-700" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                        Tap here to take or upload a photo
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Automatically compressed to JPG (under 1MB)
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 border-t pt-6">
                    <Link href="/dashboard/livestock">
                        <Button variant="outline" className="font-medium" type="button">Cancel</Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={isSubmitting || isCompressing}
                        className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold px-8"
                    >
                        {isSubmitting ? "Saving..." : "Register Animal"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}