import React, { useState, useEffect, Fragment } from 'react'
import axios from 'axios'
import { useCurrency } from '../context/CurrencyContext'

// Define formatPrice function outside component
const formatPrice = (price) => {
  const safePrice = price || 0
  return new Intl.NumberFormat('en-NG', { 
    style: 'currency', 
    currency: 'NGN' 
  }).format(safePrice)
}

const AdminOrders = () => {
  console.log('Admin Portal Rendering...')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)

  // Early return if orders not loaded yet
  if (!orders && loading) {
    return <div className="p-8 text-center">Loading Nile Orders...</div>
  }

  useEffect(() => {
    console.log('AdminOrders useEffect running...')
    console.log('Current path:', window.location.pathname)
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders from: ${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/orders')
      setLoading(true)
      setError(null)
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/orders`)
      console.log('Orders API response:', response.data)
      
      // Handle both response structures: { success, orders } or direct array
      const ordersData = response.data?.orders || response.data || []
      console.log('Orders fetched successfully:', ordersData.length, 'orders')
      setOrders(Array.isArray(ordersData) ? ordersData : [])
      setError(null)
    } catch (err) {
      console.error('Error fetching orders:', err)
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      })
      
      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        setError('Server is starting... Please wait a moment and refresh the page.')
      } else if (err.response?.status === 404) {
        setError('Orders endpoint not found. Please check backend configuration.')
      } else {
        setError(`Failed to load orders: ${err.response?.data?.message || err.message || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
      console.log('Loading state set to false')
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId)
      const response = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/orders/${orderId}/status`, {
        status: newStatus
      })

      if (response.data?.success) {
        setOrders(prevOrders => {
          if (!Array.isArray(prevOrders)) return []
          return prevOrders?.map(order => 
            order?._id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        })
      }
    } catch (err) {
      console.error('Error updating order status:', err)
      alert('Failed to update order status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'N/A'
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      'paid': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      'Pending Verification': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
      'Processing': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      'Shipped': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
      'Delivered': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      'failed': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      'cancelled': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
    }
    const config = statusConfig[status] || statusConfig['pending']
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {status}
      </span>
    )
  }

  // Calculate stats with safe optional chaining
  const totalSales = Array.isArray(orders) ? orders
    .filter(o => o?.status === 'paid' || o?.status === 'Delivered' || o?.status === 'Shipped' || o?.status === 'Processing')
    .reduce((sum, o) => sum + (o?.totalAmount || 0), 0) : 0

  const pendingTransfers = Array.isArray(orders) ? orders.filter(o => 
    o?.paymentMethod === 'Bank Transfer' && 
    (o?.status === 'Pending Verification' || o?.status === 'pending')
  ).length : 0

  const totalOrders = Array.isArray(orders) ? orders.length : 0

  const statusOptions = [
    'pending',
    'paid',
    'Pending Verification',
    'Processing',
    'Shipped',
    'Delivered',
    'failed',
    'cancelled'
  ]

  console.log('AdminOrders render - loading:', loading, 'error:', error, 'orders:', orders?.length || 0, 'location:', window.location.pathname)

  // Safety check - ensure orders exists and is array
  if (!orders && !loading && !error) {
    setOrders([])
  }

  if (loading) {
    console.log('Rendering loading state')
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
            <p className="text-sm font-light text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    console.log('Rendering error state:', error)
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-light text-red-800 mb-2">Error Loading Orders</h3>
          <p className="text-sm font-light text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-red-600 text-white text-sm font-light uppercase tracking-wider hover:bg-red-700 transition-colors rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

      console.log('Rendering main AdminOrders content')
  
  // Safety check - ensure orders is always an array
  const safeOrders = Array.isArray(orders) ? orders : []
  
  // Additional safety - ensure we have valid orders before rendering
  if (!orders && !loading && !error) {
    // This shouldn't happen, but if it does, initialize as empty array
    if (typeof setOrders === 'function') {
      setOrders([])
    }
  }
  
  return (
    <>
      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-gray-600 uppercase tracking-wider mb-1">Total Sales</p>
                <p className="text-2xl font-light text-black">{formatPrice(totalSales)}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-gray-600 uppercase tracking-wider mb-1">Pending Transfers</p>
                <p className="text-2xl font-light text-black">{pendingTransfers}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-gray-600 uppercase tracking-wider mb-1">Total Orders</p>
                <p className="text-2xl font-light text-black">{totalOrders}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-light text-black">All Orders</h2>
          </div>

          {!Array.isArray(safeOrders) || safeOrders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-2xl font-light text-gray-600 mb-2">No orders found ✨</p>
              <p className="text-sm font-light text-gray-500">Orders will appear here once customers start placing them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-wider text-gray-600">
                      Date & Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-wider text-gray-600">
                      Customer Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-wider text-gray-600">
                      Items
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-wider text-gray-600">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-wider text-gray-600">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-wider text-gray-600">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-wider text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeOrders?.map((order) => (
                    <tr key={order?._id || Math.random()} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-light text-gray-900">
                          {formatDate(order?.createdAt)}
                        </div>
                        <div className="text-xs font-light text-gray-500 mt-1">
                          #{order?._id ? order._id.substring(0, 8) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-light text-gray-900">
                          {order?.shippingDetails?.name || order?.customerName || 'Guest'}
                        </div>
                        <div className="text-xs font-light text-gray-500 mt-1">
                          {order?.shippingDetails?.email || 'Not provided'}
                        </div>
                        <div className="text-xs font-light text-gray-500">
                          {order?.shippingDetails?.phone || 'Not provided'}
                        </div>
                        {(order?.shippingDetails?.address || order?.shippingDetails?.city) && (
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="mt-2 inline-flex items-center px-2 py-1 text-xs font-light text-blue-600 hover:text-blue-800 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-light text-gray-900 space-y-1">
                          {Array.isArray(order?.items) && order.items.length > 0 ? (
                            order.items?.map((item, index) => (
                              <div key={index} className="text-sm">
                                {item?.name || 'Unknown Product'} × {item?.quantity || 1}
                                {(item?.size || item?.color) && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    ({[item?.size, item?.color].filter(Boolean).join(', ')})
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">No items</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-light text-gray-900">
                          {formatPrice(order?.totalAmount || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-light text-gray-900">
                          {order?.paymentMethod || 'Paystack'}
                        </div>
                        {order?.paymentMethod === 'Bank Transfer' && order?.receiptUrl && (
                          <button
                            onClick={() => setSelectedReceipt(order.receiptUrl)}
                            className="mt-2 inline-flex items-center px-3 py-1 text-xs font-light text-blue-600 hover:text-blue-800 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Receipt
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order?.status || 'pending')}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order?.status || 'pending'}
                          onChange={(e) => handleStatusUpdate(order?._id, e.target.value)}
                          disabled={!order?._id || updatingStatus === order._id}
                          className="text-sm font-light border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 bg-white"
                        >
                          {statusOptions?.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
          onClick={() => setSelectedReceipt(null)}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto relative" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-light text-black">Payment Receipt</h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <img
                src={selectedReceipt || ''}
                alt="Payment Receipt"
                className="max-w-full h-auto rounded-lg border border-gray-200"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='
                }}
              />
              <div className="mt-4 flex justify-end">
                <a
                  href={selectedReceipt}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 text-sm font-light text-white bg-black hover:bg-gray-800 rounded transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Details Modal */}
      {selectedOrderDetails && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
          onClick={() => setSelectedOrderDetails(null)}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full relative" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-light text-black">Shipping Details</h3>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-light text-gray-600 uppercase tracking-wider">👤 Full Name</label>
                <p className="text-sm font-light text-black mt-1">
                  {selectedOrderDetails.shippingDetails?.name || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-xs font-light text-gray-600 uppercase tracking-wider">✉️ Email</label>
                <p className="text-sm font-light text-black mt-1">
                  {selectedOrderDetails.shippingDetails?.email || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-xs font-light text-gray-600 uppercase tracking-wider">📞 Phone Number</label>
                <p className="text-sm font-light text-black mt-1">
                  {selectedOrderDetails.shippingDetails?.phone || 'Not provided'}
                </p>
              </div>
              {selectedOrderDetails.shippingDetails?.country && (
                <div>
                  <label className="text-xs font-light text-gray-600 uppercase tracking-wider">🌍 Country</label>
                  <p className="text-sm font-light text-black mt-1">
                    {selectedOrderDetails.shippingDetails.country}
                  </p>
                </div>
              )}
              {selectedOrderDetails.shippingDetails?.state && (
                <div>
                  <label className="text-xs font-light text-gray-600 uppercase tracking-wider">🗺️ State</label>
                  <p className="text-sm font-light text-black mt-1">
                    {selectedOrderDetails.shippingDetails.state}
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs font-light text-gray-600 uppercase tracking-wider">📍 Street Address</label>
                <p className="text-sm font-light text-black mt-1">
                  {selectedOrderDetails.shippingDetails?.address || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-xs font-light text-gray-600 uppercase tracking-wider">🏙️ City</label>
                <p className="text-sm font-light text-black mt-1">
                  {selectedOrderDetails.shippingDetails?.city || 'Not provided'}
                </p>
              </div>
              {(selectedOrderDetails?.shippingFee || 0) > 0 && (
                <div>
                  <label className="text-xs font-light text-gray-600 uppercase tracking-wider">💰 Shipping Fee</label>
                  <p className="text-sm font-light text-black mt-1">
                    {formatPrice(selectedOrderDetails?.shippingFee || 0)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminOrders
