import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { formatNaira } from '../utils/formatPrice'

const TrackOrder = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [orderId, setOrderId] = useState(searchParams.get('id') || '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOrder = async (id) => {
    if (!id || id.trim() === '') {
      setError('Please enter an order number')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.get(`https://nile-backend-9wdk.onrender.com/api/orders/${id}`)
      setOrder(response.data)
      setSearchParams({ id })
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('Order not found. Please check your order number and try again.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchOrder(orderId.trim())
  }

  // Auto-search if ID is in URL on mount
  useEffect(() => {
    const idFromUrl = searchParams.get('id')
    if (idFromUrl && idFromUrl !== orderId) {
      setOrderId(idFromUrl)
      fetchOrder(idFromUrl)
    }
  }, [])

  // Status stepper configuration
  const getStatusSteps = (currentStatus) => {
    const steps = [
      { key: 'Order Placed', label: 'Order Placed', status: 'placed' },
      { key: 'Pending Verification', label: 'Verified', status: 'verified' },
      { key: 'Processing', label: 'Processing', status: 'processing' },
      { key: 'Shipped', label: 'Shipped', status: 'shipped' },
      { key: 'Delivered', label: 'Delivered', status: 'delivered' }
    ]

    const statusMap = {
      'pending': 'Order Placed',
      'Pending Verification': 'Pending Verification',
      'paid': 'Pending Verification',
      'Paid': 'Pending Verification',
      'Processing': 'Processing',
      'Shipped': 'Shipped',
      'Delivered': 'Delivered',
      'failed': 'Order Placed',
      'cancelled': 'Order Placed'
    }

    const currentStepKey = statusMap[currentStatus] || 'Order Placed'
    let currentIndex = steps.findIndex(s => s.key === currentStepKey)

    if (currentIndex === -1) currentIndex = 0

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }))
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-black mb-4">
            Track Your Order
          </h1>
          <p className="text-base font-light text-gray-600">
            Enter your order number to check the status of your purchase
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-12">
          <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl mx-auto">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter Order Number"
              className="flex-1 px-6 py-3 text-sm font-light border border-gray-300 focus:outline-none focus:border-black transition-colors"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-black text-white text-sm font-light uppercase tracking-wider hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
          {error && (
            <p className="text-sm font-light text-red-600 mt-4 text-center">{error}</p>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="space-y-8">
            {/* Status Stepper */}
            <div className="bg-white border border-gray-200 p-8">
              <h2 className="text-xl font-light text-black mb-8 uppercase tracking-wider">
                Order Status
              </h2>
              
              <div className="relative">
                {getStatusSteps(order.status).map((step, index) => (
                  <div key={step.key} className="relative pb-12 last:pb-0">
                    {/* Connection Line */}
                    {index < getStatusSteps(order.status).length - 1 && (
                      <div className={`absolute left-4 top-12 w-0.5 h-full ${
                        step.completed ? 'bg-black' : 'bg-gray-300'
                      }`} />
                    )}
                    
                    {/* Step Circle & Content */}
                    <div className="flex items-start gap-4">
                      {/* Circle */}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        step.active
                          ? 'bg-black border-black'
                          : step.completed
                          ? 'bg-black border-black'
                          : 'bg-white border-gray-300'
                      }`}>
                        {step.completed && (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      
                      {/* Label */}
                      <div className="flex-1 pt-1">
                        <p className={`text-sm font-light uppercase tracking-wider ${
                          step.active ? 'text-black' : step.completed ? 'text-black' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white border border-gray-200 p-8">
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
                  <span className="text-sm font-light text-gray-600 uppercase tracking-wider">Order Date</span>
                  <span className="text-sm font-light text-black">
                    {new Date(order.createdAt).toLocaleDateString('en-NG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-sm font-light text-gray-600 uppercase tracking-wider">Payment Method</span>
                  <span className="text-sm font-light text-black">{order.paymentMethod || 'N/A'}</span>
                </div>
                {order.trackingNumber && (
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-sm font-light text-gray-600 uppercase tracking-wider">Tracking Number</span>
                    <span className="text-sm font-light text-black font-mono">{order.trackingNumber}</span>
                  </div>
                )}
                {order.shippingFee > 0 && (
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-sm font-light text-gray-600 uppercase tracking-wider">Shipping Fee</span>
                    <span className="text-sm font-light text-black">{formatNaira(order.shippingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4">
                  <span className="text-lg font-light text-black uppercase tracking-wider">Total Amount</span>
                  <span className="text-xl font-light text-black">{formatNaira(order.totalAmount)}</span>
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
                      <div className="w-20 h-24 flex-shrink-0 bg-gray-50 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400">No Image</span>
                        )}
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
                          {formatNaira(item.price)} × {item.quantity} = {formatNaira(item.price * item.quantity)}
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
        )}
      </div>
    </div>
  )
}

export default TrackOrder
