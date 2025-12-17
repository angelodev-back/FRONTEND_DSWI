import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, CreditCard, Truck, ShoppingBag, Check, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { usuariosApi, ordenesApi } from '@/lib/api';

export default function CheckoutPage() {
  const { state, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Buscar o crear usuario
      let userId: number;
      try {
        const existingUser = await usuariosApi.getByEmail(formData.email);
        userId = existingUser.idUsuario;
        localStorage.setItem('userId', String(userId));
      } catch {
        // Usuario no existe, crearlo
        const newUser = await usuariosApi.registrar({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          contraseña: 'temp123', // Contraseña temporal
          telefono: formData.telefono,
          direccion: `${formData.direccion}, ${formData.ciudad} ${formData.codigoPostal}`,
          estado: 'ACTIVO',
        });
        userId = newUser.idUsuario;
        localStorage.setItem('userId', String(userId));
      }

      // 2. Crear la orden
      const ordenDetalles = state.items.map((item) => ({
        idProducto: item.producto.idProducto,
        cantidad: item.cantidad,
      }));

      await ordenesApi.create({
        idUsuario: userId,
        detalles: ordenDetalles,
      });

      await clearCart();
      toast({
        title: '¡Pedido confirmado!',
        description: 'Tu orden ha sido guardada. Recibirás un correo con los detalles.',
      });
      navigate('/');
    } catch (error) {
      console.error('Error al procesar orden:', error);
      toast({
        title: 'Error al procesar pedido',
        description: 'No se pudo completar la orden. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-8">Agrega productos para continuar con tu compra</p>
          <Button asChild>
            <Link to="/productos">Explorar productos</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Inicio</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/productos" className="hover:text-foreground">Productos</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Checkout</span>
          </nav>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            {[
              { num: 1, label: 'Información' },
              { num: 2, label: 'Envío' },
              { num: 3, label: 'Pago' },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${
                    step >= s.num
                      ? 'bg-gold text-foreground'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span className={`ml-2 text-sm ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
                {index < 2 && (
                  <div className={`w-12 md:w-24 h-0.5 mx-4 ${step > s.num ? 'bg-gold' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Step 1: Contact Info */}
                {step === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-2xl font-bold">Información de contacto</h2>
                    <div className="space-y-4">
                      <Input
                        type="email"
                        name="email"
                        placeholder="Correo electrónico"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="h-12"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="text"
                          name="nombre"
                          placeholder="Nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          required
                          className="h-12"
                        />
                        <Input
                          type="text"
                          name="apellido"
                          placeholder="Apellido"
                          value={formData.apellido}
                          onChange={handleInputChange}
                          required
                          className="h-12"
                        />
                      </div>
                      <Input
                        type="tel"
                        name="telefono"
                        placeholder="Teléfono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        required
                        className="h-12"
                      />
                    </div>
                    <Button type="button" size="lg" onClick={() => setStep(2)} className="w-full">
                      Continuar a envío
                    </Button>
                  </div>
                )}

                {/* Step 2: Shipping */}
                {step === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-2xl font-bold">Dirección de envío</h2>
                    <div className="space-y-4">
                      <Input
                        type="text"
                        name="direccion"
                        placeholder="Dirección completa"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        required
                        className="h-12"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="text"
                          name="ciudad"
                          placeholder="Ciudad"
                          value={formData.ciudad}
                          onChange={handleInputChange}
                          required
                          className="h-12"
                        />
                        <Input
                          type="text"
                          name="codigoPostal"
                          placeholder="Código postal"
                          value={formData.codigoPostal}
                          onChange={handleInputChange}
                          required
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="bg-secondary rounded-xl p-4 flex items-center space-x-4">
                      <Truck className="w-6 h-6 text-gold" />
                      <div>
                        <p className="font-medium">Envío estándar</p>
                        <p className="text-sm text-muted-foreground">2-5 días hábiles - Gratis</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)} className="flex-1">
                        Volver
                      </Button>
                      <Button type="button" size="lg" onClick={() => setStep(3)} className="flex-1">
                        Continuar a pago
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-2xl font-bold">Método de pago</h2>
                    <div className="bg-secondary rounded-xl p-4 flex items-center space-x-4 mb-4">
                      <CreditCard className="w-6 h-6 text-gold" />
                      <span className="font-medium">Tarjeta de crédito/débito</span>
                    </div>
                    <div className="space-y-4">
                      <Input
                        type="text"
                        name="cardNumber"
                        placeholder="Número de tarjeta"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        required
                        className="h-12"
                      />
                      <Input
                        type="text"
                        name="cardName"
                        placeholder="Nombre en la tarjeta"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        required
                        className="h-12"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="text"
                          name="cardExpiry"
                          placeholder="MM/AA"
                          value={formData.cardExpiry}
                          onChange={handleInputChange}
                          required
                          className="h-12"
                        />
                        <Input
                          type="text"
                          name="cardCvv"
                          placeholder="CVV"
                          value={formData.cardCvv}
                          onChange={handleInputChange}
                          required
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button type="button" variant="outline" size="lg" onClick={() => setStep(2)} className="flex-1">
                        Volver
                      </Button>
                      <Button type="submit" size="lg" disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</> : `Pagar S/ ${totalPrice.toLocaleString('es-PE')}`}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-secondary rounded-2xl p-6 sticky top-24">
                <h3 className="text-lg font-bold mb-6">Resumen del pedido</h3>
                <div className="space-y-4 mb-6">
                  {state.items.map((item) => (
                    <div key={item.producto.idProducto} className="flex space-x-4">
                      <div className="w-16 h-16 bg-card rounded-lg overflow-hidden flex-shrink-0">
                        {item.producto.imagen ? (
                          <img
                            src={item.producto.imagen}
                            alt={item.producto.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{item.producto.nombre}</p>
                        <p className="text-sm text-muted-foreground">Cant: {item.cantidad}</p>
                      </div>
                      <p className="text-sm font-medium">
                        S/ {(item.producto.precio * item.cantidad).toLocaleString('es-PE')}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>S/ {totalPrice.toLocaleString('es-PE')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="text-green-600">Gratis</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-gold">S/ {totalPrice.toLocaleString('es-PE')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
