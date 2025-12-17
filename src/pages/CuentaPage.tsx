import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Package, Heart, Settings, LogOut, Loader2, Eye, EyeOff, X, Edit, XCircle, ShoppingCart } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usuariosApi, ordenesApi, Usuario, Orden } from '@/lib/api';
import { useFavorites } from '@/context/FavoritesContext';
import { useToast } from '@/hooks/use-toast';

export default function CuentaPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Orden[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Orden | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const { items: favoriteItems } = useFavorites();
  const [cancellingOrder, setCancellingOrder] = useState<number | null>(null);
  const [profileData, setProfileData] = useState({ nombre: '', apellido: '', telefono: '', direccion: '' });
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    telefono: '',
  });

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser) as Usuario;
      setCurrentUser(user);
      setIsLoggedIn(true);
      setActiveTab('perfil');
      setProfileData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
      });
    }
  }, []);

  // Cargar pedidos cuando el usuario está logueado
  useEffect(() => {
    const fetchOrders = async () => {
      if (currentUser?.idUsuario) {
        setLoadingOrders(true);
        try {
          const userOrders = await ordenesApi.getByUsuario(currentUser.idUsuario);
          setOrders(userOrders);
        } catch (error) {
          console.log('No se pudieron cargar los pedidos');
          setOrders([]);
        } finally {
          setLoadingOrders(false);
        }
      }
    };
    fetchOrders();
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const user = await usuariosApi.login(formData.email, formData.password);
      setCurrentUser(user);
      setIsLoggedIn(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setActiveTab('perfil');
      toast({
        title: '¡Bienvenido!',
        description: `Hola ${user.nombre}, has iniciado sesión correctamente.`,
      });
    } catch (error) {
      toast({
        title: 'Error de autenticación',
        description: 'Correo o contraseña incorrectos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const newUser = await usuariosApi.registrar({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        contraseña: formData.password,
        telefono: formData.telefono,
        estado: 'ACTIVO',
      });
      setCurrentUser(newUser);
      setIsLoggedIn(true);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setActiveTab('perfil');
      toast({
        title: '¡Cuenta creada!',
        description: 'Tu cuenta ha sido registrada exitosamente.',
      });
    } catch (error) {
      toast({
        title: 'Error al registrar',
        description: 'No se pudo crear la cuenta. El correo ya podría estar registrado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setOrders([]);
    localStorage.removeItem('currentUser');
    setActiveTab('login');
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente.',
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.idUsuario) return;

    setSavingProfile(true);
    try {
      const updatedUser = await usuariosApi.update(currentUser.idUsuario, profileData);
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setIsEditingProfile(false);
      toast({
        title: 'Perfil actualizado',
        description: 'Tus datos han sido guardados correctamente.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil.',
        variant: 'destructive',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const getStatusBadge = (estado: Orden['estado']) => {
    const statusConfig = {
      PENDIENTE: { variant: 'secondary' as const, label: 'Pendiente' },
      PROCESANDO: { variant: 'default' as const, label: 'Procesando' },
      ENVIADO: { variant: 'outline' as const, label: 'Enviado' },
      ENTREGADO: { variant: 'default' as const, label: 'Entregado' },
      CANCELADO: { variant: 'destructive' as const, label: 'Cancelado' },
    };
    const config = statusConfig[estado] || statusConfig.PENDIENTE;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4 max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Mi Cuenta</h1>
              <p className="text-muted-foreground">Inicia sesión o crea una cuenta</p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-product">
              <div className="flex mb-8">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 pb-3 text-center font-medium border-b-2 transition-colors ${
                    activeTab === 'login' ? 'border-gold text-foreground' : 'border-transparent text-muted-foreground'
                  }`}
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 pb-3 text-center font-medium border-b-2 transition-colors ${
                    activeTab === 'register' ? 'border-gold text-foreground' : 'border-transparent text-muted-foreground'
                  }`}
                >
                  Registrarse
                </button>
              </div>

              {activeTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Correo electrónico</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contraseña</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        minLength={6}
                        className="h-12 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span>Recordarme</span>
                    </label>
                    <a href="#" className="text-gold hover:underline">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <Button type="submit" className="w-full h-12" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cargando...</> : 'Iniciar sesión'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nombre</label>
                      <Input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Apellido</label>
                      <Input
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        required
                        className="h-12"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Correo electrónico</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Teléfono</label>
                    <Input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contraseña</label>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="h-12"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creando cuenta...</> : 'Crear cuenta'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </main>
        <Footer />
        <CartSidebar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Mi Cuenta</h1>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 shadow-product">
                <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-border">
                  <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center">
                    <User className="w-8 h-8 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">{currentUser?.nombre || 'Usuario'}</p>
                    <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                  </div>
                </div>

                <nav className="space-y-2">
                  {[
                    { id: 'perfil', icon: User, label: 'Mi perfil' },
                    { id: 'pedidos', icon: Package, label: 'Mis pedidos' },
                    { id: 'favoritos', icon: Heart, label: 'Favoritos' },
                    { id: 'configuracion', icon: Settings, label: 'Configuración' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-gold text-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar sesión</span>
                  </button>
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeTab === 'perfil' && (
                <div className="bg-card rounded-2xl p-8 shadow-product animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Mi perfil</h2>
                    {!isEditingProfile && (
                      <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
                        <Edit className="w-4 h-4 mr-2" /> Editar
                      </Button>
                    )}
                  </div>
                  {isEditingProfile ? (
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Nombre</label>
                          <Input
                            type="text"
                            value={profileData.nombre}
                            onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                            className="h-12"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Apellido</label>
                          <Input
                            type="text"
                            value={profileData.apellido}
                            onChange={(e) => setProfileData({ ...profileData, apellido: e.target.value })}
                            className="h-12"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Correo electrónico</label>
                        <Input type="email" value={currentUser?.email || ''} className="h-12 bg-muted" readOnly />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Teléfono</label>
                        <Input
                          type="tel"
                          value={profileData.telefono}
                          onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Dirección</label>
                        <Input
                          type="text"
                          value={profileData.direccion}
                          onChange={(e) => setProfileData({ ...profileData, direccion: e.target.value })}
                          className="h-12"
                          placeholder="Tu dirección de envío"
                        />
                      </div>
                      <div className="flex gap-4">
                        <Button type="submit" disabled={savingProfile}>
                          {savingProfile ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</> : 'Guardar cambios'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm text-muted-foreground mb-1">Nombre</label>
                          <p className="font-medium">{currentUser?.nombre || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm text-muted-foreground mb-1">Apellido</label>
                          <p className="font-medium">{currentUser?.apellido || '-'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">Correo electrónico</label>
                        <p className="font-medium">{currentUser?.email || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">Teléfono</label>
                        <p className="font-medium">{currentUser?.telefono || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">Dirección</label>
                        <p className="font-medium">{currentUser?.direccion || '-'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'pedidos' && (
                <div className="bg-card rounded-2xl p-8 shadow-product animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6">Mis pedidos</h2>
                  {loadingOrders ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Cargando pedidos...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">Aún no tienes pedidos</p>
                      <Button asChild>
                        <Link to="/productos">Explorar productos</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.idOrden} className="border border-border rounded-xl p-6 hover:bg-secondary/30 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                              <p className="font-semibold text-lg">Pedido #{order.idOrden}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.fechaOrden ? new Date(order.fechaOrden).toLocaleDateString('es-PE', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : 'Fecha no disponible'}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              {getStatusBadge(order.estado)}
                              <span className="text-xl font-bold text-gold">
                                S/ {order.total.toLocaleString('es-PE')}
                              </span>
                            </div>
                          </div>
                          {order.detalles && order.detalles.length > 0 && (
                            <div className="border-t border-border pt-4 mt-4">
                              <p className="text-sm text-muted-foreground mb-2">
                                {order.detalles.length} producto{order.detalles.length > 1 ? 's' : ''}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {order.detalles.slice(0, 3).map((detalle, idx) => (
                                  <span key={idx} className="text-sm bg-secondary px-3 py-1 rounded-full">
                                    {detalle.producto?.nombre || `Producto #${detalle.idProducto}`} x{detalle.cantidad}
                                  </span>
                                ))}
                                {order.detalles.length > 3 && (
                                  <span className="text-sm text-muted-foreground">
                                    +{order.detalles.length - 3} más
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              Ver detalle
                            </Button>
                            {(order.estado === 'PENDIENTE' || order.estado === 'PROCESANDO') && (
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={cancellingOrder === order.idOrden}
                                onClick={async () => {
                                  setCancellingOrder(order.idOrden);
                                  try {
                                    await ordenesApi.updateEstado(order.idOrden, 'CANCELADO');
                                    setOrders(orders.map(o => o.idOrden === order.idOrden ? { ...o, estado: 'CANCELADO' } : o));
                                    toast({ title: 'Pedido cancelado', description: 'El pedido ha sido cancelado.' });
                                  } catch {
                                    toast({ title: 'Error', description: 'No se pudo cancelar el pedido.', variant: 'destructive' });
                                  } finally {
                                    setCancellingOrder(null);
                                  }
                                }}
                              >
                                {cancellingOrder === order.idOrden ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-1" /> Cancelar</>}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Modal de detalle de pedido */}
              <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Detalle del Pedido #{selectedOrder?.idOrden}</DialogTitle>
                  </DialogHeader>
                  {selectedOrder && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Fecha del pedido</p>
                          <p className="font-medium">
                            {selectedOrder.fechaOrden
                              ? new Date(selectedOrder.fechaOrden).toLocaleDateString('es-PE', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'No disponible'}
                          </p>
                        </div>
                        {getStatusBadge(selectedOrder.estado)}
                      </div>

                      <div className="border-t border-border pt-4">
                        <h4 className="font-semibold mb-4">Productos</h4>
                        <div className="space-y-4">
                          {selectedOrder.detalles?.map((detalle, idx) => (
                            <div key={idx} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
                                  <Package className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium">{detalle.producto?.nombre || `Producto #${detalle.idProducto}`}</p>
                                  <p className="text-sm text-muted-foreground">
                                    S/ {detalle.precioUnitario.toLocaleString('es-PE')} x {detalle.cantidad}
                                  </p>
                                </div>
                              </div>
                              <p className="font-semibold">S/ {detalle.subtotal.toLocaleString('es-PE')}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-border pt-4">
                        <div className="flex justify-between items-center text-lg">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold text-gold">S/ {selectedOrder.total.toLocaleString('es-PE')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {activeTab === 'favoritos' && (
                <div className="bg-card rounded-2xl p-8 shadow-product animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6">Favoritos</h2>
                  {favoriteItems.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No tienes productos favoritos</p>
                      <Button asChild>
                        <Link to="/productos">Explorar productos</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favoriteItems.map((product) => (
                        <div key={product.idProducto} className="border border-border rounded-xl p-4 space-y-3">
                          <div className="aspect-video bg-secondary rounded-lg overflow-hidden">
                            {product.imagen ? (
                              <img src={product.imagen} alt={product.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <ShoppingCart className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Link to={`/productos/${product.idProducto}`} className="font-semibold line-clamp-2 hover:text-gold transition-colors">
                              {product.nombre}
                            </Link>
                            <p className="text-sm text-muted-foreground line-clamp-2">{product.descripcion}</p>
                            <p className="text-lg font-bold text-gold">S/ {product.precio.toLocaleString('es-PE')}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button asChild variant="default" className="flex-1">
                              <Link to={`/productos/${product.idProducto}`}>Ver detalle</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'configuracion' && (
                <div className="bg-card rounded-2xl p-8 shadow-product animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6">Configuración</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-border">
                      <div>
                        <p className="font-medium">Notificaciones por email</p>
                        <p className="text-sm text-muted-foreground">Recibe ofertas y novedades</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-border">
                      <div>
                        <p className="font-medium">Notificaciones SMS</p>
                        <p className="text-sm text-muted-foreground">Actualizaciones de pedidos</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" />
                    </div>
                  </div>
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
