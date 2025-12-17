import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: 'Crea instantes inolvidables',
    subtitle: 'Optimiza tu hogar y disfruta más tiempo en familia',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=80',
    ctaText: 'Conoce más',
    ctaLink: '/productos',
    secondaryCtaText: 'Comprar',
    secondaryCtaLink: '/productos',
  },
  {
    id: 2,
    title: 'Galaxy S25 Ultra',
    subtitle: 'El poder de la inteligencia artificial en tus manos',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1920&q=80',
    ctaText: 'Conoce más',
    ctaLink: '/productos?categoria=moviles',
    secondaryCtaText: 'Comprar',
    secondaryCtaLink: '/productos?categoria=moviles',
  },
  {
    id: 3,
    title: 'Neo QLED 8K',
    subtitle: 'La máxima expresión de la calidad de imagen',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1920&q=80',
    ctaText: 'Descubrir',
    ctaLink: '/productos?categoria=tv-audio',
    secondaryCtaText: 'Comprar',
    secondaryCtaLink: '/productos?categoria=tv-audio',
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);

  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden bg-foreground">
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full container mx-auto px-4 flex items-center">
            <div className={`max-w-xl text-background transition-all duration-700 delay-300 ${
              index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 hero-text-shadow">
                {slide.title}
              </h2>
              <p className="text-lg md:text-xl text-background/90 mb-8 hero-text-shadow">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="hero"
                  size="lg"
                  asChild
                >
                  <Link to={slide.ctaLink}>{slide.ctaText}</Link>
                </Button>
                {slide.secondaryCtaText && (
                  <Button
                    variant="heroOutline"
                    size="lg"
                    asChild
                  >
                    <Link to={slide.secondaryCtaLink!}>{slide.secondaryCtaText}</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center text-background hover:bg-background/40 transition-colors"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center text-background hover:bg-background/40 transition-colors"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-gold w-8'
                : 'bg-background/50 hover:bg-background/80'
            }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
