import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const CartContext = createContext();

const STORAGE_KEY = "albaylsan_cart_items";

const initialState = {
  items: [],
  isOpen: false,
};

const buildLineId = (item) => {
  const sizeKey = item.size || "default";
  const colorKey = item.color || "default";
  return `${item.id}_${sizeKey}_${colorKey}`;
};

const reducer = (state, action) => {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, items: action.payload || [] };
    case "ADD_ITEM": {
      const lineId = buildLineId(action.payload);
      const existing = state.items.find((item) => item.lineId === lineId);
      const updatedItems = existing
        ? state.items.map((item) =>
            item.lineId === lineId
              ? { ...item, qty: item.qty + (action.payload.qty || 1) }
              : item
          )
        : [...state.items, { ...action.payload, lineId, qty: action.payload.qty || 1 }];
      return { ...state, items: updatedItems, isOpen: true };
    }
    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter((item) => item.lineId !== action.payload),
      };
    }
    case "UPDATE_QTY": {
      const { lineId, qty } = action.payload;
      const sanitizedQty = Math.max(1, qty);
      return {
        ...state,
        items: state.items.map((item) =>
          item.lineId === lineId ? { ...item, qty: sanitizedQty } : item
        ),
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", payload: parsed });
        }
      }
    } catch (error) {
      console.warn("Failed to hydrate cart", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const value = useMemo(() => {
    const totalQuantity = state.items.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = state.items.reduce((sum, item) => sum + item.price * item.qty, 0);

    return {
      items: state.items,
      cartItems: state.items,
      isOpen: state.isOpen,
      totalQuantity,
      totalPrice,
      addItem: (item) => dispatch({ type: "ADD_ITEM", payload: item }),
      removeItem: (lineId) => dispatch({ type: "REMOVE_ITEM", payload: lineId }),
      updateQty: (lineId, qty) => dispatch({ type: "UPDATE_QTY", payload: { lineId, qty } }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
      openCart: () => dispatch({ type: "OPEN_CART" }),
      closeCart: () => dispatch({ type: "CLOSE_CART" }),
      toggleCart: () => dispatch({ type: "TOGGLE_CART" }),
    };
  }, [state.items, state.isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
