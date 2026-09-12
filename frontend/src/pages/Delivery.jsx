import { useForm } from "react-hook-form";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext.jsx";
import { CalendarIcon, ShieldIcon, TruckIcon } from "../components/icons.jsx";
import { buildWhatsAppLink } from "../config/contact.js";

const Delivery = () => {
  const { register, handleSubmit, reset, formState } = useForm();
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const { cartItems, totalPrice, clearCart } = useCart();
  const isRTL = i18n.language === "ar";

  const formatOrderDetails = () => {
    if (!cartItems.length) {
      return t("orders.cartEmpty");
    }
    const lines = cartItems.map((item) =>
      t("orders.itemLine", {
        name: item.name,
        size: item.size || t("product.defaultSize"),
        color: item.color || t("product.defaultColor"),
        qty: item.qty,
      })
    );
    return `${lines.join("\n")}\n\n${t("orders.total", {
      amount: totalPrice.toFixed(2),
    })}`;
  };

  const orderDetails = formatOrderDetails();
  const steps = t("deliveryPage.steps", { returnObjects: true });
  const stepIcons = [TruckIcon, ShieldIcon, CalendarIcon];

  const onSubmit = async (values) => {
    if (cartItems.length === 0) {
      showToast(t("deliveryPage.toast.cartEmpty"), "error");
      return;
    }

    try {
      const { customerName, phone, address, height, weight } = values;

      const messageLines = [
        t("orders.newDeliveryTitle", { customer: customerName }),
        orderDetails,
        t("orders.whatsappPhone", { phone }),
      ];
      if (address) {
        messageLines.push(t("orders.whatsappAddress", { address }));
      }
      if (height) {
        messageLines.push(t("orders.whatsappHeight", { height }));
      }
      if (weight) {
        messageLines.push(t("orders.whatsappWeight", { weight }));
      }
      messageLines.push(t("orders.whatsappFooter"));

      const orderText = messageLines.join("\n\n");

      const whatsappURL = buildWhatsAppLink({ message: orderText });

      await axiosClient.post("/api/orders", {
        type: "delivery",
        customerName,
        phone,
        address,
        height,
        weight,
        items: cartItems.map(({ lineId, ...item }) => ({ ...item })),
        notes: orderDetails,
      });

      clearCart();
      reset();
      showToast(t("deliveryPage.toast.success"), "success");
      window.location.assign(whatsappURL);
    } catch (error) {
      console.error(error);
      showToast(t("deliveryPage.toast.error"), "error");
    }
  };

  return (
    <section className="relative overflow-hidden py-16">
      <div
        className="absolute inset-0 bg-[url('/assets/background-floral.png')] bg-no-repeat bg-right-bottom bg-contain opacity-0 pointer-events-none animate-floralFade"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-4xl px-6">
        {/* Checkout Step Progress Bar */}
        <div className="mb-8 rounded-3xl border border-white/10 bg-neutral-900/80 p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between max-w-lg mx-auto text-xs font-bold text-white">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-500">1</span>
              <span>سلة التسوق</span>
            </div>
            <div className="h-0.5 flex-1 mx-3 bg-gradient-to-r from-emerald-500 to-primary-500" />
            <div className="flex items-center gap-2 text-primary-400">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500/20 ring-2 ring-primary-500">2</span>
              <span>بيانات التوصيل</span>
            </div>
            <div className="h-0.5 flex-1 mx-3 bg-white/20" />
            <div className="flex items-center gap-2 text-white/50">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">3</span>
              <span>تأكيد الواتساب</span>
            </div>
          </div>
        </div>

        <section className="glass-card p-10">
          <div className="flex flex-col gap-8 md:flex-row">
            <div
              className={`w-full space-y-6 ${isRTL ? "text-right md:text-right" : "text-left md:text-left"} md:w-2/5`}
            >
              <h2 className="text-2xl font-bold text-white">{t("deliveryPage.stepsTitle")}</h2>
              <div className="space-y-4">
                {steps.map((text, index) => (
                  <div
                    key={`delivery-step-${index}`}
                    className={`flex items-start gap-3 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {(() => {
                      const StepIcon = stepIcons[index] || TruckIcon;
                      return (
                        <span className="mt-2 shrink-0 rounded-full bg-secondary-500/20 p-2 text-secondary-200">
                          <StepIcon className="h-4 w-4" />
                        </span>
                      );
                    })()}
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
              <form
                className={`grid gap-5 ${isRTL ? "text-right" : "text-left"}`}
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">{t("forms.name")} <span className="text-rose-400">*</span></label>
                  <input
                    {...register("customerName", { required: true })}
                    className={`w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  />
                  {formState.errors.customerName && (
                    <span className="mt-1 block text-xs text-rose-300">{t("forms.required")}</span>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">{t("forms.phone")} <span className="text-rose-400">*</span></label>
                  <input
                    {...register("phone", { required: true })}
                    className={`w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  />
                  {formState.errors.phone && (
                    <span className="mt-1 block text-xs text-rose-300">{t("forms.required")}</span>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">{t("forms.address")} <span className="text-rose-400">*</span></label>
                  <textarea
                    {...register("address", { required: true })}
                    rows="2"
                    className={`w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  />
                  {formState.errors.address && (
                    <span className="mt-1 block text-xs text-rose-300">{t("forms.required")}</span>
                  )}
                </div>

                {/* Height & Weight Fields */}
                <div className="rounded-2xl border border-secondary-400/30 bg-purple-950/40 p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-secondary-200">
                        {t("forms.height")} <span className="text-rose-400">*</span>
                      </label>
                      <input
                        {...register("height", { required: true })}
                        placeholder={t("forms.heightPlaceholder")}
                        className={`w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-secondary-300 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      />
                      {formState.errors.height && (
                        <span className="mt-1 block text-xs text-rose-300">{t("forms.required")}</span>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-secondary-200">
                        {t("forms.weight")} <span className="text-rose-400">*</span>
                      </label>
                      <input
                        {...register("weight", { required: true })}
                        placeholder={t("forms.weightPlaceholder")}
                        className={`w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-secondary-300 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      />
                      {formState.errors.weight && (
                        <span className="mt-1 block text-xs text-rose-300">{t("forms.required")}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs font-medium text-pink-200/90 leading-relaxed">
                    💡 {t("forms.sizeNote")}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">{t("forms.details")}</label>
                  <textarea
                    name="details"
                    value={orderDetails}
                    readOnly
                    dir={isRTL ? "rtl" : "ltr"}
                    rows={4}
                    className={`w-full resize-none rounded-2xl border border-purple-400/20 bg-purple-950/40 px-4 py-3 text-sm text-white ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-secondary-500 to-pink-500 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-900/30 transition-transform hover:scale-[1.02]"
                  disabled={formState.isSubmitting}
                >
                  {formState.isSubmitting ? t("forms.submitting") : t("forms.submitDelivery")}
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
