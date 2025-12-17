import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';

const footerLinks = {
  productos: [
    { name: 'Móviles', href: '/productos?categoria=moviles' },
    { name: 'TV y Audio', href: '/productos?categoria=tv-audio' },
    { name: 'Línea Blanca', href: '/productos?categoria=linea-blanca' },
    { name: 'Monitores', href: '/productos?categoria=monitores' },
    { name: 'Portátiles', href: '/productos?categoria=portatiles' },
  ],
  soporte: [
    { name: 'Centro de ayuda', href: '/ayuda' },
    { name: 'Garantía', href: '/garantia' },
    { name: 'Reparaciones', href: '/reparaciones' },
    { name: 'Contacto', href: '/contacto' },
  ],
  empresa: [
    { name: 'Sobre nosotros', href: '/nosotros' },
    { name: 'Noticias', href: '/noticias' },
    { name: 'Carreras', href: '/carreras' },
    { name: 'Sostenibilidad', href: '/sostenibilidad' },
  ],
  legal: [
    { name: 'Términos y condiciones', href: '/terminos' },
    { name: 'Política de privacidad', href: '/privacidad' },
    { name: 'Cookies', href: '/cookies' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold tracking-wider mb-4">SAMSUNG</h2>
            <p className="text-background/70 text-sm mb-6">
              Tecnología que inspira el mundo, creando el futuro.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-background/70 hover:text-gold transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/70 hover:text-gold transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/70 hover:text-gold transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/70 hover:text-gold transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4">Productos</h3>
            <ul className="space-y-3">
              {footerLinks.productos.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-background/70 text-sm hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Soporte</h3>
            <ul className="space-y-3">
              {footerLinks.soporte.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-background/70 text-sm hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-background/70 text-sm hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-background/70 text-sm">
                <Phone className="w-4 h-4" />
                <span>0800-00000</span>
              </li>
              <li className="flex items-center space-x-3 text-background/70 text-sm">
                <Mail className="w-4 h-4" />
                <span>soporte@samsung.pe</span>
              </li>
              <li className="flex items-start space-x-3 text-background/70 text-sm">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Av. Javier Prado Este 123, Lima, Perú</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-background/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-background/50 text-sm">
              © {new Date().getFullYear()} Samsung Electronics Co., Ltd. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-background/50 text-sm hover:text-gold transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
