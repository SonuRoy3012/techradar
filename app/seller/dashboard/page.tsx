"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Plus, Store } from "lucide-react"
import type { Store as StoreType, Product } from "@/lib/types"
import Loader from "./loader"

export default function SellerDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const storeId = searchParams.get("store")
  const supabase = getSupabaseClient()

  const [store, setStore] = useState<StoreType | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  // Exchange rate (1 USD to INR)
  const [exchangeRate] = useState(83.12) // Fixed exchange rate, in a real app you would fetch this

  // Function to convert USD to INR
  const convertToINR = (usdPrice: number): string => {
    const inrPrice = usdPrice * exchangeRate;
    return `₹${inrPrice.toFixed(2)}`;
  }

  // New product form state
  const [productCategory, setProductCategory] = useState<"phone" | "laptop" | "accessories">("phone")
  const [productName, setProductName] = useState("")
  const [productPrice, setProductPrice] = useState("")
  const [productStock, setProductStock] = useState("")

  useEffect(() => {
    if (!storeId) {
      router.push("/seller/login")
      return
    }

    const fetchStoreData = async () => {
      try {
        // Check if user is authenticated
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          router.push("/seller/login")
          return
        }

        // Fetch store data
        // In the fetchStoreData function
        const { data: storeData, error: storeError } = await supabase
          .from("stores")
          .select("*")
          .eq("id", storeId)
          .single()
        
        if (storeError) {
          throw storeError
        }
        
        // Use a safer type conversion approach
        setStore(storeData as unknown as StoreType)
        
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("store_id", storeId)
          .order("created_at", { ascending: false })
        
        if (productsError) {
          throw productsError
        }
        
        // Use a safer type conversion approach
        setProducts(productsData as unknown as Product[])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load store data",
          variant: "destructive",
        })
        router.push("/seller/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStoreData()
  }, [storeId, router, supabase])

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingProduct(true)

    try {
      // Validate inputs
      const price = Number.parseFloat(productPrice)
      const stock = Number.parseInt(productStock)

      if (isNaN(price) || price <= 0) {
        throw new Error("Please enter a valid price")
      }

      if (isNaN(stock) || stock < 0) {
        throw new Error("Please enter a valid stock quantity")
      }

      // Add product to database
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            store_id: storeId,
            category: productCategory,
            name: productName,
            price: price,
            stock: stock,
          },
        ])
        .select()

      if (error) {
        throw error
      }

      // Update local state with proper type casting
      setProducts([data[0] as unknown as Product, ...products])

      // Reset form
      setProductName("")
      setProductPrice("")
      setProductStock("")

      toast({
        title: "Product added",
        description: "Your product has been added successfully",
      })
    } catch (error: any) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsAddingProduct(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  // Replace the inline loading with the Loader component
  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-slate-100 text-slate-900">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 slide-in-right">
            <Store className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">{store?.name}</h1>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="hover-lift bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 border-blue-200 hover:border-blue-300">
            Sign out
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold slide-up bg-gradient-to-r from-blue-700 to-sky-600 bg-clip-text text-transparent">Store Dashboard</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="hover-lift hover-glow scale-in bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 border-0">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-blue-100 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-sky-400"></div>
                <DialogHeader>
                  <DialogTitle className="text-slate-800">Add New Product</DialogTitle>
                  <DialogDescription className="text-slate-500">Add a new product to your store inventory</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddProduct}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category" className="text-slate-700">Category</Label>
                      <Select
                        value={productCategory}
                        onValueChange={(value: any) => setProductCategory(value)}
                        required
                      >
                        <SelectTrigger className="border-blue-100 focus:ring-blue-200">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-blue-100">
                          <SelectItem value="phone" className="hover:bg-blue-50">Phone</SelectItem>
                          <SelectItem value="laptop" className="hover:bg-blue-50">Laptop</SelectItem>
                          <SelectItem value="accessories" className="hover:bg-blue-50">Accessories</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-slate-700">Product Name</Label>
                      <Input 
                        id="name" 
                        value={productName} 
                        onChange={(e) => setProductName(e.target.value)} 
                        required 
                        className="border-blue-100 focus:border-blue-300 focus:ring-blue-200"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price" className="text-slate-700">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        required
                        className="border-blue-100 focus:border-blue-300 focus:ring-blue-200"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="stock" className="text-slate-700">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={productStock}
                        onChange={(e) => setProductStock(e.target.value)}
                        required
                        className="border-blue-100 focus:border-blue-300 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={isAddingProduct}
                      className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 border-0"
                    >
                      {isAddingProduct ? "Adding..." : "Add Product"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            <Card className="fade-in interactive-card bg-white border-blue-100 shadow-sm overflow-hidden relative">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-sky-400"></div>
              <CardHeader className="border-b border-blue-50">
                <CardTitle className="text-slate-800">Store Information</CardTitle>
                <CardDescription className="text-slate-500">Your store details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="bg-white pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="stagger-item stagger-delay-1">
                    <h3 className="font-medium text-slate-800">Store Name</h3>
                    <p className="text-sm text-slate-500">{store?.name}</p>
                  </div>
                  <div className="stagger-item stagger-delay-2">
                    <h3 className="font-medium text-slate-800">Address</h3>
                    <p className="text-sm text-slate-500">{store?.address}</p>
                  </div>
                  <div className="stagger-item stagger-delay-3">
                    <h3 className="font-medium text-slate-800">Owner</h3>
                    <p className="text-sm text-slate-500">{store?.owner_name}</p>
                  </div>
                  <div className="stagger-item stagger-delay-4">
                    <h3 className="font-medium text-slate-800">Contact</h3>
                    <p className="text-sm text-slate-500">{store?.phone_number}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="slide-up interactive-card bg-white border-blue-100 shadow-sm overflow-hidden relative" style={{animationDelay: '0.2s'}}>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-sky-400"></div>
              <CardHeader className="border-b border-blue-50">
                <CardTitle className="text-slate-800">Products</CardTitle>
                <CardDescription className="text-slate-500">Manage your store inventory</CardDescription>
              </CardHeader>
              <CardContent className="bg-white pt-4">
                <Tabs defaultValue="all">
                  <TabsList className="mb-4 bg-blue-50">
                    <TabsTrigger value="all" className="hover-lift data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-sky-400 data-[state=active]:text-white">All Products</TabsTrigger>
                    <TabsTrigger value="phone" className="hover-lift data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-sky-400 data-[state=active]:text-white">Phones</TabsTrigger>
                    <TabsTrigger value="laptop" className="hover-lift data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-sky-400 data-[state=active]:text-white">Laptops</TabsTrigger>
                    <TabsTrigger value="accessories" className="hover-lift data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-sky-400 data-[state=active]:text-white">Accessories</TabsTrigger>
                  </TabsList>
                  
                  {/* All Products Tab */}
                  <TabsContent value="all">
                    {products.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 border border-blue-100 rounded-md bg-blue-50">
                        No products found. Add your first product!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map((product, index) => (
                          <div 
                            key={product.id} 
                            className={`stagger-item stagger-delay-${(index % 5) + 1} p-4 border border-blue-100 rounded-md 
                            hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-sky-50 
                            bg-white group relative overflow-hidden`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-sky-100/20 opacity-0 
                            group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            <div className="flex justify-between items-start mb-2 relative z-10">
                              <h3 className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors">{product.name}</h3>
                              <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 text-xs rounded-full capitalize
                              group-hover:from-blue-200 group-hover:to-sky-200 transition-colors">
                                {product.category}
                              </span>
                            </div>
                            <div className="flex justify-between items-end mt-4 relative z-10">
                              <span className="text-lg font-bold text-slate-900 group-hover:scale-105 transition-transform group-hover:bg-gradient-to-r group-hover:from-blue-700 group-hover:to-sky-600 group-hover:bg-clip-text group-hover:text-transparent">
                                {convertToINR(product.price)}
                              </span>
                              <span className={`text-sm ${product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'} 
                              transition-all duration-300 group-hover:font-medium`}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Phones Tab */}
                  <TabsContent value="phone">
                    {products.filter(product => product.category === 'phone').length === 0 ? (
                      <div className="p-8 text-center text-slate-500 border border-blue-100 rounded-md bg-blue-50">
                        No phone products found. Add your first phone!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products
                          .filter(product => product.category === 'phone')
                          .map((product, index) => (
                            <div 
                              key={product.id} 
                              className={`stagger-item stagger-delay-${(index % 5) + 1} p-4 border border-blue-100 rounded-md 
                              hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-sky-50 
                              bg-white group relative overflow-hidden`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-sky-100/20 opacity-0 
                              group-hover:opacity-100 transition-opacity duration-300"></div>
                              
                              <div className="flex justify-between items-start mb-2 relative z-10">
                                <h3 className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors">{product.name}</h3>
                                <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 text-xs rounded-full capitalize
                                group-hover:from-blue-200 group-hover:to-sky-200 transition-colors">
                                  {product.category}
                                </span>
                              </div>
                              <div className="flex justify-between items-end mt-4 relative z-10">
                                <span className="text-lg font-bold text-slate-900 group-hover:scale-105 transition-transform group-hover:bg-gradient-to-r group-hover:from-blue-700 group-hover:to-sky-600 group-hover:bg-clip-text group-hover:text-transparent">
                                  ${product.price.toFixed(2)}
                                </span>
                                <span className={`text-sm ${product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'} 
                                transition-all duration-300 group-hover:font-medium`}>
                                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Laptops Tab */}
                  <TabsContent value="laptop">
                    {products.filter(product => product.category === 'laptop').length === 0 ? (
                      <div className="p-8 text-center text-slate-500 border border-blue-100 rounded-md bg-blue-50">
                        No laptop products found. Add your first laptop!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products
                          .filter(product => product.category === 'laptop')
                          .map((product, index) => (
                            <div 
                              key={product.id} 
                              className={`stagger-item stagger-delay-${(index % 5) + 1} p-4 border border-blue-100 rounded-md 
                              hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-sky-50 
                              bg-white group relative overflow-hidden`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-sky-100/20 opacity-0 
                              group-hover:opacity-100 transition-opacity duration-300"></div>
                              
                              <div className="flex justify-between items-start mb-2 relative z-10">
                                <h3 className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors">{product.name}</h3>
                                <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 text-xs rounded-full capitalize
                                group-hover:from-blue-200 group-hover:to-sky-200 transition-colors">
                                  {product.category}
                                </span>
                              </div>
                              <div className="flex justify-between items-end mt-4 relative z-10">
                                <span className="text-lg font-bold text-slate-900 group-hover:scale-105 transition-transform group-hover:bg-gradient-to-r group-hover:from-blue-700 group-hover:to-sky-600 group-hover:bg-clip-text group-hover:text-transparent">
                                  ${product.price.toFixed(2)}
                                </span>
                                <span className={`text-sm ${product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'} 
                                transition-all duration-300 group-hover:font-medium`}>
                                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Accessories Tab */}
                  <TabsContent value="accessories">
                    {products.filter(product => product.category === 'accessories').length === 0 ? (
                      <div className="p-8 text-center text-slate-500 border border-blue-100 rounded-md bg-blue-50">
                        No accessories found. Add your first accessory!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products
                          .filter(product => product.category === 'accessories')
                          .map((product, index) => (
                            <div 
                              key={product.id} 
                              className={`stagger-item stagger-delay-${(index % 5) + 1} p-4 border border-blue-100 rounded-md 
                              hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-sky-50 
                              bg-white group relative overflow-hidden`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-sky-100/20 opacity-0 
                              group-hover:opacity-100 transition-opacity duration-300"></div>
                              
                              <div className="flex justify-between items-start mb-2 relative z-10">
                                <h3 className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors">{product.name}</h3>
                                <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 text-xs rounded-full capitalize
                                group-hover:from-blue-200 group-hover:to-sky-200 transition-colors">
                                  {product.category}
                                </span>
                              </div>
                              <div className="flex justify-between items-end mt-4 relative z-10">
                                <span className="text-lg font-bold text-slate-900 group-hover:scale-105 transition-transform group-hover:bg-gradient-to-r group-hover:from-blue-700 group-hover:to-sky-600 group-hover:bg-clip-text group-hover:text-transparent">
                                  ${product.price.toFixed(2)}
                                </span>
                                <span className={`text-sm ${product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'} 
                                transition-all duration-300 group-hover:font-medium`}>
                                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

