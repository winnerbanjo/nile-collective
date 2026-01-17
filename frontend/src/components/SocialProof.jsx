import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

// Winner names with locations - Updated list
const names = [
  { name: 'Winner', location: 'Lagos' },
  { name: 'Chidi', location: 'Port Harcourt' },
  { name: 'Tolu', location: 'Ibadan' },
  { name: 'Hadiza', location: 'Abuja' },
  { name: 'Nneka', location: 'Enugu' },
  { name: 'Kwame', location: 'Accra' }
]

const messages = [
  'just purchased',
  'just added to their bag',
  'recently bought',
  'just ordered'
]

const SocialProof = () => {
  const [notification, setNotification] = useState(null)
  const [products, setProducts] = useState([])
  const [isEnabled, setIsEnabled] = useState(true) // Safety flag

  useEffect(() => {
    // Self-contained error handling - if this fails, component just won't show notifications
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://nile-backend-9wdk.onrender.com/api/products', {
          timeout: 5000 // 5 second timeout
        })
        if (Array.isArray(response.data) && response.data.length > 0) {
          setProducts(response.data)
        } else {
          setIsEnabled(false) // Disable if no products
        }
      } catch (error) {
        // Silently fail - don't crash the app
        setIsEnabled(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    // Self-contained - if anything fails, just don't show notifications
    if (!isEnabled || products.length === 0) return

    try {
      const showNotification = () => {
        try {
          const randomName = names[Math.floor(Math.random() * names.length)]
          const randomProduct = products[Math.floor(Math.random() * products.length)]
          const randomMessage = messages[Math.floor(Math.random() * messages.length)]
          
          if (randomProduct?.name && randomName?.name) {
            setNotification({
              name: randomName.name,
              location: randomName.location,
              product: randomProduct.name,
              message: randomMessage
            })

            // Auto-hide after 5 seconds
            setTimeout(() => {
              setNotification(null)
            }, 5000)
          }
        } catch (error) {
          // Silently fail - don't crash
        }
      }

      // Initial delay, then show every 45 seconds
      const initialDelay = Math.random() * 10000 + 10000 // 10-20 seconds
      const interval = setInterval(() => {
        showNotification()
      }, 45000) // 45 seconds interval

      const timeout = setTimeout(() => {
        showNotification()
      }, initialDelay)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    } catch (error) {
      // If setup fails, disable component
      setIsEnabled(false)
    }
  }, [products, isEnabled])

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-6 z-50 max-w-sm"
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-sm font-light text-black">
                    {notification.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-light text-gray-600 mb-1">
                  <span className="font-medium text-black">{notification.name}</span> from {notification.location}
                </p>
                <p className="text-sm font-light text-black">
                  {notification.message === 'just purchased' ? (
                    <>Verified: <span className="font-medium">{notification.name}</span> just purchased <span className="font-medium">{notification.product}</span> ✨</>
                  ) : (
                    <><span className="font-medium">{notification.name}</span> just added <span className="font-medium">{notification.product}</span> to their bag! 👜</>
                  )}
                </p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SocialProof
