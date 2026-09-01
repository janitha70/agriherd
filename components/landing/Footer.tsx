import { Sprout } from "lucide-react"

export function Footer() {
    return (
        <footer className="py-10 px-6 border-t border-gray-100 bg-white">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-600 p-1.5 rounded-lg">
                        <Sprout className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-900">AgriHerd</span>
                </div>
                <p className="text-sm text-gray-400">2026 AgriHerd Systems. All rights reserved.</p>
                <div className="flex gap-4 text-sm text-gray-400">
                    <span className="hover:text-gray-600 cursor-pointer">Privacy</span>
                    <span className="hover:text-gray-600 cursor-pointer">Terms</span>
                    <span className="hover:text-gray-600 cursor-pointer">Support</span>
                </div>
            </div>
        </footer>
    )
}
