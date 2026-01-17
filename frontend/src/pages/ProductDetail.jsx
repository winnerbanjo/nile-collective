import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import { motion } from 'framer-motion'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { formatPrice } = useCurrency()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loadingRelated, setLoadingRelated] = useState(true)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [reviews, setReviews] = useState([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    userName: '',
    userEmail: '',
    rating: 5,
    comment: ''
  })
  const [submittingReview, setSubmittingReview] = useState(false)

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log(`Fetching product from: ${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/products/${id}`)
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/products/${id}`)
        console.log('Product fetched successfully:', response.data)
        setProduct(response.data)
        setError(null)
      } catch (err) {
        console.error('❌ Error fetching product:', err)
        console.error('Error details:', {
          message: err.message,
          code: err.code,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url
        })
        setError(`Product not found: ${err.message || 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  // Fetch related products after product is loaded
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return
      
      try {
        setLoadingRelated(true)
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/products`)
        let related = []
        
        // Try to find products from same category
        if (product?.category) {
          related = response.data
            .filter(p => p._id !== id && p.category === product.category)
            .sort(() => Math.random() - 0.5) // Randomize
            .slice(0, 4)
        }
        
        // If not enough products from same category, get latest arrivals
        if (related.length < 4) {
          const latest = response.data
            .filter(p => p._id !== id && !related.find(r => r._id === p._id))
            .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0))
            .slice(0, 4 - related.length)
          related = [...related, ...latest].slice(0, 4)
        }
        
        // Final fallback: random products
        if (related.length < 4) {
          const random = response.data
            .filter(p => p._id !== id && !related.find(r => r._id === p._id))
            .sort(() => Math.random() - 0.5)
            .slice(0, 4 - related.length)
          related = [...related, ...random].slice(0, 4)
        }
        
        setRelatedProducts(related)
      } catch (err) {
        console.error('Error fetching related products:', err)
      } finally {
        setLoadingRelated(false)
      }
    }

    fetchRelatedProducts()
  }, [product, id])

  // Fetch reviews for this product
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?._id) return
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/reviews/product/${product._id}`)
        if (response.data?.success) {
          setReviews(response.data.reviews || [])
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      }
    }
    fetchReviews()
  }, [product])

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!product?._id) return

    setSubmittingReview(true)
    try {
      const userId = localStorage.getItem('userId')
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/reviews`, {
        productId: product._id,
        userId: userId || null,
        userName: reviewForm.userName,
        userEmail: reviewForm.userEmail,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      })
      
      setReviewForm({ userName: '', userEmail: '', rating: 5, comment: '' })
      setShowReviewForm(false)
      // Refresh reviews
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/reviews/product/${product._id}`)
      if (response.data?.success) {
        setReviews(response.data.reviews || [])
      }
      alert('Review submitted! It will appear after admin approval.')
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, selectedSize, selectedColor)
    }
  }

  // Get unique sizes and colors from variants
  const getUniqueSizes = () => {
    if (!product?.variants || product.variants.length === 0) return []
    const sizes = [...new Set(product.variants?.map(v => v?.size).filter(Boolean) || [])]
    return sizes
  }

  const getUniqueColors = () => {
    if (!product?.variants || product.variants.length === 0) return []
    const colors = [...new Set(product.variants?.map(v => v?.color).filter(Boolean) || [])]
    return colors
  }

  // Get stock for a specific size/color combination
  const getStock = (size, color) => {
    if (!product?.variants) return 0
    const variant = product.variants.find(v => v.size === size && v.color === color)
    return variant ? variant.stock : 0
  }

  // Check if a size is available (has at least one variant with stock > 0)
  const isSizeAvailable = (size) => {
    if (!product?.variants) return false
    return product.variants.some(v => v.size === size && v.stock > 0)
  }

  // Check if a color is available (has at least one variant with stock > 0)
  const isColorAvailable = (color) => {
    if (!product?.variants) return false
    return product.variants.some(v => v.color === color && v.stock > 0)
  }

  // Check if a specific size/color combination is available
  const isCombinationAvailable = (size, color) => {
    return getStock(size, color) > 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-sm font-light text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-sm font-light text-red-600 mb-4">{error || 'Product not found'}</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Large Image */}
          <div className="w-full">
            <div className="aspect-[4/5] overflow-hidden bg-gray-50 relative">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/400x500/f5f5f5/999999?text=No+Image'}
                alt={product.name}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x500/f5f5f5/999999?text=No+Image'
                }}
              />
              {/* Badge - Sale or New */}
              {product.badge && (
                <div className="absolute top-4 left-4 bg-black text-white text-[10px] font-light uppercase tracking-wider px-3 py-1.5">
                  {product.badge}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div className="flex flex-col items-start lg:pt-0">
            {/* Merchant Name - Tiny gray uppercase */}
            <p className="text-[10px] font-light text-gray-500 uppercase tracking-[0.15em] mb-3">
              {product.merchantName}
            </p>

            {/* Product Name - Poppins Bold */}
            <h1 className="text-4xl font-semibold text-black mb-6 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-3xl font-light text-black mb-8">
              {formatPrice(product.price)}
            </p>

            {/* Description */}
            <div className="mb-8">
              <p className="text-base font-light text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Size Selection */}
            {product.variants && product.variants.length > 0 && getUniqueSizes().length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-light text-gray-700">Size</label>
                  {product.sizeGuideUrl && (
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="text-xs font-light text-gray-600 hover:text-black underline uppercase tracking-wider"
                    >
                      Size Guide
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {getUniqueSizes()?.map((size) => {
                    // Check if this size has any available variants (considering selected color if any)
                    const available = selectedColor 
                      ? isCombinationAvailable(size, selectedColor)
                      : isSizeAvailable(size)
                    const isSelected = selectedSize === size
                    return (
                      <button
                        key={size}
                        onClick={() => available && setSelectedSize(size)}
                        disabled={!available}
                        className={`w-12 h-12 flex items-center justify-center text-sm font-light transition-all ${
                          isSelected
                            ? 'border-4 border-black bg-white text-black'
                            : available
                            ? 'border-2 border-gray-300 bg-white text-black hover:border-gray-400'
                            : 'border-2 border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.variants && product.variants.length > 0 && getUniqueColors().length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-light text-gray-700 mb-3">Color</label>
                <div className="flex flex-wrap gap-2">
                  {getUniqueColors()?.map((color) => {
                    // Check if this color has any available variants (considering selected size if any)
                    const available = selectedSize
                      ? isCombinationAvailable(selectedSize, color)
                      : isColorAvailable(color)
                    const isSelected = selectedColor === color
                    return (
                      <button
                        key={color}
                        onClick={() => available && setSelectedColor(color)}
                        disabled={!available}
                        className={`px-4 py-2 text-sm font-light transition-all ${
                          isSelected
                            ? 'border-4 border-black bg-white text-black'
                            : available
                            ? 'border-2 border-gray-300 bg-white text-black hover:border-gray-400'
                            : 'border-2 border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {color}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && (
              (product.specifications.length || 
               product.specifications.width || 
               product.specifications.height || 
               product.specifications.weight || 
               product.specifications.material) && (
                <div className="mb-8">
                  <h2 className="text-lg font-light text-black mb-4">Specifications</h2>
                  <div className="border-t border-b border-gray-200">
                    <div className="divide-y divide-gray-100">
                      {product.specifications.length && (
                        <div className="py-3 flex items-center gap-3">
                          <div className="w-5 h-5 flex-shrink-0">
                            <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                          </div>
                          <span className="text-sm font-light text-gray-600 uppercase tracking-wider w-24">Length</span>
                          <span className="text-sm font-light text-black">{product.specifications.length}</span>
                        </div>
                      )}
                      {product.specifications.width && (
                        <div className="py-3 flex items-center gap-3">
                          <div className="w-5 h-5 flex-shrink-0">
                            <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                          </div>
                          <span className="text-sm font-light text-gray-600 uppercase tracking-wider w-24">Width</span>
                          <span className="text-sm font-light text-black">{product.specifications.width}</span>
                        </div>
                      )}
                      {product.specifications.height && (
                        <div className="py-3 flex items-center gap-3">
                          <div className="w-5 h-5 flex-shrink-0">
                            <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 4v16M10 4v16M14 4v16M18 4v16" />
                            </svg>
                          </div>
                          <span className="text-sm font-light text-gray-600 uppercase tracking-wider w-24">Height</span>
                          <span className="text-sm font-light text-black">{product.specifications.height}</span>
                        </div>
                      )}
                      {product.specifications.weight && (
                        <div className="py-3 flex items-center gap-3">
                          <div className="w-5 h-5 flex-shrink-0">
                            <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                          </div>
                          <span className="text-sm font-light text-gray-600 uppercase tracking-wider w-24">Weight</span>
                          <span className="text-sm font-light text-black">{product.specifications.weight}</span>
                        </div>
                      )}
                      {product.specifications.material && (
                        <div className="py-3 flex items-center gap-3">
                          <div className="w-5 h-5 flex-shrink-0">
                            <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                          </div>
                          <span className="text-sm font-light text-gray-600 uppercase tracking-wider w-24">Material</span>
                          <span className="text-sm font-light text-black">{product.specifications.material}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Add to Cart Button - Big black button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-black text-white text-base font-light uppercase tracking-wider py-4 px-6 hover:bg-gray-900 transition-colors duration-200"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Related Products Section - "The Nile Edit: You Might Also Like" */}
      {!loadingRelated && relatedProducts?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-20 border-t border-gray-200">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-light text-black mb-4 tracking-tight">
              The Nile Edit: You Might Also Like
            </h2>
            <p className="text-sm font-light text-gray-600 uppercase tracking-wider">
              Curated Selection
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {relatedProducts?.map((relatedProduct, index) => (
              <motion.div
                key={relatedProduct._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <Link to={`/product/${relatedProduct._id}`}>
                  {/* Product Image - 4:5 Portrait Ratio */}
                  <div className="aspect-[4/5] overflow-hidden bg-gray-50 relative mb-4">
                    <img
                      src={relatedProduct.imageUrl || 'https://via.placeholder.com/400x500/f5f5f5/999999?text=No+Image'}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500 ease-out"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x500/f5f5f5/999999?text=No+Image'
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="text-center">
                    <p className="text-[10px] font-light text-gray-500 uppercase tracking-[0.15em] mb-1">
                      {relatedProduct.merchantName || 'Nile Collective'}
                    </p>
                    <h3 className="text-sm font-light text-black mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-sm font-light text-black">
                      {formatPrice(relatedProduct?.price || 0)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetail
