import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Truck, ShieldCheck, CreditCard } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Producto, productosApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function CartPage() {
  const { state, totalItems, totalPrice, updateQuantity, removeItem, addItem, openCart } = useCart();
  const [recommendations, setRecommendations] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await productosApi.getActivos();
        setRecommendations(data.slice(0, 6));
      } catch (error) {
        console.error("Error cargando recomendaciones", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const formatPrice = (value: number) => `S/ ${value.toLocaleString("es-PE")}`;

  const handleAddRecommendation = (product: Producto) => {
    addItem(product);
    openCart();
    toast({
      title: "Producto agregado",
      description: `${product.nombre} se agregó al carrito`,
    });
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="bg-card rounded-3xl shadow-sm border border-border/60 py-16 px-6 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Tu carrito está vacío</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Inicia sesión en tu cuenta Samsung para ver tus artículos guardados o continua explorando productos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" asChild className="h-12 px-8">
                <Link to="/productos">Continuar comprando</Link>
              </Button>
              <Button asChild className="h-12 px-8">
                <Link to="/cuenta">Iniciar sesión</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
              {["Visa", "Mastercard", "Amex", "PagoEfectivo", "Plin", "Samsung Rewards"].map((brand) => (
                <span key={brand} className="px-3 py-1 bg-secondary rounded-full border border-border/50">
                  {brand}
                </span>
              ))}
            </div>
            <div className="mt-6 space-y-1 text-sm text-muted-foreground">
              <Link to="/" className="underline hover:text-foreground">¿Cuál es la política de devolución o cancelación?</Link>
              <Link to="/" className="underline hover:text-foreground">¿Cuál es la fecha estimada de entrega?</Link>
            </div>
          </div>

          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">También te puede interesar</h2>
              <Button variant="ghost" asChild>
                <Link to="/productos">Ver todos</Link>
              </Button>
            </div>
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Cargando recomendaciones...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((product) => (
                  <div key={product.idProducto} className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
                    <div className="aspect-square bg-muted overflow-hidden">
                      {product.imagen ? (
                        <img src={product.imagen} alt={product.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ShoppingBag className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-3">
                      <h3 className="font-semibold text-lg line-clamp-2">{product.nombre}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">{product.descripcion}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gold">{formatPrice(product.precio)}</span>
                        <Button size="sm" onClick={() => handleAddRecommendation(product)}>
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-muted-foreground">Resumen del carrito</p>
            <h1 className="text-3xl md:text-4xl font-bold">Tu carrito ({totalItems})</h1>
          </div>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full border border-border/60">
              <Truck className="w-4 h-4" />
              <span>Envío gratis</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full border border-border/60">
              <ShieldCheck className="w-4 h-4" />
              <span>Pago seguro</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
          <section className="bg-card border border-border/60 rounded-2xl shadow-sm divide-y divide-border/60">
            {state.items.map((item) => (
              <div key={item.idDetalle} className="flex gap-5 p-6">
                <div className="w-28 h-28 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                  {item.producto.imagen ? (
                    <img src={item.producto.imagen} alt={item.producto.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold line-clamp-2">{item.producto.nombre}</h3>
                      <p className="text-muted-foreground text-sm">Stock: {item.producto.stock}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.idDetalle)}
                      className="text-destructive hover:underline text-sm"
                    >
                      Quitar
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item, item.cantidad - 1)}
                        className="w-9 h-9 border border-border rounded-full flex items-center justify-center hover:bg-secondary"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(item, item.cantidad + 1)}
                        className="w-9 h-9 border border-border rounded-full flex items-center justify-center hover:bg-secondary"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gold">{formatPrice(item.producto.precio)}</p>
                      <p className="text-sm text-muted-foreground">Total: {formatPrice(item.producto.precio * item.cantidad)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <aside className="bg-card border border-border/60 rounded-2xl shadow-sm p-6 space-y-6 h-fit sticky top-24">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span className="text-green-600">Gratis</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/60 pt-4 text-lg font-bold">
              <span>Total</span>
              <span className="text-gold">{formatPrice(totalPrice)}</span>
            </div>

            <Button asChild className="w-full h-12 text-base">
              <Link to="/checkout">Proceder al pago</Link>
            </Button>
            <Button variant="outline" asChild className="w-full h-12">
              <Link to="/productos">Seguir comprando</Link>
            </Button>

            <div className="bg-secondary/80 rounded-xl p-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Pagos con tarjetas y billeteras digitales.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Compra protegida y soporte 24/7.</span>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">También te puede interesar</h2>
            <Button variant="ghost" asChild>
              <Link to="/productos">Ver todos</Link>
            </Button>
          </div>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Cargando recomendaciones...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((product) => (
                <div key={product.idProducto} className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
                  <div className="aspect-square bg-muted overflow-hidden">
                    {product.imagen ? (
                      <img src={product.imagen} alt={product.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-semibold text-lg line-clamp-2">{product.nombre}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{product.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gold">{formatPrice(product.precio)}</span>
                      <Button size="sm" onClick={() => handleAddRecommendation(product)}>
                        Agregar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
