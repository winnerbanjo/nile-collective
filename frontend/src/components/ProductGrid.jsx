import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'

const ProductGrid = ({ products = [], loading = false, error = null }) => {
  const { addToCart } = useCart()
  const { formatPrice } = useCurrency()
  const [selectedVariants, setSelectedVariants] = useState({})

  if (error) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-light text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-black text-white text-sm font-light uppercase tracking-wider hover:bg-gray-900 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </section>
    )
  }

  const handleAddToCart = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    const selectedSize = selectedVariants[product._id]?.size || ''
    const selectedColor = selectedVariants[product._id]?.color || ''
    addToCart(product, selectedSize, selectedColor)
  }

  const getUniqueSizes = (product) => {
    if (!product?.variants || product.variants.length === 0) return []
    return [...new Set(product.variants?.map(v => v.size).filter(Boolean) || [])]
  }

  const getUniqueColors = (product) => {
    if (!product?.variants || product.variants.length === 0) return []
    return [...new Set(product.variants?.map(v => v.color).filter(Boolean) || [])]
  }

  const handleVariantSelect = (productId, type, value) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [type]: value
      }
    }))
  }

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-sm font-light text-gray-600">Loading products...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-sm font-light text-red-600">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-sm font-light text-gray-600">No products available</p>
          </div>
        </div>
      </section>
    )
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f9f9f9' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {Array.isArray(products) && products.length > 0 ? products.map((product, index) => {
            const sizes = getUniqueSizes(product)
            const colors = getUniqueColors(product)
            const selectedSize = selectedVariants[product._id]?.size || ''
            const selectedColor = selectedVariants[product._id]?.color || ''

            return (
              <motion.div
                key={product._id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white group cursor-pointer transition-all duration-300 hover:shadow-xl block border border-gray-200"
              >
                <Link
                  to={`/product/${product._id}`}
                  className="block"
                >
                  {/* Product Image - 4:5 Portrait Ratio */}
                  <div className="aspect-[4/5] overflow-hidden bg-gray-50 relative">
                    <img
                      src={product.imageUrl || 'https://via.placeholder.com/400x500/f5f5f5/999999?text=No+Image'}
                      alt={product.name}
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500 ease-out"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x500/f5f5f5/999999?text=No+Image'
                      }}
                    />
                    {/* Badge - Sale or New */}
                    {product.badge && (
                      <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-light uppercase tracking-wider px-2 py-1">
                        {product.badge}
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    {/* Merchant Name - Tiny 10px gray uppercase */}
                    <p className="text-[10px] font-light text-gray-500 uppercase tracking-[0.15em] mb-2.5 leading-tight">
                      {product.merchantName}
                    </p>
                    {/* Product Title - Sans-serif */}
                    <h3 className="text-sm font-sans font-light text-black mb-1 leading-snug">
                      {product.name}
                    </h3>
                    {/* Price - Naira */}
                    <p className="text-sm font-sans font-light text-black mb-3">
                      {formatPrice(product.price)}
                    </p>

                    {/* Size Selection */}
                    {sizes.length > 0 && (
                      <div className="mb-2">
                        <div className="flex flex-wrap gap-1">
                          {sizes?.slice(0, 3).map((size) => (
                            <button
                              key={size}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleVariantSelect(product._id, 'size', size)
                              }}
                              className={`text-[10px] px-2 py-0.5 border transition-all ${
                                selectedSize === size
                                  ? 'border-black bg-black text-white'
                                  : 'border-gray-300 bg-white text-black hover:border-gray-400'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                          {sizes.length > 3 && (
                            <span className="text-[10px] text-gray-500">+{sizes.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Color Selection */}
                    {colors.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {colors?.slice(0, 3).map((color) => (
                            <button
                              key={color}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleVariantSelect(product._id, 'color', color)
                              }}
                              className={`text-[10px] px-2 py-0.5 border transition-all ${
                                selectedColor === color
                                  ? 'border-black bg-black text-white'
                                  : 'border-gray-300 bg-white text-black hover:border-gray-400'
                              }`}
                            >
                              {color}
                            </button>
                          ))}
                          {colors.length > 3 && (
                            <span className="text-[10px] text-gray-500">+{colors.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Add to Cart Button - Sleek, minimalist black button with white text */}
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-full bg-black text-white text-xs font-light uppercase tracking-wider py-3 px-4 hover:bg-gray-900 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Add to Cart
                    </button>
                  </div>
                </Link>
              </motion.div>
            )
          }) : (
            <div className="col-span-2 md:col-span-4 text-center py-12">
              <p className="text-sm font-light text-gray-600">No products available</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default ProductGrid
