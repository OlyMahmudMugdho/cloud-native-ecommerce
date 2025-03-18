import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Package, LayoutGrid } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] text-center">
        <div className="max-w-4xl w-full">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-primary mb-8">
            Inventory Management System
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            A modern, responsive inventory management solution for your business.
            Track products, manage categories, and maintain your inventory with ease.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-8 bg-card rounded-lg border shadow-sm">
              <Package className="h-12 w-12 mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Product Management</h2>
              <p className="text-muted-foreground text-center mb-6">
                Efficiently manage your products with detailed tracking and real-time updates.
              </p>
              {isAuthenticated ? (
                <Button asChild className="w-full button-primary">
                  <Link to="/products">View Products</Link>
                </Button>
              ) : (
                <Button asChild variant="secondary" className="w-full button-secondary">
                  <Link to="/login">Sign In to Manage</Link>
                </Button>
              )}
            </div>
            <div className="flex flex-col items-center p-8 bg-card rounded-lg border shadow-sm">
              <LayoutGrid className="h-12 w-12 mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Category Organization</h2>
              <p className="text-muted-foreground text-center mb-6">
                Keep your inventory organized with customizable categories and tags.
              </p>
              {isAuthenticated ? (
                <Button asChild className="w-full button-primary">
                  <Link to="/categories">View Categories</Link>
                </Button>
              ) : (
                <Button asChild variant="secondary" className="w-full button-secondary">
                  <Link to="/login">Sign In to Organize</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}