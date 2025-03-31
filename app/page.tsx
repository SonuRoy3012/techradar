import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingBag, User } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-slate-100">
      {/* Hero Section */}
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent sm:text-[5rem]">
          <span className="text-blue-700">Tech</span>radar
        </h1>

        <p className="max-w-md text-lg text-slate-700">
          Connect with local tech stores and find the products you need
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
          <Link href="/customer/login" className="flex flex-col items-center">
            <Button className="flex h-16 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 px-8 text-lg font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300">
              <User className="h-5 w-5" />
              Login as Customer
            </Button>
          </Link>

          <Link href="/seller/login" className="flex flex-col items-center">
            <Button className="flex h-16 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 px-8 text-lg font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300">
              <ShoppingBag className="h-5 w-5" />
              Login as Seller
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="slide-up">
          <p className="text-xl mb-8 text-center text-slate-700">
            Track and visualize technology trends with our powerful radar tool.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {/* Staggered animation for feature cards */}
          <div className="stagger-item stagger-delay-1 interactive-card p-6 rounded-lg bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">Trend Analysis</h3>
            <p className="text-slate-600">Identify emerging technologies and track their adoption.</p>
          </div>
          
          <div className="stagger-item stagger-delay-2 interactive-card p-6 rounded-lg bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">Visualization</h3>
            <p className="text-slate-600">Powerful radar charts to visualize your technology landscape.</p>
          </div>
          
          <div className="stagger-item stagger-delay-3 interactive-card p-6 rounded-lg bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">Collaboration</h3>
            <p className="text-slate-600">Share insights with your team and make decisions together.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

