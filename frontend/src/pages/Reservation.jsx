import { useForm } from "react-hook-form";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext.jsx";
import { CalendarIcon } from "../components/icons.jsx";
import { buildWhatsAppLink } from "../config/contact.js";

const Reservation = () => {
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

  const onSubmit = async (values) => {
    if (cartItems.length === 0) {
      showToast(t("reservationPage.toast.cartEmpty"), "error");
      return;
    }

    try {
      const { customerName, phone, pickupDate } = values;
      const locale = isRTL ? "ar-JO" : "en-US";

      const messageLines = [
        t("orders.newReservationTitle", { customer: customerName }),
        orderDetails,
        t("orders.whatsappPhone", { phone }),
      ];

      if (pickupDate) {
        messageLines.push(
          t("orders.whatsappPickup", {
            date: new Date(pickupDate).toLocaleDateString(locale),
          })
        );
      }

      messageLines.push(t("orders.whatsappFooter"));

      const orderText = messageLines.join("\n\n");

      const whatsappURL = buildWhatsAppLink({ message: orderText });

      await axiosClient.post("/api/orders", {
        type: "reservation",
        customerName,
        phone,
        pickupDate,
        items: cartItems.map(({ lineId, ...item }) => ({ ...item })),
        notes: orderDetails,
      });

      clearCart();
      reset();
      showToast(t("reservationPage.toast.success"), "success");
      window.location.assign(whatsappURL);
    } catch (error) {
      console.error(error);
      showToast(t("reservationPage.toast.error"), "error");
    }
  };

  return (
    <section className="relative overflow-hidden py-16">
      <div
        className="absolute inset-0 bg-[url('/assets/background-floral.png')] bg-no-repeat bg-left-bottom bg-contain opacity-0 pointer-events-none animate-floralFade"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-4xl px-6">
        <section className="glass-card space-y-6 p-10">
          <div className={isRTL ? "text-right" : "text-left"}>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
              <CalendarIcon className="h-7 w-7 text-secondary-200" />
              {t("nav.reservation")}
            </h1>
            <p className="mt-2 text-sm text-white/70">{t("reservationPage.intro")}</p>
          </div>
          <form
            className={`grid gap-5 ${isRTL ? "text-right" : "text-left"}`}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <label className="mb-2 block text-sm text-white/70">{t("forms.name")}</label>
              <input
                {...register("customerName", { required: true })}
                className={`w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary-300 ${
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
                className={`w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary-300 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              />
              {formState.errors.phone && (
                <span className="mt-1 block text-xs text-rose-300">{t("forms.required")}</span>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">{t("forms.pickupDate")}</label>
              <input
                type="date"
                {...register("pickupDate", { required: true })}
                className={`w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary-300 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              />
              {formState.errors.pickupDate && (
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
              {formState.isSubmitting ? t("forms.submitting") : t("forms.submitReservation")}
            </button>
          </form>
        </section>
      </div>
    </section>
  );
};

export default Reservation;
