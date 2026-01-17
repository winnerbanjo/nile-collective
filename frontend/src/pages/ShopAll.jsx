import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import ProductGrid from '../components/ProductGrid'
import Footer from '../components/Footer'

const ShopAll = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/products`)
        setProducts(response.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching products:', err)
        if (err.isServerDown || err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
          setError('Server is starting... Please wait a moment and refresh the page.')
        } else {
          setError(`Failed to load products: ${err.response?.data?.message || err.message || 'Unknown error'}`)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light text-black mb-4 tracking-tight">
            Shop All
          </h1>
          <p className="text-sm font-light text-gray-600 uppercase tracking-wider">
            Explore Our Complete Collection
          </p>
        </div>
      </div>
      <ProductGrid products={products} loading={loading} error={error} />
      <Footer />
    </div>
  )
}

export default ShopAll
