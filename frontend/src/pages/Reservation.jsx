import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext.jsx";
import { CalendarIcon, SparkleIcon } from "../components/icons.jsx";
import { buildWhatsAppLink } from "../config/contact.js";

const Reservation = () => {
  const { register, handleSubmit, reset, formState } = useForm();
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const { cartItems, totalPrice, clearCart, getItemPrice } = useCart();
  const isRTL = i18n.language === "ar";

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  useEffect(() => {
    const savedCode = sessionStorage.getItem("applied_promo_code");
    if (savedCode) {
      setPromoCodeInput(savedCode);
      handleApplyPromo(savedCode);
    }
  }, []);

  const handleApplyPromo = async (codeToTest) => {
    const code = (typeof codeToTest === "string" ? codeToTest : promoCodeInput).trim();
    if (!code) {
      showToast("يرجى كتابة كود الخصم أولاً", "error");
      return;
    }
    setValidatingPromo(true);
    try {
      const { data } = await axiosClient.post("/api/promo-codes/validate", {
        code,
        cartItems,
        subtotal: totalPrice,
      });
      if (data.valid) {
        setAppliedPromo(data);
        showToast(data.message || "تم تطبيق الخصم بنجاح 🎉", "success");
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "كود الخصم غير صالح";
      setAppliedPromo(null);
      showToast(msg, "error");
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput("");
    sessionStorage.removeItem("applied_promo_code");
    showToast("تم إزالة كود الخصم", "info");
  };

  const subtotal = totalPrice;
  const discountAmount = appliedPromo ? Number(appliedPromo.discountAmount) || 0 : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const discountLabel = appliedPromo
    ? appliedPromo.discountType === "percentage"
      ? `${appliedPromo.discountValue}%`
      : `${appliedPromo.discountValue} د.أ`
    : "";

  const formatOrderDetails = () => {
    if (!cartItems.length) {
      return t("orders.cartEmpty");
    }
    const lines = cartItems.map((item) => {
      const itemPrice = getItemPrice(item);
      let line = `• ${item.name} (${item.size || "وسيط"}، ${item.color || "افتراضي"}) × ${item.qty} = ${(itemPrice * item.qty).toFixed(2)} د.أ`;
      if (item.configSnapshot?.length) {
        const treeLines = item.configSnapshot.map(
          (e) => `   ↳ ${e.pieceName ? `${e.pieceName}: ` : ""}${e.optionName}: ${e.selectedValue}${e.priceAdjustment > 0 ? ` (+${e.priceAdjustment} د.أ)` : ""}`
        );
        line += `\n${treeLines.join("\n")}`;
      }
      return line;
    });
    let summary = `${lines.join("\n")}\n\nالمجموع الفرعي: ${subtotal.toFixed(2)} د.أ`;
    if (discountAmount > 0) {
      summary += `\nخصم الكود (${appliedPromo.promoCode} - ${discountLabel}): -${discountAmount.toFixed(2)} د.أ`;
    }
    summary += `\nنوع الطلب: استلام من المتجر (0.00 د.أ توصيل)\nالإجمالي الكلي: ${finalTotal.toFixed(2)} د.أ`;
    return summary;
  };

  const orderDetails = formatOrderDetails();

  const onSubmit = async (values) => {
    if (cartItems.length === 0) {
      showToast(t("reservationPage.toast.cartEmpty"), "error");
      return;
    }

    try {
      const { customerName, phone, pickupDate, height, weight } = values;
      const locale = isRTL ? "ar-JO" : "en-US";
      const formattedDate = pickupDate ? new Date(pickupDate).toLocaleDateString(locale) : "";

      const itemLines = cartItems.map((item) => {
        let line = `• ${item.name} (${item.size ? `المقاس ${item.size}` : "مقاس موحد"}، ${item.color ? `اللون ${item.color}` : "لون قياسي"}) × ${item.qty}`;
        if (item.configSnapshot?.length) {
          const configStr = item.configSnapshot.map((e) => `${e.optionName}: ${e.selectedValue}`).join("، ");
          line += `\n  ↳ [${configStr}]`;
        }
        return line;
      }).join("\n");

      const messageLines = [
        `🛍️ *طلب حجز واستلام من المتجر*`,
        `👤 *الاسم:* ${customerName}`,
        `📞 *رقم الهاتف:* ${phone}`,
        formattedDate ? `📅 *تاريخ الاستلام:* ${formattedDate}` : null,
        `📏 *الطول:* ${height} سم`,
        `⚖️ *الوزن:* ${weight} كغم`,
        "",
        `📦 *المنتجات المطلوبة:*`,
        itemLines,
        "",
        `💵 *المجموع الفرعي:* ${subtotal.toFixed(2)} د.أ`,
        appliedPromo && discountAmount > 0 ? `🏷️ *كود الخصم:* ${appliedPromo.promoCode} (${discountLabel} = -${discountAmount.toFixed(2)} د.أ)` : null,
        `💰 *الإجمالي النهائي:* ${finalTotal.toFixed(2)} د.أ`,
        "",
        `✨ *تم الإرسال من موقع البيلسان أونلاين*`
      ].filter(Boolean);

      const orderText = messageLines.join("\n");
      const whatsappURL = buildWhatsAppLink({ message: orderText });

      await axiosClient.post("/api/orders", {
        type: "reservation",
        customerName,
        phone,
        address: "استلام من المتجر",
        pickupDate,
        height,
        weight,
        items: cartItems.map(({ lineId, ...item }) => {
          const orderItem = { ...item };
          if (orderItem.configuredPrice != null) {
            orderItem.price = orderItem.configuredPrice;
          }
          return orderItem;
        }),
        deliveryFee: 0,
        discountAmount,
        promoCode: appliedPromo?.promoCode || "",
        totalPrice: finalTotal,
        notes: orderDetails,
      });

      clearCart();
      reset();
      sessionStorage.removeItem("applied_promo_code");
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
              <label className="mb-2 block text-sm font-medium text-white/80">
                {t("forms.name")} <span className="text-rose-400">*</span>
              </label>
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
              <label className="mb-2 block text-sm font-medium text-white/80">
                {t("forms.phone")} <span className="text-rose-400">*</span>
              </label>
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
              <label className="mb-2 block text-sm font-medium text-white/80">
                {t("forms.pickupDate")} <span className="text-rose-400">*</span>
              </label>
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

            {/* Promo Code Input Box */}
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
              <label className="block text-xs font-bold text-white/80 flex items-center gap-1.5">
                <SparkleIcon className="h-4 w-4 text-amber-400" />
                هل لديك كود خصم؟ (Promo Code)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  placeholder="أدخل كود الخصم (مثال: BAYSAN20)"
                  disabled={!!appliedPromo || validatingPromo}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-400 uppercase font-mono"
                />
                {appliedPromo ? (
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="px-4 py-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold hover:bg-red-500/30 transition whitespace-nowrap"
                  >
                    إلغاء الخصم
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApplyPromo()}
                    disabled={validatingPromo || !promoCodeInput.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-pink-600 text-white text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {validatingPromo ? "جاري التحقق..." : "تطبيق الخصم"}
                  </button>
                )}
              </div>
              {appliedPromo && (
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  ✓ تم تطبيق كود الخصم ({appliedPromo.promoCode}) - تم خصم {discountLabel} (-{discountAmount.toFixed(2)} د.أ)
                </p>
              )}
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
              {formState.isSubmitting ? t("forms.submitting") : t("forms.submitReservation")}
            </button>
          </form>
        </section>
      </div>
    </section>
  );
};

export default Reservation;
