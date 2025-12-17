import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { Producto } from '@/lib/api';
import { carritoApi, Carrito, CarritoDetalle, usuariosApi, Usuario } from '@/lib/api';

export interface CartItem {
  idDetalle: number;
  producto: Producto;
  cantidad: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'SET_FROM_BACKEND'; payload: CartItem[] }
  | { type: 'UPDATE_FROM_BACKEND'; payload: CartItem[] }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' };

const initialState: CartState = {
  items: [],
  isOpen: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_FROM_BACKEND':
      return { ...state, items: action.payload };
    case 'UPDATE_FROM_BACKEND':
      return { ...state, items: action.payload };
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (producto: Producto) => Promise<void>;
  removeItem: (idDetalle: number) => Promise<void>;
  updateQuantity: (item: CartItem, newQuantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const getStoredUserId = () => {
    if (typeof localStorage === 'undefined') return undefined;
    const stored = localStorage.getItem('userId');
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  };

  const ensureUserId = useCallback(async (): Promise<number> => {
    if (typeof localStorage === 'undefined') return 1;

    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr) as Usuario;
        if (currentUser?.idUsuario) {
          localStorage.setItem('userId', String(currentUser.idUsuario));
          return currentUser.idUsuario;
        }
      }

      const storedId = getStoredUserId();
      if (storedId) return storedId;

      try {
        const existing = await usuariosApi.getByEmail('guest@local');
        if (existing?.idUsuario) {
          localStorage.setItem('userId', String(existing.idUsuario));
          return existing.idUsuario;
        }
      } catch (_) {
        // Si no existe, lo creamos abajo
      }

      const guest = await usuariosApi.registrar({
        nombre: 'Invitado',
        apellido: '',
        email: 'guest@local',
        contraseña: 'guest',
        telefono: '',
        direccion: '',
        estado: 'ACTIVO',
      });
      localStorage.setItem('userId', String(guest.idUsuario));
      return guest.idUsuario;
    } catch (e) {
      console.error('No se pudo asegurar userId:', e);
      // Último recurso: 1 (puede fallar si no existe en BD)
      return 1;
    }
  }, []);

  const mapBackendToItems = useCallback((carrito: Carrito): CartItem[] => {
    if (!carrito.detalles) return [];
    return carrito.detalles.map((d: CarritoDetalle) => ({
      idDetalle: d.idDetalle,
      cantidad: d.cantidad,
      producto: {
        idProducto: d.idProducto,
        nombre: d.nombreProducto ?? 'Producto',
        descripcion: '',
        precio: Number(d.precioUnitario ?? 0),
        stock: 0,
        idCategoria: 0,
        nombreCategoria: '',
        estado: 'ACTIVO',
        imagen: undefined,
      },
    }));
  }, []);

  const syncFromBackend = useCallback(async () => {
    const userId = await ensureUserId();
    const carrito = await carritoApi.getByUsuario(userId);
    dispatch({ type: 'SET_FROM_BACKEND', payload: mapBackendToItems(carrito) });
  }, [mapBackendToItems, ensureUserId]);

  useEffect(() => {
    syncFromBackend().catch(() => {});
  }, [syncFromBackend]);

  const addItem = async (producto: Producto) => {
    try {
      const userId = await ensureUserId();
      console.log('Agregando producto al carrito:', producto.idProducto, 'Usuario:', userId);
      const updated = await carritoApi.addItem(userId, { idProducto: producto.idProducto, cantidad: 1 });
      console.log('Respuesta del backend:', updated);
      dispatch({ type: 'UPDATE_FROM_BACKEND', payload: mapBackendToItems(updated) });
    } catch (error) {
      console.error('Error agregando producto al carrito:', error);
      throw error;
    }
  };

  const removeItem = async (idDetalle: number) => {
    const userId = await ensureUserId();
    const updated = await carritoApi.removeItem(userId, idDetalle);
    dispatch({ type: 'UPDATE_FROM_BACKEND', payload: mapBackendToItems(updated) });
  };

  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      return removeItem(item.idDetalle);
    }
    // Estrategia: eliminar y recrear el detalle con la nueva cantidad
    const userId = await ensureUserId();
    await carritoApi.removeItem(userId, item.idDetalle);
    const updated = await carritoApi.addItem(userId, { idProducto: item.producto.idProducto, cantidad: newQuantity });
    dispatch({ type: 'UPDATE_FROM_BACKEND', payload: mapBackendToItems(updated) });
  };

  const clearCart = async () => {
    const userId = await ensureUserId();
    const updated = await carritoApi.clear(userId);
    dispatch({ type: 'UPDATE_FROM_BACKEND', payload: mapBackendToItems(updated) });
  };
  const toggleCart = () => dispatch({ type: 'TOGGLE_CART' });
  const openCart = () => dispatch({ type: 'OPEN_CART' });
  const closeCart = () => dispatch({ type: 'CLOSE_CART' });

  const totalItems = state.items.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.producto.precio * item.cantidad,
    0
  );

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
