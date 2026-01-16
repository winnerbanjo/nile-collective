import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { User, ShoppingBag, Search } from 'lucide-react'
import { useCart } from '../context/CartContext'
import SearchResultsDropdown from './SearchResultsDropdown'

const Navbar = () => {
  const { getCartItemCount, setIsDrawerOpen } = useCart()
  const cartItemCount = getCartItemCount()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchRef = useRef(null)

  // User icon click - links to account/dashboard
  const handleUserIconClick = () => {
    try {
      window.location.href = '/account/dashboard'
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Typographic Logo - Absolute Left */}
            <Link to="/" className="flex-shrink-0 mr-6 sm:mr-8 lg:mr-12">
              <div className="text-left" style={{ lineHeight: '0.72', fontFamily: "'Nunito Sans', sans-serif" }}>
                <div className="text-xl font-black text-black lowercase" style={{ fontWeight: 900 }}>
                  nile
                </div>
                <div className="text-xl font-black text-black lowercase" style={{ fontWeight: 900 }}>
                  collective
                </div>
              </div>
            </Link>

            {/* Desktop Navigation - Centered/Balanced */}
            <div className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
              <Link
                to="/shop"
                className="text-black hover:text-gray-600 px-3 py-2 text-sm font-light transition-colors uppercase tracking-wider"
              >
                Shop All
              </Link>
              <Link
                to="/new-arrivals"
                className="text-black hover:text-gray-600 px-3 py-2 text-sm font-light transition-colors uppercase tracking-wider"
              >
                New Arrivals
              </Link>
              <Link
                to="/merchants"
                className="text-black hover:text-gray-600 px-3 py-2 text-sm font-light transition-colors uppercase tracking-wider"
              >
                Merchants
              </Link>
              <Link
                to="/about"
                className="text-black hover:text-gray-600 px-3 py-2 text-sm font-light transition-colors uppercase tracking-wider"
              >
                About
              </Link>
            </div>

            {/* Search Bar - Flat, Better Spacing */}
            <div className="hidden lg:flex items-center flex-shrink-0 ml-6">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Search..."
                  className="w-48 pl-8 pr-3 py-1.5 text-sm font-light border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors bg-white"
                />
                {/* Search Results Dropdown */}
                {isSearchFocused && (
                  <SearchResultsDropdown
                    searchQuery={searchQuery}
                    onClose={() => {
                      setSearchQuery('')
                      setIsSearchFocused(false)
                    }}
                  />
                )}
              </div>
            </div>

            {/* Icons - Absolute Right */}
            <div className="flex items-center space-x-4 flex-shrink-0 ml-auto">
              {/* Search Icon - Mobile Only */}
              <button
                onClick={() => {
                  setSearchQuery('')
                  setIsSearchFocused(true)
                  setTimeout(() => searchRef.current?.focus(), 100)
                }}
                className="lg:hidden text-black hover:text-gray-600 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              {/* User Icon 👤 */}
              <button
                onClick={handleUserIconClick}
                className="text-black hover:text-gray-600 transition-colors hover:scale-110 transform duration-200"
                aria-label="My Account"
              >
                <User className="w-5 h-5" />
              </button>
              {/* Cart Icon 👜 */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="relative text-black hover:text-gray-600 transition-colors hover:scale-110 transform duration-200"
                aria-label="Cart"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-normal">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden border-t border-gray-200 pt-4 pb-4">
            {/* Mobile Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 text-sm font-light border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors bg-white"
                />
              </div>
              {/* Mobile Search Results */}
              {isSearchFocused && (
                <div className="relative mt-2">
                  <SearchResultsDropdown
                    searchQuery={searchQuery}
                    onClose={() => {
                      setSearchQuery('')
                      setIsSearchFocused(false)
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="text-black hover:text-gray-600 text-sm font-light transition-colors uppercase tracking-wider"
              >
                Shop All
              </Link>
              <Link
                to="/new-arrivals"
                className="text-black hover:text-gray-600 text-sm font-light transition-colors uppercase tracking-wider"
              >
                New Arrivals
              </Link>
              <Link
                to="/merchants"
                className="text-black hover:text-gray-600 text-sm font-light transition-colors uppercase tracking-wider"
              >
                Merchants
              </Link>
              <Link
                to="/about"
                className="text-black hover:text-gray-600 text-sm font-light transition-colors uppercase tracking-wider"
              >
                About
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar
