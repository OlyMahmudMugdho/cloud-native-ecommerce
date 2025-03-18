import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Package className="h-6 w-6" />
              <span className="text-xl font-bold">Inventory</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/products"
                  className="text-sm font-medium hover:text-primary"
                >
                  Products
                </Link>
                <Link
                  to="/categories"
                  className="text-sm font-medium hover:text-primary"
                >
                  Categories
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}