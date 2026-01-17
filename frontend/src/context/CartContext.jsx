import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  // Initialize cart as empty array to prevent undefined errors
  const [cartItems, setCartItems] = useState([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Load cart from localStorage or user account on mount
  useEffect(() => {
    const loadCart = async () => {
      const userId = localStorage.getItem('userId')
      const savedCart = localStorage.getItem('cart')
      
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          setCartItems(Array.isArray(parsedCart) ? parsedCart : [])
        } catch (error) {
          console.error('Error parsing saved cart:', error)
          setCartItems([])
        }
      }

      // If user is logged in, try to sync with server cart
      if (userId) {
        await loadUserCart(userId)
      }
    }
    
    loadCart()
  }, [])

  const loadUserCart = async (userId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/${userId}/cart`)
      if (response.data?.success && Array.isArray(response.data.cart)) {
        setCartItems(response.data.cart)
        localStorage.setItem('cart', JSON.stringify(response.data.cart))
      } else {
        // Ensure cart is always an array
        setCartItems([])
      }
    } catch (error) {
      console.error('Error loading user cart:', error)
      // On error, ensure cart is still an array
      setCartItems([])
    }
  }

  const saveCart = async (items) => {
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(items))
    
    // Save to server if user is logged in
    const userId = localStorage.getItem('userId')
    if (userId) {
      try {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/${userId}/cart`, {
          cart: items
        })
      } catch (error) {
        console.error('Error saving cart to server:', error)
      }
    }
  }

  const addToCart = (product, selectedSize = '', selectedColor = '') => {
    // Safety check - ensure product exists before proceeding
    if (!product || !product._id) {
      console.error('Cannot add to cart: Product is invalid or missing ID')
      return
    }

    try {
      setCartItems(prevItems => {
        // Ensure prevItems is always an array
        const safePrevItems = Array.isArray(prevItems) ? prevItems : []
        
        // Create unique cart item ID based on product ID + size + color
        const cartItemId = `${product._id}-${selectedSize || ''}-${selectedColor || ''}`
        
        // Check if this exact variant already exists in cart
        const existingItem = safePrevItems.find(item => item?.cartItemId === cartItemId)
        
        let updatedItems
        if (existingItem) {
          // If exists, increment quantity
          updatedItems = safePrevItems?.map(item =>
            item?.cartItemId === cartItemId
              ? { ...item, quantity: (item.quantity || 0) + 1 }
              : item
          )
        } else {
          // If new, add with quantity 1, including size and color
          updatedItems = [...safePrevItems, { 
            ...product, 
            quantity: 1,
            cartItemId,
            selectedSize: selectedSize || '',
            selectedColor: selectedColor || ''
          }]
        }
        
        // Save cart after update
        saveCart(updatedItems)
        
        return updatedItems
      })
      // Open drawer when item is added
      setIsDrawerOpen(true)
    } catch (error) {
      console.error('Error adding to cart:', error)
      // Don't crash - just log the error
    }
  }

  const removeFromCart = (cartItemId) => {
    setCartItems(prevItems => {
      // Force prevItems to be an array
      const safePrevItems = Array.isArray(prevItems) ? prevItems : []
      // Filter OUT the item with matching cartItemId (or _id as fallback)
      const updated = safePrevItems.filter(item => {
        // Remove item if cartItemId matches, or if no cartItemId exists and _id matches
        const itemId = item?.cartItemId || item?._id
        return itemId !== cartItemId
      })
      saveCart(updated)
      return updated
    })
  }

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId)
      return
    }
    setCartItems(prevItems => {
      // Force prevItems to be an array
      const safePrevItems = Array.isArray(prevItems) ? prevItems : []
      const updated = safePrevItems?.map(item =>
        item?.cartItemId === cartItemId ? { ...item, quantity } : item
      )
      saveCart(updated)
      return updated
    })
  }

  const getTotalPrice = () => {
    // Force cartItems to be an array before processing
    const safeCart = Array.isArray(cartItems) ? cartItems : []
    return safeCart.reduce((total, item) => {
      if (!item) return total
      const price = item?.price || 0
      const quantity = item?.quantity || 0
      return total + (price * quantity)
    }, 0)
  }

  const getCartItemCount = () => {
    // Force cartItems to be an array before processing
    const safeCart = Array.isArray(cartItems) ? cartItems : []
    return safeCart.reduce((count, item) => {
      if (!item) return count
      return count + (item?.quantity || 0)
    }, 0)
  }

  const clearCart = () => {
    setCartItems([])
    saveCart([])
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getCartItemCount,
    clearCart,
    isDrawerOpen,
    setIsDrawerOpen
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
