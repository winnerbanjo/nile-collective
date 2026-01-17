import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCurrency } from '../context/CurrencyContext'
import axios from 'axios'

const FeaturedProducts = () => {
  const { formatPrice } = useCurrency()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/products`)
        // Get only featured products, sorted by newest first, limit to 3
        const featured = response.data
          .filter(p => p.isFeatured === true)
          .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
          .slice(0, 3)
        setFeaturedProducts(featured)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching featured products:', error)
        setLoading(false)
      }
    }

    fetchFeatured()
  }, [])

  if (loading) {
    return null
  }

  if (featuredProducts.length === 0) {
    return null
  }

  if (featuredProducts.length === 0) {
    return null
  }

  return (
    <section className="hidden md:block py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-light text-black mb-4 tracking-tight">
            Featured Collection
          </h2>
          <p className="text-sm font-light text-gray-600 uppercase tracking-wider">
            Limited Edition
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts?.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <Link
                to={`/product/${product._id}`}
                className="block bg-white border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                {/* Product Image */}
                <div className="aspect-[4/5] overflow-hidden bg-gray-50 relative">
                  <img
                    src={product.imageUrl || 'https://via.placeholder.com/400x500/f5f5f5/999999?text=No+Image'}
                    alt={product.name}
                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x500/f5f5f5/999999?text=No+Image'
                    }}
                  />
                  {/* Limited Edition Badge */}
                  <div className="absolute top-4 left-4 bg-black text-white text-[10px] font-light uppercase tracking-[0.2em] px-3 py-1.5">
                    Limited Edition
                  </div>
                  {product.badge && (
                    <div className="absolute top-4 right-4 bg-white text-black text-[10px] font-light uppercase tracking-wider px-2 py-1">
                      {product.badge}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <p className="text-[10px] font-light text-gray-500 uppercase tracking-[0.15em] mb-2">
                    {product.merchantName}
                  </p>
                  <h3 className="text-lg font-light text-black mb-3 leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-base font-light text-black">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
