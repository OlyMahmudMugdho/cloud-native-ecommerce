import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useKeycloak } from "../lib/KeycloakContext";

export const Navbar = () => {
  const { isAuthenticated, login, logout } = useKeycloak();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          E-commerce
        </Link>
        <div className="space-x-4">
          <Link to="/cart">
            <Button variant="ghost">Cart</Button>
          </Link>
          <Link to="/orders">
            <Button variant="ghost">Orders</Button>
          </Link>
          {isAuthenticated ? (
            <Button onClick={logout}>Logout</Button>
          ) : (
            <Button onClick={login}>Login</Button>
          )}
        </div>
      </div>
    </nav>
  );
};