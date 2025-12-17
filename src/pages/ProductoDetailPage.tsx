import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Minus, Plus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { Button } from '@/components/ui/button';
import { Producto, productosApi } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useToast } from '@/hooks/use-toast';

const features = [
  { icon: Truck, title: 'Envío Gratis', description: 'En pedidos mayores a S/500' },
  { icon: Shield, title: 'Garantía', description: '1 año de garantía oficial' },
  { icon: RotateCcw, title: 'Devoluciones', description: '30 días para cambios' },
];

export default function ProductoDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem, openCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await productosApi.getById(parseInt(id));
        setProduct(data);
      } catch (error) {
        console.error('Error cargando producto:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar el producto',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, toast]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      for (let i = 0; i < quantity; i++) {
        await addItem(product);
      }
      toast({
        title: 'Producto agregado',
        description: `${quantity}x ${product.nombre} se agregó al carrito`,
      });
      openCart();
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      const message = error instanceof Error ? error.message : 'No se pudo agregar el producto al carrito. Verifica tu conexión.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="aspect-square bg-secondary rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 bg-secondary rounded w-3/4" />
                <div className="h-6 bg-secondary rounded w-1/2" />
                <div className="h-24 bg-secondary rounded" />
                <div className="h-12 bg-secondary rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <Button asChild>
            <Link to="/productos">Volver a productos</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.imagen ? [product.imagen, product.imagen, product.imagen] : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Inicio</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/productos" className="hover:text-foreground">Productos</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{product.nombre}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-secondary">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ShoppingCart className="w-24 h-24" />
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex space-x-4">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-gold' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.nombre}</h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {product.descripcion}
                </p>
              </div>

              <div className="flex items-baseline space-x-4">
                <span className="text-4xl font-bold text-gold">
                  S/ {product.precio.toLocaleString('es-PE')}
                </span>
                {product.stock > 0 ? (
                  <span className="text-sm text-green-600 font-medium">En stock</span>
                ) : (
                  <span className="text-sm text-destructive font-medium">Agotado</span>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Cantidad:</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4">
                <Button
                  size="xl"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Agregar al carrito
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  aria-pressed={isFavorite(product.idProducto)}
                  onClick={() => {
                    toggleFavorite(product);
                    toast({
                      title: isFavorite(product.idProducto) ? 'Eliminado de favoritos' : 'Agregado a favoritos',
                      description: product.nombre,
                    });
                  }}
                >
                  <Heart
                    className="w-5 h-5"
                    fill={isFavorite(product.idProducto) ? 'currentColor' : 'none'}
                  />
                </Button>
                <Button variant="outline" size="xl">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                {features.map((feature) => (
                  <div key={feature.title} className="text-center">
                    <feature.icon className="w-6 h-6 mx-auto mb-2 text-gold" />
                    <h3 className="text-sm font-medium">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="mt-16 grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-4">Especificaciones</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Modelo</span>
                  <span className="font-medium">{product.nombre}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Disponibilidad</span>
                  <span className="font-medium">{product.stock} unidades</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Estado</span>
                  <span className="font-medium">{product.estado}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Garantía</span>
                  <span className="font-medium">1 año</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Información de envío</h2>
              <div className="bg-secondary rounded-2xl p-6 space-y-4">
                <div className="flex items-start space-x-4">
                  <Truck className="w-6 h-6 text-gold mt-0.5" />
                  <div>
                    <h3 className="font-medium">Envío a domicilio</h3>
                    <p className="text-sm text-muted-foreground">
                      Recibe tu pedido en 2-5 días hábiles
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Shield className="w-6 h-6 text-gold mt-0.5" />
                  <div>
                    <h3 className="font-medium">Compra segura</h3>
                    <p className="text-sm text-muted-foreground">
                      Protección al comprador garantizada
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartSidebar />
    </div>
  );
}
