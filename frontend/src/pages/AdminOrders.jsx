import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";

const statuses = [
  { value: "pending", label: "قيد المتابعة" },
  { value: "confirmed", label: "تم التأكيد" },
  { value: "delivered", label: "تم التوصيل" },
  { value: "picked_up", label: "تم الاستلام" },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ type: "", status: "" });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

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
      showToast("تعذر تحميل الطلبات", "error");
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
      showToast("تم تحديث الحالة", "success");
      loadOrders();
    } catch (error) {
      showToast("تعذر تحديث الحالة", "error");
    }
  };

  const whatsappLink = (phone, type) => {
    const base = phone.startsWith("0") ? `962${phone.slice(1)}` : phone;
    const message =
      type === "delivery"
        ? "السلام عليكم، نود تأكيد طلب التوصيل من البيلسان أونلاين."
        : "السلام عليكم، نود تأكيد حجزك من البيلسان أونلاين.";
    return `https://wa.me/${base}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-white">إدارة الطلبات والحجوزات</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <select
            value={filters.type}
            onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
            className="px-4 py-2 text-sm"
          >
            <option value="">كل الأنواع</option>
            <option value="delivery">توصيل</option>
            <option value="reservation">حجز</option>
          </select>
          <select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            className="px-4 py-2 text-sm"
          >
            <option value="">كل الحالات</option>
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-10 space-y-4">
        {loading ? (
          <div className="glass-card h-32 animate-pulse bg-white/5" />
        ) : (
          orders.map((order) => (
            <div key={order._id} className="glass-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                    {order.type === "delivery" ? "توصيل" : "حجز"}
                  </span>
                  <span>الحالة: {statuses.find((s) => s.value === order.status)?.label || order.status}</span>
                  <span>التاريخ: {new Date(order.createdAt).toLocaleDateString("ar-JO")}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{order.customerName}</h3>
                <p className="text-sm text-white/70">هاتف: {order.phone}</p>
                {order.type === "delivery" && (
                  <p className="mt-2 text-sm text-white/70">العنوان: {order.address}</p>
                )}
                {order.type === "reservation" && order.pickupDate && (
                  <p className="mt-2 text-sm text-white/70">
                    موعد الاستلام: {new Date(order.pickupDate).toLocaleDateString("ar-JO")}
                  </p>
                )}
                {order.notes && <p className="mt-2 text-sm text-white/60">ملاحظات: {order.notes}</p>}
                {order.items && order.items.length > 0 && (
                  <div className="mt-3 space-y-2 text-xs text-white/75">
                    {order.items.map((item, index) => (
                      <p key={`${order._id}-item-${index}`}>
                        {item.name || "منتج"} - مقاس {item.size || "حر"} - لون {item.color || "غير محدد"} -
                        {(item.price || 0).toFixed(2)} د.أ × {item.qty || 1}
                      </p>
                    ))}
                    <p className="text-sm font-semibold text-secondary-200">
                      الإجمالي: {formatOrderTotal(order).toFixed(2)} د.أ
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start gap-3 text-sm md:items-end">
                <select
                  value={order.status}
                  onChange={(event) => updateStatus(order._id, event.target.value)}
                  className="px-4 py-2 text-sm"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <a
                  href={whatsappLink(order.phone, order.type)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary px-4 py-2 text-xs"
                >
                  تواصل عبر واتساب
                </a>
              </div>
            </div>
          ))
        )}
        {!loading && orders.length === 0 && (
          <div className="glass-card p-10 text-center text-white/60">لا توجد طلبات حالياً.</div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

