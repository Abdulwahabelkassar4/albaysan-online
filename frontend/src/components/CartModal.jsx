import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import {
  CalendarIcon,
  CartIcon,
  CloseIcon,
  MinusIcon,
  PaletteIcon,
  PlusIcon,
  PriceTagIcon,
  RulerIcon,
  TruckIcon,
} from "./icons.jsx";

const CartModal = () => {
  const { items, isOpen, closeCart, removeItem, updateQty, totalPrice, getItemPrice } = useCart();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  if (!isOpen) return null;

  const goToFlow = (path) => {
    closeCart();
    navigate(path);
  };

  return (
    <div className="animate-cart-overlay fixed inset-0 z-50 bg-black/65 backdrop-blur-sm" onClick={closeCart}>
      <aside
        className={`animate-cart-drawer absolute top-0 h-full w-full max-w-md border-white/10 bg-neutral-900/95 p-5 shadow-2xl transition-transform sm:w-[92vw] ${
          isRTL ? "left-0 border-r" : "right-0 border-l"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          <div className={`mb-5 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <CartIcon className="h-5 w-5 text-secondary-200" />
              <h2 className="text-xl font-semibold text-white">{t("cart.title")}</h2>
            </div>
            <button
              onClick={closeCart}
              className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label={t("cart.close")}
            >
              <CloseIcon />
            </button>
          </div>

          <div className={`flex-1 space-y-3 overflow-y-auto ${isRTL ? "pr-1" : "pl-1"}`}>
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-white/70">
                <CartIcon className="mx-auto mb-3 h-7 w-7 text-white/40" />
                <p>{t("cart.empty")}</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.lineId}
                  className={`rounded-2xl border border-white/10 bg-white/5 p-4 transition duration-200 hover:border-secondary-300/50 hover:bg-white/10 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-primary-500/10 text-white/60">
                          {item.name.slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                        <button
                          onClick={() => removeItem(item.lineId)}
                          className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 text-xs text-secondary-200 transition hover:border-secondary-300/50 hover:bg-secondary-500/10 hover:text-secondary-100"
                        >
                          <CloseIcon className="h-3.5 w-3.5" />
                          {t("cart.remove")}
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
                        <span className="inline-flex items-center gap-1.5">
                          <RulerIcon className="h-3.5 w-3.5 text-white/60" />
                          {t("cart.size")}: <span className="text-white">{item.size}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <PaletteIcon className="h-3.5 w-3.5 text-white/60" />
                          {t("cart.color")}: <span className="text-white">{item.color}</span>
                        </span>
                      </div>
                      {/* Configuration details */}
                      {item.configSnapshot && item.configSnapshot.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {item.configSnapshot.map((entry, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-lg bg-primary-500/15 border border-primary-400/20 px-2 py-0.5 text-[10px] font-semibold text-primary-200"
                            >
                              {entry.optionName}: {entry.selectedValue}
                              {entry.priceAdjustment > 0 && (
                                <span className="text-primary-300/70">+{entry.priceAdjustment}</span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <button
                            onClick={() => updateQty(item.lineId, item.qty - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                            aria-label={t("cart.decrease")}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(event) => updateQty(item.lineId, event.target.value)}
                            className="w-14 rounded-full border border-white/20 bg-white/5 px-2 py-1 text-center text-sm text-white transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300"
                          />
                          <button
                            onClick={() => updateQty(item.lineId, item.qty + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                            aria-label={t("cart.increase")}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-secondary-200">
                          <PriceTagIcon className="h-4 w-4" />
                          {(getItemPrice(item) * item.qty).toFixed(2)} {t("product.priceSuffix")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="mb-3 flex items-center justify-between text-base font-semibold text-white">
              <span>{t("cart.total")}</span>
              <span>
                {totalPrice.toFixed(2)} {t("product.priceSuffix")}
              </span>
            </div>
            <div className="grid gap-3">
              <button
                onClick={() => goToFlow("/delivery")}
                disabled={items.length === 0}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-950/35 transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-secondary-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TruckIcon className="h-4 w-4" />
                {t("cart.goToDelivery")}
              </button>
              <button
                onClick={() => goToFlow("/reservation")}
                disabled={items.length === 0}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/30 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/90 shadow-lg shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CalendarIcon className="h-4 w-4" />
                {t("cart.goToReservation")}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CartModal;
