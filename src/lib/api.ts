export const API_URL = 'http://localhost:8081/api';

// Types matching your SQL Server schema

export interface Categoria {
  idCategoria: number;
  nombre: string;
  descripcion?: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface Producto {
  idProducto: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  idCategoria: number;
  nombreCategoria?: string;
  categoria?: Categoria;
  imagen?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  fechaRegistro?: string;
}

export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fechaRegistro?: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface Carrito {
  idCarrito: number;
  idUsuario: number;
  fechaCreacion?: string;
  detalles?: CarritoDetalle[];
}

export interface CarritoDetalle {
  idDetalle: number;
  idProducto: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Orden {
  idOrden: number;
  idUsuario: number;
  nombreUsuario?: string;
  fechaOrden?: string;
  total: number;
  estado: 'PENDIENTE' | 'PROCESANDO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';
  detalles?: OrdenDetalle[];
}

export interface OrdenDetalle {
  idProducto: number;
  nombreProducto?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

// API Helper
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Productos API
export const productosApi = {
  getAll: () => fetchApi<Producto[]>('/products'),
  getActivos: () => fetchApi<Producto[]>('/products/active'),
  getById: (id: number) => fetchApi<Producto>(`/products/${id}`),
  getByCategoria: (idCategoria: number) => fetchApi<Producto[]>(`/products/category/${idCategoria}`),
  create: (producto: Omit<Producto, 'idProducto' | 'fechaRegistro'>) =>
    fetchApi<Producto>('/products', { method: 'POST', body: JSON.stringify(producto) }),
  update: (id: number, producto: Partial<Producto>) =>
    fetchApi<Producto>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(producto) }),
  delete: (id: number) =>
    fetchApi<void>(`/products/${id}`, { method: 'DELETE' }),
};

// Categorías API
export const categoriasApi = {
  getAll: () => fetchApi<Categoria[]>('/categories'),
  getActivas: () => fetchApi<Categoria[]>('/categories/active'),
  getById: (id: number) => fetchApi<Categoria>(`/categories/${id}`),
  create: (categoria: Omit<Categoria, 'idCategoria'>) =>
    fetchApi<Categoria>('/categories', { method: 'POST', body: JSON.stringify(categoria) }),
  update: (id: number, categoria: Partial<Categoria>) =>
    fetchApi<Categoria>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(categoria) }),
  delete: (id: number) =>
    fetchApi<void>(`/categories/${id}`, { method: 'DELETE' }),
};

// Usuarios API
export const usuariosApi = {
  getAll: () => fetchApi<Usuario[]>('/users'),
  getActivos: () => fetchApi<Usuario[]>('/users/active'),
  getById: (id: number) => fetchApi<Usuario>(`/users/${id}`),
  getByEmail: (email: string) => fetchApi<Usuario>(`/users/email/${email}`),
  login: (email: string, contraseña: string) =>
    fetchApi<Usuario>('/users/login', { method: 'POST', body: JSON.stringify({ email, contraseña }) }),
  registrar: (usuario: Omit<Usuario, 'idUsuario' | 'fechaRegistro'> & { contraseña: string }) =>
    fetchApi<Usuario>('/users/register', { method: 'POST', body: JSON.stringify(usuario) }),
  update: (id: number, usuario: Partial<Usuario>) =>
    fetchApi<Usuario>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(usuario) }),
  delete: (id: number) =>
    fetchApi<void>(`/users/${id}`, { method: 'DELETE' }),
};

// Órdenes API
export const ordenesApi = {
  getAll: () => fetchApi<Orden[]>('/orders'),
  getById: (id: number) => fetchApi<Orden>(`/orders/${id}`),
  getByUsuario: (idUsuario: number) => fetchApi<Orden[]>(`/orders/user/${idUsuario}`),
  create: (orden: { idUsuario: number; detalles: Array<{ idProducto: number; cantidad: number }> }) =>
    fetchApi<Orden>('/orders', { method: 'POST', body: JSON.stringify(orden) }),
  updateEstado: (id: number, estado: Orden['estado']) =>
    fetchApi<Orden>(`/orders/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) }),
};

// Carrito API (if your backend has these endpoints)
export const carritoApi = {
  getByUsuario: (idUsuario: number) => fetchApi<Carrito>(`/cart/user/${idUsuario}`),
  addItem: (idUsuario: number, item: { idProducto: number; cantidad: number }) =>
    fetchApi<Carrito>(`/cart/user/${idUsuario}/items`, { method: 'POST', body: JSON.stringify(item) }),
  removeItem: (idUsuario: number, idDetalle: number) =>
    fetchApi<Carrito>(`/cart/user/${idUsuario}/items/${idDetalle}`, { method: 'DELETE' }),
  clear: (idUsuario: number) => fetchApi<Carrito>(`/cart/user/${idUsuario}`),
};
