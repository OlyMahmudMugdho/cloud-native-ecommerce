import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { CartPage } from "./pages/CartPage";
import { OrdersPage } from "./pages/OrdersPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductDetails } from "./pages/ProductDetails";
import { Footer } from "./components/Footer";
import { ThemeProvider } from "./components/theme-provider";
import { KeycloakProvider } from "./lib/KeycloakContext";
import UserProfile from "./pages/UserProfile";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <KeycloakProvider>
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/my-orders" element={<OrdersPage />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/profile" element={<UserProfile />} />
            </Routes>
            <Footer />
          </BrowserRouter>
        </KeycloakProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;