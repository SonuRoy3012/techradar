"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { MapPin, Search, User, ShoppingCart, MessageCircle, HelpCircle } from "lucide-react"
import type { Store as StoreType, Product } from "@/lib/types"
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import Loading from "./loader"
import ChatBot from "@/components/ChatBot"

// Extend the StoreType to include coordinates
interface ExtendedStoreType extends StoreType {
  latitude?: number;
  longitude?: number;
}

// Add this declaration to avoid TypeScript errors
declare global {
  interface HTMLElement {
    _map?: maplibregl.Map;
  }
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

export default function CustomerDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const customerId = searchParams.get("id")
  const supabase = getSupabaseClient()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ExtendedStoreType[]>([])
  const [selectedStore, setSelectedStore] = useState<ExtendedStoreType | null>(null)
  const [storeProducts, setStoreProducts] = useState<Product[]>([])
  const [searchLocation, setSearchLocation] = useState<{lat: number, lng: number} | null>(null)
  // State for chatbot visibility
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  
  // Map related states and refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  // Default coordinates for India (centered on New Delhi)
  const [lng] = useState(77.2090);
  const [lat] = useState(28.6139);
  const [zoom] = useState(5);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<string>("");
  const API_KEY = '9flzezXTgXmqJyFORRvN';

  // Add these helper functions before the useEffect hooks
  // Helper function to calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number | undefined, lon2: number | undefined): number => {
    // Return 0 if any coordinate is undefined
    if (lat2 === undefined || lon2 === undefined) return 0;
    
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  }
  
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  }

  // Request location permission and initialize map
  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return; // wait for map container to be available
    
    // Create the map with India as default center
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${API_KEY}`,
      center: [lng, lat],
      zoom: zoom
    });
    
    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    // Request user location permission
    if ('geolocation' in navigator) {
      setLocationPermissionStatus("Requesting your location to find nearby stores...");
      
      navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
        if (permissionStatus.state === 'granted') {
          setLocationPermissionStatus("Using your location to find nearby stores");
          centerMapOnUserLocation();
        } else if (permissionStatus.state === 'prompt') {
          setLocationPermissionStatus("Please allow location access to find nearby stores");
        } else {
          setLocationPermissionStatus("Location access denied. Showing stores in India.");
        }
        
        permissionStatus.onchange = () => {
          if (permissionStatus.state === 'granted') {
            setLocationPermissionStatus("Using your location to find nearby stores");
            centerMapOnUserLocation();
          } else {
            setLocationPermissionStatus("Location access denied. Showing stores in India.");
          }
        };
      });
      
      // Add geolocate control for user to manually trigger location
      const geolocateControl = new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
        // Removed showUserHeading as it's not supported in this version of MapLibre GL
      });
      
      map.current.addControl(geolocateControl);
      
      // Listen for when the user has been successfully geolocated
      map.current.on('geolocate', () => {
        setLocationPermissionStatus("Using your location to find nearby stores");
      });
    } else {
      setLocationPermissionStatus("Geolocation is not supported by your browser. Showing stores in India.");
    }
  }, [lng, lat, zoom, API_KEY]);
  
  // Function to center map on user's location
  const centerMapOnUserLocation = () => {
    if (!map.current) return;
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (map.current) {
          map.current.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 12,
            essential: true
          });
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationPermissionStatus(`Unable to access your location: ${error.message}. Showing stores in India.`);
      }
    );
  };
  
  // Update map with store locations when search results change
  useEffect(() => {
    if (!map.current || searchResults.length === 0) return;
    
    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.store-marker');
    existingMarkers.forEach(marker => marker.remove());
    
    // Add markers for each store
    searchResults.forEach(store => {
      // For this example, we're assuming stores have lat/lng properties
      // If your stores don't have coordinates, you would need to geocode them
      if (store.latitude && store.longitude) {
        const markerElement = document.createElement('div');
        markerElement.className = 'store-marker';
        markerElement.innerHTML = `<div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>`;
        
        // Add popup
        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
          `<strong>${store.name}</strong><p>${store.address}</p>`
        );
        
        // Add marker - Fix the null check
        const mapInstance = map.current;
        if (mapInstance) {
          new maplibregl.Marker(markerElement)
            .setLngLat([store.longitude, store.latitude])
            .setPopup(popup)
            .addTo(mapInstance);
        }
          
        markerElement.addEventListener('click', () => {
          viewStoreDetails(store);
        });
      }
    });
    
    // Fit map to show all markers if there are multiple results
    if (searchResults.length > 1) {
      const bounds = new maplibregl.LngLatBounds();
      searchResults.forEach(store => {
        if (store.latitude && store.longitude) {
          bounds.extend([store.longitude, store.latitude]);
        }
      });
      const mapInstance = map.current;
      if (mapInstance) {
        mapInstance.fitBounds(bounds, { padding: 50 });
      }
    }
  }, [searchResults]);

  // Add a new useEffect for the store detail map
  useEffect(() => {
    if (!selectedStore || !selectedStore.latitude || !selectedStore.longitude) return;
    
    // Initialize store detail map
    const storeDetailMapContainer = document.getElementById('store-detail-map');
    if (!storeDetailMapContainer) return;
    
    // Remove any existing map
    if (storeDetailMapContainer._map) {
      storeDetailMapContainer._map.remove();
    }
    
    // Create new map
    const storeDetailMap = new maplibregl.Map({
      container: 'store-detail-map',
      style: `https://api.maptiler.com/maps/streets/style.json?key=${API_KEY}`,
      center: [selectedStore.longitude, selectedStore.latitude],
      zoom: 14
    });
    
    // Save reference to map for cleanup
    storeDetailMapContainer._map = storeDetailMap;
    
    // Add navigation controls
    storeDetailMap.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    // Add marker for the store
    const markerElement = document.createElement('div');
    markerElement.className = 'store-detail-marker';
    markerElement.innerHTML = `<div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
    </div>`;
    
    // Add popup
    const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
      `<strong>${selectedStore.name}</strong><p>${selectedStore.address}</p>`
    );
    
    // Add marker
    new maplibregl.Marker(markerElement)
      .setLngLat([selectedStore.longitude, selectedStore.latitude])
      .setPopup(popup)
      .addTo(storeDetailMap);
    
    // Add user's current location if available
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Create user location marker
          const userMarkerElement = document.createElement('div');
          userMarkerElement.className = 'user-location-marker';
          userMarkerElement.innerHTML = `<div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg pulse-animation">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
          </div>`;
          
          // Add user marker
          new maplibregl.Marker(userMarkerElement)
            .setLngLat([position.coords.longitude, position.coords.latitude])
            .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML('<strong>Your Location</strong>'))
            .addTo(storeDetailMap);
          
          // Create bounds to fit both markers - Fix type issues
          const bounds = new maplibregl.LngLatBounds();
          
          // Ensure coordinates are defined before extending bounds
          if (selectedStore.longitude !== undefined && selectedStore.latitude !== undefined) {
            bounds.extend([selectedStore.longitude, selectedStore.latitude]);
          }
          
          bounds.extend([position.coords.longitude, position.coords.latitude]);
          
          // Fit map to show both user and store
          storeDetailMap.fitBounds(bounds, { 
            padding: 100,
            maxZoom: 15
          });
          
          // Add distance information
          const distance = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            selectedStore.latitude,
            selectedStore.longitude
          );
          
          // Add distance info to the UI
          const distanceInfoElement = document.createElement('div');
          distanceInfoElement.className = 'bg-white px-3 py-2 rounded-md shadow-md text-sm';
          distanceInfoElement.innerHTML = `<div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            <span>Distance: ${distance.toFixed(2)} km</span>
          </div>`;
          
          storeDetailMap.getContainer().appendChild(distanceInfoElement);
          distanceInfoElement.style.position = 'absolute';
          distanceInfoElement.style.bottom = '10px';
          distanceInfoElement.style.left = '10px';
          distanceInfoElement.style.zIndex = '1';
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
      
    // Clean up on unmount
    return () => {
      if (storeDetailMapContainer && storeDetailMapContainer._map) {
        storeDetailMapContainer._map.remove();
      }
    };
  }, [selectedStore, API_KEY]);

  useEffect(() => {
    if (!customerId) {
      router.push("/customer/login")
      return
    }

    const fetchCustomerData = async () => {
      try {
        // Check if user is authenticated
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          router.push("/customer/login")
          return
        }

        // Fetch customer data
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*")
          .eq("id", customerId)
          .single()

        if (customerError) {
          throw customerError
        }

        // Fix type conversion with proper type assertion
        setCustomer(customerData as unknown as Customer)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load customer data",
          variant: "destructive",
        })
        router.push("/customer/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomerData()
  }, [customerId, router, supabase])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a location",
        variant: "destructive",
      })
      return
    }

    try {
      // First, geocode the location query to get coordinates
      const geocodingUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${API_KEY}`;
      
      const response = await fetch(geocodingUrl);
      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        toast({
          title: "Location not found",
          description: "Try a different location name",
          variant: "destructive",
        })
        return;
      }
      
      // Get the coordinates of the first result
      const [longitude, latitude] = data.features[0].center;
      setSearchLocation({ lat: latitude, lng: longitude });
      
      // Fly to the location
      if (map.current) {
        map.current.flyTo({
          center: [longitude, latitude],
          zoom: 12,
          essential: true
        });
      }
      
      // Now search for stores near this location
      // In a real app, you would use a spatial query
      // For this example, we'll fetch all stores and filter by distance
      const { data: allStores, error } = await supabase.from("stores").select("*");

      if (error) {
        throw error;
      }
      
      // Add coordinates to stores if they don't have them
      // In a real app, stores would have real coordinates
      const storesWithCoordinates = allStores.map(store => ({
        ...store,
        latitude: store.latitude || (latitude + (Math.random() - 0.5) * 0.05),
        longitude: store.longitude || (longitude + (Math.random() - 0.5) * 0.05)
      }));
      
      // Filter stores by distance (within 10km of the searched location)
      const nearbyStores = storesWithCoordinates.filter(store => {
        const distance = calculateDistance(
          latitude,
          longitude,
          store.latitude || 0,
          store.longitude || 0
        );
        return distance <= 10; // 10km radius
      });
      
      // Sort by distance
      nearbyStores.sort((a, b) => {
        const distanceA = calculateDistance(
          latitude,
          longitude,
          a.latitude || 0,
          a.longitude || 0
        );
        const distanceB = calculateDistance(
          latitude,
          longitude,
          b.latitude || 0,
          b.longitude || 0
        );
        return distanceA - distanceB;
      });

      // Fix type conversion with proper type assertion
      setSearchResults(nearbyStores as unknown as ExtendedStoreType[]);

      if (nearbyStores.length === 0) {
        toast({
          title: "No stores found nearby",
          description: "Try a different location or expand your search area",
        })
      } else {
        toast({
          title: `Found ${nearbyStores.length} stores near ${data.features[0].place_name}`,
          description: "Showing stores within 10km radius",
        })
      }
    } catch (error) {
      console.error("Error searching location:", error)
      toast({
        title: "Error",
        description: "Failed to search for stores in this location",
        variant: "destructive",
      })
    }
  }

  const viewStoreDetails = async (store: ExtendedStoreType) => {
    setSelectedStore(store)

    try {
      // Fetch products for the selected store
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      // Fix type conversion with proper type assertion
      setStoreProducts(data as unknown as Product[])
    } catch (error) {
      console.error("Error fetching store products:", error)
      toast({
        title: "Error",
        description: "Failed to load store products",
        variant: "destructive",
      })
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  // Replace the inline loading with the Loader component
  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-slate-100">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 slide-in-right">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">TechRadar</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-slate-700 font-medium">{customer?.name}</span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsChatbotOpen(true)}
              className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-slate-600 hover:text-blue-700"
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Find Tech Products Near You</h2>
            <p className="text-slate-600">Search for nearby tech stores and browse their products</p>
          </div>

          <Card className="mb-8 border-blue-100 shadow-md overflow-hidden relative bg-white">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-sky-400"></div>
            <CardHeader className="border-b border-blue-50">
              <CardTitle className="text-slate-800">Search for Stores</CardTitle>
              <CardDescription className="text-slate-500">Enter a location to find tech stores nearby</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Search for a location (e.g., Mumbai, Delhi, Bangalore)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-blue-100 focus:border-blue-300 focus:ring-blue-200 bg-white text-slate-900"
                />
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 border-0"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </form>

              {/* Location permission status */}
              {locationPermissionStatus && (
                <div className="mt-3 text-sm flex items-center gap-2 text-blue-600">
                  <MapPin className="h-4 w-4" />
                  <p>{locationPermissionStatus}</p>
                </div>
              )}


              {/* Search results section */}
              {searchResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-4 font-medium text-slate-800">Nearby Stores</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {searchResults.map((store) => {
                      // Calculate distance from search location
                      const distance = searchLocation ? 
                        calculateDistance(
                          searchLocation.lat,
                          searchLocation.lng,
                          store.latitude || 0,
                          store.longitude || 0
                        ) : 0;
                        
                      return (
                        <Card key={store.id} className="overflow-hidden border-blue-100 hover:shadow-md transition-all duration-300 bg-white">
                          <CardHeader className="p-4 bg-blue-50/50">
                            <CardTitle className="text-lg text-blue-700">{store.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 text-slate-600">
                              <MapPin className="h-3 w-3" />
                              {store.address}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 pt-3">
                            {searchLocation && (
                              <p className="text-sm text-slate-600 mb-3">
                                <span className="font-medium">{distance.toFixed(2)} km</span> from search location
                              </p>
                            )}
                            <Button 
                              variant="outline" 
                              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700" 
                              onClick={() => viewStoreDetails(store)}
                            >
                              View Details
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Only render the store details card when a store is selected */}
          {selectedStore && (
            <Card className="border-blue-100 shadow-md overflow-hidden relative bg-white">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-sky-400"></div>
              <CardHeader className="border-b border-blue-50">
                <CardTitle className="text-slate-800">{selectedStore.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-slate-600">
                  <MapPin className="h-3 w-3" />
                  {selectedStore.address}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-medium text-blue-700">Available Products</h3>
                {storeProducts.length === 0 ? (
                  <p className="text-slate-500">No products available at this store.</p>
                ) : (
                  <div className="rounded-md border border-blue-100 overflow-hidden bg-white">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-blue-50/50">
                          <th className="p-3 text-left font-medium text-slate-700">Name</th>
                          <th className="p-3 text-left font-medium text-slate-700">Category</th>
                          <th className="p-3 text-left font-medium text-slate-700">Price</th>
                          <th className="p-3 text-left font-medium text-slate-700">Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeProducts.map((product) => (
                          <tr key={product.id} className="border-b hover:bg-blue-50/30 transition-colors">
                            <td className="p-3 text-slate-800">{product.name}</td>
                            <td className="p-3 capitalize text-slate-600">{product.category}</td>
                            <td className="p-3 text-slate-800">${product.price.toFixed(2)}</td>
                            <td className="p-3 text-slate-800">{product.stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Store Location Map */}
                <div className="mt-8">
                  <h3 className="mb-4 text-lg font-medium text-blue-700">Store Location</h3>
                  <div className="rounded-lg overflow-hidden border border-blue-100 shadow-sm">
                    <div id="store-detail-map" className="h-[300px] w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <footer className="border-t border-blue-100 bg-white mt-auto">
        <div className="container flex flex-col gap-2 sm:flex-row py-6 items-center justify-between">
          <p className="text-sm text-slate-500">© 2023 TechRadar. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">Help</a>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">Contact</a>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">Privacy</a>
          </div>
        </div>
      </footer>
      
      {/* Chatbot button */}
      <div 
        className="fixed bottom-6 right-6 z-[9999]" 
        style={{ pointerEvents: 'auto' }}
      >
        <button 
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center"
          style={{ 
            width: '64px', 
            height: '64px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)'
          }}
          aria-label="Open customer support chat"
          title="Need help? Chat with our assistant"
        >
          {isChatbotOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          )}
        </button>
      </div>
      
      {/* Chatbot component */}
      {isChatbotOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-10 z-[9998]">
          <div className="absolute bottom-24 right-6">
            <ChatBot onClose={() => setIsChatbotOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

