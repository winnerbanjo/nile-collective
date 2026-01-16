import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const CurrencyContext = createContext()

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    // Load from localStorage or default to NGN
    return localStorage.getItem('selectedCurrency') || 'NGN'
  })
  const [exchangeRates, setExchangeRates] = useState({
    NGN: 1,
    USD: 0.0012,
    GBP: 0.00095,
    EUR: 0.0011
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Save to localStorage when currency changes
    localStorage.setItem('selectedCurrency', currency)
  }, [currency])

  useEffect(() => {
    // Fetch exchange rates from free API
    const fetchExchangeRates = async () => {
      try {
        // Using exchangerate-api.com free tier (no API key needed for base USD)
        // We'll convert from NGN (base) to other currencies
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/NGN')
        
        if (response.data && response.data.rates) {
          setExchangeRates({
            NGN: 1,
            USD: response.data.rates.USD || 0.0012,
            GBP: response.data.rates.GBP || 0.00095,
            EUR: response.data.rates.EUR || 0.0011
          })
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error)
        // Use fallback rates if API fails
        setExchangeRates({
          NGN: 1,
          USD: 0.0012,
          GBP: 0.00095,
          EUR: 0.0011
        })
      } finally {
        setLoading(false)
      }
    }

    fetchExchangeRates()
    // Refresh rates every hour
    const interval = setInterval(fetchExchangeRates, 3600000)
    return () => clearInterval(interval)
  }, [])

  const convertPrice = (priceInNGN) => {
    if (!priceInNGN) return 0
    const rate = exchangeRates[currency] || 1
    return priceInNGN * rate
  }

  const formatPrice = (priceInNGN) => {
    const convertedPrice = convertPrice(priceInNGN)
    
    const currencySymbols = {
      NGN: '₦',
      USD: '$',
      GBP: '£',
      EUR: '€'
    }

    const currencyLocales = {
      NGN: 'en-NG',
      USD: 'en-US',
      GBP: 'en-GB',
      EUR: 'en-EU'
    }

    const symbol = currencySymbols[currency] || '₦'
    
    if (currency === 'NGN') {
      return new Intl.NumberFormat(currencyLocales[currency], {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(convertedPrice)
    } else {
      return new Intl.NumberFormat(currencyLocales[currency], {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(convertedPrice)
    }
  }

  const value = {
    currency,
    setCurrency,
    exchangeRates,
    loading,
    convertPrice,
    formatPrice
  }

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}
