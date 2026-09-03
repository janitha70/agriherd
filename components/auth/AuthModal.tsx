"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sprout,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  Phone,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter()
  const [authMode, setAuthMode] = useState<"email" | "phone">("email")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLinkSent, setIsLinkSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 1. Send Magic Link Handler
  const handleSendMagicLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.")
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage(null)

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      })

      if (error) throw error

      setIsLinkSent(true)
    } catch (err: any) {
      console.error("Magic link error:", err)
      setErrorMessage(err?.message || "Failed to send magic link. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // 2. Google OAuth Handler
  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      setErrorMessage(null)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        },
      })

      if (error) throw error
    } catch (err: any) {
      console.error("Google OAuth error:", err)
      setErrorMessage(err?.message || "Google sign-in failed. Please try again.")
      setIsGoogleLoading(false)
    }
  }

  // 3. Phone Submit & Dashboard Login Handler
  const handlePhoneSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!phoneNumber || phoneNumber.trim().length < 6) {
      setErrorMessage("Please enter a valid phone number.")
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage(null)

      // Set session & farmer profile locally
      localStorage.setItem("agriherd_session", "active")
      if (!localStorage.getItem("agriherd_farmer_name")) {
        localStorage.setItem("agriherd_farmer_name", "Farmer")
      }
      localStorage.setItem("agriherd_phone_number", phoneNumber.trim())

      // Realistic mock network delay for smooth UX
      await new Promise((resolve) => setTimeout(resolve, 600))

      onClose()
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Phone login error:", err)
      setErrorMessage("Failed to log in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle modal closing and state reset
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
      setTimeout(() => {
        setAuthMode("email")
        setErrorMessage(null)
        setIsLoading(false)
      }, 200)
    }
  }

  const handleResetEmail = () => {
    setIsLinkSent(false)
    setErrorMessage(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl transition-all">
        {/* Header Section */}
        <DialogHeader className="pt-8 pb-5 px-8 flex flex-col items-center text-center border-b border-gray-50 dark:border-zinc-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 mb-3 shadow-sm ring-1 ring-emerald-500/20">
            {isLinkSent ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-50 duration-300" />
            ) : authMode === "phone" ? (
              <Smartphone className="h-6 w-6 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-50 duration-300" />
            ) : (
              <Sprout className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>

          <DialogTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">
            {isLinkSent
              ? "Check your email"
              : authMode === "phone"
              ? "Enter your phone number"
              : "Log in or sign up"}
          </DialogTitle>

          <DialogDescription className="text-sm text-gray-500 dark:text-zinc-400 mt-1.5 max-w-xs">
            {isLinkSent
              ? "We sent a secure magic link to your inbox. Click the link to log in instantly."
              : authMode === "phone"
              ? "Enter your phone number to sign in directly to your dashboard."
              : "Welcome to AgriHerd"}
          </DialogDescription>
        </DialogHeader>

        {/* Dynamic Body Content */}
        <div className="p-8 space-y-5 bg-gray-50/40 dark:bg-zinc-900/20">
          {errorMessage && (
            <div className="p-3 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg animate-in fade-in duration-200">
              {errorMessage}
            </div>
          )}

          {isLinkSent ? (
            /* --- SUCCESS VIEW (MAGIC LINK) --- */
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300 text-center">
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="font-medium truncate">{email}</span>
              </div>

              <div className="space-y-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResetEmail}
                  className="w-full h-11 rounded-xl text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100/80 dark:hover:bg-zinc-800 text-sm font-medium transition-colors"
                >
                  Use a different email
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSendMagicLink()}
                  disabled={isLoading}
                  className="w-full h-10 rounded-xl border-dashed border-gray-200 dark:border-zinc-800 text-xs text-gray-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Resend magic link
                </Button>
              </div>
            </div>
          ) : authMode === "phone" ? (
            /* --- PHONE LOGIN VIEW --- */
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
              <form onSubmit={handlePhoneSubmit} className="space-y-3">
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    type="tel"
                    placeholder="+94 77 123 4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                    required
                    className="h-11 pl-10 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 focus-visible:ring-emerald-600"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !phoneNumber.trim()}
                  className="w-full h-11 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <Button
                type="button"
                variant="ghost"
                disabled={isLoading}
                onClick={() => {
                  setAuthMode("email")
                  setErrorMessage(null)
                }}
                className="w-full h-10 rounded-xl text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100/80 dark:hover:bg-zinc-800 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Email</span>
              </Button>
            </div>
          ) : (
            /* --- DEFAULT VIEW (EMAIL & OAUTH) --- */
            <div className="space-y-4 animate-in fade-in slide-in-from-left-3 duration-300">
              {/* Google OAuth Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 shadow-sm transition-all flex items-center justify-center gap-3"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </Button>

              {/* Phone Login Toggle Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 shadow-sm transition-all flex items-center justify-center gap-3"
                onClick={() => {
                  setAuthMode("phone")
                  setErrorMessage(null)
                }}
                disabled={isGoogleLoading || isLoading}
              >
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Continue with Phone Number</span>
              </Button>

              {/* OR Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-50/40 dark:bg-zinc-900/20 backdrop-blur-xs px-3 text-gray-400 dark:text-zinc-500 font-medium">
                    or
                  </span>
                </div>
              </div>

              {/* Magic Link Email Form */}
              <form onSubmit={handleSendMagicLink} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || isGoogleLoading}
                    required
                    className="h-11 pl-10 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 focus-visible:ring-emerald-600"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm transition-all flex items-center justify-center gap-2"
                  disabled={isLoading || isGoogleLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
