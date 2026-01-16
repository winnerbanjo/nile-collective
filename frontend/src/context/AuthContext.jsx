import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated on mount - check both keys for backwards compatibility
    const authStatus = localStorage.getItem('adminAuth') === 'true' || localStorage.getItem('adminAuthenticated') === 'true'
    if (authStatus) {
      setIsAuthenticated(true)
      // Ensure both keys are set
      localStorage.setItem('adminAuth', 'true')
    }
  }, [])

  const login = (password) => {
    // Hardcoded password
    const correctPassword = 'Vision_2026!'
    if (password === correctPassword) {
      setIsAuthenticated(true)
      localStorage.setItem('adminAuth', 'true')
      // Keep old key for backwards compatibility
      localStorage.setItem('adminAuthenticated', 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('adminAuthenticated')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
