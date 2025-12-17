import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function CartSidebar() {
  const { state, closeCart, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  if (!state.isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-foreground/50 z-[70] animate-fade-in"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-[80] shadow-2xl animate-slide-down">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Tu Carrito</h2>
              <span className="bg-gold text-foreground text-sm font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {state.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Tu carrito está vacío</p>
                <p className="text-muted-foreground mb-6">
                  Agrega productos para comenzar tu compra
                </p>
                <Button onClick={closeCart} variant="default" asChild>
                  <Link to="/productos">Explorar productos</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {state.items.map((item) => (
                  <div
                    key={item.producto.idProducto}
                    className="flex space-x-4 pb-6 border-b border-border last:border-0"
                  >
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-secondary rounded-lg flex-shrink-0 overflow-hidden">
                      {item.producto.imagen ? (
                        <img
                          src={item.producto.imagen}
                          alt={item.producto.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">
                        {item.producto.nombre}
                      </h3>
                      <p className="text-gold font-semibold">
                        S/ {item.producto.precio.toLocaleString('es-PE')}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item, item.cantidad - 1)}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.cantidad}</span>
                          <button
                            onClick={() => updateQuantity(item, item.cantidad + 1)}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.idDetalle)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">S/ {totalPrice.toLocaleString('es-PE')}</span>
              </div>
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-gold">S/ {totalPrice.toLocaleString('es-PE')}</span>
              </div>
              <Button
                variant="secondary"
                className="w-full h-12 text-base"
                onClick={closeCart}
                asChild
              >
                <Link to="/carrito">Ver carrito completo</Link>
              </Button>
              <Button
                className="w-full h-12 text-base"
                variant="default"
                onClick={closeCart}
                asChild
              >
                <Link to="/checkout">Proceder al pago</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={closeCart}
                asChild
              >
                <Link to="/productos">Seguir comprando</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
