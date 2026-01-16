import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { useCurrency } from '../context/CurrencyContext'

const SearchResultsDropdown = ({ searchQuery, onClose }) => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const { formatPrice } = useCurrency()

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const searchProducts = async () => {
      setLoading(true)
      try {
        const response = await axios.get('http://localhost:5001/api/products')
        const filtered = response.data
          .filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 6) // Limit to 6 results
        setResults(filtered)
      } catch (error) {
        // Error searching - silently fail
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(searchProducts, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  if (!searchQuery.trim()) return null

  return (
    <AnimatePresence>
      {(results.length > 0 || loading) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 mt-2 w-96 z-50"
        >
          {/* Glassmorphism effect */}
          <div
            className="bg-white/80 backdrop-blur-md border border-white/20 rounded-lg shadow-xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="p-2 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <p className="text-sm font-light text-gray-600">Searching...</p>
                </div>
              ) : results.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs font-light text-gray-600 uppercase tracking-wider border-b border-gray-200/50">
                    Live Results ({results.length})
                  </div>
                  {results?.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 hover:bg-black/5 transition-colors group"
                    >
                      {/* Mini Thumbnail */}
                      <div className="w-16 h-16 flex-shrink-0 overflow-hidden bg-gray-50 rounded">
                        <img
                          src={product.imageUrl || 'https://via.placeholder.com/64x64/f5f5f5/999999?text=No+Image'}
                          alt={product.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/64x64/f5f5f5/999999?text=No+Image'
                          }}
                        />
                      </div>
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-light text-black truncate group-hover:text-gray-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs font-light text-gray-600 uppercase tracking-wider mt-0.5">
                          {product.merchantName}
                        </p>
                        <p className="text-sm font-light text-black mt-1">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm font-light text-gray-600">
                    No products found for &quot;{searchQuery}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SearchResultsDropdown
