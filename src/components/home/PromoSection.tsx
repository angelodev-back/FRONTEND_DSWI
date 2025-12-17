import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Truck, Shield, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Envío Gratis',
    description: 'En pedidos mayores a S/500',
  },
  {
    icon: Shield,
    title: 'Garantía Oficial',
    description: 'Garantía Samsung de 1 año',
  },
  {
    icon: Headphones,
    title: 'Soporte 24/7',
    description: 'Atención al cliente premium',
  },
  {
    icon: Sparkles,
    title: 'Productos Originales',
    description: '100% productos Samsung',
  },
];

export function PromoSection() {
  return (
    <>
      {/* Features Bar */}
      <section className="py-12 bg-background border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <feature.icon className="w-8 h-8 mx-auto mb-3 text-gold" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galaxy AI Promo */}
      <section className="py-20 bg-gradient-dark text-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <span className="inline-block px-4 py-1 bg-gold/20 text-gold rounded-full text-sm font-medium mb-4">
                Galaxy AI
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                El futuro está aquí
              </h2>
              <p className="text-background/80 text-lg mb-8 leading-relaxed">
                Descubre el poder de la inteligencia artificial con Galaxy AI. Traduce en tiempo real, 
                edita fotos como un profesional y maximiza tu productividad con funciones inteligentes.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="gold" size="lg" asChild>
                  <Link to="/productos?categoria=moviles">Descubrir Galaxy AI</Link>
                </Button>
                <Button variant="heroOutline" size="lg" asChild>
                  <Link to="/productos">Ver dispositivos</Link>
                </Button>
              </div>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gold/20 rounded-full blur-3xl animate-pulse-glow" />
                <img
                  src="https://images.samsung.com/is/image/samsung/assets/pe/25_hd_f03_co73_feature_cards_mx_01_galaxy-s25-ultra_560x560.jpg?$560_560_JPG$"
                  alt="Galaxy AI"
                  className="relative z-10 w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Mantente informado
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Suscríbete para recibir las últimas novedades, ofertas exclusivas y lanzamientos de productos.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <Button type="submit" variant="default" className="h-12 px-8">
              Suscribirse
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}
