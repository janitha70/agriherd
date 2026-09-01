"use client"
import { Sprout, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavbarProps {
    onOpenAuth: () => void;
}

export function Navbar({ onOpenAuth }: NavbarProps) {
    return (
        <nav className="w-full border-b border-gray-100 bg-white/90 backdrop-blur-lg sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-600 p-1.5 rounded-lg">
                        <Sprout className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900">AgriHerd</span>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        id="nav-login-btn"
                        variant="ghost"
                        className="hidden sm:flex font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        onClick={onOpenAuth}
                    >
                        <LogIn className="w-4 h-4 mr-1.5" />
                        Log In
                    </Button>
                    <Button
                        id="nav-register-btn"
                        onClick={onOpenAuth}
                        className="flex items-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-white font-semibold px-5 shadow-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        Get Started
                    </Button>
                </div>
            </div>
        </nav>
    )
}
