import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Success = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Get message from location state or use default
    const stateMessage = location.state?.message
    if (stateMessage) {
      setMessage(stateMessage)
    } else {
      // Default message if no state passed
      setMessage('Your order has been confirmed. Thank you for your purchase!')
    }
  }, [location])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] px-4">
        <div className="bg-white p-8 md:p-12 max-w-md w-full text-center shadow-lg">
          <div className="mb-6">
            <svg 
              className="w-20 h-20 mx-auto text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <h1 className="text-3xl font-light text-black mb-4">
            {location.state?.isManualOrder 
              ? 'Order Received! ✨' 
              : 'Payment Successful ✨'}
          </h1>
          <p className="text-sm font-light text-gray-600 mb-8 leading-relaxed">
            {message}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-black text-white px-8 py-3 text-sm font-light uppercase tracking-wider hover:bg-gray-900 transition-colors"
            >
              Continue Shopping
            </button>
            {location.state?.orderId && (
              <button
                onClick={() => navigate(`/order-confirmation/${location.state.orderId}`)}
                className="w-full bg-gray-100 text-black px-8 py-3 text-sm font-light uppercase tracking-wider hover:bg-gray-200 transition-colors"
              >
                View Your Order
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Success
