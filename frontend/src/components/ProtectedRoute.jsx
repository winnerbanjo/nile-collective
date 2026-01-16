import { Navigate, useLocation, Outlet } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  
  // Direct localStorage check - no useEffect, no async, no delay
  const isAuth = !!localStorage.getItem('adminAuth')

  // If authenticated, render children (which contains AdminLayout with Outlet)
  if (isAuth) {
    return children
  }

  // If not authenticated, redirect to login
  return <Navigate to="/admin-login" state={{ from: location }} replace />
}

export default ProtectedRoute
