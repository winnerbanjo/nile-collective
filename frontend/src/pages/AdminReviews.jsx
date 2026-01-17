import React, { useState, useEffect, Fragment } from 'react'
import axios from 'axios'

const AdminReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`https://nile-backend-9wdk.onrender.com/api/reviews`)
      if (response.data?.success) {
        setReviews(response.data.reviews || [])
      } else {
        setReviews([])
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (reviewId) => {
    try {
      const response = await axios.put(`https://nile-backend-9wdk.onrender.com/api/reviews/${reviewId}/approve`)
      if (response.data?.success) {
        setReviews(reviews?.map(r => r._id === reviewId ? { ...r, isApproved: true } : r))
      }
    } catch (error) {
      console.error('Error approving review:', error)
      alert('Failed to approve review')
    }
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    
    try {
      const response = await axios.delete(`https://nile-backend-9wdk.onrender.com/api/reviews/${reviewId}`)
      if (response.data?.success) {
        setReviews(reviews?.filter(r => r._id !== reviewId))
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Failed to delete review')
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
            <p className="text-sm font-light text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-light text-red-800 mb-2">Error Loading Reviews</h3>
          <p className="text-sm font-light text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchReviews}
            className="px-4 py-2 bg-red-600 text-white text-sm font-light uppercase tracking-wider hover:bg-red-700 transition-colors rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const pendingReviews = reviews?.filter(r => !r.isApproved) || []
  const approvedReviews = reviews?.filter(r => r.isApproved) || []

  return (
    <Fragment>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-light text-black mb-2">Review Management</h1>
          <p className="text-sm font-light text-gray-600">Approve or delete customer reviews</p>
        </div>

        {/* Pending Reviews */}
        {pendingReviews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-light text-black mb-4">
              Pending Approval ({pendingReviews.length})
            </h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {pendingReviews?.map((review) => (
                  <div key={review._id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-sm font-light text-black">{review.userName}</p>
                          {review.productId && (
                            <span className="text-xs font-light text-gray-500">
                              for {review.productId.name || 'Product'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-sm font-light text-gray-700 leading-relaxed mb-2">
                          {review.comment}
                        </p>
                        <p className="text-xs font-light text-gray-500">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleApprove(review._id)}
                          className="px-4 py-2 bg-green-600 text-white text-xs font-light uppercase tracking-wider hover:bg-green-700 transition-colors rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="px-4 py-2 bg-red-600 text-white text-xs font-light uppercase tracking-wider hover:bg-red-700 transition-colors rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Approved Reviews */}
        <div>
          <h2 className="text-lg font-light text-black mb-4">
            Approved Reviews ({approvedReviews.length})
          </h2>
          {approvedReviews.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {approvedReviews?.map((review) => (
                  <div key={review._id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-sm font-light text-black">{review.userName}</p>
                          {review.productId && (
                            <span className="text-xs font-light text-gray-500">
                              for {review.productId.name || 'Product'}
                            </span>
                          )}
                          <span className="text-xs font-light text-green-600 bg-green-50 px-2 py-1 rounded">
                            Approved
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-sm font-light text-gray-700 leading-relaxed mb-2">
                          {review.comment}
                        </p>
                        <p className="text-xs font-light text-gray-500">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="ml-4 px-4 py-2 bg-red-600 text-white text-xs font-light uppercase tracking-wider hover:bg-red-700 transition-colors rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-sm font-light text-gray-600">No approved reviews yet</p>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  )
}

export default AdminReviews
