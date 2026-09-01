"use client"

import { useState } from "react"
import { Mail, Smartphone, Sprout } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [isPhoneLoading, setIsPhoneLoading] = useState(false)

    const handleGoogleLogin = async () => {
        try {
            setIsGoogleLoading(true)
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/onboarding`,
                },
            })
            if (error) throw error
        } catch (err: any) {
            console.error("Google OAuth error:", err)
            alert(`Sign-in failed: ${err?.message ?? "Unknown error"}. Check the console for details.`)
            setIsGoogleLoading(false)
        }
    }

    const handlePhoneLogin = () => {
        setIsPhoneLoading(true)
        setTimeout(() => {
            alert("Phone login flow coming soon.")
            setIsPhoneLoading(false)
        }, 1000)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
                <DialogHeader className="pt-8 pb-6 px-8 border-b border-gray-100 flex flex-col items-center">
                    <div className="bg-emerald-600 p-2.5 rounded-xl shadow-md shadow-emerald-600/20 mb-4">
                        <Sprout className="w-6 h-6 text-white" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-center text-gray-900">
                        Log in or sign up
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1.5 text-center">
                        Welcome to AgriHerd
                    </p>
                </DialogHeader>

                <div className="p-8 space-y-4 bg-gray-50/50">
                    {/* Outline Buttons for OAuth */}
                    <Button 
                        variant="outline" 
                        className="w-full h-12 rounded-xl border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading || isPhoneLoading}
                    >
                        {isGoogleLoading ? (
                            "Connecting..."
                        ) : (
                            <>
                                <Mail className="w-5 h-5 mr-3 text-red-500" />
                                Continue with Google
                            </>
                        )}
                    </Button>

                    <Button 
                        variant="outline" 
                        className="w-full h-12 rounded-xl border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                        onClick={handlePhoneLogin}
                        disabled={isGoogleLoading || isPhoneLoading}
                    >
                        {isPhoneLoading ? (
                            "Connecting..."
                        ) : (
                            <>
                                <Smartphone className="w-5 h-5 mr-3 text-blue-500" />
                                Continue with Phone Number
                            </>
                        )}
                    </Button>

                    {/* Divider */}
                    <div className="relative py-3">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-[#f9faf9] px-3 text-gray-500 font-medium uppercase">or</span>
                        </div>
                    </div>

                    {/* Email Input Alternative */}
                    <div className="space-y-3">
                        <Input 
                            type="email" 
                            placeholder="Email address" 
                            className="h-12 rounded-xl border-gray-200 bg-white"
                        />
                        <Button className="w-full h-12 rounded-xl font-bold bg-emerald-900 text-white hover:bg-emerald-800">
                            Continue
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
