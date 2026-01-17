import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useUser } from '../context/UserContext'
import { useCurrency } from '../context/CurrencyContext'

const MyAccount = () => {
  const { user, logout, isAuthenticated } = useUser()
  const { formatPrice } = useCurrency()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const fetchOrders = async () => {
      try {
        const userId = localStorage.getItem('userId')
        const response = await axios.get(`https://nile-backend-9wdk.onrender.com/api/orders/myorders`, {
          headers: {
            'X-User-Id': userId
          }
        })
        setOrders(response.data.orders || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated, navigate])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      'paid': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      'Processing': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      'Shipped': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
      'Delivered': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' }
    }
    const config = statusConfig[status] || statusConfig['pending']
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {status}
      </span>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-light text-black mb-4 tracking-tight">
              My Account
            </h1>
            <p className="text-sm font-light text-gray-600 uppercase tracking-wider">
              Welcome back, {user.name || user.email}
            </p>
          </div>

          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-light text-black mb-4">Profile Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-light text-gray-600 uppercase tracking-wider">Name</label>
                <p className="text-sm font-light text-black mt-1">{user.name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs font-light text-gray-600 uppercase tracking-wider">Email</label>
                <p className="text-sm font-light text-black mt-1">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-6 px-6 py-2 bg-black text-white text-sm font-light uppercase tracking-wider hover:bg-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Order History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-light text-black mb-6">Order History</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-sm font-light text-gray-600">Loading orders...</p>
              </div>
            ) : !Array.isArray(orders) || orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm font-light text-gray-600 mb-4">You haven't placed any orders yet.</p>
                <Link
                  to="/shop"
                  className="inline-block px-6 py-2 bg-black text-white text-sm font-light uppercase tracking-wider hover:bg-gray-900 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-wider text-gray-600">
                        Order Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-wider text-gray-600">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-wider text-gray-600">
                        Items
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-wider text-gray-600">
                        Total
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
                    {Array.isArray(orders) && orders.length > 0 ? orders.map((order) => {
                      if (!order || !order._id) return null
                      return (
                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-light text-gray-900">
                              {formatDate(order.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-light text-gray-900">
                              #{order._id.substring(0, 8)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-light text-gray-900">
                              {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-light text-black">
                              {formatPrice(order.totalAmount || 0)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.status || 'pending')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/order-confirmation/${order._id}`}
                              className="text-sm font-light text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      )
                    }) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <p className="text-sm font-light text-gray-600">No orders found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyAccount
