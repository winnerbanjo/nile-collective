import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const AdminLogin = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const location = useLocation()

  // Check if already authenticated on mount - redirect immediately
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth') === 'true'
    if (isAuthenticated) {
      // If already logged in, redirect immediately
      const from = location.state?.from?.pathname || '/nile-admin-portal/orders'
      window.location.href = from
    }
  }, [location.state?.from?.pathname])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300))

    // Hardcoded password check
    const correctPassword = 'Vision_2026!'
    
    if (password === correctPassword) {
      // Set localStorage with 'adminAuth' key immediately
      localStorage.setItem('adminAuth', 'true')
      
      // Use window.location.href for clean browser refresh
      // This forces a complete page reload and clears any stuck memory
      const targetUrl = location.state?.from?.pathname || '/nile-admin-portal/orders'
      window.location.href = targetUrl
    } else {
      setError('Incorrect password. Please try again.')
      setPassword('')
      localStorage.removeItem('adminAuth')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-sm p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-black mb-2">Nile Admin</h1>
            <p className="text-sm font-light text-gray-600 uppercase tracking-wider">
              Management Portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-light text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                placeholder="Enter admin password"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-800 border border-red-200 p-3 text-sm font-light">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white px-8 py-3 text-sm font-light uppercase tracking-wider hover:bg-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
