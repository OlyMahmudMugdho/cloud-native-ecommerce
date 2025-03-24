import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { products, categories } from '@/api/api';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Trash2, Plus, Loader2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function Products() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [productList, setProductList] = useState<Product[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);

  // Filter and sort state
  const [filters, setFilters] = useState({
    name: '',
    category: 'all', // Default to 'all' instead of ''
    price_min: '',
    price_max: '',
  });
  const [sort, setSort] = useState<{ field: string; order: 'asc' | 'desc' }>({
    field: 'name',
    order: 'asc',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          products.getAll({
            name: filters.name || undefined,
            category: filters.category === 'all' ? undefined : filters.category, // Send undefined for 'all'
            price_min: filters.price_min ? parseFloat(filters.price_min) : undefined,
            price_max: filters.price_max ? parseFloat(filters.price_max) : undefined,
            sort: sort.field,
            order: sort.order,
            page: currentPage,
            limit,
          }),
          categories.getAll(),
        ]);
        setProductList(productsResponse.data.products || []);
        setTotalPages(productsResponse.data.total_pages || 1);
        setCategoryList(categoriesResponse.data || []);
      } catch (error) {
        toast.error('Failed to load data');
        setProductList([]);
        setCategoryList([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, filters, sort]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setFilters((prev) => ({ ...prev, category: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (field: string) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!isAdmin) {
        toast.error('Only admins can delete products');
        return;
      }
      await products.delete(id);
      toast.success('Product deleted successfully');
      const response = await products.getAll({
        name: filters.name || undefined,
        category: filters.category === 'all' ? undefined : filters.category,
        price_min: filters.price_min ? parseFloat(filters.price_min) : undefined,
        price_max: filters.price_max ? parseFloat(filters.price_max) : undefined,
        sort: sort.field,
        order: sort.order,
        page: currentPage,
        limit,
      });
      setProductList(response.data.products || []);
      setTotalPages(response.data.total_pages || 1);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Only admins can delete products');
      } else {
        toast.error('Failed to delete product');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        {isAuthenticated && (
          <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
            <Link to="/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="nameFilter">Name</Label>
          <Input
            id="nameFilter"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
            placeholder="Filter by name"
          />
        </div>
        <div>
          <Label htmlFor="categoryFilter">Category</Label>
          <Select value={filters.category} onValueChange={handleCategoryChange}>
            <SelectTrigger id="categoryFilter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem> {/* Changed to 'all' */}
              {categoryList.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="price_min">Min Price</Label>
          <Input
            id="price_min"
            name="price_min"
            type="number"
            step="0.01"
            value={filters.price_min}
            onChange={handleFilterChange}
            placeholder="Min price"
          />
        </div>
        <div>
          <Label htmlFor="price_max">Max Price</Label>
          <Input
            id="price_max"
            name="price_max"
            type="number"
            step="0.01"
            value={filters.price_max}
            onChange={handleFilterChange}
            placeholder="Max price"
          />
        </div>
      </div>

      {/* Product Table */}
      {productList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No products found.{' '}
          {isAuthenticated && 'Click "Add Product" to create one.'}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead onClick={() => handleSortChange('name')} className="cursor-pointer">
                  Name {sort.field === 'name' && (sort.order === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead onClick={() => handleSortChange('price')} className="cursor-pointer">
                  Price {sort.field === 'price' && (sort.order === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead onClick={() => handleSortChange('stock')} className="cursor-pointer">
                  Stock {sort.field === 'stock' && (sort.order === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productList.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link to={`/products/${product.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {isAuthenticated && isAdmin && (
                        <>
                          <Button variant="outline" size="icon" asChild>
                            <Link to={`/products/edit/${product.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this product? This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                  onClick={() => handleDelete(product.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}