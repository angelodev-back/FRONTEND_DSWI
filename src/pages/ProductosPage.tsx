import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Grid, List, ShoppingCart, SlidersHorizontal, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { Button } from '@/components/ui/button';
import { Producto, Categoria, productosApi, categoriasApi } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

export default function ProductosPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addItem, openCart } = useCart();
  const { toast } = useToast();

  const searchQuery = searchParams.get('buscar');
  const categoriaParam = searchParams.get('categoria');

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productosApi.getActivos(),
          categoriasApi.getActivas(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los productos. Verifica tu conexión con el backend.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoriaParam, toast]);

  // Resolver la categoría del query param (id numérico o slug) una vez que tengamos las categorías cargadas
  useEffect(() => {
    if (!categoriaParam) {
      setSelectedCategory(null);
      return;
    }

    const numericId = Number(categoriaParam);
    if (!Number.isNaN(numericId)) {
      setSelectedCategory(numericId);
      return;
    }

    const resolved = categories.find(
      (cat) => slugify(cat.nombre) === slugify(categoriaParam)
    );
    setSelectedCategory(resolved ? resolved.idCategoria : null);
  }, [categoriaParam, categories]);

  const filteredProducts = products
    .filter((p) => (selectedCategory ? p.idCategoria === selectedCategory : true))
    .filter((p) =>
      searchQuery
        ? p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
        : true
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.precio - b.precio;
        case 'price-desc':
          return b.precio - a.precio;
        default:
          return a.nombre.localeCompare(b.nombre);
      }
    });

  const handleAddToCart = (product: Producto) => {
    addItem(product);
    toast({
      title: 'Producto agregado',
      description: `${product.nombre} se agregó al carrito`,
    });
    openCart();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {searchQuery ? `Resultados para "${searchQuery}"` : 'Todos los productos'}
            </h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} productos encontrados
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Categorías</h3>
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          !selectedCategory ? 'bg-gold text-foreground' : 'hover:bg-secondary'
                        }`}
                      >
                        Todas las categorías
                      </button>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat.idCategoria}>
                        <button
                          onClick={() => setSelectedCategory(cat.idCategoria)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            selectedCategory === cat.idCategoria ? 'bg-gold text-foreground' : 'hover:bg-secondary'
                          }`}
                        >
                          {cat.nombre}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Ordenar por</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold"
                  >
                    <option value="name">Nombre</option>
                    <option value="price-asc">Precio: menor a mayor</option>
                    <option value="price-desc">Precio: mayor a menor</option>
                  </select>
                </div>
              </div>
            </aside>

            {/* Mobile Filter Button */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-secondary' : ''}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-secondary' : ''}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Filter Drawer */}
            {isFilterOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-foreground/50" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute left-0 top-0 h-full w-80 bg-background p-6 overflow-y-auto animate-slide-down">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Filtros</h2>
                    <button onClick={() => setIsFilterOpen(false)}>
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-4">Categorías</h3>
                      <ul className="space-y-2">
                        <li>
                          <button
                            onClick={() => {
                              setSelectedCategory(null);
                              setIsFilterOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                              !selectedCategory ? 'bg-gold text-foreground' : 'hover:bg-secondary'
                            }`}
                          >
                            Todas las categorías
                          </button>
                        </li>
                        {categories.map((cat) => (
                          <li key={cat.idCategoria}>
                            <button
                              onClick={() => {
                                setSelectedCategory(cat.idCategoria);
                                setIsFilterOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                selectedCategory === cat.idCategoria ? 'bg-gold text-foreground' : 'hover:bg-secondary'
                              }`}
                            >
                              {cat.nombre}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-4">Ordenar por</h3>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                      >
                        <option value="name">Nombre</option>
                        <option value="price-asc">Precio: menor a mayor</option>
                        <option value="price-desc">Precio: mayor a menor</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1">
              <div className="hidden lg:flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-secondary' : ''}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-secondary' : ''}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-xl text-muted-foreground mb-4">No se encontraron productos</p>
                  <Button onClick={() => setSelectedCategory(null)}>Ver todos los productos</Button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.idProducto}
                      className="group bg-card rounded-2xl overflow-hidden product-card-hover"
                    >
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
                      </Link>
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
                          <Button size="sm" onClick={() => handleAddToCart(product)}>
                            <ShoppingCart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.idProducto}
                      className="flex gap-6 bg-card rounded-2xl p-4 product-card-hover"
                    >
                      <Link to={`/productos/${product.idProducto}`} className="w-40 h-40 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        {product.imagen ? (
                          <img
                            src={product.imagen}
                            alt={product.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ShoppingCart className="w-8 h-8" />
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <Link to={`/productos/${product.idProducto}`}>
                            <h3 className="font-semibold text-lg mb-2 hover:text-gold transition-colors">
                              {product.nombre}
                            </h3>
                          </Link>
                          <p className="text-muted-foreground text-sm">
                            {product.descripcion}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-2xl font-bold text-gold">
                            S/ {product.precio.toLocaleString('es-PE')}
                          </span>
                          <Button onClick={() => handleAddToCart(product)}>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Agregar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartSidebar />
    </div>
  );
}
