import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext.jsx";
import { CartIcon } from "./icons.jsx";

const CartButton = () => {
  const { totalQuantity, toggleCart } = useCart();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleCart}
      className="fixed bottom-6 right-24 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition-transform hover:scale-[1.05]"
      aria-label={t("cartButton.aria")}
    >
      <CartIcon className="h-5 w-5" />
      <span>{t("cartButton.label")}</span>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
        {totalQuantity}
      </span>
    </button>
  );
};

export default CartButton;
