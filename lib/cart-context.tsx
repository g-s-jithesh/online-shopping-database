"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSupabase } from "@/components/supabase-provider"

export interface CartItem {
  product_no: number
  p_description: string
  product_price: number
  product_image?: string
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: any, quantity?: number) => void
  removeFromCart: (productNo: number) => void
  updateQuantity: (productNo: number, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getCartTotal: () => 0,
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const { user } = useSupabase()

  // Load cart from localStorage or Supabase on initial render
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        // Load cart from Supabase if user is authenticated
        const supabase = createClient()
        const { data, error } = await supabase.from("app_user").select("user_cart").eq("user_id", user.id).single()

        if (!error && data) {
          setCartItems(data.user_cart || [])
        }
      } else {
        // Load cart from localStorage if user is not authenticated
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
          try {
            setCartItems(JSON.parse(savedCart))
          } catch (error) {
            console.error("Failed to parse cart from localStorage:", error)
          }
        }
      }
    }

    loadCart()
  }, [user])

  // Save cart to localStorage or Supabase whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      if (user) {
        // Save cart to Supabase if user is authenticated
        const supabase = createClient()
        await supabase.from("app_user").update({ user_cart: cartItems }).eq("user_id", user.id)
      } else {
        // Save cart to localStorage if user is not authenticated
        localStorage.setItem("cart", JSON.stringify(cartItems))
      }
    }

    saveCart()
  }, [cartItems, user])

  const addToCart = (product: any, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.product_no === product.product_no)

      if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += quantity
        return updatedItems
      } else {
        // Add new product to cart
        return [
          ...prevItems,
          {
            product_no: product.product_no,
            p_description: product.p_description,
            product_price: product.product_price,
            product_image: product.product_image,
            quantity,
          },
        ]
      }
    })
  }

  const removeFromCart = (productNo: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product_no !== productNo))
  }

  const updateQuantity = (productNo: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productNo)
      return
    }

    setCartItems((prevItems) => prevItems.map((item) => (item.product_no === productNo ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.product_price * item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
