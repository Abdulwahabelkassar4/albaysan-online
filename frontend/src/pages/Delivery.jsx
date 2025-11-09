import { useForm } from "react-hook-form";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext.jsx";

const Delivery = () => {
  const { register, handleSubmit, reset, formState } = useForm();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { cartItems, totalPrice, clearCart } = useCart();

  const orderDetails =
    cartItems.length > 0
      ? `${cartItems
          .map(
            (item) =>
              `• ${item.name} (المقاس ${item.size || "حر"}، اللون ${item.color || "غير محدد"}) × ${item.qty}`
          )
          .join("\n")}\n\nالإجمالي الكلي: ${totalPrice.toFixed(2)} د.أ`
      : "السلة فارغة حاليًا";

  const steps = [
    "أضف المنتجات إلى السلة بعد اختيار المقاس واللون.",
    "املأ نموذج التوصيل بمعلوماتك وعنوانك بالتفصيل.",
    "بعد الإرسال سيتم تحويلك تلقائيًا إلى واتساب لتأكيد الطلب."
  ];

  const onSubmit = async (values) => {
    if (cartItems.length === 0) {
      showToast("الرجاء إضافة منتجات إلى السلة قبل الطلب", "error");
      return;
    }

    try {
      const { customerName, phone, address } = values;

      const orderText =
        `🛵 طلب جديد من ${customerName}\n\n` +
        `${orderDetails}\n\n` +
        `📞 رقم الهاتف: ${phone}\n` +
        (address ? `📍 العنوان: ${address}\n` : "") +
        "⌚ تم الإرسال من موقع البيلسان أونلاين";

      const whatsappNumber = "0798522935";
      const whatsappURL = `https://wa.me/962${whatsappNumber.slice(1)}?text=${encodeURIComponent(orderText)}`;

      await axiosClient.post("/api/orders", {
        type: "delivery",
        customerName,
        phone,
        address,
        items: cartItems.map(({ lineId, ...item }) => ({ ...item })),
        notes: orderDetails,
      });

      window.open(whatsappURL, "_blank");
      clearCart();
      reset();
      showToast("تم إرسال الطلب عبر واتساب ✅", "success");
    } catch (error) {
      console.error(error);
      showToast("تعذر إرسال الطلب، يرجى المحاولة لاحقًا", "error");
    }
  };

  return (
    <section className="relative overflow-hidden py-16">
      <div
        className="absolute inset-0 bg-[url('/assets/background-floral.png')] bg-no-repeat bg-right-bottom bg-contain opacity-0 pointer-events-none animate-floralFade"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-4xl px-6">
        <section className="glass-card p-10">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="w-full space-y-6 text-right md:w-2/5 md:text-left">
              <h2 className="text-2xl font-bold text-white">خطوات الطلب</h2>
              <div className="space-y-4">
                {steps.map((text, index) => (
                  <div
                    key={`delivery-step-${index}`}
                    className="flex items-start gap-3 text-right md:text-left"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-base font-bold text-white shadow-lg shadow-purple-900/30">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-300 md:text-base">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full space-y-6 md:w-3/5">
              <div>
                <h1 className="text-3xl font-bold text-white">{t("nav.delivery")}</h1>
                <p className="mt-2 text-sm text-white/70">{t("deliveryNote")}</p>
              </div>
              <form className="grid gap-5 text-right" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-2 block text-sm text-white/70">{t("forms.name")}</label>
              <input
                {...register("customerName", { required: true })}
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              {formState.errors.customerName && (
                <span className="mt-1 block text-xs text-rose-300">هذا الحقل مطلوب</span>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">{t("forms.phone")}</label>
              <input
                {...register("phone", { required: true })}
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              {formState.errors.phone && (
                <span className="mt-1 block text-xs text-rose-300">هذا الحقل مطلوب</span>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">{t("forms.address")}</label>
              <textarea
                {...register("address", { required: true })}
                rows="3"
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              {formState.errors.address && (
                <span className="mt-1 block text-xs text-rose-300">هذا الحقل مطلوب</span>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">تفاصيل الطلب</label>
              <textarea
                name="details"
                value={orderDetails}
                readOnly
                dir="rtl"
                rows={5}
                className="w-full resize-none rounded-2xl border border-purple-400/20 bg-purple-950/40 px-4 py-3 text-sm text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-secondary-500 to-pink-500 py-3 text-base font-semibold text-white shadow-lg shadow-purple-900/30 transition-transform hover:scale-[1.02]"
              disabled={formState.isSubmitting}
            >
              {formState.isSubmitting ? "جارٍ الإرسال..." : "إرسال الطلب"}
            </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default Delivery;
