import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";
import { normalizeJordanPhoneForWhatsApp } from "../config/contact.js";
import logoImg from "../assets/logo.jpg";
import { CloseIcon } from "../components/icons.jsx";

const statusOptions = [
  { value: "pending", labelKey: "adminOrdersPage.statuses.pending" },
  { value: "confirmed", labelKey: "adminOrdersPage.statuses.confirmed" },
  { value: "delivered", labelKey: "adminOrdersPage.statuses.delivered" },
  { value: "picked_up", labelKey: "adminOrdersPage.statuses.picked_up" },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ type: "", status: "", search: "" });
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

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
      const res = await axiosClient.get("/api/orders", {
        params: {
          type: filters.type || undefined,
          status: filters.status || undefined,
          search: filters.search || undefined,
        },
      });
      const data = res.data?.data || (Array.isArray(res.data) ? res.data : []);
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
    const base = normalizeJordanPhoneForWhatsApp(phone);
    const message = getWhatsappMessage(type);
    return `https://wa.me/${base}?text=${encodeURIComponent(message)}`;
  };

  // CSV Export
  const exportToCSV = () => {
    if (!orders.length) {
      showToast("لا توجد طلبات للتصدير", "error");
      return;
    }

    const headers = ["ID", "الاسم", "رقم الهاتف", "النوع", "الحالة", "العنوان/التاريخ", "المجموع (د.أ)", "تاريخ الطلب"];
    const rows = orders.map((ord) => [
      ord._id || ord.id,
      `"${ord.customerName || ""}"`,
      `"${ord.phone || ""}"`,
      ord.type,
      statusLabelMap[ord.status] || ord.status,
      `"${ord.address || ord.pickupDate || ""}"`,
      formatOrderTotal(ord).toFixed(2),
      formatDate(ord.createdAt),
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `albaysan_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("تم تصدير ملف CSV بنجاح", "success");
  };

  // Print Invoice Modal Action
  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <div className={`mb-6 flex items-center justify-between`}>
        <button
          onClick={exportToCSV}
          className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-900/50 transition"
        >
          📥 تصدير الطلبات إلى CSV
        </button>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          {isRTL ? `${t("adminOrdersPage.backToDashboard")} →` : `← ${t("adminOrdersPage.backToDashboard")}`}
        </Link>
      </div>

      {/* Header & Filter Controls */}
      <div
        className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        <h1 className="text-3xl font-bold text-white">{t("adminOrdersPage.title")}</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="بحث باسم الزبون أو الهاتف..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="rounded-full border border-white/20 bg-neutral-800 px-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          <select
            value={filters.type}
            onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
            className="rounded-full border border-white/20 bg-neutral-800 px-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{t("adminOrdersPage.filters.allTypes")}</option>
            <option value="delivery">{t("adminOrdersPage.filters.typeDelivery")}</option>
            <option value="reservation">{t("adminOrdersPage.filters.typeReservation")}</option>
          </select>

          <select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            className="rounded-full border border-white/20 bg-neutral-800 px-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{t("adminOrdersPage.filters.allStatuses")}</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {t(status.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Cards List */}
      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="glass-card h-32 animate-pulse bg-white/5 rounded-3xl" />
        ) : (
          orders.map((order) => {
            const statusLabel = statusLabelMap[order.status] || order.status;
            const total = formatOrderTotal(order);

            return (
              <div
                key={order._id || order.id}
                className={`glass-card flex flex-col gap-4 p-6 rounded-3xl border border-white/10 bg-neutral-900/80 backdrop-blur-xl ${
                  isRTL ? "text-right" : "text-left"
                } md:flex-row md:items-center md:justify-between`}
              >
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                    <span className="rounded-full bg-primary-500/20 border border-primary-500/30 px-3 py-1 font-semibold text-primary-300">
                      {getOrderTypeLabel(order.type)}
                    </span>
                    <span className="font-medium text-white/80">
                      {t("adminOrdersPage.cards.status")}: {statusLabel}
                    </span>
                    <span>
                      {t("adminOrdersPage.cards.date")}: {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{order.customerName}</h3>
                  <p className="text-sm text-white/70">
                    📱 {t("adminOrdersPage.cards.phone")}: <span className="text-white font-mono">{order.phone}</span>
                  </p>
                  
                  {order.type === "delivery" && order.address && (
                    <p className="text-sm text-white/70">
                      📍 {t("adminOrdersPage.cards.address")}: <span className="text-white">{order.address}</span>
                    </p>
                  )}
                  {order.type === "reservation" && order.pickupDate && (
                    <p className="text-sm text-white/70">
                      📅 {t("adminOrdersPage.cards.pickupDate")}: <span className="text-white">{formatDate(order.pickupDate)}</span>
                    </p>
                  )}

                  {(order.height || order.weight) && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {order.height && (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-purple-400/30 bg-purple-950/40 px-2.5 py-1 text-xs text-purple-200">
                          📏 {t("adminOrdersPage.cards.height")}: {order.height} سم
                        </span>
                      )}
                      {order.weight && (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-purple-400/30 bg-purple-950/40 px-2.5 py-1 text-xs text-purple-200">
                          ⚖️ {t("adminOrdersPage.cards.weight")}: {order.weight} كغم
                        </span>
                      )}
                    </div>
                  )}

                  {order.items && order.items.length > 0 && (
                    <div className="mt-3 rounded-2xl bg-black/40 p-3 space-y-2 text-xs text-white/80 border border-white/5">
                      <p className="font-semibold text-primary-300 mb-1">{t("adminOrdersPage.cards.items")}</p>
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-10 w-10 rounded-xl object-cover border border-white/10 shrink-0" />
                            ) : (
                              <div className="h-10 w-10 rounded-xl bg-neutral-800 flex items-center justify-center text-[9px] text-white/40 shrink-0">بدون صورة</div>
                            )}
                            <span className="truncate">• {item.name || "منتج"} ({item.size || "وسيط"} - {item.color || "افتراضي"}) × {item.qty || 1}</span>
                          </div>
                          <span className="font-mono text-emerald-300 shrink-0">{((item.price || 0) * (item.qty || 1)).toFixed(2)} د.أ</span>
                        </div>
                      ))}
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-[11px] text-amber-300 pt-1 font-medium">
                          <span>خصم الكود ({order.promoCode || "عرض"}):</span>
                          <span>-{order.discountAmount.toFixed(2)} د.أ</span>
                        </div>
                      )}
                      {order.deliveryFee > 0 && (
                        <div className="flex justify-between text-[11px] text-white/60 pt-1">
                          <span>رسوم التوصيل:</span>
                          <span>{order.deliveryFee.toFixed(2)} د.أ</span>
                        </div>
                      )}
                      <div className="pt-2 mt-2 border-t border-white/10 flex justify-between font-bold text-sm text-white">
                        <span>المجموع الإجمالي:</span>
                        <span className="text-emerald-400">{(order.totalPrice || total).toFixed(2)} د.أ</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Panel */}
                <div className="flex flex-col gap-2.5 shrink-0">
                  <select
                    value={order.status}
                    onChange={(event) => updateStatus(order._id || order.id, event.target.value)}
                    className="rounded-full border border-white/20 bg-neutral-800 px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {t(status.labelKey)}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setSelectedInvoiceOrder(order)}
                    className="rounded-full border border-primary-500/50 bg-primary-950/40 px-4 py-2 text-xs font-bold text-primary-300 hover:bg-primary-900/50 transition"
                  >
                    🖨️ طباعة الفاتورة
                  </button>

                  <a
                    href={whatsappLink(order.phone, order.type)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary px-4 py-2 text-xs text-center flex items-center justify-center gap-1"
                  >
                    💬 {t("adminOrdersPage.cards.contactWhatsapp")}
                  </a>
                </div>
              </div>
            );
          })
        )}

        {!loading && orders.length === 0 && (
          <div className="glass-card p-12 text-center text-white/60 rounded-3xl border border-white/10">
            {t("adminOrdersPage.empty")}
          </div>
        )}
      </div>

      {/* Printable Invoice Modal */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-8 text-neutral-900 shadow-2xl print:m-0 print:p-0 print:shadow-none">
            {/* Modal Controls */}
            <div className="flex justify-between items-center mb-6 print:hidden">
              <h2 className="text-lg font-bold text-neutral-800">معاينة الفاتورة</h2>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="rounded-full bg-neutral-100 p-2 text-neutral-600 hover:bg-neutral-200"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Invoice Card */}
            <div id="printable-invoice" className="space-y-6 text-right">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <div className="flex items-center gap-3">
                  <img src={logoImg} alt="البيلسان" className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <h3 className="text-xl font-extrabold text-neutral-900">متجر البيلسان أونلاين</h3>
                    <p className="text-xs text-neutral-500">للألبسة والسبورات الشرعية</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-primary-700">فاتورة طلب #{selectedInvoiceOrder._id?.slice(-6)}</p>
                  <p className="text-xs text-neutral-500">{formatDate(selectedInvoiceOrder.createdAt)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="rounded-2xl bg-neutral-50 p-4 space-y-1 text-xs text-neutral-700">
                <p><strong>اسم العميل:</strong> {selectedInvoiceOrder.customerName}</p>
                <p><strong>الهاتف:</strong> {selectedInvoiceOrder.phone}</p>
                {selectedInvoiceOrder.address && <p><strong>العنوان:</strong> {selectedInvoiceOrder.address}</p>}
                {(selectedInvoiceOrder.height || selectedInvoiceOrder.weight) && (
                  <p><strong>المقاسات الشخصية:</strong> الطول {selectedInvoiceOrder.height || "-"} سم / الوزن {selectedInvoiceOrder.weight || "-"} كغم</p>
                )}
              </div>

              {/* Items Table */}
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-neutral-300 text-neutral-600 font-bold">
                    <th className="py-2">المنتج</th>
                    <th className="py-2 text-center">المقاس / اللون</th>
                    <th className="py-2 text-center">الكمية</th>
                    <th className="py-2 text-left">السعر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {(selectedInvoiceOrder.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-medium flex items-center gap-2">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-9 w-9 rounded-lg object-cover border border-neutral-200 shrink-0" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center text-[9px] text-neutral-400 shrink-0">بدون صورة</div>
                        )}
                        <span>{item.name || "منتج"}</span>
                      </td>
                      <td className="py-2 text-center">{item.size || "-"} / {item.color || "-"}</td>
                      <td className="py-2 text-center">{item.qty || 1}</td>
                      <td className="py-2 text-left font-mono">{((item.price || 0) * (item.qty || 1)).toFixed(2)} د.أ</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Invoice Footer Total */}
              <div className="space-y-1 border-t-2 border-neutral-900 pt-3 text-xs text-neutral-800">
                {selectedInvoiceOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-amber-700 font-semibold">
                    <span>خصم الكود ({selectedInvoiceOrder.promoCode || "عرض"}):</span>
                    <span className="font-mono">-{selectedInvoiceOrder.discountAmount.toFixed(2)} د.أ</span>
                  </div>
                )}
                {selectedInvoiceOrder.deliveryFee > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>رسوم التوصيل:</span>
                    <span className="font-mono">{selectedInvoiceOrder.deliveryFee.toFixed(2)} د.أ</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold text-neutral-900 pt-1">
                  <span>المجموع النهائي:</span>
                  <span className="text-lg text-primary-700 font-mono">
                    {(selectedInvoiceOrder.totalPrice || formatOrderTotal(selectedInvoiceOrder)).toFixed(2)} د.أ
                  </span>
                </div>
              </div>

              <div className="text-center pt-4 text-[11px] text-neutral-500 border-t border-neutral-200">
                شكراً لتسوقكم من البيلسان أونلاين! ❤️
              </div>
            </div>

            {/* Print Action Button */}
            <div className="mt-6 flex justify-end gap-3 print:hidden">
              <button
                onClick={handlePrintInvoice}
                className="w-full rounded-2xl bg-neutral-900 py-3 text-sm font-bold text-white hover:bg-neutral-800 transition"
              >
                🖨️ طباعة الفاتورة الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
