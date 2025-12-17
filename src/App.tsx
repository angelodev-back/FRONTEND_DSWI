import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { CartSidebar } from "@/components/cart/CartSidebar";
import Index from "./pages/Index";
import ProductosPage from "./pages/ProductosPage";
import ProductoDetailPage from "./pages/ProductoDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import CuentaPage from "./pages/CuentaPage";
import NotFound from "./pages/NotFound";
import CartPage from "./pages/CartPage";

const queryClient = new QueryClient();

const App = () => {
  if (typeof window !== 'undefined' && !localStorage.getItem('userId')) {
    localStorage.setItem('userId', '1');
  }

  return (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <FavoritesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CartSidebar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/productos" element={<ProductosPage />} />
              <Route path="/productos/:id" element={<ProductoDetailPage />} />
              <Route path="/carrito" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/cuenta" element={<CuentaPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </FavoritesProvider>
    </CartProvider>
  </QueryClientProvider>
  );
};

export default App;
