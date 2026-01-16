import { useState, useEffect, Fragment } from 'react'

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load subscribers from localStorage (in production, this would come from backend)
    const loadSubscribers = () => {
      try {
        const stored = localStorage.getItem('newsletterSubscribers')
        const subscribersList = stored ? JSON.parse(stored) : []
        setSubscribers(subscribersList)
      } catch (error) {
        console.error('Error loading subscribers:', error)
        setSubscribers([])
      } finally {
        setLoading(false)
      }
    }

    loadSubscribers()

    // Refresh subscribers every 5 seconds
    const interval = setInterval(loadSubscribers, 5000)
    return () => clearInterval(interval)
  }, [])

  const exportSubscribers = () => {
    const csv = ['Email,Subscribed Date'].concat(
      subscribers?.map(email => `${email},${new Date().toLocaleDateString()}`) || []
    ).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nile-collective-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-black">Newsletter Subscribers</h1>
        {subscribers.length > 0 && (
          <button
            onClick={exportSubscribers}
            className="px-6 py-2 bg-black text-white text-sm font-light uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            Export CSV
          </button>
        )}
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8 max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-light text-gray-600 uppercase tracking-wider mb-1">Total Subscribers</p>
            <p className="text-3xl font-light text-black">{subscribers.length}</p>
          </div>
          <div className="bg-blue-100 rounded-full p-3">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-light text-black">All Subscribers</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Loading subscribers...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No subscribers yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Subscribers will appear here once they sign up through the newsletter form.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-wider text-gray-600">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-wider text-gray-600">
                    Email Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-wider text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers?.map((email, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-black">
                      {email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default AdminSubscribers
