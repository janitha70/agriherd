"use client"

import { Zap, LogIn, UserPlus, LayoutDashboard, Moon, Sun, Menu, X } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/ThemeContext"
import { useState } from "react"

interface NavbarProps {
    onOpenAuth: () => void;
    isAuthenticated?: boolean;
}

export function Navbar({ onOpenAuth, isAuthenticated }: NavbarProps) {
    const { isDark, toggleTheme } = useTheme()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <nav className="w-full border-b border-border/50 bg-background/90 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-paddy to-paddy-light flex items-center justify-center shadow-md">
                        <Zap className="w-4 h-4 text-turmeric fill-turmeric" />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight gradient-text-paddy dark:text-emerald-300">
                        AgriHerd
                    </span>
                </div>

                {/* Desktop nav */}
                <div className="hidden sm:flex items-center gap-2">
                    {/* Dark mode toggle */}
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle dark mode"
                        className="p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                        {isDark ? <Sun className="w-4 h-4 text-turmeric" /> : <Moon className="w-4 h-4" />}
                    </button>

                    {isAuthenticated ? (
                        <Link
                            href="/dashboard"
                            className={cn(
                                buttonVariants({ variant: "default" }),
                                "btn-shimmer flex items-center gap-2 bg-gradient-to-r from-paddy to-paddy-light text-white font-semibold px-5 shadow-md shadow-paddy/20 h-9 rounded-xl hover:-translate-y-0.5 transition-all duration-200"
                            )}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Button
                                id="nav-login-btn"
                                variant="ghost"
                                className="font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl"
                                onClick={onOpenAuth}
                            >
                                <LogIn className="w-4 h-4 mr-1.5" />
                                Log In
                            </Button>
                            <Button
                                id="nav-register-btn"
                                onClick={onOpenAuth}
                                className="btn-shimmer flex items-center gap-2 bg-gradient-to-r from-paddy to-paddy-light text-white font-semibold px-5 shadow-md shadow-paddy/20 rounded-xl hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <UserPlus className="w-4 h-4" />
                                Get Started
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile: theme + hamburger */}
                <div className="flex sm:hidden items-center gap-1">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl text-muted-foreground hover:bg-accent transition-colors"
                    >
                        {isDark ? <Sun className="w-4 h-4 text-turmeric" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(v => !v)}
                        className="p-2 rounded-xl text-muted-foreground hover:bg-accent transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {mobileMenuOpen && (
                <div className="sm:hidden border-t border-border/50 px-6 py-4 space-y-2 bg-background/95 backdrop-blur-xl animate-fade-slide-up">
                    {isAuthenticated ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl bg-paddy text-white font-semibold text-sm"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <button
                                onClick={() => { onOpenAuth(); setMobileMenuOpen(false) }}
                                className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl text-muted-foreground hover:bg-accent font-medium text-sm transition-colors"
                            >
                                <LogIn className="w-4 h-4" /> Log In
                            </button>
                            <button
                                onClick={() => { onOpenAuth(); setMobileMenuOpen(false) }}
                                className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl bg-paddy text-white font-semibold text-sm"
                            >
                                <UserPlus className="w-4 h-4" /> Get Started Free
                            </button>
                        </>
                    )}
                </div>
            )}
        </nav>
    )
}
