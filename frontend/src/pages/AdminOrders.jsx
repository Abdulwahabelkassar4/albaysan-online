import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";
import {
  WhatsAppIcon,
  SearchIcon,
  FilterIcon,
  ClipboardIcon,
  CloseIcon,
  SparkleIcon,
  TruckIcon,
  CalendarIcon,
  MapPinIcon,
  EyeIcon,
} from "../components/icons.jsx";
import { normalizeJordanPhoneForWhatsApp } from "../config/contact.js";

const statusOptions = [
  { value: "pending", label: "قيد الانتظار", bg: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { value: "confirmed", label: "جاري التجهيز", bg: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { value: "completed", label: "مكتمل", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { value: "cancelled", label: "ملغي", bg: "bg-red-500/20 text-red-300 border-red-500/30" },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    completedOrders: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const locale = isRTL ? "ar-JO" : "en-US";

  const loadOrders = async (targetPage = pagination.page, targetLimit = pagination.limit) => {
    setLoading(true);
    try {
      const [{ data: ordersRes }, { data: statsRes }] = await Promise.all([
        axiosClient.get("/api/orders", {
          params: {
            page: targetPage,
            limit: targetLimit,
            type: filters.type || undefined,
            status: filters.status || undefined,
            search: filters.search || undefined,
          },
        }),
        axiosClient.get("/api/orders/stats"),
      ]);

      const data = ordersRes?.data || (Array.isArray(ordersRes) ? ordersRes : []);
      setOrders(data);

      if (ordersRes?.pagination) {
        setPagination({
          page: ordersRes.pagination.page || targetPage,
          limit: targetLimit,
          total: ordersRes.pagination.total || data.length,
          pages: ordersRes.pagination.pages || Math.ceil((ordersRes.pagination.total || data.length) / targetLimit) || 1,
        });
      } else {
        setPagination((prev) => ({ ...prev, page: targetPage, limit: targetLimit, total: data.length, pages: 1 }));
      }

      if (statsRes) {
        setStats(statsRes);
      }
    } catch (error) {
      showToast("تعذر تحميل الطلبات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(1, pagination.limit);
  }, [filters]);

  const updateStatus = async (orderId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await axiosClient.put(`/api/orders/${orderId}/status`, { status: newStatus });
      showToast("تم تحديث حالة الطلب بنجاح", "success");
      setOrders((prev) =>
        prev.map((ord) => ((ord._id || ord.id) === orderId ? { ...ord, status: newStatus } : ord))
      );
      if (selectedOrder && (selectedOrder._id || selectedOrder.id) === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      showToast("تعذر تحديث حالة الطلب", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const sendReviewRequestWhatsApp = async (order) => {
    try {
      const orderId = order._id || order.id;
      const res = await axiosClient.post(`/api/reviews/admin/generate-token/${orderId}`);
      const token = res.data.token;
      const origin = window.location.origin;
      const reviewUrl = `${origin}/r/${token}`;
      const phoneBase = normalizeJordanPhoneForWhatsApp(order.phone);
      const msg = `مرحباً ${order.customerName}! 🌸\nيسعدنا أن طلبك من متجر البيلسان وصلك بالسلامة.\nرأيك يهمنا ويسعدنا جداً! يمكنك مشاركة تجربتك وتقييمك عبر رابطك الخاص خلال دقيقة واحدة:\n${reviewUrl}`;
      window.open(`https://wa.me/${phoneBase}?text=${encodeURIComponent(msg)}`, "_blank");
      showToast("تم إنشاء رابط التقييم وفتح محادثة الواتساب", "success");
      setOrders((prev) =>
        prev.map((ord) => ((ord._id || ord.id) === orderId ? { ...ord, reviewToken: token } : ord))
      );
    } catch (err) {
      showToast("تعذر إنشاء رابط التقييم", "error");
    }
  };

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
      ord.type === "delivery" ? "توصيل" : "استلام من المتجر",
      statusOptions.find((s) => s.value === ord.status)?.label || ord.status,
      `"${ord.address || ""}"`,
      ord.total || 0,
      new Date(ord.createdAt).toLocaleDateString("ar-JO"),
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatOrderTotal = (order) => {
    if (order.total !== undefined && order.total !== null) return Number(order.total);
    if (!order.items || order.items.length === 0) return 0;
    return order.items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  };

  // Filter counters using database-wide stats
  const counts = useMemo(() => {
    return {
      all: stats.totalOrders || pagination.total || orders.length,
      pending: stats.pendingOrders || 0,
      confirmed: stats.confirmedOrders || 0,
      completed: stats.completedOrders || 0,
    };
  }, [stats, pagination.total, orders.length]);

  return (
    <div className="mx-auto max-w-7xl px-2.5 sm:px-4 md:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* ─── Top Header & Actions ─── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5">
            <ClipboardIcon className="h-7 w-7 text-primary-400" />
            <span>إدارة الطلبات والحجوزات</span>
          </h1>
          <p className="text-xs md:text-sm text-white/60 mt-1">
            إجمالي {pagination.total || stats.totalOrders || orders.length} طلب مسجل • متابعة الحالات وتحديث الطلبات
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/90 hover:bg-white/10 transition"
          >
            <span>📥 تصدير CSV</span>
          </button>
          <button
            onClick={() => loadOrders(pagination.page, pagination.limit)}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary-950/40 hover:bg-primary-500 transition"
          >
            <span>تحديث القائمة ⟳</span>
          </button>
        </div>
      </div>

      {/* ─── Filter Status Pills & Search Bar ─── */}
      <div className="rounded-3xl border border-white/10 bg-neutral-900/80 p-4 shadow-xl backdrop-blur-xl space-y-3">
        {/* Status Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-white/10">
          <button
            onClick={() => setFilters((p) => ({ ...p, status: "" }))}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filters.status === ""
                ? "bg-white text-neutral-950 shadow-md"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            الكل ({counts.all})
          </button>

          {statusOptions.map((st) => {
            const isSelected = filters.status === st.value;
            const countValue =
              st.value === "pending"
                ? counts.pending
                : st.value === "confirmed"
                ? counts.confirmed
                : st.value === "completed"
                ? counts.completed
                : null;

            return (
              <button
                key={st.value}
                onClick={() => setFilters((p) => ({ ...p, status: isSelected ? "" : st.value }))}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition flex items-center gap-1.5 ${
                  isSelected
                    ? `${st.bg} ring-2 ring-white/30`
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                <span>{st.label}</span>
                {countValue !== null && (
                  <span className="text-[10px] opacity-80">({countValue})</span>
                )}
              </button>
            );
          })}

          {/* Type Filter */}
          <div className="ms-auto flex items-center gap-1.5">
            <button
              onClick={() => setFilters((p) => ({ ...p, type: p.type === "delivery" ? "" : "delivery" }))}
              className={`rounded-xl px-2.5 py-1 text-xs font-semibold border transition ${
                filters.type === "delivery"
                  ? "bg-primary-600 text-white border-primary-500"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              🚚 توصيل
            </button>
            <button
              onClick={() => setFilters((p) => ({ ...p, type: p.type === "reservation" ? "" : "reservation" }))}
              className={`rounded-xl px-2.5 py-1 text-xs font-semibold border transition ${
                filters.type === "reservation"
                  ? "bg-primary-600 text-white border-primary-500"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              🛍️ استلام
            </button>
          </div>
        </div>

        {/* Search Input Field */}
        <div className="relative">
          <SearchIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="search"
            placeholder="بحث فوري باسم الزبون، رقم الهاتف، أو العنوان..."
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-neutral-950/60 pr-10 pl-4 py-2.5 text-xs text-white placeholder-white/40 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* ─── Orders Data Table (Desktop) & Card Stack (Mobile) ─── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-3xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-neutral-900/50 p-12 text-center text-white/60">
          <ClipboardIcon className="h-12 w-12 mx-auto text-white/20 mb-3" />
          <p className="text-base font-bold text-white">لا توجد طلبات مطابقة للبحث أو الفلتر المحدد</p>
          <p className="text-xs text-white/40 mt-1">جرّب مسح الفلاتر أو تغيير معايير البحث.</p>
        </div>
      ) : (
        <>
          {/* DESKTOP HIGH-DENSITY TABLE (hidden on mobile) */}
          <div className="hidden lg:block overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/80 shadow-2xl backdrop-blur-xl">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-white/10 bg-white/5 text-white/60 font-semibold uppercase">
                <tr>
                  <th className="px-5 py-4">الزبون والهاتف</th>
                  <th className="px-4 py-4">نوع الطلب</th>
                  <th className="px-4 py-4">المنتجات</th>
                  <th className="px-4 py-4">المجموع</th>
                  <th className="px-4 py-4">حالة الطلب</th>
                  <th className="px-4 py-4">تاريخ الطلب</th>
                  <th className="px-5 py-4 text-center">إجراءات سريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {orders.map((order) => {
                  const orderId = order._id || order.id;
                  const phoneBase = normalizeJordanPhoneForWhatsApp(order.phone);
                  const total = formatOrderTotal(order);
                  const currentStatus = statusOptions.find((s) => s.value === order.status) || statusOptions[0];

                  return (
                    <tr
                      key={orderId}
                      className="hover:bg-white/5 transition cursor-pointer group"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Customer info */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-sm group-hover:text-primary-300 transition">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-white/60 font-mono mt-0.5">{order.phone}</div>
                      </td>

                      {/* Type & Location */}
                      <td className="px-4 py-4">
                        {order.type === "delivery" ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-[11px] font-semibold text-blue-300">
                            🚚 توصيل
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-[11px] font-semibold text-purple-300">
                            🛍️ استلام
                          </span>
                        )}
                        <p className="text-[10px] text-white/50 truncate max-w-[150px] mt-1">
                          {order.address || "استلام من المتجر"}
                        </p>
                      </td>

                      {/* Items Preview */}
                      <td className="px-4 py-4">
                        <span className="font-bold text-white">{order.items?.length || 0} عناصر</span>
                        <p className="text-[11px] text-white/50 truncate max-w-[180px]">
                          {order.items?.map((it) => it.name).join(", ")}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-4 font-black text-emerald-400 text-sm">
                        {total.toFixed(2)} <span className="text-[10px] font-normal text-white/60">د.أ</span>
                      </td>

                      {/* Status Dropdown Pill */}
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          disabled={isUpdatingStatus}
                          onChange={(e) => updateStatus(orderId, e.target.value)}
                          className={`rounded-xl px-2.5 py-1 text-xs font-bold border bg-neutral-900 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-400 ${currentStatus.bg}`}
                        >
                          {statusOptions.map((st) => (
                            <option key={st.value} value={st.value} className="bg-neutral-900 text-white font-medium">
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-[11px] text-white/50">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString(locale) : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          {phoneBase && (
                            <a
                              href={`https://wa.me/${phoneBase}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2 text-emerald-400 hover:bg-emerald-500/20 transition"
                              title="تواصل واتساب"
                            >
                              <WhatsAppIcon className="h-4 w-4" />
                            </a>
                          )}

                          <button
                            onClick={() => sendReviewRequestWhatsApp(order)}
                            className={`rounded-xl border p-2 text-xs font-semibold transition ${
                              order.hasReviewed
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                : "bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20"
                            }`}
                            title="إرسال رابط التقييم"
                          >
                            <SparkleIcon className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition"
                          >
                            عرض
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE RESPONSIVE CARD STACK (< lg) */}
          <div className="lg:hidden space-y-2.5">
            {orders.map((order) => {
              const orderId = order._id || order.id;
              const phoneBase = normalizeJordanPhoneForWhatsApp(order.phone);
              const total = formatOrderTotal(order);
              const currentStatus = statusOptions.find((s) => s.value === order.status) || statusOptions[0];

              return (
                <div
                  key={orderId}
                  className="rounded-2xl border border-white/10 bg-neutral-900/90 p-3.5 shadow-xl backdrop-blur-xl space-y-2.5"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-black text-white truncate max-w-[150px]">{order.customerName}</span>
                        {order.type === "delivery" ? (
                          <span className="rounded bg-blue-500/20 text-blue-300 text-[9px] font-bold px-1.5 py-0.5">
                            توصيل
                          </span>
                        ) : (
                          <span className="rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold px-1.5 py-0.5">
                            استلام
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/60 font-mono mt-0.5">{order.phone}</p>
                    </div>

                    <span className="text-base font-black text-emerald-400 shrink-0">
                      {total.toFixed(2)} <span className="text-[10px] font-normal text-white/60">د.أ</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-white/60 pt-1.5 border-t border-white/10">
                    <span className="truncate max-w-[160px]">{order.address || "استلام من المتجر"}</span>
                    <span className="text-[10px]">{order.createdAt ? new Date(order.createdAt).toLocaleDateString(locale) : ""}</span>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-1.5" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      disabled={isUpdatingStatus}
                      onChange={(e) => updateStatus(orderId, e.target.value)}
                      className={`flex-1 rounded-xl px-2 py-1.5 text-xs font-bold border bg-neutral-900 ${currentStatus.bg}`}
                    >
                      {statusOptions.map((st) => (
                        <option key={st.value} value={st.value} className="bg-neutral-900 text-white font-medium">
                          {st.label}
                        </option>
                      ))}
                    </select>

                    {phoneBase && (
                      <a
                        href={`https://wa.me/${phoneBase}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 p-2 text-emerald-400 hover:bg-emerald-500/30 shrink-0"
                        title="محادثة واتساب"
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                      </a>
                    )}

                    <button
                      onClick={() => sendReviewRequestWhatsApp(order)}
                      className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-2 text-purple-300 hover:bg-purple-500/20 shrink-0"
                      title="إرسال رابط التقييم"
                    >
                      <SparkleIcon className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="rounded-xl bg-white/10 border border-white/15 p-2 text-white hover:bg-white/20 shrink-0"
                      title="عرض كامل التفاصيل"
                      aria-label="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── PAGINATION CONTROLS ─── */}
          {pagination.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur-xl text-xs text-white/70">
              <div className="flex items-center gap-2">
                <span>
                  عرض{" "}
                  <strong className="text-white">
                    {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
                  </strong>{" "}
                  -{" "}
                  <strong className="text-white">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </strong>{" "}
                  من أصل <strong className="text-primary-400">{pagination.total}</strong> طلب
                </span>

                {/* Per-page selector */}
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    loadOrders(1, newLimit);
                  }}
                  aria-label="عدد الطلبات لكل صفحة"
                  className="rounded-lg border border-white/10 bg-neutral-950 px-2 py-1 text-xs text-white focus:outline-none focus:border-primary-500"
                >
                  <option value={20}>20 / صفحة</option>
                  <option value={50}>50 / صفحة</option>
                  <option value={100}>100 / صفحة</option>
                </select>
              </div>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => loadOrders(pagination.page - 1, pagination.limit)}
                  className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition"
                >
                  ◀ السابق
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - pagination.page) <= 1)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && p - prev > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="px-1 text-white/40">...</span>}
                        <button
                          onClick={() => loadOrders(p, pagination.limit)}
                          className={`min-w-[32px] h-8 rounded-xl font-bold transition ${
                            pagination.page === p
                              ? "bg-primary-600 text-white shadow-lg shadow-primary-950/40"
                              : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => loadOrders(pagination.page + 1, pagination.limit)}
                  className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition"
                >
                  التالي ▶
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── SLIDE-OVER INSPECTION DRAWER ─── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          <div
            className={`relative z-10 w-full max-w-lg bg-neutral-900 border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl h-full overflow-y-auto ${
              isRTL ? "border-r border-l-0" : ""
            }`}
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] text-white/50 uppercase font-mono">
                    ID: {selectedOrder._id || selectedOrder.id}
                  </span>
                  <h2 className="text-xl font-black text-white mt-0.5">تفاصيل الطلب الكاملة</h2>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl p-2 text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Status Selector in Drawer */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
                <label className="text-xs font-bold text-white/70 block">تحديث حالة الطلب:</label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((st) => (
                    <button
                      key={st.value}
                      onClick={() => updateStatus(selectedOrder._id || selectedOrder.id, st.value)}
                      className={`rounded-xl py-2 px-3 text-xs font-bold border transition ${
                        selectedOrder.status === st.value
                          ? `${st.bg} ring-2 ring-white/30`
                          : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Info Card */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">بيانات الزبونة والتوصيل</h3>
                <div className="space-y-1.5 text-xs text-white/80">
                  <p className="text-sm font-bold text-white">👤 {selectedOrder.customerName}</p>
                  <p className="flex items-center gap-2">
                    📞 <span className="font-mono text-primary-300">{selectedOrder.phone}</span>
                  </p>
                  <p>
                    📍 {selectedOrder.type === "delivery" ? `العنوان: ${selectedOrder.address}` : "استلام من المتجر"}
                  </p>
                  {(selectedOrder.height || selectedOrder.weight) && (
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-4 text-xs font-semibold text-secondary-300">
                      {selectedOrder.height && <span>📏 الطول: {selectedOrder.height} سم</span>}
                      {selectedOrder.weight && <span>⚖️ الوزن: {selectedOrder.weight} كغم</span>}
                    </div>
                  )}
                </div>

                {/* Quick WhatsApp Action */}
                {selectedOrder.phone && (
                  <a
                    href={`https://wa.me/${normalizeJordanPhoneForWhatsApp(selectedOrder.phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    محادثة واتساب مباشرة
                  </a>
                )}
              </div>

              {/* Items List Card */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">
                  المنتجات المطلوبة ({selectedOrder.items?.length || 0})
                </h3>

                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="rounded-xl bg-black/20 p-3 space-y-1.5 border border-white/5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-sm text-white">
                          {item.name} × {item.qty}
                        </span>
                        <span className="font-bold text-emerald-400 text-xs">
                          {((item.price || 0) * (item.qty || 1)).toFixed(2)} د.أ
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px] text-white/60">
                        {item.size && <span className="rounded bg-white/10 px-2 py-0.5">مقاس: {item.size}</span>}
                        {item.color && <span className="rounded bg-white/10 px-2 py-0.5">لون: {item.color}</span>}
                      </div>

                      {/* Config Snapshot Options Tree */}
                      {item.configSnapshot && item.configSnapshot.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/10 space-y-1 text-[11px]">
                          <span className="text-[10px] text-primary-300 font-bold block">خيارات التهيئة والتفصيل:</span>
                          {item.configSnapshot.map((conf, cIdx) => (
                            <div key={cIdx} className="flex items-center justify-between text-white/70">
                              <span>
                                ↳ {conf.pieceName ? `${conf.pieceName}: ` : ""}{conf.optionName}:{" "}
                                <strong className="text-white">{conf.selectedValue}</strong>
                              </span>
                              {conf.priceAdjustment > 0 && (
                                <span className="text-emerald-400 font-mono">+{conf.priceAdjustment} د.أ</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Notes / Raw message if exists */}
              {selectedOrder.notes && (
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
                  <h3 className="text-xs font-bold text-white/50 uppercase">ملخص وتفاصيل الزبونة المرفقة:</h3>
                  <pre className="text-xs text-white/70 whitespace-pre-wrap font-sans bg-black/30 p-3 rounded-xl">
                    {selectedOrder.notes}
                  </pre>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-6 border-t border-white/10 flex items-center gap-3">
              <button
                onClick={() => sendReviewRequestWhatsApp(selectedOrder)}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-xs font-bold text-white shadow-lg shadow-purple-950/50 hover:scale-[1.02] transition"
              >
                <SparkleIcon className="h-4 w-4" />
                إرسال رابط التقييم ⭐
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold text-white/80 hover:bg-white/10"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
