import { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
import { Producto } from "@/lib/api";

interface FavoritesState {
  items: Producto[];
}

type FavoritesAction =
  | { type: "TOGGLE"; payload: Producto }
  | { type: "SET"; payload: Producto[] };

const initialState: FavoritesState = {
  items: [],
};

function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case "SET":
      return { ...state, items: action.payload };
    case "TOGGLE": {
      const exists = state.items.some((p) => p.idProducto === action.payload.idProducto);
      if (exists) {
        return { ...state, items: state.items.filter((p) => p.idProducto !== action.payload.idProducto) };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    default:
      return state;
  }
}

interface FavoritesContextType {
  items: Producto[];
  toggleFavorite: (producto: Producto) => void;
  isFavorite: (idProducto: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = "favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Producto[] = JSON.parse(stored);
        dispatch({ type: "SET", payload: parsed });
      }
    } catch (error) {
      console.error("No se pudieron cargar favoritos", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error("No se pudieron guardar favoritos", error);
    }
  }, [state.items]);

  const toggleFavorite = (producto: Producto) => dispatch({ type: "TOGGLE", payload: producto });
  const isFavorite = (idProducto: number) => state.items.some((p) => p.idProducto === idProducto);

  return (
    <FavoritesContext.Provider value={{ items: state.items, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  return ctx;
}
