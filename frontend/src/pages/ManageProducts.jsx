import { useState, useEffect, Fragment } from 'react'
import axios from 'axios'
import { useCurrency } from '../context/CurrencyContext'

const ManageProducts = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    merchantName: '',
    imageFile: null,
    imageUrl: '',
    description: '',
    badge: '',
    category: '',
    stockQuantity: '',
    sizes: [],
    colors: [],
    isFeatured: false,
    sizeGuideFile: null,
    sizeGuideUrl: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [sizeGuidePreview, setSizeGuidePreview] = useState('')
  const [isUploadingSizeGuide, setIsUploadingSizeGuide] = useState(false)
  const [sizeInput, setSizeInput] = useState('')
  const [colorInput, setColorInput] = useState('')
  const { formatPrice } = useCurrency()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`https://nile-backend-9wdk.onrender.com/api/products`)
      // Ensure products is always an array
      const productsData = Array.isArray(response.data) ? response.data : []
      setProducts(productsData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([]) // Set to empty array on error
      setLoading(false)
    }
  }

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
        imageUrl: ''
      }))
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
      imageFile: null
    }))
    if (url) {
      setImagePreview(url)
    } else {
      setImagePreview('')
    }
  }

  const handleSizeGuideChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        setIsUploadingSizeGuide(true)
        const url = await uploadImage(file)
        setFormData(prev => ({
          ...prev,
          sizeGuideFile: null,
          sizeGuideUrl: url
        }))
        setSizeGuidePreview(url)
        setIsUploadingSizeGuide(false)
      } catch (error) {
        console.error('Size guide upload error:', error)
        setIsUploadingSizeGuide(false)
      }
    }
  }

  const handleSizeGuideUrlChange = (e) => {
    const url = e.target.value
    setFormData(prev => ({
      ...prev,
      sizeGuideUrl: url,
      sizeGuideFile: null
    }))
    setSizeGuidePreview(url || '')
  }

  const addSize = () => {
    if (sizeInput.trim()) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, sizeInput.trim()]
      }))
      setSizeInput('')
    }
  }

  const removeSize = (index) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }))
  }

  const addColor = () => {
    if (colorInput.trim()) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, colorInput.trim()]
      }))
      setColorInput('')
    }
  }

  const removeColor = (index) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }))
  }

  const uploadImage = async (file) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await axios.post(`https://nile-backend-9wdk.onrender.com/api/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data.url
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      let imageUrl = ''
      let sizeGuideUrl = formData.sizeGuideUrl || ''

      if (formData.imageUrl && formData.imageUrl.trim()) {
        imageUrl = formData.imageUrl.trim()
      } else if (formData.imageFile) {
        try {
          setIsUploadingImage(true)
          imageUrl = await uploadImage(formData.imageFile)
          setIsUploadingImage(false)
        } catch (uploadError) {
          setIsUploadingImage(false)
          throw new Error('Image upload failed. Please try again or provide an image URL.')
        }
      } else {
        throw new Error('Please provide either an image file or paste an image URL.')
      }

      // Handle size guide upload if file is selected
      if (formData.sizeGuideFile) {
        try {
          setIsUploadingSizeGuide(true)
          sizeGuideUrl = await uploadImage(formData.sizeGuideFile)
          setIsUploadingSizeGuide(false)
        } catch (uploadError) {
          setIsUploadingSizeGuide(false)
          console.error('Size guide upload failed, continuing without it')
        }
      }

      // Convert sizes and colors arrays to variants format
      const variants = []
      if (formData.sizes.length > 0 || formData.colors.length > 0) {
        const sizes = formData.sizes.length > 0 ? formData.sizes : ['']
        const colors = formData.colors.length > 0 ? formData.colors : ['']
        
        sizes.forEach(size => {
          colors.forEach(color => {
            variants.push({
              size: size || '',
              color: color || '',
              stock: parseInt(formData.stockQuantity) || 0
            })
          })
        })
      }

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        merchantName: formData.merchantName,
        imageUrl: imageUrl,
        description: formData.description,
        badge: formData.badge || null,
        category: formData.category || '',
        isFeatured: formData.isFeatured || false,
        variants: variants.length > 0 ? variants : [],
        sizeGuideUrl: sizeGuideUrl || ''
      }

      if (editingId) {
        await axios.put(`https://nile-backend-9wdk.onrender.com/api/products/${editingId}`, productData)
        setMessage({
          type: 'success',
          text: 'Product updated successfully!'
        })
        setEditingId(null)
      } else {
        await axios.post(`https://nile-backend-9wdk.onrender.com/api/products`, productData)
        setMessage({
          type: 'success',
          text: 'Product created successfully!'
        })
      }

      // Reset form - include ALL fields including sizeGuide
      setFormData({
        name: '',
        price: '',
        merchantName: '',
        imageFile: null,
        imageUrl: '',
        description: '',
        badge: '',
        category: '',
        stockQuantity: '',
        sizes: [],
        colors: [],
        isFeatured: false,
        sizeGuideFile: null,
        sizeGuideUrl: ''
      })
      setImagePreview('')
      setSizeGuidePreview('')
      setSizeInput('')
      setColorInput('')

      fetchProducts()
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

  const handleEdit = (product) => {
    setEditingId(product._id)
    const sizes = [...new Set(product.variants?.map(v => v?.size).filter(Boolean) || [])]
    const colors = [...new Set(product.variants?.map(v => v?.color).filter(Boolean) || [])]
    const stock = product.variants?.[0]?.stock || 0
    
    setFormData({
      name: product.name,
      price: product.price.toString(),
      merchantName: product.merchantName,
      imageFile: null,
      imageUrl: product.imageUrl,
      description: product.description,
      badge: product.badge || '',
      category: product.category || '',
      stockQuantity: stock.toString(),
      sizes: sizes,
      colors: colors,
      isFeatured: product.isFeatured || false,
      sizeGuideFile: null,
      sizeGuideUrl: product.sizeGuideUrl || ''
    })
    setImagePreview(product.imageUrl)
    setSizeGuidePreview(product.sizeGuideUrl || '')
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    setDeletingId(productId)
    try {
      await axios.delete(`https://nile-backend-9wdk.onrender.com/api/products/${productId}`)
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
    <>
      <div className="p-8">
        <h1 className="text-3xl font-serif text-black mb-8">Product Management</h1>

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

        {/* Add/Edit Product Form */}
        <div className="bg-white shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-serif text-black mb-6">
            {editingId ? 'Edit Product' : 'Add New Product'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-light text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
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
                <label className="block text-sm font-light text-gray-700 mb-2">
                  Price (₦) *
                </label>
                <input
                  type="number"
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
                <label className="block text-sm font-light text-gray-700 mb-2">
                  Merchant Name *
                </label>
                <input
                  type="text"
                  name="merchantName"
                  value={formData.merchantName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                  placeholder="Enter merchant name"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-light text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                  placeholder="e.g., Clothing, Accessories"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-sm font-light text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                  placeholder="0"
                />
              </div>

              {/* Badge */}
              <div>
                <label className="block text-sm font-light text-gray-700 mb-2">
                  Badge (Optional)
                </label>
                <select
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

              {/* Featured Toggle */}
              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isFeatured ? 'bg-black' : 'bg-gray-300'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isFeatured ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                  <span className="ml-3 text-sm font-light text-gray-700">Featured Product</span>
                </label>
                <p className="text-xs font-light text-gray-500 mt-1 ml-14">
                  Featured products appear in the homepage hero section
                </p>
              </div>
            </div>

            {/* Product Image */}
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">
                Product Image *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light mb-3"
              />
              <div className="text-center text-xs text-gray-500 mb-3">OR</div>
              <input
                type="url"
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

            {/* Size Guide Upload */}
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">
                Size Guide Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleSizeGuideChange}
                disabled={isUploadingSizeGuide}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light mb-3 disabled:opacity-50"
              />
              {isUploadingSizeGuide && (
                <p className="text-xs font-light text-gray-500 mb-3">Uploading size guide...</p>
              )}
              <div className="text-center text-xs text-gray-500 mb-3">OR</div>
              <input
                type="url"
                value={formData.sizeGuideUrl}
                onChange={handleSizeGuideUrlChange}
                placeholder="Paste Size Guide Image URL"
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
              />
              {sizeGuidePreview && (
                <div className="mt-4">
                  <img
                    src={sizeGuidePreview}
                    alt="Size Guide Preview"
                    className="max-w-md h-48 object-contain border border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light resize-none"
                placeholder="Enter product description"
              />
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">
                Sizes (Optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                  className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                  placeholder="e.g., S, M, L, XL"
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="px-4 py-2 bg-black text-white text-sm font-light uppercase tracking-wider hover:bg-gray-800 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.sizes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.sizes?.map((size, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-black text-sm font-light"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">
                Colors (Optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                  className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                  placeholder="e.g., Black, Red, Blue"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="px-4 py-2 bg-black text-white text-sm font-light uppercase tracking-wider hover:bg-gray-800 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.colors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.colors?.map((color, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-black text-sm font-light"
                    >
                      {color}
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="flex-1 bg-black text-white px-8 py-3 text-sm font-light uppercase tracking-wider hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingImage ? 'Uploading Image...' : isSubmitting ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setFormData({
                      name: '',
                      price: '',
                      merchantName: '',
                      imageFile: null,
                      imageUrl: '',
                      description: '',
                      badge: '',
                      category: '',
                      stockQuantity: '',
                      sizes: [],
                      colors: [],
                      isFeatured: false
                    })
                    setImagePreview('')
                  }}
                  className="px-8 py-3 border border-gray-300 text-black text-sm font-light uppercase tracking-wider hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
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
                    <th className="text-left py-3 px-4 text-xs font-light text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-light text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(products) && products.length > 0 ? products?.map((product) => {
                    if (!product || !product._id) return null
                    return (
                      <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <img
                            src={product?.imageUrl || 'https://via.placeholder.com/64x80/f5f5f5/999999?text=No+Image'}
                            alt={product?.name || 'Product'}
                            className="w-16 h-20 object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/64x80/f5f5f5/999999?text=No+Image'
                            }}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-light text-black">{product?.name || 'N/A'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-xs font-light text-gray-600 uppercase">{product?.merchantName || 'N/A'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-light text-black">{formatPrice(product?.price || 0)}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-xs font-light text-gray-600">{product?.category || '—'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="bg-blue-600 text-white px-4 py-2 text-xs font-light uppercase tracking-wider hover:bg-blue-700 transition-colors duration-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product?._id)}
                              disabled={deletingId === product?._id}
                              className="bg-red-600 text-white px-4 py-2 text-xs font-light uppercase tracking-wider hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingId === product?._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  }) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ManageProducts
