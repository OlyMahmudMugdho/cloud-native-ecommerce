import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Menu, LogOut, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navItems = (
    <>
      <Link to="/" className="text-foreground hover:text-primary">
        Home
      </Link>
      <Link to="/products" className="text-foreground hover:text-primary">
        Products
      </Link>
      <Link to="/categories" className="text-foreground hover:text-primary">
        Categories
      </Link>
      {!isAuthenticated ? (
        <>
          <Link to="/login" className="text-foreground hover:text-primary">
            Login
          </Link>
          <Link to="/register" className="text-foreground hover:text-primary">
            Register
          </Link>
        </>
      ) : (
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-foreground hover:text-primary flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      )}
    </>
  );

  return (
    <nav className="bg-background border-b border-border px-4 py-3 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Brand/Logo */}
        <Link to="/" className="text-xl font-bold text-foreground">
          Inventory App
        </Link>

        {/* Desktop Navbar (hidden below md) */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground hover:text-primary"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Drawer Trigger (visible below md) */}
        <div className="md:hidden flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground hover:text-primary"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-foreground" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-background border-border">
              <DrawerHeader>
                <DrawerTitle className="text-foreground">Menu</DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col space-y-4 p-4">
                {navItems}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </nav>
  );
}