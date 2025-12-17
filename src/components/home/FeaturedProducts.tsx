import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Producto, productosApi } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, openCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productosApi.getActivos();
        setProducts(data.slice(0, 6));
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Producto) => {
    addItem(product);
    toast({
      title: 'Producto agregado',
      description: `${product.nombre} se agregó al carrito`,
    });
    openCart();
  };

  if (loading) {
    return <div className="py-16 bg-secondary text-center">Cargando productos...</div>;
  }

  if (products.length === 0) {
    return (
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">No hay productos disponibles</h2>
          <p className="text-muted-foreground">Por favor, verifica tu conexión con el backend.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Productos destacados</h2>
            <p className="text-muted-foreground">Lo más nuevo y popular</p>
          </div>
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link to="/productos" className="group">
              Ver todo
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div
              key={product.idProducto}
              className="group bg-card rounded-2xl overflow-hidden product-card-hover animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <Link to={`/productos/${product.idProducto}`} className="block relative aspect-square overflow-hidden bg-muted">
                {product.imagen ? (
                  <img
                    src={product.imagen}
                    alt={product.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ShoppingCart className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
              </Link>

              {/* Content */}
              <div className="p-6">
                <Link to={`/productos/${product.idProducto}`}>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-gold transition-colors">
                    {product.nombre}
                  </h3>
                </Link>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {product.descripcion}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gold">
                    S/ {product.precio.toLocaleString('es-PE')}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Button variant="outline" asChild>
            <Link to="/productos">Ver todos los productos</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
