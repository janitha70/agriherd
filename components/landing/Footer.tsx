import { Zap } from "lucide-react"
import Link from "next/link"

const FOOTER_LINKS = [
    { label: "Privacy",    href: "#" },
    { label: "Terms",      href: "#" },
    { label: "Support",    href: "#" },
    { label: "Changelog",  href: "#" },
]

export function Footer() {
    return (
        <footer className="border-t border-border/50 bg-background py-10 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* Brand */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-paddy to-paddy-light flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-turmeric fill-turmeric" />
                        </div>
                        <span className="font-extrabold text-foreground tracking-tight">AgriHerd</span>
                        <span className="text-muted-foreground text-xs font-medium">Field Terminal v1.0</span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-1">
                        {FOOTER_LINKS.map((link, i) => (
                            <span key={link.label} className="flex items-center gap-1">
                                <Link
                                    href={link.href}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-accent"
                                >
                                    {link.label}
                                </Link>
                                {i < FOOTER_LINKS.length - 1 && (
                                    <span className="text-border">·</span>
                                )}
                            </span>
                        ))}
                    </div>

                    {/* Copyright */}
                    <p className="text-xs text-muted-foreground">
                        © 2026 AgriHerd Systems. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
