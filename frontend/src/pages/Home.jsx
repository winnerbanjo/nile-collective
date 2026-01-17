import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import FeaturedProducts from '../components/FeaturedProducts'
import ProductGrid from '../components/ProductGrid'
import Footer from '../components/Footer'

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products from:', `${import.meta.env.VITE_API_URL || 'https://nile-backend-9wdk.onrender.com'}/api/products`)
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://nile-backend-9wdk.onrender.com'}/api/products`)
        console.log('Products fetched successfully:', response.data)
        setProducts(response.data)
        setError(null)
      } catch (err) {
        console.error('❌ Error fetching products:', err)
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
      <Hero />
      <FeaturedProducts />
      <div id="products">
        <ProductGrid products={products} loading={loading} error={error} />
      </div>
      <Footer />
    </div>
  )
}

export default Home
