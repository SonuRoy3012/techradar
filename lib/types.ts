export interface Store {
  id: string
  name: string
  address: string
  owner_name: string
  phone_number: string
  email: string
  created_at: string
}

export interface Product {
  id: string
  store_id: string
  category: "phone" | "laptop" | "accessories"
  name: string
  price: number
  stock: number
  created_at: string
}

export interface Customer {
  id: string
  name: string
  email: string
  created_at: string
}

