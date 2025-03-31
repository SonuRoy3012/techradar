"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { ShoppingBag, ArrowLeft } from "lucide-react"

export default function SellerLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = getSupabaseClient()

  // Sign in form state
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")

  // Sign up form state
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [storeName, setStoreName] = useState("")
  const [storeAddress, setStoreAddress] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      })

      if (error) {
        throw error
      }

      // Check if this user is a seller (has a store)
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("email", signInEmail)
        .single()

      if (storeError) {
        throw new Error("No store found for this account. Please sign up as a seller first.")
      }

      router.push(`/seller/dashboard?store=${storeData.id}`)
    } catch (error: any) {
      console.error("Error signing in:", error)
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(signUpEmail)) {
        throw new Error("Please enter a valid email address")
      }

      // Phone validation
      const phoneRegex = /^\d{10}$/
      if (!phoneRegex.test(phoneNumber)) {
        throw new Error("Please enter a valid 10-digit phone number")
      }

      // Create the user account
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
      })

      if (error) {
        throw error
      }

      // Create the store record
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .insert([
          {
            name: storeName,
            address: storeAddress,
            owner_name: ownerName,
            phone_number: phoneNumber,
            email: signUpEmail,
          },
        ])
        .select()

      if (storeError) {
        throw storeError
      }

      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account",
      })

      // Redirect to dashboard
      router.push(`/seller/dashboard?store=${storeData[0].id}`)
    } catch (error: any) {
      console.error("Error signing up:", error)
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-slate-100">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 slide-in-right">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">TechRadar</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-slate-600 hover:text-blue-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-sky-600 bg-clip-text text-transparent">Seller Account</h1>
            <p className="text-sm text-slate-500">Sign in to manage your store or create a new one</p>
          </div>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-blue-50">
              <TabsTrigger value="signin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-sky-400 data-[state=active]:text-white">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-sky-400 data-[state=active]:text-white">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <Card className="bg-white border-blue-100 shadow-md overflow-hidden relative">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-sky-400"></div>
                <CardHeader className="border-b border-blue-50">
                  <CardTitle className="text-slate-800">Sign In</CardTitle>
                  <CardDescription className="text-slate-500">Enter your email and password to sign in to your store account</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignIn}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-slate-700">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        required
                        className="border-blue-100 focus:border-blue-300 focus:ring-blue-200 bg-white text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-slate-700">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        required
                        className="border-blue-100 focus:border-blue-300 focus:ring-blue-200 bg-white text-slate-900"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 border-0" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="signup">
              <Card className="bg-white border-blue-100 shadow-md overflow-hidden relative">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-sky-400"></div>
                <CardHeader className="border-b border-blue-50">
                  <CardTitle className="text-slate-800">Create an account</CardTitle>
                  <CardDescription className="text-slate-500">Enter your store details to create a new seller account</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignUp}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        className="border-blue-100 focus:border-blue-300 focus:ring-blue-200 bg-white text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-700">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required
                        className="border-blue-100 focus:border-blue-300 focus:ring-blue-200 bg-white text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="store-name" className="text-slate-700">Store Name</Label>
                      <Input
                        id="store-name"
                        placeholder="My Tech Store"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        required
                        className="border-blue-100 focus:border-blue-300 focus:ring-blue-200 bg-white text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="store-address" className="text-slate-700">Store Address</Label>
                      <Input
                        id="store-address"
                        placeholder="123 Tech Street, City"
                        value={storeAddress}
                        onChange={(e) => setStoreAddress(e.target.value)}
                        required
                        className="border-blue-100 focus:border-blue-300 focus:ring-blue-200 bg-white text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="owner-name" className="text-slate-700">Owner Name</Label>
                      <Input
                        id="owner-name"
                        placeholder="John Doe"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        required
                        className="border-blue-100 focus:border-blue-300 focus:ring-blue-200 bg-white text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone-number" className="text-slate-700">Phone Number</Label>
                      <Input
                        id="phone-number"
                        type="tel"
                        placeholder="1234567890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="border-blue-100 focus:border-blue-300 focus:ring-blue-200 bg-white text-slate-900"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 border-0" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="border-t border-blue-100 bg-white mt-auto">
        <div className="container flex flex-col gap-2 sm:flex-row py-6 items-center justify-between">
          <p className="text-sm text-slate-500">© 2023 TechRadar. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/about" className="text-sm text-blue-600 hover:text-blue-800">About</Link>
            <Link href="/contact" className="text-sm text-blue-600 hover:text-blue-800">Contact</Link>
            <Link href="/privacy" className="text-sm text-blue-600 hover:text-blue-800">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

