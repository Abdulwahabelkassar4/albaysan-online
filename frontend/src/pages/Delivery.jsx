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
      const { customerName, phone, address } = values;

      const messageLines = [
        t("orders.newDeliveryTitle", { customer: customerName }),
        orderDetails,
        t("orders.whatsappPhone", { phone }),
      ];
      if (address) {
        messageLines.push(t("orders.whatsappAddress", { address }));
      }
      messageLines.push(t("orders.whatsappFooter"));

      const orderText = messageLines.join("\n\n");

      const whatsappURL = buildWhatsAppLink({ message: orderText });

      await axiosClient.post("/api/orders", {
        type: "delivery",
        customerName,
        phone,
        address,
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
                  <label className="mb-2 block text-sm text-white/70">{t("forms.name")}</label>
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
                  <label className="mb-2 block text-sm text-white/70">{t("forms.phone")}</label>
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
                  <label className="mb-2 block text-sm text-white/70">{t("forms.address")}</label>
                  <textarea
                    {...register("address", { required: true })}
                    rows="3"
                    className={`w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  />
                  {formState.errors.address && (
                    <span className="mt-1 block text-xs text-rose-300">{t("forms.required")}</span>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/70">{t("forms.details")}</label>
                  <textarea
                    name="details"
                    value={orderDetails}
                    readOnly
                    dir={isRTL ? "rtl" : "ltr"}
                    rows={5}
                    className={`w-full resize-none rounded-2xl border border-purple-400/20 bg-purple-950/40 px-4 py-3 text-sm text-white ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-secondary-500 to-pink-500 py-3 text-base font-semibold text-white shadow-lg shadow-purple-900/30 transition-transform hover:scale-[1.02]"
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
