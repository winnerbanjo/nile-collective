import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { UserProvider } from './context/UserContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import ShopAll from './pages/ShopAll'
import NewArrivals from './pages/NewArrivals'
import Merchants from './pages/Merchants'
import AboutUs from './pages/AboutUs'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import AdminOrders from './pages/AdminOrders'
import AdminSubscribers from './pages/AdminSubscribers'
import AdminReviews from './pages/AdminReviews'
import ManageProducts from './pages/ManageProducts'
import ProductDetail from './pages/ProductDetail'
import Success from './pages/Success'
import OrderSummary from './pages/OrderSummary'
import TrackOrder from './pages/TrackOrder'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Login from './pages/Login'
import MyAccount from './pages/MyAccount'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import SocialProof from './components/SocialProof'
import WhatsAppButton from './components/WhatsAppButton'

function App() {
  console.log('App.jsx rendering - Routes configured')
  
  // Safety wrapper: If critical contexts fail to load, show loading state
  try {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <CurrencyProvider>
            <UserProvider>
              <CartProvider>
                <Router>
                  {/* CartDrawer at the very top - globally available, never unmounts */}
                  <CartDrawer />
                  <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<ShopAll />} />
                <Route path="/new-arrivals" element={<NewArrivals />} />
                <Route path="/merchants" element={<Merchants />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/admin" element={<Admin />} />
                
                {/* Customer Account Routes - All Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/account/login" element={<Login />} />
                <Route path="/my-account" element={<MyAccount />} />
                <Route path="/account/profile" element={<MyAccount />} />
                <Route path="/account/dashboard" element={<MyAccount />} />
                
                {/* Admin Login - Public Route */}
                <Route path="/admin-login" element={<AdminLogin />} />
                
                {/* Admin Portal - Protected Parent Route with Nested Routes */}
                <Route path="/nile-admin-portal" element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  {/* Index route redirects to orders */}
                  <Route index element={<Navigate to="/nile-admin-portal/orders" replace />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="products" element={<ManageProducts />} />
                  <Route path="subscribers" element={<AdminSubscribers />} />
                  <Route path="reviews" element={<AdminReviews />} />
                </Route>
                
                {/* Product & Order Routes */}
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/success" element={<Success />} />
                <Route path="/order-confirmation/:id" element={<OrderSummary />} />
                <Route path="/track-order" element={<TrackOrder />} />
                  </Routes>
                  {/* Footer outside Routes - shows on all pages */}
                  <Footer />
                  {/* Social Proof Notifications */}
                  <SocialProof />
                  <WhatsAppButton />
                </Router>
              </CartProvider>
            </UserProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ErrorBoundary>
    )
  } catch (error) {
    // Safety fallback: If anything crashes, show loading state instead of white screen
    console.error('App initialization error:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-light text-black mb-2">Loading Nile...</h1>
          <p className="text-sm font-light text-gray-600">Please wait</p>
        </div>
      </div>
    )
  }
}

export default App
