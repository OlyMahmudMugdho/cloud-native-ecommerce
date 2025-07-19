import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useKeycloak } from "../lib/KeycloakContext";
import { ModeToggle } from "./mode-toggle";
import { useState } from "react";
import { X, Menu } from "lucide-react";

export const Navbar = () => {
  const { isAuthenticated, login, logout } = useKeycloak();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="p-4 bg-background shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          E-commerce
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <ModeToggle />
          <Link to="/cart">
            <Button variant="ghost">Cart</Button>
          </Link>
          <Link to="/orders">
            <Button variant="ghost">Orders</Button>
          </Link>
          {isAuthenticated && (
            <Link to="/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
          )}
          {isAuthenticated ? (
            <Button onClick={logout}>Logout</Button>
          ) : (
            <Button onClick={login}>Login</Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={toggleDrawer}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-background shadow-lg transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden z-50`}
      >
        <div className="flex flex-col p-4 space-y-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold" onClick={toggleDrawer}>
              E-commerce
            </Link>
            <button onClick={toggleDrawer} aria-label="Close menu">
              <X size={24} />
            </button>
          </div>
          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-start">
              <ModeToggle />
            </div>
            <Link to="/cart" onClick={toggleDrawer}>
              <Button variant="ghost" className="w-full justify-start">
                Cart
              </Button>
            </Link>
            <Link to="/orders" onClick={toggleDrawer}>
              <Button variant="ghost" className="w-full justify-start">
                Orders
              </Button>
            </Link>
            {isAuthenticated && (
              <Link to="/profile" onClick={toggleDrawer}>
                <Button variant="ghost" className="w-full justify-start">
                  Profile
                </Button>
              </Link>
            )}
            {isAuthenticated ? (
              <Button onClick={() => { logout(); toggleDrawer(); }} className="w-full">
                Logout
              </Button>
            ) : (
              <Button onClick={() => { login(); toggleDrawer(); }} className="w-full">
                Login
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={toggleDrawer}
        />
      )}
    </nav>
  );
};