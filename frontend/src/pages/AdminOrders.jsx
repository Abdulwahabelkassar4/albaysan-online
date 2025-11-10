import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";

const statusOptions = [
  { value: "pending", labelKey: "adminOrdersPage.statuses.pending" },
  { value: "confirmed", labelKey: "adminOrdersPage.statuses.confirmed" },
  { value: "delivered", labelKey: "adminOrdersPage.statuses.delivered" },
  { value: "picked_up", labelKey: "adminOrdersPage.statuses.picked_up" },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ type: "", status: "" });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const locale = isRTL ? "ar-JO" : "en-US";

  const statusLabelMap = useMemo(() => {
    return statusOptions.reduce((acc, option) => {
      acc[option.value] = t(option.labelKey);
      return acc;
    }, {});
  }, [t, i18n.language]);

  const getOrderTypeLabel = (type) =>
    type === "delivery"
      ? t("adminOrdersPage.cards.typeDelivery")
      : t("adminOrdersPage.cards.typeReservation");

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString(locale) : "";

  const getWhatsappMessage = (type) =>
    type === "delivery"
      ? t("adminOrdersPage.whatsappMessage.delivery")
      : t("adminOrdersPage.whatsappMessage.reservation");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get("/api/orders", {
        params: {
          type: filters.type || undefined,
          status: filters.status || undefined,
        },
      });
      setOrders(data);
    } catch (error) {
      showToast(t("adminOrdersPage.toast.loadError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const formatOrderTotal = (order) => {
    if (!order.items || order.items.length === 0) return 0;
    return order.items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  };

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const updateStatus = async (orderId, status) => {
    try {
      await axiosClient.put(`/api/orders/${orderId}/status`, { status });
      showToast(t("adminOrdersPage.toast.updateSuccess"), "success");
      loadOrders();
    } catch (error) {
      showToast(t("adminOrdersPage.toast.updateError"), "error");
    }
  };

  const whatsappLink = (phone, type) => {
    const base = phone.startsWith("0") ? `962${phone.slice(1)}` : phone;
    const message = getWhatsappMessage(type);
    return `https://wa.me/${base}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className={`mb-6 flex ${isRTL ? "justify-start" : "justify-end"}`}>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          {isRTL
            ? `${t("adminOrdersPage.backToDashboard")} →`
            : `← ${t("adminOrdersPage.backToDashboard")}`}
        </Link>
      </div>
      <div
        className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        <h1 className="text-3xl font-bold text-white">{t("adminOrdersPage.title")}</h1>
        <div
          className={`flex flex-wrap items-center gap-3 text-sm ${
            isRTL ? "justify-start" : "justify-end"
          }`}
        >
          <select
            value={filters.type}
            onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
            aria-label={t("adminOrdersPage.filters.type")}
            className={`rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary-300 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            <option value="">{t("adminOrdersPage.filters.allTypes")}</option>
            <option value="delivery">{t("adminOrdersPage.filters.typeDelivery")}</option>
            <option value="reservation">{t("adminOrdersPage.filters.typeReservation")}</option>
          </select>
          <select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            aria-label={t("adminOrdersPage.filters.status")}
            className={`rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary-300 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            <option value="">{t("adminOrdersPage.filters.allStatuses")}</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value} className="text-black">
                {t(status.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-10 space-y-4">
        {loading ? (
          <div className="glass-card h-32 animate-pulse bg-white/5" />
        ) : (
          orders.map((order) => {
            const statusLabel = statusLabelMap[order.status] || order.status;
            const totalLabel = t("adminOrdersPage.cards.total", {
              total: formatOrderTotal(order).toFixed(2),
            });

            return (
              <div
                key={order._id}
                className={`glass-card flex flex-col gap-4 p-6 ${
                  isRTL ? "text-right" : "text-left"
                } md:flex-row md:items-center md:justify-between`}
              >
                <div className="flex-1 space-y-3">
                  <div
                    className={`flex items-center gap-3 text-sm text-white/60 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                      {getOrderTypeLabel(order.type)}
                    </span>
                    <span>
                      {t("adminOrdersPage.cards.status")}: {statusLabel}
                    </span>
                    <span>
                      {t("adminOrdersPage.cards.date")}: {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{order.customerName}</h3>
                  <p className="text-sm text-white/70">
                    {t("adminOrdersPage.cards.phone")}: {order.phone}
                  </p>
                  {order.type === "delivery" && order.address && (
                    <p className="text-sm text-white/70">
                      {t("adminOrdersPage.cards.address")}: {order.address}
                    </p>
                  )}
                  {order.type === "reservation" && order.pickupDate && (
                    <p className="text-sm text-white/70">
                      {t("adminOrdersPage.cards.pickupDate")}: {formatDate(order.pickupDate)}
                    </p>
                  )}
                  {order.notes && (
                    <p className="text-sm text-white/60">
                      {t("adminOrdersPage.cards.notes")}: {order.notes}
                    </p>
                  )}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-3 space-y-2 text-xs text-white/75">
                      <p className="font-semibold">{t("adminOrdersPage.cards.items")}</p>
                      {order.items.map((item, index) => {
                        const name = item.name || t("adminOrdersPage.cards.unknownProduct");
                        const size = item.size || t("product.defaultSize");
                        const color = item.color || t("product.defaultColor");
                        const price = (item.price || 0).toFixed(2);
                        const qty = item.qty || 1;
                        return (
                          <p key={`${order._id}-item-${index}`}>
                            {t("adminOrdersPage.cards.itemSummary", {
                              name,
                              size,
                              color,
                              price,
                              qty,
                            })}
                          </p>
                        );
                      })}
                      <p className="text-sm font-semibold text-secondary-200">{totalLabel}</p>
                    </div>
                  )}
                </div>
                <div
                  className={`flex flex-col gap-3 text-sm ${
                    isRTL ? "items-start" : "items-end"
                  }`}
                >
                  <select
                    value={order.status}
                    onChange={(event) => updateStatus(order._id, event.target.value)}
                    className={`rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary-300 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value} className="text-black">
                        {t(status.labelKey)}
                      </option>
                    ))}
                  </select>
                  <a
                    href={whatsappLink(order.phone, order.type)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary px-4 py-2 text-xs"
                  >
                    {t("adminOrdersPage.cards.contactWhatsapp")}
                  </a>
                </div>
              </div>
            );
          })
        )}
        {!loading && orders.length === 0 && (
          <div className="glass-card p-10 text-center text-white/60">
            {t("adminOrdersPage.empty")}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

