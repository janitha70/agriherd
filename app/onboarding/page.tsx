"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tractor, ArrowRight, Sprout } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function OnboardingPage() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  const [farmData, setFarmData] = useState({
    farmerName: "",
    farmName: "",
    primaryFocus: "",
    scale: ""
  })

  // Confirm the user just came from Google OAuth, prefill their name
  useEffect(() => {
    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        // Not authenticated - send back to landing page
        router.replace("/")
        return
      }

      // Check if they already completed onboarding (returning user)
      const existingName = localStorage.getItem("agriherd_farmer_name")
      if (existingName) {
        router.replace("/dashboard")
        return
      }

      // New user - prefill from Google profile
      const user = session.user
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ""
      const email = user.email || ""

      setUserEmail(email)
      setFarmData((prev) => ({ ...prev, farmerName: fullName }))
      localStorage.setItem("agriherd_session", "active")
      setIsLoading(false)
    }

    bootstrap()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      localStorage.setItem("agriherd_farmer_name", farmData.farmerName)
      localStorage.setItem("agriherd_farm_name", farmData.farmName)
      router.push("/dashboard")
    }, 800)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl animate-pulse">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-500 text-sm">Setting up your account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50/30 p-4">
      <Card className="max-w-md w-full shadow-xl border-gray-200 animate-in zoom-in-95 duration-300">
        <CardHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-emerald-100 p-2.5 rounded-xl">
              <Tractor className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <CardTitle className="text-xl">Almost there!</CardTitle>
              <CardDescription className="mt-0.5">
                {userEmail ? `Signed in as ${userEmail}` : "Set up your farm profile."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="farmerName">Your Full Name</Label>
              <Input
                id="farmerName"
                required
                placeholder="e.g. Sunil Perera"
                value={farmData.farmerName}
                onChange={(e) => setFarmData({ ...farmData, farmerName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="farmName">Farm / Operation Name (optional)</Label>
              <Input
                id="farmName"
                placeholder="e.g. Green Valley Dairies"
                value={farmData.farmName}
                onChange={(e) => setFarmData({ ...farmData, farmName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="primaryFocus">Primary Livestock Focus</Label>
              <select
                id="primaryFocus"
                required
                className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-emerald-900"
                value={farmData.primaryFocus}
                onChange={(e) => setFarmData({ ...farmData, primaryFocus: e.target.value })}
              >
                <option value="" disabled>Select primary focus</option>
                <option value="Dairy">Dairy (Cattle / Buffalo)</option>
                <option value="Poultry">Poultry (Layers / Broilers)</option>
                <option value="Swine">Swine</option>
                <option value="Ovine">Ovine (Sheep / Goats)</option>
                <option value="Mixed">Mixed Farm</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scale">Estimated Herd Size</Label>
              <select
                id="scale"
                required
                className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-emerald-900"
                value={farmData.scale}
                onChange={(e) => setFarmData({ ...farmData, scale: e.target.value })}
              >
                <option value="" disabled>Select herd size</option>
                <option value="1-10">1 to 10 animals (Smallholder)</option>
                <option value="11-50">11 to 50 animals (Medium)</option>
                <option value="50+">50+ animals (Commercial)</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button
              id="onboarding-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold shadow-sm"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Setting up...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Enter Dashboard <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}