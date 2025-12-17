import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Tv, Home, Monitor, Laptop, Headphones, Package } from 'lucide-react';
import { Categoria, categoriasApi } from '@/lib/api';

const iconMap: Record<string, any> = {
  'Smartphones': Smartphone,
  'Tablets': Monitor,
  'Accesorios': Headphones,
  'Wearables': Laptop,
  'Televisores': Tv,
  'default': Package,
};

const colorMap = [
  'from-blue-500/20 to-purple-500/20',
  'from-emerald-500/20 to-teal-500/20',
  'from-amber-500/20 to-orange-500/20',
  'from-rose-500/20 to-pink-500/20',
  'from-violet-500/20 to-indigo-500/20',
  'from-cyan-500/20 to-sky-500/20',
];

const imageMap: Record<string, string> = {
  'Smartphones': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
  'Tablets': 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=600&q=80',
  'Accesorios': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
  'Wearables': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80',
  'Televisores': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80',
  'default': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
};

export function CategoryGrid() {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriasApi.getActivas();
        setCategories(data);
      } catch (error) {
        console.error('Error cargando categorías:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return <div className="py-16 bg-background text-center">Cargando categorías...</div>;
  }
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Explora nuestros productos</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubre la tecnología que está transformando el mundo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const IconComponent = iconMap[category.nombre] || iconMap.default;
            const image = imageMap[category.nombre] || imageMap.default;
            const color = colorMap[index % colorMap.length];
            
            return (
              <Link
                key={category.idCategoria}
                to={`/productos?categoria=${category.idCategoria}`}
                className="group relative overflow-hidden rounded-2xl bg-secondary h-80 product-card-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={image}
                    alt={category.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${color} via-transparent to-foreground/60`} />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="transform transition-transform duration-300 group-hover:translate-y-[-8px]">
                    <IconComponent className="w-8 h-8 text-background mb-3" />
                    <h3 className="text-2xl font-bold text-background mb-1">{category.nombre}</h3>
                    <p className="text-background/80">{category.descripcion || 'Productos de calidad'}</p>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gold/0 transition-colors duration-300 group-hover:bg-gold/10" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
