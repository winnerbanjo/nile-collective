import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'

// Define formatPrice function outside component
const formatPrice = (price) => {
  const safePrice = price || 0
  return new Intl.NumberFormat('en-NG', { 
    style: 'currency', 
    currency: 'NGN' 
  }).format(safePrice)
}

const CartDrawer = () => {
  const navigate = useNavigate()
  const {
    cartItems,
    removeFromCart,
    getTotalPrice,
    clearCart,
    isDrawerOpen,
    setIsDrawerOpen
  } = useCart()
  const [step, setStep] = useState(1) // 1 = Bag View, 2 = Checkout View
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('Paystack') // 'Paystack' or 'Bank Transfer'
  const [receiptFile, setReceiptFile] = useState(null)
  const [receiptPreview, setReceiptPreview] = useState(null)
  const [showCartSummary, setShowCartSummary] = useState(false) // For collapsing cart in step 2
  const [shippingDetails, setShippingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria'
  })

  // Calculate shipping fee based on state/country
  const getShippingFee = () => {
    if (shippingDetails.country === 'Nigeria') {
      // Abuja: Free shipping
      if (shippingDetails.state === 'Abuja') {
        return 0
      }
      // Lagos: ₦5,000
      if (shippingDetails.state === 'Lagos') {
        return 5000
      }
      // Rest of Nigeria: ₦10,000
      if (shippingDetails.state && shippingDetails.state !== '') {
        return 10000
      }
      // If country is Nigeria but state not selected yet, return 0
      return 0
    } else if (shippingDetails.country && shippingDetails.country !== '') {
      // International: ₦30,000
      return 30000
    }
    return 0
  }

  const shippingFee = getShippingFee()
  const subtotal = getTotalPrice()
  const grandTotal = subtotal + shippingFee

  // Paystack public key - hardcoded (DO NOT REMOVE)
  // Live Key: pk_live_8a8770480c060bf0555068a2799f96aecbdda177
  const publicKey = 'pk_live_8a8770480c060bf0555068a2799f96aecbdda177'

  const handlePaymentSuccess = useCallback(async (response) => {
    // Payment successful
    
    const currentOrderId = orderId
    if (!currentOrderId) {
      setIsProcessing(false)
      return
    }

    try {
      // Verify payment with backend
      const verifyResponse = await axios.post(`https://nile-backend-9wdk.onrender.com/api/orders/verify`, {
        reference: response.reference,
        orderId: currentOrderId
      })

      if (verifyResponse.data.success) {
        // Clear cart and redirect to success page
        clearCart()
        setStep(1) // Reset to step 1
        setIsDrawerOpen(false)
        navigate('/success', { 
          state: { 
            message: 'Your order has been confirmed. Thank you for your purchase!',
            isManualOrder: false,
            orderId: currentOrderId
          } 
        })
      } else {
        alert('Payment verification failed. Please contact support.')
      }
    } catch (error) {
      // Show detailed error message
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error'
      alert(`Payment Verification Error: ${errorMessage}\n\nPlease contact support with this error message.`)
    } finally {
      setIsProcessing(false)
      setOrderId(null)
    }
  }, [orderId, clearCart, setIsDrawerOpen])

  const handleReceiptChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setReceiptFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleManualOrder = async () => {
    if (cartItems.length === 0) return

    // Validate shipping details
    if (!shippingDetails.name || !shippingDetails.email || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.city || !shippingDetails.country) {
      alert('Please fill in all shipping details')
      return
    }

    if (shippingDetails.country === 'Nigeria' && !shippingDetails.state) {
      alert('Please select a state')
      return
    }

    if (!receiptFile) {
      alert('Please upload your payment receipt')
      return
    }

    setIsProcessing(true)

    try {
      // First, upload receipt to Cloudinary
      const formData = new FormData()
      formData.append('image', receiptFile)

      const uploadResponse = await axios.post(`https://nile-backend-9wdk.onrender.com/api/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const receiptUrl = uploadResponse.data.url

      // Create manual order
      const orderData = {
        items: Array.isArray(cartItems) && cartItems.length > 0 ? cartItems?.map(item => ({
          productId: item?._id || item?.productId,
          name: item?.name || 'Unknown Product',
          price: item?.price || 0,
          quantity: item?.quantity || 1,
          size: item?.selectedSize || '',
          color: item?.selectedColor || ''
        })).filter(item => item.productId) : [],
        totalAmount: grandTotal,
        shippingFee: shippingFee,
        shippingDetails: {
          name: shippingDetails.name,
          email: shippingDetails.email,
          phone: shippingDetails.phone,
          address: shippingDetails.address,
          city: shippingDetails.city,
          state: shippingDetails.state || '',
          country: shippingDetails.country
        },
        receiptUrl: receiptUrl
      }

      // Creating manual order
      console.log('Creating manual order with data:', orderData)
      const orderResponse = await axios.post(`https://nile-backend-9wdk.onrender.com/api/orders/manual`, orderData)
      console.log('Manual order response:', orderResponse.data)

      if (orderResponse.data.success) {
        // Clear cart and redirect to success page
        clearCart()
        setStep(1) // Reset to step 1
        setIsDrawerOpen(false)
        setReceiptFile(null)
        setReceiptPreview(null)
        navigate('/success', { 
          state: { 
            message: 'Success! We will verify your transfer and notify you shortly.',
            isManualOrder: true,
            orderId: orderResponse.data.order?._id || orderResponse.data.orderId
          } 
        })
      } else {
        alert('Failed to submit order. Please try again.')
      }
    } catch (error) {
      // Get specific error message
      let errorMessage = 'Failed to submit order. Please try again.'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Check for specific error types
      if (errorMessage.includes('Cloudinary') || errorMessage.includes('cloudinary')) {
        errorMessage = 'Cloudinary upload error: ' + errorMessage
      } else if (errorMessage.includes('No image file provided') || errorMessage.includes('File')) {
        errorMessage = 'File upload error: ' + errorMessage
      } else if (error.response?.status === 413) {
        errorMessage = 'File too large. Please use an image smaller than 5MB.'
      } else if (error.response?.status === 400) {
        errorMessage = 'Upload error: ' + errorMessage
      } else if (!error.response) {
        errorMessage = 'Network error: Unable to connect to server. Please check your connection.'
      }
      
      alert(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) return

    // Validate shipping details
    if (!shippingDetails.name || !shippingDetails.email || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.city || !shippingDetails.country) {
      alert('Please fill in all shipping details')
      return
    }

    if (shippingDetails.country === 'Nigeria' && !shippingDetails.state) {
      alert('Please select a state')
      return
    }

    setIsProcessing(true)
    
    try {
      // Create order first
      const orderData = {
        items: Array.isArray(cartItems) && cartItems.length > 0 ? cartItems?.map(item => ({
          productId: item?._id || item?.productId,
          name: item?.name || 'Unknown Product',
          price: item?.price || 0,
          quantity: item?.quantity || 1,
          size: item?.selectedSize || '',
          color: item?.selectedColor || ''
        })).filter(item => item.productId) : [],
        totalAmount: grandTotal,
        shippingFee: shippingFee,
        shippingDetails: {
          name: shippingDetails.name,
          email: shippingDetails.email,
          phone: shippingDetails.phone,
          address: shippingDetails.address,
          city: shippingDetails.city,
          state: shippingDetails.state || '',
          country: shippingDetails.country
        }
      }

      console.log('Creating order with data:', orderData)
      const orderResponse = await axios.post(`https://nile-backend-9wdk.onrender.com/api/orders`, orderData)
      console.log('Order creation response:', orderResponse.data)
      
      if (!orderResponse.data.success || !orderResponse.data.orderId) {
        throw new Error(orderResponse.data.message || 'Failed to create order')
      }
      
      const newOrderId = orderResponse.data.orderId
      setOrderId(newOrderId)

      // Check if Paystack script is loaded
      if (typeof window.PaystackPop === 'undefined') {
        alert('Paystack script not loaded. Please refresh the page and try again.')
        setIsProcessing(false)
        return
      }

      // Calculate amount (including shipping) - ensure it's an integer
      const amountInKobo = Math.round(Number(grandTotal) * 100)
      console.log('Amount in kobo:', amountInKobo, 'Grand total:', grandTotal)
      // Paystack email - hardcoded (DO NOT REMOVE)
      const email = 'business@nile.ng'
      
      if (amountInKobo <= 0) {
        alert('Invalid payment amount. Please add items to your cart.')
        setIsProcessing(false)
        return
      }

      // Use PaystackPop.setup() directly - Vanilla JS
      // Live Key: pk_live_8a8770480c060bf0555068a2799f96aecbdda177 (DO NOT REMOVE)
      const handler = window.PaystackPop.setup({
        key: 'pk_live_8a8770480c060bf0555068a2799f96aecbdda177',
        email: email,
        amount: amountInKobo,
        currency: 'NGN',
        ref: new Date().getTime().toString(),
        metadata: {
          orderId: newOrderId,
          custom_fields: [
            {
              display_name: 'Cart Items',
              variable_name: 'cart_items',
              value: 'Nile Collective Order'
            }
          ]
        },
        callback: function(response) {
          handlePaymentSuccess(response)
        },
        onClose: function() {
          setIsProcessing(false)
          setOrderId(null)
        }
      })
      
      handler.openIframe()
    } catch (error) {
      console.error('Checkout initialization error:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      })
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initialize checkout. Please try again.'
      alert(errorMessage)
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* Overlay with backdrop blur - Below drawer but above navbar */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[55] transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Drawer - Higher z-index than navbar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-xl z-[60] transform transition-all duration-500 ease-out ${
          isDrawerOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        style={{
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-2xl font-serif text-black">
              {step === 1 ? 'Your Bag 🛒' : 'Checkout 🔒'}
            </h2>
            <button
              onClick={() => {
                setIsDrawerOpen(false)
                setStep(1) // Reset to step 1 when closing
              }}
              className="text-black hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Main Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto relative">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                // STEP 1: Your Bag
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  {cartItems.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-sm font-light text-gray-600">Your bag is empty 🛍️</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Array.isArray(cartItems) && cartItems.length > 0 ? (
                        cartItems?.map((item, index) => {
                          if (!item || !item._id) return null
                          return (
                            <div 
                              key={item.cartItemId || item._id} 
                              className="flex gap-4 pb-6 border-b border-gray-100 animate-fadeIn"
                              style={{
                                animation: `fadeIn 0.3s ease-out ${index * 0.1}s both`
                              }}
                            >
                              {/* Product Image */}
                              <div className="w-20 h-24 flex-shrink-0 overflow-hidden bg-gray-50">
                                <img
                                  src={item.imageUrl || 'https://via.placeholder.com/80x96/f5f5f5/999999?text=No+Image'}
                                  alt={item.name}
                                  className="w-full h-full object-cover object-top"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/80x96/f5f5f5/999999?text=No+Image'
                                  }}
                                />
                              </div>

                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-light text-gray-500 uppercase tracking-[0.15em] mb-1">
                                  {item.merchantName}
                                </p>
                                <h3 className="text-sm font-sans font-light text-black mb-1 truncate">
                                  {item.name}
                                </h3>
                                {/* Display Size and Color if available */}
                                {(item.selectedSize || item.selectedColor) && (
                                  <p className="text-xs font-light text-gray-600 mb-1">
                                    {item.selectedSize && `Size: ${item.selectedSize}`}
                                    {item.selectedSize && item.selectedColor && ' • '}
                                    {item.selectedColor && `Color: ${item.selectedColor}`}
                                  </p>
                                )}
                                <p className="text-sm font-sans font-light text-black mb-2">
                                  {formatPrice(item?.price)}
                                  {item.quantity > 1 && (
                                    <span className="text-gray-500 ml-2">× {item.quantity}</span>
                                  )}
                                </p>
                                <button
                                  onClick={() => removeFromCart(item.cartItemId || item._id)}
                                  className="flex items-center gap-1 text-gray-400 hover:text-red-600 transition-colors hover:scale-110 active:scale-95"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-sm font-light text-gray-600">Your cart is empty</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                // STEP 2: Checkout
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 pt-8 space-y-6"
                >
                  {/* Back to Bag Button */}
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-sm font-light text-black hover:text-gray-600 transition-colors mb-6 underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Bag
                  </button>
                  
                  {/* Collapsible Cart Summary */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setShowCartSummary(!showCartSummary)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm font-light text-black uppercase tracking-wider">
                        Order Summary ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-600 transition-transform ${showCartSummary ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {showCartSummary && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 space-y-3 border-t border-gray-200">
                            {Array.isArray(cartItems) && cartItems.length > 0 ? cartItems?.map((item) => {
                              if (!item || !item._id) return null
                              return (
                                <div key={item.cartItemId || item._id} className="flex gap-3 text-sm">
                                  <div className="w-16 h-16 flex-shrink-0 overflow-hidden bg-gray-50 rounded">
                                    <img
                                      src={item.imageUrl || 'https://via.placeholder.com/64x64/f5f5f5/999999?text=No+Image'}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-light text-black truncate">{item.name}</p>
                                    <p className="text-xs font-light text-gray-600">
                                      {formatPrice(item?.price)} × {item.quantity}
                                    </p>
                                  </div>
                                </div>
                              )
                            }) : (
                              <p className="text-xs font-light text-gray-600 text-center py-2">No items</p>
                            )}
                            <div className="pt-3 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-light text-gray-600 uppercase tracking-wider">Subtotal</span>
                                <span className="text-sm font-light text-black">{formatPrice(subtotal)}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Shipping Details Form */}
                  <div className="space-y-4 bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-light text-black uppercase tracking-wider">Shipping Details 🚚</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-light text-gray-600 uppercase tracking-wider mb-1">
                      👤 Full Name *
                    </label>
                    <input
                      type="text"
                      value={shippingDetails.name}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm font-light border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black transition-all hover:border-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-light text-gray-600 uppercase tracking-wider mb-1">
                      ✉️ Email *
                    </label>
                    <input
                      type="email"
                      value={shippingDetails.email}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm font-light border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black transition-all hover:border-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-light text-gray-600 uppercase tracking-wider mb-1">
                      📞 Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingDetails.phone}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm font-light border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black transition-all hover:border-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-light text-gray-600 uppercase tracking-wider mb-1">
                      🌍 Country *
                    </label>
                    <select
                      value={shippingDetails.country}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, country: e.target.value, state: '' })}
                      className="w-full px-3 py-2 text-sm font-light border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black transition-all hover:border-gray-400"
                      required
                    >
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Kenya">Kenya</option>
                      <option value="South Africa">South Africa</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Other">Other (International)</option>
                    </select>
                  </div>
                  {shippingDetails.country === 'Nigeria' && (
                    <div>
                      <label className="block text-xs font-light text-gray-600 uppercase tracking-wider mb-1">
                        🗺️ State *
                      </label>
                      <select
                        value={shippingDetails.state}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                        className="w-full px-3 py-2 text-sm font-light border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black transition-all hover:border-gray-400"
                        required
                      >
                      <option value="">Select State</option>
                      <option value="Abuja">Abuja (Free Shipping ✨)</option>
                      <option value="Lagos">Lagos</option>
                      <option value="Kano">Kano</option>
                      <option value="Rivers">Rivers</option>
                      <option value="Ogun">Ogun</option>
                      <option value="Oyo">Oyo</option>
                      <option value="Kaduna">Kaduna</option>
                      <option value="Enugu">Enugu</option>
                      <option value="Delta">Delta</option>
                      <option value="Other">Other</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-light text-gray-600 uppercase tracking-wider mb-1">
                      📍 Street Address *
                    </label>
                    <input
                      type="text"
                      value={shippingDetails.address}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                      className="w-full px-3 py-2 text-sm font-light border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black transition-all hover:border-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-light text-gray-600 uppercase tracking-wider mb-1">
                      🏙️ City *
                    </label>
                    <input
                      type="text"
                      value={shippingDetails.city}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                      className="w-full px-3 py-2 text-sm font-light border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black transition-all hover:border-gray-400"
                      required
                    />
                  </div>
                </div>
                    {/* Disclaimer Notice */}
                    <p className="text-xs italic text-gray-500 mt-3">
                      Note: Shipping fees are subject to change depending on the specific delivery location and item weight.
                    </p>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-light text-black uppercase tracking-wider">Payment Method 💳</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPaymentMethod('Paystack')}
                        className={`flex-1 py-2 px-4 text-sm font-light uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${
                          paymentMethod === 'Paystack'
                            ? 'bg-black text-white'
                            : 'bg-white text-black hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        💳 Paystack
                      </button>
                      <button
                        onClick={() => setPaymentMethod('Bank Transfer')}
                        className={`flex-1 py-2 px-4 text-sm font-light uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${
                          paymentMethod === 'Bank Transfer'
                            ? 'bg-black text-white'
                            : 'bg-white text-black hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        🏦 Bank Transfer
                      </button>
                    </div>

                    {/* Bank Transfer Details - Animated */}
                    <AnimatePresence>
                      {paymentMethod === 'Bank Transfer' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 space-y-3 border-t border-gray-200 mt-4">
                            <h4 className="text-xs font-light text-black uppercase tracking-wider">
                              Transfer Details
                            </h4>
                            <div className="space-y-2 text-sm bg-white p-3 rounded border border-gray-200">
                              <div>
                                <span className="text-gray-600 font-light">Bank:</span>
                                <span className="text-black font-light ml-2">Zenith Bank</span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-light">Account Name:</span>
                                <span className="text-black font-light ml-2">NILE AFRICA TECHNOLOGIES LTD</span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-light">Account Number:</span>
                                <span className="text-black font-light ml-2">1229851938</span>
                              </div>
                            </div>

                            {/* Receipt Upload */}
                            <div className="mt-3">
                              <label className="block text-xs font-light text-gray-600 uppercase tracking-wider mb-2">
                                Upload Payment Receipt (Screenshot/Image)
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleReceiptChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-light file:bg-black file:text-white hover:file:bg-gray-900 cursor-pointer"
                              />
                              {receiptPreview && (
                                <div className="mt-3">
                                  <img
                                    src={receiptPreview}
                                    alt="Receipt preview"
                                    className="max-w-full h-32 object-contain border border-gray-200 rounded"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Back to Bag Button */}
                  <button
                    onClick={() => setStep(1)}
                    className="w-full py-2 px-4 text-sm font-light text-black uppercase tracking-wider border border-gray-300 rounded hover:bg-gray-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    ← Back to Bag
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky Footer - Only show when cart has items */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 bg-white flex-shrink-0">
              {step === 1 ? (
                // Step 1 Footer: Subtotal + Proceed Button
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-light text-gray-600 uppercase tracking-wider">Subtotal</span>
                    <span className="text-lg font-light text-black">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-black text-white text-sm font-light uppercase tracking-wider py-3 px-4 hover:bg-gray-900 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Proceed to Shipping →
                  </button>
                </div>
              ) : (
                // Step 2 Footer: Shipping Fee + Grand Total + Checkout Button
                <div className="p-6 space-y-4">
                  {shippingDetails.state && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-light text-gray-600 uppercase tracking-wider">
                        🚚 Shipping Fee {shippingDetails.country === 'Nigeria' ? '🇳🇬' : '🌍'}
                        {shippingDetails.state === 'Abuja' && (
                          <span className="ml-2 text-green-600 text-xs font-normal normal-case">(Free!)</span>
                        )}
                      </span>
                      <span className="font-light text-black">
                        {shippingFee === 0 ? (
                          <span className="text-green-600 font-medium">Free ✨</span>
                        ) : (
                          formatPrice(shippingFee)
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm font-light text-gray-900 uppercase tracking-wider">Grand Total</span>
                    <span className="text-xl font-light text-black">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                  <button 
                    onClick={paymentMethod === 'Paystack' ? handleCheckout : handleManualOrder}
                    disabled={
                      isProcessing || 
                      !shippingDetails.name || 
                      !shippingDetails.email || 
                      !shippingDetails.phone || 
                      !shippingDetails.address || 
                      !shippingDetails.city ||
                  !shippingDetails.country ||
                  (shippingDetails.country === 'Nigeria' && !shippingDetails.state) ||
                  (shippingDetails.country === 'Nigeria' && shippingDetails.state !== 'Abuja' && shippingFee === 0) ||
                  (paymentMethod === 'Bank Transfer' && !receiptFile)
                    }
                    className="w-full bg-black text-white text-sm font-light uppercase tracking-wider py-3 px-4 hover:bg-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isProcessing 
                      ? 'Processing... ⏳' 
                      : paymentMethod === 'Paystack' 
                        ? '🔒 Secure Checkout' 
                        : 'Submit Order ✨'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CartDrawer
