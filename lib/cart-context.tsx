"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems))
  }, [cartItems])

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
