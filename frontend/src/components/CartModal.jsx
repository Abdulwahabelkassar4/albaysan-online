import { useCart } from "../context/CartContext.jsx";

const CartModal = () => {
  const { items, isOpen, closeCart, removeItem, updateQty, totalPrice } = useCart();

  if (!isOpen) return null;

  const handleCheckout = () => {
    // Placeholder for future checkout flow (e.g., redirect to checkout page)
    closeCart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="max-h-[80vh] w-[90vw] max-w-2xl overflow-hidden rounded-2xl border border-purple-400/20 bg-purple-900/60 p-6 text-right text-white shadow-lg shadow-purple-900/40">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-wide">السلة</h2>
          <button
            onClick={closeCart}
            className="rounded-full bg-white/10 px-4 py-2 text-sm transition hover:scale-[1.02] hover:bg-white/20"
          >
            إغلاق السلة
          </button>
        </div>
        <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-2">
          {items.length === 0 ? (
            <p className="text-sm text-white/70">سلتك فارغة حالياً.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.lineId}
                className="flex gap-4 rounded-2xl bg-white/5 p-4 text-sm shadow-inner shadow-black/20"
              >
                <div className="h-20 w-20 overflow-hidden rounded-xl border border-white/10">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary-500/10 text-white/60">
                      {item.name.slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">{item.name}</h3>
                    <button
                      onClick={() => removeItem(item.lineId)}
                      className="text-xs text-secondary-200 transition hover:scale-[1.05]"
                    >
                      إزالة
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                    <span>المقاس: <span className="text-white">{item.size}</span></span>
                    <span>اللون: <span className="text-white">{item.color}</span></span>
                    <span>السعر: <span className="text-white">{item.price} د.أ</span></span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.lineId, item.qty - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg transition hover:scale-[1.05]"
                        aria-label="إنقاص الكمية"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(event) => updateQty(item.lineId, Number(event.target.value))}
                        className="w-14 rounded-full border border-white/20 bg-transparent text-center text-sm focus:outline-none"
                      />
                      <button
                        onClick={() => updateQty(item.lineId, item.qty + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg transition hover:scale-[1.05]"
                        aria-label="زيادة الكمية"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-base font-semibold text-secondary-200">
                      {(item.price * item.qty).toFixed(2)} د.أ
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-6 space-y-4 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>المجموع الكلي</span>
            <span>{totalPrice.toFixed(2)} د.أ</span>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <button
              onClick={handleCheckout}
              disabled={items.length === 0}
              className="rounded-full bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              إتمام الطلب
            </button>
            <button
              onClick={closeCart}
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/90 transition hover:scale-[1.02] hover:bg-white/10"
            >
              إغلاق السلة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
