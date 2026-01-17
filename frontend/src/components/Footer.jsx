import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Twitter, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    try {
      // Store newsletter subscription in localStorage for now
      // In production, this would send to your backend/EmailJS
      const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]')
      if (!subscribers.includes(email)) {
        subscribers.push(email)
        localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers))
      }

      // Optional: Send to backend if endpoint exists
      try {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/newsletter/subscribe`, { email })
      } catch (error) {
        console.log('Newsletter subscription saved locally')
      }

      setSubmitted(true)
      setEmail('')
      setTimeout(() => {
        setSubmitted(false)
      }, 3000)
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setSubmitted(true)
      setEmail('')
      setTimeout(() => {
        setSubmitted(false)
      }, 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Typographic Logo */}
        <div className="mb-8">
          <div className="text-left" style={{ lineHeight: '0.72', fontFamily: "'Nunito Sans', sans-serif" }}>
            <div className="text-lg text-black lowercase" style={{ fontWeight: 900 }}>
              nile
            </div>
            <div className="text-lg text-black lowercase" style={{ fontWeight: 900 }}>
              collective
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Shop Column */}
          <div>
            <h3 className="text-sm font-light text-black uppercase tracking-wider mb-6">
              Shop 👜
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm font-light text-gray-600 hover:text-black transition-colors"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm font-light text-gray-600 hover:text-black transition-colors"
                >
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-sm font-light text-black uppercase tracking-wider mb-6">
              Company 🌍
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-sm font-light text-gray-600 hover:text-black transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm font-light text-gray-600 hover:text-black transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-sm font-light text-black uppercase tracking-wider mb-6">
              Support ✨
            </h3>
            <div className="space-y-4">
              {/* Shipping Info */}
              <div>
                <h4 className="text-xs font-light text-black uppercase tracking-wider mb-2">
                  Shipping
                </h4>
                <p className="text-xs font-light text-gray-600 leading-relaxed">
                  Nile Collective offers worldwide express shipping. Lagos orders: 1-2 days. International: 5-7 business days via DHL. Tracking provided upon dispatch.
                </p>
              </div>
              {/* Contact Info */}
              <div>
                <h4 className="text-xs font-light text-black uppercase tracking-wider mb-2">
                  Contact
                </h4>
                <p className="text-xs font-light text-gray-600 leading-relaxed">
                  Customer Concierge: support@nilecollective.com<br />
                  WhatsApp: +234 [Your Number]<br />
                  Studio: Victoria Island, Lagos
                </p>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="col-span-1 md:col-span-3 mt-8 pt-8 border-t border-gray-200"
          >
            <div className="max-w-md mx-auto text-center">
              <h3 className="text-sm font-light text-black uppercase tracking-wider mb-4">
                Join the Collective ✨
              </h3>
              <p className="text-xs font-light text-gray-600 mb-4">
                Subscribe to receive updates on new arrivals and exclusive offers
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 text-sm font-light border border-gray-300 focus:outline-none focus:border-black transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-black text-white text-sm font-light uppercase tracking-wider hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Subscribing...' : submitted ? 'Subscribed!' : 'Subscribe'}
                </button>
              </form>
              {submitted && (
                <p className="text-xs font-light text-green-600 mt-2">
                  Thank you for joining! ✨
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Social Icons */}
            <div className="flex items-center space-x-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-xs font-light text-gray-600">
              © NILE AFRICA TECHNOLOGIES LIMITED 2026
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
