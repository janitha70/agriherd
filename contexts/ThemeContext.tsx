"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
    isDark: boolean
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
    toggleTheme: () => {},
    isDark: false,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light")

    // On mount, read persisted theme preference
    useEffect(() => {
        const stored = localStorage.getItem("agriherd_theme") as Theme | null
        const preferred = stored ?? "light"
        setTheme(preferred)
        applyTheme(preferred)
    }, [])

    function applyTheme(t: Theme) {
        const root = document.documentElement
        if (t === "dark") {
            root.classList.add("dark")
        } else {
            root.classList.remove("dark")
        }
    }

    function toggleTheme() {
        setTheme(prev => {
            const next: Theme = prev === "light" ? "dark" : "light"
            localStorage.setItem("agriherd_theme", next)
            applyTheme(next)
            return next
        })
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeContext)
}
