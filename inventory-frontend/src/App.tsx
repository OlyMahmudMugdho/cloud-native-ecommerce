import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import VerifyEmail from '@/pages/VerifyEmail';
import ResetPassword from '@/pages/ResetPassword';
import Products from '@/pages/Products';
import ProductDetails from '@/pages/ProductDetails';
import Categories from '@/pages/Categories';
import CategoryDetails from '@/pages/CategoryDetails';
import UserManagementDetail from './pages/UserManagementDetail';
import UserManagement from './pages/UserManagement';
import ProductUpdate from './pages/ProductUpdate';
import CategoryUpdate from './pages/CategoryUpdate';
import ProductNew from './pages/ProductNew';
import CategoryNew from './pages/CategoryNew';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-grow w-full">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify" element={<VerifyEmail />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/products/edit/:id" element={<ProductUpdate />} />
                <Route path="/products/new" element={<ProductNew />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categories/:id" element={<CategoryDetails />} />
                <Route path="/categories/edit/:id" element={<CategoryUpdate />} />
                <Route path="/categories/new" element={<CategoryNew />} />
                <Route path="/user-management" element={<UserManagement />} />
                <Route path="/user-management/:id" element={<UserManagementDetail />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;