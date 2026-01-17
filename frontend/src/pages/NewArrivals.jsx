import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import ProductGrid from '../components/ProductGrid'
import Footer from '../components/Footer'

const NewArrivals = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/products`)
        // Filter products added in the last 14 days
        const fourteenDaysAgo = new Date()
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
        
        const newProducts = response.data.filter(product => {
          const productDate = new Date(product.createdAt || product.updatedAt)
          return productDate >= fourteenDaysAgo
        })
        
        setProducts(newProducts)
        setError(null)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(`Failed to load products: ${err.message || 'Unknown error'}`)
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
            New Arrivals ✨
          </h1>
          <p className="text-sm font-light text-gray-600 uppercase tracking-wider">
            Latest Additions to The Collection
          </p>
        </div>
      </div>
      <ProductGrid products={products} loading={loading} error={error} />
      {!loading && products.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-sm font-light text-gray-600">
            No new arrivals in the last 14 days. Check back soon!
          </p>
        </div>
      )}
      <Footer />
    </div>
  )
}

export default NewArrivals
