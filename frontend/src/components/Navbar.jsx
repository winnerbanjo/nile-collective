import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, ShoppingBag, Search, ChevronDown } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import SearchResultsDropdown from './SearchResultsDropdown'

const Navbar = () => {
  const { getCartItemCount, setIsDrawerOpen } = useCart()
  const { currency, setCurrency } = useCurrency()
  const cartItemCount = getCartItemCount()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false)
  const searchRef = useRef(null)
  const currencyDesktopRef = useRef(null)

  // User icon click - links to account/dashboard
  const handleUserIconClick = () => {
    try {
      window.location.href = '/account/dashboard'
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  // Close currency dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyDesktopRef.current && !currencyDesktopRef.current.contains(event.target)) {
        setIsCurrencyOpen(false)
      }
    }
    if (isCurrencyOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCurrencyOpen])

  const currencyOptions = [
    { code: 'NGN', symbol: '₦', label: 'NGN' },
    { code: 'USD', symbol: '$', label: 'USD' }
  ]

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency)
    setIsCurrencyOpen(false)
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

            {/* Icons & Currency - Absolute Right */}
            <div className="flex items-center gap-4 flex-shrink-0 ml-6">
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
              {/* Currency Switcher - Desktop & Mobile in Header */}
              <div className="relative" ref={currencyDesktopRef}>
                <button
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                  className="flex items-center space-x-1 text-black hover:text-gray-600 transition-colors text-sm font-light uppercase tracking-wider"
                  aria-label="Currency"
                >
                  <span>{currencyOptions.find(opt => opt.code === currency)?.symbol || '₦'}</span>
                  <span className="text-xs lg:text-xs">{currency}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCurrencyOpen && (
                  <div className="absolute right-0 mt-2 w-24 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {currencyOptions.map((option) => (
                      <button
                        key={option.code}
                        onClick={() => handleCurrencyChange(option.code)}
                        className={`w-full text-left px-3 py-2 text-sm font-light uppercase tracking-wider transition-colors ${
                          currency === option.code
                            ? 'bg-black text-white'
                            : 'text-black hover:bg-gray-50'
                        }`}
                      >
                        <span className="mr-2">{option.symbol}</span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
            <div className="flex flex-wrap gap-4 items-center">
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
