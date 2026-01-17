import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for logged-in user on mount
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    const userEmail = localStorage.getItem('userEmail')
    const userName = localStorage.getItem('userName')

    if (userId && userEmail) {
      setUser({
        id: userId,
        email: userEmail,
        name: userName || ''
      })
    }
    setLoading(false)
  }, [])

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('https://nile-backend-9wdk.onrender.com/api/users/register', {
        name,
        email,
        password
      })

      if (response.data.success) {
        const userData = response.data.user
        localStorage.setItem('userId', userData._id)
        localStorage.setItem('userEmail', userData.email)
        localStorage.setItem('userName', userData.name)
        setUser({
          id: userData._id,
          email: userData.email,
          name: userData.name
        })
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post('https://nile-backend-9wdk.onrender.com/api/users/login', {
        email,
        password
      })

      if (response.data.success) {
        const userData = response.data.user
        localStorage.setItem('userId', userData._id)
        localStorage.setItem('userEmail', userData.email)
        localStorage.setItem('userName', userData.name)
        setUser({
          id: userData._id,
          email: userData.email,
          name: userData.name
        })
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    setUser(null)
  }

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
