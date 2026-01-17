import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useCurrency } from '../context/CurrencyContext'

const OrderSummary = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { formatPrice } = useCurrency()

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`https://nile-backend-9wdk.onrender.com/api/orders/${id}`)
        setOrder(response.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('Order not found')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchOrder()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-sm font-light text-gray-600">Loading order...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-sm font-light text-red-600 mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-black text-white px-6 py-2 text-sm font-light uppercase tracking-wider hover:bg-gray-900 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Thank You Message */}
        <div className="text-center mb-12">
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
          <h1 className="text-4xl font-light text-black mb-4">
            Order Confirmed ✨
          </h1>
          <p className="text-base font-light text-gray-600">
            Thank you for your purchase! Your order has been confirmed and is being processed.
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-light text-black mb-6 uppercase tracking-wider">
            Order Summary
          </h2>

          {/* Order Details */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-sm font-light text-gray-600 uppercase tracking-wider">Order ID</span>
              <span className="text-sm font-light text-black">{order._id}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-sm font-light text-gray-600 uppercase tracking-wider">Status</span>
              <span className={`text-sm font-light uppercase tracking-wider px-3 py-1 ${
                order.status === 'paid' || order.status === 'Paid' || order.status === 'Delivered'
                  ? 'bg-green-100 text-green-800'
                  : order.status === 'Pending Verification' || order.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {order.status}
              </span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-sm font-light text-gray-600 uppercase tracking-wider">Payment Method</span>
              <span className="text-sm font-light text-black">{order.paymentMethod || 'N/A'}</span>
            </div>
            {order.shippingFee > 0 && (
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-sm font-light text-gray-600 uppercase tracking-wider">Shipping Fee</span>
                <span className="text-sm font-light text-black">{formatPrice(order.shippingFee)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-4">
              <span className="text-lg font-light text-black uppercase tracking-wider">Total Amount</span>
              <span className="text-xl font-light text-black">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h3 className="text-sm font-light text-gray-600 uppercase tracking-wider mb-4">
              Items Ordered
            </h3>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-20 h-24 flex-shrink-0 bg-gray-50">
                    {/* Product image would go here if available */}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-light text-black mb-1">{item.name}</p>
                    {item.size && (
                      <p className="text-xs font-light text-gray-600">Size: {item.size}</p>
                    )}
                    {item.color && (
                      <p className="text-xs font-light text-gray-600">Color: {item.color}</p>
                    )}
                    <p className="text-sm font-light text-black mt-2">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Details */}
          {order.shippingDetails && (
            <div>
              <h3 className="text-sm font-light text-gray-600 uppercase tracking-wider mb-4">
                Shipping Address
              </h3>
              <div className="space-y-2 text-sm font-light text-black">
                <p>{order.shippingDetails.name}</p>
                <p>{order.shippingDetails.address}</p>
                {order.shippingDetails.city && (
                  <p>{order.shippingDetails.city}{order.shippingDetails.state ? `, ${order.shippingDetails.state}` : ''}</p>
                )}
                {order.shippingDetails.country && (
                  <p>{order.shippingDetails.country}</p>
                )}
                <p className="mt-2">{order.shippingDetails.email}</p>
                {order.shippingDetails.phone && (
                  <p>{order.shippingDetails.phone}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-black text-white px-8 py-3 text-sm font-light uppercase tracking-wider hover:bg-gray-900 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
