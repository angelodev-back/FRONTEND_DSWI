import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Mapea a ids reales de la base de datos (ver seed bd.sql)
const categories = [
  { name: 'Tienda Online', href: '/productos' },
  { name: 'Móviles', href: '/productos?categoria=1' }, // Smartphones
  { name: 'TV y Audio', href: '/productos?categoria=5' }, // Televisores
  { name: 'Línea Blanca', href: '/productos?categoria=8' }, // Hogar como proxy
  { name: 'Monitores', href: '/productos?categoria=12' },
  { name: 'Portátiles', href: '/productos?categoria=13' }, // Laptops
  { name: 'Accesorios', href: '/productos?categoria=3' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems, toggleCart } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?buscar=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-foreground text-background text-center py-2 text-sm">
        <p>Envío gratis en pedidos mayores a S/500 | <Link to="/productos" className="underline hover:text-gold">Comprar ahora</Link></p>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-nav text-nav-foreground nav-blur">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold tracking-wider">SAMSUNG</h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={category.href}
                  className="text-sm font-medium hover:text-gold transition-colors duration-200 relative group"
                >
                  {category.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:text-gold transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="p-2 hover:text-gold transition-colors relative"
                aria-label="Carrito"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* User */}
              <Link
                to="/cuenta"
                className="p-2 hover:text-gold transition-colors"
                aria-label="Mi cuenta"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 hover:text-gold transition-colors"
                aria-label="Menú"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-nav border-t border-border/20 animate-slide-down">
            <nav className="container mx-auto px-4 py-4 space-y-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={category.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm font-medium hover:text-gold transition-colors py-2"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-background/95 nav-blur animate-fade-in">
          <div className="container mx-auto px-4 pt-20">
            <div className="flex justify-end mb-8">
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 hover:text-gold transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="¿Qué estás buscando?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-16 text-xl bg-transparent border-0 border-b-2 border-foreground/30 rounded-none focus:border-gold focus:ring-0 placeholder:text-muted-foreground"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-4 hover:text-gold transition-colors"
                >
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </form>
            <div className="max-w-2xl mx-auto mt-8">
              <p className="text-sm text-muted-foreground mb-4">BÚSQUEDAS POPULARES</p>
              <div className="flex flex-wrap gap-2">
                {['Galaxy S25', 'Smart TV', 'Refrigeradora', 'Laptop', 'Audífonos'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      navigate(`/productos?buscar=${encodeURIComponent(term)}`);
                      setIsSearchOpen(false);
                    }}
                    className="px-4 py-2 bg-secondary rounded-full text-sm hover:bg-gold hover:text-foreground transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
