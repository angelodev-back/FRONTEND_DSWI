import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { Producto } from '@/lib/api';
import { carritoApi, Carrito, CarritoDetalle } from '@/lib/api';

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

  const getUserId = () => {
    if (typeof localStorage === 'undefined') return 1;
    const stored = localStorage.getItem('userId');
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  };

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
    const carrito = await carritoApi.getByUsuario(getUserId());
    dispatch({ type: 'SET_FROM_BACKEND', payload: mapBackendToItems(carrito) });
  }, [mapBackendToItems]);

  useEffect(() => {
    syncFromBackend().catch(() => {});
  }, [syncFromBackend]);

  const addItem = async (producto: Producto) => {
    const updated = await carritoApi.addItem(getUserId(), { idProducto: producto.idProducto, cantidad: 1 });
    dispatch({ type: 'UPDATE_FROM_BACKEND', payload: mapBackendToItems(updated) });
  };

  const removeItem = async (idDetalle: number) => {
    const updated = await carritoApi.removeItem(getUserId(), idDetalle);
    dispatch({ type: 'UPDATE_FROM_BACKEND', payload: mapBackendToItems(updated) });
  };

  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      return removeItem(item.idDetalle);
    }
    // Estrategia: eliminar y recrear el detalle con la nueva cantidad
    await carritoApi.removeItem(getUserId(), item.idDetalle);
    const updated = await carritoApi.addItem(getUserId(), { idProducto: item.producto.idProducto, cantidad: newQuantity });
    dispatch({ type: 'UPDATE_FROM_BACKEND', payload: mapBackendToItems(updated) });
  };

  const clearCart = async () => {
    const updated = await carritoApi.clear(getUserId());
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
