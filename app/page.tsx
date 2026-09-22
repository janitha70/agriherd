"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

import { Navbar } from "@/components/landing/Navbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { TrustBar } from "@/components/landing/TrustBar"
import { FeatureGrid } from "@/components/landing/FeatureGrid"
import { CTABanner } from "@/components/landing/CTABanner"
import { Footer } from "@/components/landing/Footer"
import { AuthModal } from "@/components/auth/AuthModal"

export default function CommercialLandingPage() {
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsAuthenticated(true)
        localStorage.setItem("agriherd_session", "active")
      } else {
        setIsAuthenticated(false)
        localStorage.removeItem("agriherd_session")
      }
    }
    checkSession()
  }, [])

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} isAuthenticated={isAuthenticated} />
      <HeroSection onOpenAuth={() => setIsAuthModalOpen(true)} />
      <TrustBar />
      <FeatureGrid />
      <CTABanner onOpenAuth={() => setIsAuthModalOpen(true)} />
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}