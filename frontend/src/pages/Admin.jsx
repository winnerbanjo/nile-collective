import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useCurrency } from '../context/CurrencyContext'

const Admin = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    merchantName: '',
    imageFile: null,
    imageUrl: '',
    description: '',
    badge: '',
    category: '',
    specifications: {
      length: '',
      width: '',
      height: '',
      weight: '',
      material: ''
    },
    variants: []
  })
  const [heroData, setHeroData] = useState({
    heroImage: null,
    heroImageUrl: '',
    heroTitle: '',
    heroSubtitle: '',
    showHeroTitle: true,
    showHeroSubtitle: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSavingHero, setIsSavingHero] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [heroImagePreview, setHeroImagePreview] = useState('')

  // Fetch all products and settings
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`https://nile-backend-9wdk.onrender.com/api/products`)
      setProducts(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching products:', error)
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`https://nile-backend-9wdk.onrender.com/api/settings`)
      setHeroData({
        heroImage: null,
        heroImageUrl: '',
        heroTitle: response.data.heroTitle || '',
        heroSubtitle: response.data.heroSubtitle || '',
        showHeroTitle: response.data.showHeroTitle !== undefined ? response.data.showHeroTitle : true,
        showHeroSubtitle: response.data.showHeroSubtitle !== undefined ? response.data.showHeroSubtitle : true
      })
      setHeroImagePreview(response.data.heroImage || '')
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchSettings()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imageUrl: '' // Clear URL when file is selected
      }))
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUrlChange = (e) => {
    const url = e.target.value
    setFormData(prev => ({
      ...prev,
      imageUrl: url,
      imageFile: null // Clear file when URL is entered
    }))
    if (url) {
      setImagePreview(url)
    } else {
      setImagePreview('')
    }
  }

  const handleHeroImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setHeroData(prev => ({
        ...prev,
        heroImage: file,
        heroImageUrl: '' // Clear URL when file is selected
      }))
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setHeroImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleHeroImageUrlChange = (e) => {
    const url = e.target.value
    setHeroData(prev => ({
      ...prev,
      heroImageUrl: url,
      heroImage: null // Clear file when URL is entered
    }))
    if (url) {
      setHeroImagePreview(url)
    } else {
      setHeroImagePreview('')
    }
  }

  // Variant management functions
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { size: '', color: '', stock: 0 }]
    }))
  }

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const updateVariant = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }))
  }

  const handleHeroChange = (e) => {
    const { name, value } = e.target
    setHeroData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const uploadImage = async (file) => {
    try {
      console.log('=== UPLOAD IMAGE START ===')
      console.log('File details:', { name: file.name, type: file.type, size: file.size })
      
      const formData = new FormData()
      formData.append('image', file) // Field name 'image' matches backend upload.single('image')
      
      console.log('FormData created with field name: image')
      console.log('Uploading to:', `https://nile-backend-9wdk.onrender.com/api/upload/image`)

      // Don't set Content-Type header - axios will set it automatically with the correct boundary
      const response = await axios.post(`https://nile-backend-9wdk.onrender.com/api/upload/image`, formData, {
        timeout: 60000, // 60 second timeout for slow connections
        headers: {
          // Let axios set Content-Type automatically for multipart/form-data
        }
      })
      
      console.log('✅ Upload successful!')
      console.log('Response URL:', response.data.url)
      return response.data.url
    } catch (error) {
      console.error('❌ Image upload error:', error)
      console.error('Error type:', error.constructor.name)
      console.error('Error message:', error.message)
      console.error('Error code:', error.code)
      console.error('Error response status:', error.response?.status)
      console.error('Error response data:', error.response?.data)
      console.error('Error request config:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      })
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout - please try again with a smaller image')
      }
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Network error - please check that the server is running on port 5001')
      }
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      let imageUrl = ''

      // Priority: Use URL if provided, otherwise try file upload
      if (formData.imageUrl && formData.imageUrl.trim()) {
        // Use the manually pasted URL
        imageUrl = formData.imageUrl.trim()
        console.log('Using manual image URL:', imageUrl)
      } else if (formData.imageFile) {
        // Try uploading file
        try {
          setIsUploadingImage(true)
          imageUrl = await uploadImage(formData.imageFile)
          setIsUploadingImage(false)
          console.log('Image uploaded successfully:', imageUrl)
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError)
          setIsUploadingImage(false)
          throw new Error('Image upload failed. Please try again or provide an image URL.')
        }
      } else {
        throw new Error('Please provide either an image file or paste an image URL.')
      }

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        merchantName: formData.merchantName,
        imageUrl: imageUrl,
        description: formData.description,
        badge: formData.badge || null,
        category: formData.category || '',
        specifications: {
          length: formData.specifications.length || '',
          width: formData.specifications.width || '',
          height: formData.specifications.height || '',
          weight: formData.specifications.weight || '',
          material: formData.specifications.material || ''
        },
        variants: formData.variants.length > 0 ? formData.variants?.map(v => ({
          size: v.size || '',
          color: v.color || '',
          stock: parseInt(v.stock) || 0
        })) : []
      }

      const response = await axios.post(`https://nile-backend-9wdk.onrender.com/api/products`, productData)
      
      setMessage({
        type: 'success',
        text: 'Product saved successfully!'
      })

      // Reset form
      setFormData({
        name: '',
        price: '',
        merchantName: '',
        imageFile: null,
        imageUrl: '',
        description: '',
        badge: '',
        category: '',
        specifications: {
          length: '',
          width: '',
          height: '',
          weight: '',
          material: ''
        },
        variants: []
      })
      setImagePreview('')

      // Refresh products list
      fetchProducts()

      console.log('Product created:', response.data)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Failed to save product. Please try again.'
      })
      console.error('Error saving product:', error)
    } finally {
      setIsSubmitting(false)
      setIsUploadingImage(false)
    }
  }

  const handleHeroSubmit = async (e) => {
    e.preventDefault()
    setIsSavingHero(true)
    setMessage({ type: '', text: '' })

    try {
      console.log('Hero submit started. Hero data:', heroData)
      let heroImageUrl = ''

      // Priority: Use URL if provided, otherwise try file upload, otherwise use existing preview
      if (heroData.heroImageUrl && heroData.heroImageUrl.trim()) {
        // Use the manually pasted URL
        heroImageUrl = heroData.heroImageUrl.trim()
        console.log('Using manual hero image URL:', heroImageUrl)
      } else if (heroData.heroImage) {
        // Try uploading file
        console.log('Hero image file detected, uploading...')
        setIsUploadingImage(true)
        try {
          heroImageUrl = await uploadImage(heroData.heroImage)
          console.log('Hero image uploaded successfully:', heroImageUrl)
        } catch (uploadError) {
          console.error('Failed to upload hero image:', uploadError)
          setIsUploadingImage(false)
          throw new Error(`Image upload failed: ${uploadError.response?.data?.message || uploadError.message}. Please try providing an image URL instead.`)
        } finally {
          setIsUploadingImage(false)
        }
      } else if (heroImagePreview) {
        // Use existing preview (from previous save)
        heroImageUrl = heroImagePreview
        console.log('Using existing hero image preview:', heroImageUrl)
      }

      const settingsData = {
        heroImage: heroImageUrl || '',
        heroTitle: heroData.heroTitle || 'ELEVATE YOUR STYLE',
        heroSubtitle: heroData.heroSubtitle || 'Discover the latest trends in fashion',
        showHeroTitle: Boolean(heroData.showHeroTitle !== undefined ? heroData.showHeroTitle : true),
        showHeroSubtitle: Boolean(heroData.showHeroSubtitle !== undefined ? heroData.showHeroSubtitle : true)
      }

      console.log('Sending settings data to backend:', settingsData)
      console.log('Request URL:', `https://nile-backend-9wdk.onrender.com/api/settings`)
      console.log('Request method: PUT')
      
      const response = await axios.put(`https://nile-backend-9wdk.onrender.com/api/settings`, settingsData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('✅ Settings saved successfully:', response.data)
      
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Hero section updated successfully!'
        })

        setHeroData(prev => ({
          ...prev,
          heroImage: null,
          heroImageUrl: ''
        }))
        setHeroImagePreview(heroImageUrl)
        
        // Refresh settings to show updated values
        await fetchSettings()
        
        // Trigger immediate refresh in Hero component by dispatching a custom event
        window.dispatchEvent(new CustomEvent('heroSettingsUpdated'))
      } else {
        throw new Error(response.data.message || 'Failed to save settings')
      }

    } catch (error) {
      console.error('Error saving hero settings:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Failed to save hero settings. Please try again.'
      })
    } finally {
      setIsSavingHero(false)
      setIsUploadingImage(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    setDeletingId(productId)
    try {
      await axios.delete(`https://nile-backend-9wdk.onrender.com/api/products/${productId}`)
      
      // Refresh products list
      fetchProducts()
      
      setMessage({
        type: 'success',
        text: 'Product deleted successfully!'
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete product. Please try again.'
      })
      console.error('Error deleting product:', error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f9f8f6' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="text-black hover:text-gray-600 text-sm font-light transition-colors inline-flex items-center"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Storefront Management */}
        <div className="bg-white shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-serif text-black mb-8">Storefront Management</h1>

          {message.text && (
            <div
              className={`mb-6 p-4 rounded ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleHeroSubmit} className="space-y-6">
            {/* Hero Image */}
            <div>
              <label
                htmlFor="heroImage"
                className="block text-sm font-light text-gray-700 mb-2"
              >
                Hero Image
              </label>
              <input
                type="file"
                id="heroImage"
                name="heroImage"
                accept="image/*"
                onChange={handleHeroImageChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light mb-3"
              />
              <div className="text-center text-xs text-gray-500 mb-3">OR</div>
              <input
                type="url"
                id="heroImageUrl"
                name="heroImageUrl"
                value={heroData.heroImageUrl}
                onChange={handleHeroImageUrlChange}
                placeholder="Paste Image URL"
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
              />
              {heroImagePreview && (
                <div className="mt-4">
                  <img
                    src={heroImagePreview}
                    alt="Hero preview"
                    className="max-w-md h-48 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Hero Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="heroTitle"
                  className="block text-sm font-light text-gray-700"
                >
                  Main Title
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={heroData.showHeroTitle}
                    onChange={(e) => setHeroData(prev => ({ ...prev, showHeroTitle: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    heroData.showHeroTitle ? 'bg-black' : 'bg-gray-300'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      heroData.showHeroTitle ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                  <span className="ml-2 text-xs text-gray-600">Show Title</span>
                </label>
              </div>
              <input
                type="text"
                id="heroTitle"
                name="heroTitle"
                value={heroData.heroTitle}
                onChange={handleHeroChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                placeholder="ELEVATE YOUR STYLE"
              />
            </div>

            {/* Hero Subtitle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="heroSubtitle"
                  className="block text-sm font-light text-gray-700"
                >
                  Subtitle
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={heroData.showHeroSubtitle}
                    onChange={(e) => setHeroData(prev => ({ ...prev, showHeroSubtitle: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    heroData.showHeroSubtitle ? 'bg-black' : 'bg-gray-300'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      heroData.showHeroSubtitle ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                  <span className="ml-2 text-xs text-gray-600">Show Subtitle</span>
                </label>
              </div>
              <input
                type="text"
                id="heroSubtitle"
                name="heroSubtitle"
                value={heroData.heroSubtitle}
                onChange={handleHeroChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                placeholder="Discover the latest trends in fashion"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSavingHero || isUploadingImage}
                className="w-full bg-black text-white px-8 py-3 text-sm font-light uppercase tracking-wider hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingImage ? 'Uploading...' : isSavingHero ? 'Saving...' : 'Save Hero Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Add Product Form */}
        <div className="bg-white shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-serif text-black mb-8">Add New Product</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-light text-gray-700 mb-2"
              >
                Product Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                placeholder="Enter product name"
              />
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-light text-gray-700 mb-2"
              >
                Price (₦)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                placeholder="50000"
              />
            </div>

            {/* Merchant Name */}
            <div>
              <label
                htmlFor="merchantName"
                className="block text-sm font-light text-gray-700 mb-2"
              >
                Merchant Name
              </label>
              <input
                type="text"
                id="merchantName"
                name="merchantName"
                value={formData.merchantName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                placeholder="Enter merchant name"
              />
            </div>

            {/* Product Image */}
            <div>
              <label
                htmlFor="imageFile"
                className="block text-sm font-light text-gray-700 mb-2"
              >
                Product Image
              </label>
              <input
                type="file"
                id="imageFile"
                name="imageFile"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light mb-3"
              />
              <div className="text-center text-xs text-gray-500 mb-3">OR</div>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleImageUrlChange}
                placeholder="Paste Image URL"
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
              />
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-md h-48 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-light text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light resize-none"
                placeholder="Enter product description"
              />
            </div>

            {/* Badge */}
            <div>
              <label
                htmlFor="badge"
                className="block text-sm font-light text-gray-700 mb-2"
              >
                Badge (Optional)
              </label>
              <select
                id="badge"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
              >
                <option value="">None</option>
                <option value="Sale">Sale</option>
                <option value="New">New</option>
              </select>
            </div>

            {/* Advanced Details Section */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-light text-black mb-6">Advanced Details</h2>
              
              {/* Category */}
              <div className="mb-6">
                <label
                  htmlFor="category"
                  className="block text-sm font-light text-gray-700 mb-2"
                >
                  Category (Optional)
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                  placeholder="e.g., Clothing, Accessories, Shoes"
                />
              </div>

              {/* Specifications */}
              <div className="space-y-4">
                <h3 className="text-sm font-light text-gray-700 mb-4">Specifications (Optional)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="specLength"
                      className="block text-xs font-light text-gray-600 mb-1"
                    >
                      Length
                    </label>
                    <input
                      type="text"
                      id="specLength"
                      value={formData.specifications.length}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, length: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light text-sm"
                      placeholder="e.g., 50cm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="specWidth"
                      className="block text-xs font-light text-gray-600 mb-1"
                    >
                      Width
                    </label>
                    <input
                      type="text"
                      id="specWidth"
                      value={formData.specifications.width}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, width: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light text-sm"
                      placeholder="e.g., 30cm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="specHeight"
                      className="block text-xs font-light text-gray-600 mb-1"
                    >
                      Height
                    </label>
                    <input
                      type="text"
                      id="specHeight"
                      value={formData.specifications.height}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, height: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light text-sm"
                      placeholder="e.g., 20cm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="specWeight"
                      className="block text-xs font-light text-gray-600 mb-1"
                    >
                      Weight
                    </label>
                    <input
                      type="text"
                      id="specWeight"
                      value={formData.specifications.weight}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, weight: e.target.value }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light text-sm"
                      placeholder="e.g., 500g"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="specMaterial"
                    className="block text-xs font-light text-gray-600 mb-1"
                  >
                    Material
                  </label>
                  <input
                    type="text"
                    id="specMaterial"
                    value={formData.specifications.material}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      specifications: { ...prev.specifications, material: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light text-sm"
                    placeholder="e.g., 100% Cotton"
                  />
                </div>
              </div>
            </div>

            {/* Product Variants Section */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-light text-black">Product Variants</h2>
                <button
                  type="button"
                  onClick={addVariant}
                  className="px-4 py-2 text-sm font-light text-black border border-gray-300 hover:bg-gray-50 transition-colors uppercase tracking-wider"
                >
                  + Add Variant
                </button>
              </div>
              
              {formData.variants.length === 0 ? (
                <p className="text-sm font-light text-gray-500 italic">
                  No variants added. Product will be saved as a standard item.
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.variants?.map((variant, index) => (
                    <div key={index} className="border border-gray-200 p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-sm font-light text-gray-700">Variant {index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-xs font-light text-red-600 hover:text-red-800 uppercase tracking-wider"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-light text-gray-600 mb-1">
                            Size
                          </label>
                          <input
                            type="text"
                            value={variant.size}
                            onChange={(e) => updateVariant(index, 'size', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light text-sm"
                            placeholder="e.g., S, M, L"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-light text-gray-600 mb-1">
                            Color
                          </label>
                          <input
                            type="text"
                            value={variant.color}
                            onChange={(e) => updateVariant(index, 'color', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light text-sm"
                            placeholder="e.g., Black, Red"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-light text-gray-600 mb-1">
                            Stock
                          </label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light text-sm"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="w-full bg-black text-white px-8 py-3 text-sm font-light uppercase tracking-wider hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingImage ? 'Uploading Image...' : isSubmitting ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>

        {/* Products List */}
        <div className="bg-white shadow-sm p-8">
          <h2 className="text-2xl font-serif text-black mb-6">All Products</h2>
          
          {loading ? (
            <p className="text-sm font-light text-gray-600">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-sm font-light text-gray-600">No products found. Add your first product above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-light text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="text-left py-3 px-4 text-xs font-light text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-light text-gray-500 uppercase tracking-wider">Merchant</th>
                    <th className="text-left py-3 px-4 text-xs font-light text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="text-left py-3 px-4 text-xs font-light text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="text-left py-3 px-4 text-xs font-light text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.map((product) => (
                    <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-16 h-20 object-cover"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-light text-black">{product.name}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-xs font-light text-gray-600 uppercase">{product.merchantName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-light text-black">{formatPrice(product.price)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-xs font-light text-gray-600 max-w-xs truncate">{product.description}</p>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deletingId === product._id}
                          className="bg-red-600 text-white px-4 py-2 text-xs font-light uppercase tracking-wider hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === product._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Admin
