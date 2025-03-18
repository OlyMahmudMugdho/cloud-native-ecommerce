import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function MobileNav() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col space-y-4">
          <Link
            to="/"
            className="text-lg font-medium hover:text-primary"
          >
            Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/products"
                className="text-lg font-medium hover:text-primary"
              >
                Products
              </Link>
              <Link
                to="/categories"
                className="text-lg font-medium hover:text-primary"
              >
                Categories
              </Link>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-lg font-medium hover:text-primary">
                Login
              </Link>
              <Link
                to="/register"
                className="text-lg font-medium hover:text-primary"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}