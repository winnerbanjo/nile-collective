import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useCurrency } from '../context/CurrencyContext'

const SearchOverlay = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const { formatPrice } = useCurrency()

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const searchProducts = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://nile-backend-9wdk.onrender.com'}/api/products`)
        const filtered = response.data
          .filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 8) // Limit to 8 results
        setResults(filtered)
      } catch (error) {
        console.error('Error searching products:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(searchProducts, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      setSearchQuery('')
      setResults([])
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl max-w-4xl mx-auto mt-20 rounded-xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
            border: '1px solid rgba(255, 255, 255, 0.4)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full px-6 py-4 text-lg font-light border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-black transition-colors"
                aria-label="Close search"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center">
                <p className="text-sm font-light text-gray-600">Searching...</p>
              </div>
            ) : searchQuery.trim() && results.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm font-light text-gray-600">
                  No products found for &quot;{searchQuery}&quot;
                </p>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-xs font-light text-gray-600 uppercase tracking-wider">
                    {results.length} {results.length === 1 ? 'Result' : 'Results'}
                  </p>
                </div>
                <div className="divide-y divide-gray-100">
                  {results?.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      onClick={onClose}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-24 flex-shrink-0 overflow-hidden bg-gray-50 rounded">
                        <img
                          src={product.imageUrl || 'https://via.placeholder.com/80x96/f5f5f5/999999?text=No+Image'}
                          alt={product.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x96/f5f5f5/999999?text=No+Image'
                          }}
                        />
                      </div>
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-light text-black mb-1 group-hover:text-gray-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs font-light text-gray-600 uppercase tracking-wider mb-2">
                          {product.merchantName}
                        </p>
                        <p className="text-lg font-light text-black">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <p className="text-sm font-light text-gray-600">
                  Start typing to search for products...
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SearchOverlay
