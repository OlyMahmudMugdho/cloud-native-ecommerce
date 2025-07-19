import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useKeycloak } from "../lib/KeycloakContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image_url: string;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { isAuthenticated, login } = useKeycloak();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    navigate(`/products/${product.id}`);
  };

  return (
    <Card
      className="w-64 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-32 object-cover rounded-md mb-2"
        />
        <p className="truncate">{product.description}</p>
        <p className="font-bold">${product.price}</p>
        <p>Stock: {product.stock}</p>
      </CardContent>
    </Card>
  );
};