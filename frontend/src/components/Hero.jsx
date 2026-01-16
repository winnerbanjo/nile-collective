import { useEffect, useState } from 'react'
import axios from 'axios'

const Hero = () => {
  const [settings, setSettings] = useState({
    heroImage: '',
    heroTitle: 'ELEVATE YOUR STYLE',
    heroSubtitle: 'Discover the latest trends in fashion',
    showHeroTitle: true,
    showHeroSubtitle: true
  })
  const [loading, setLoading] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log('Fetching settings from: http://localhost:5001/api/settings')
        const response = await axios.get('http://localhost:5001/api/settings')
        if (response.data) {
          const newSettings = {
            heroImage: response.data.heroImage || '',
            heroTitle: response.data.heroTitle || 'ELEVATE YOUR STYLE',
            heroSubtitle: response.data.heroSubtitle || 'Discover the latest trends in fashion',
            showHeroTitle: response.data.showHeroTitle !== undefined ? response.data.showHeroTitle : true,
            showHeroSubtitle: response.data.showHeroSubtitle !== undefined ? response.data.showHeroSubtitle : true
          }
          setSettings(newSettings)
          console.log('Current Settings:', newSettings)
        }
      } catch (error) {
        console.error('❌ Error fetching hero settings:', error)
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()

    // Listen for immediate refresh event from Admin panel
    const handleSettingsUpdate = () => {
      console.log('🔄 Hero settings update event received, refreshing...')
      fetchSettings()
    }
    window.addEventListener('heroSettingsUpdated', handleSettingsUpdate)

    // Set up polling to refresh settings every 5 seconds (backup refresh)
    const intervalId = setInterval(fetchSettings, 5000)

    // Parallax scroll effect
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('heroSettingsUpdated', handleSettingsUpdate)
      clearInterval(intervalId)
    }
  }, [])

  const handleShopClick = () => {
    const productsSection = document.getElementById('products')
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Don't render if no hero image
  if (loading || !settings.heroImage) {
    return null
  }

  const parallaxTransform = `translateY(${scrollY * 0.3}px) scale(${1 + scrollY * 0.0001})`

  return (
    <section className="relative w-full" style={{ height: '100vh' }}>
      {/* Hero Image Container with Parallax and Zoom-in Animation */}
      <div className="absolute inset-0">
        <div
          style={{
            transform: parallaxTransform,
            transition: 'transform 0.1s ease-out'
          }}
          className="w-full h-full"
        >
          <img
            src={settings.heroImage}
            alt="Fashion Hero"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover object-center transition-transform duration-1000 ease-out ${
              imageLoaded ? 'scale-100' : 'scale-110'
            }`}
          />
        </div>
        {/* Dark overlay (30% opacity) for text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl">
          {settings?.showHeroTitle !== false && (
            <h1 
              className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-6 tracking-tight"
              style={{ 
                fontFamily: 'Poppins, sans-serif',
                textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                letterSpacing: '0.05em'
              }}
            >
              {settings?.heroTitle || 'THE NILE COLLECTION'}
            </h1>
          )}
          {settings?.showHeroSubtitle !== false && (
            <p className="text-xl md:text-2xl lg:text-3xl text-white/95 mb-10 font-light tracking-wide">
              {settings?.heroSubtitle}
            </p>
          )}
          <button 
            onClick={handleShopClick}
            className="bg-black text-white px-10 py-4 text-sm font-light uppercase tracking-[0.2em] hover:bg-gray-900 transition-all duration-300 hover:scale-105 border border-white/20"
            style={{ letterSpacing: '0.2em' }}
          >
            Shop Now
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero
