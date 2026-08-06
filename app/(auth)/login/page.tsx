"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            {/* Header Logo/Text */}
            <div className="mb-8 text-center">
                <div className="bg-green-900 text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold text-xl">((+))</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Field Terminal</h1>
                <p className="text-sm text-gray-500">Industrial Node v1.0 Authentication</p>
            </div>

            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-green-900">
                <CardHeader>
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <button
                            className={`font-semibold ${isLogin ? 'text-green-900' : 'text-gray-400'}`}
                            onClick={() => setIsLogin(true)}
                        >
                            Sign In
                        </button>
                        <button
                            className={`font-semibold ${!isLogin ? 'text-green-900' : 'text-gray-400'}`}
                            onClick={() => setIsLogin(false)}
                        >
                            Create Account
                        </button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Create Account Fields (Hidden on Login) */}
                    {!isLogin && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="fullName">FULL NAME</Label>
                                <Input id="fullName" placeholder="Operator Name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nodeId">NODE ASSIGNMENT ID</Label>
                                <Input id="nodeId" placeholder="e.g. NODE-772A" />
                            </div>
                        </>
                    )}

                    {/* Shared Fields */}
                    <div className="space-y-2">
                        <Label htmlFor="email">EMAIL OR PHONE NUMBER</Label>
                        <Input id="email" placeholder="Enter credentials" type="text" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">PASSKEY</Label>
                            {isLogin && <a href="#" className="text-xs text-green-700 hover:underline">Recover Access</a>}
                        </div>
                        <Input id="password" placeholder="••••••••" type="password" />
                    </div>

                    {/* Login Only Fields */}
                    {isLogin && (
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox id="maintain" />
                            <label htmlFor="maintain" className="text-sm font-medium leading-none">
                                Maintain session
                            </label>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pt-4">
                    <Button className="w-full bg-green-900 hover:bg-green-800 text-white font-bold py-6">
                        {isLogin ? "AUTHENTICATE →" : "INITIALIZE NODE ⚡"}
                    </Button>
                    <div className="text-center text-xs text-gray-500">
                        Having trouble connecting? <a href="#" className="text-green-700 hover:underline">Contact Dispatch Support</a>
                    </div>
                    <div className="flex items-center justify-center space-x-2 mt-4 text-xs text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Central Server Online</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}