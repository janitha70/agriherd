"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Leaf, Lock, Mail, User, Fingerprint, ArrowRight, Activity, ShieldCheck } from "lucide-react"

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setTimeout(() => setIsLoading(false), 1500) // Simulate auth
    }

    return (
        <div className="min-h-screen bg-[#022c22] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900 via-emerald-950 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-green-500/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Header Logo/Text */}
            <div className="mb-8 text-center z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-emerald-500/20 text-emerald-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)] backdrop-blur-md border border-emerald-500/30">
                    <Leaf size={32} strokeWidth={1.5} />
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 drop-shadow-md">AgriHerd</h1>
                <div className="flex items-center justify-center space-x-2 text-emerald-300/80">
                    <Activity size={16} />
                    <span className="text-sm font-medium tracking-widest uppercase">Field Node v2.0</span>
                </div>
            </div>

            <Card className="w-full max-w-md bg-white/5 backdrop-blur-2xl border-white/10 shadow-2xl z-10 transition-all duration-500 animate-in fade-in zoom-in-95 duration-500 delay-150">
                <CardHeader className="pb-0">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 relative">
                        <div 
                            className="absolute bottom-[-1px] h-0.5 bg-emerald-500 transition-all duration-300 ease-in-out shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                            style={{ 
                                left: isLogin ? '0%' : '50%',
                                width: '50%'
                            }} 
                        />
                        <button
                            className={`flex-1 pb-2 text-sm font-bold tracking-wider uppercase transition-colors duration-300 ${isLogin ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-300'}`}
                            onClick={() => setIsLogin(true)}
                        >
                            Sign In
                        </button>
                        <button
                            className={`flex-1 pb-2 text-sm font-bold tracking-wider uppercase transition-colors duration-300 ${!isLogin ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-300'}`}
                            onClick={() => setIsLogin(false)}
                        >
                            Register
                        </button>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className={`space-y-5 transition-all duration-500 overflow-hidden ${!isLogin ? 'opacity-100 max-h-64' : 'opacity-0 max-h-0'}`}>
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-xs font-semibold text-slate-300 tracking-wider">FULL NAME</Label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                    <Input 
                                        id="fullName" 
                                        placeholder="Operator Name" 
                                        className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50 h-12 rounded-xl transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nodeId" className="text-xs font-semibold text-slate-300 tracking-wider">NODE ASSIGNMENT ID</Label>
                                <div className="relative group">
                                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                    <Input 
                                        id="nodeId" 
                                        placeholder="e.g. NODE-772A" 
                                        className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50 h-12 rounded-xl transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 transform transition-all duration-300">
                            <Label htmlFor="email" className="text-xs font-semibold text-slate-300 tracking-wider">CREDENTIALS</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                <Input 
                                    id="email" 
                                    placeholder="Email or Node ID" 
                                    type="text" 
                                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50 h-12 rounded-xl transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 transform transition-all duration-300 delay-75">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-xs font-semibold text-slate-300 tracking-wider">PASSKEY</Label>
                                {isLogin && <a href="#" className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline transition-all">Recover Access</a>}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                <Input 
                                    id="password" 
                                    placeholder="••••••••" 
                                    type="password" 
                                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50 h-12 rounded-xl transition-all tracking-widest"
                                    required
                                />
                            </div>
                        </div>

                        {isLogin && (
                            <div className="flex items-center space-x-2 pt-2 transform transition-all duration-300 delay-150">
                                <Checkbox id="maintain" className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" />
                                <label htmlFor="maintain" className="text-sm font-medium leading-none text-slate-300 cursor-pointer">
                                    Maintain secure session
                                </label>
                            </div>
                        )}

                        <Button 
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-14 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all group overflow-hidden relative mt-4"
                            disabled={isLoading}
                        >
                            <span className="relative z-10 flex items-center justify-center space-x-2">
                                <span>{isLoading ? 'AUTHENTICATING...' : (isLogin ? "AUTHORIZE ACCESS" : "INITIALIZE NODE")}</span>
                                {!isLoading && (
                                    isLogin ? <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /> : <Fingerprint size={18} />
                                )}
                            </span>
                            {/* Hover effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-emerald-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-6 pt-2 pb-8">
                    <div className="flex items-center justify-center space-x-2 text-xs text-emerald-400/70 bg-emerald-950/30 px-4 py-2 rounded-full border border-emerald-900/50">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span>Encrypted Connection Active</span>
                    </div>
                    
                    <div className="text-center text-xs text-slate-400">
                        Connection issues? <a href="#" className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">Contact Central Dispatch</a>
                    </div>
                </CardFooter>
            </Card>
            
            {/* System status indicator */}
            <div className="fixed bottom-6 right-6 flex items-center space-x-2 text-xs font-medium text-emerald-500/80 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>SYS.ONLINE</span>
            </div>
        </div>
    )
}