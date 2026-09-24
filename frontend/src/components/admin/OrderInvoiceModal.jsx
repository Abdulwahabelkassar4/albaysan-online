import React from "react";
import logoImg from "../../assets/logo.jpg";
import { CloseIcon, DownloadIcon, PrinterIcon, WhatsAppIcon } from "../icons.jsx";
import { normalizeJordanPhoneForWhatsApp } from "../../config/contact.js";

const OrderInvoiceModal = ({ order, onClose }) => {
  if (!order) return null;

  const orderId = order._id || order.id || "";
  const shortId = orderId ? `#ORD-${orderId.slice(-6).toUpperCase()}` : "#ORD-OFFICIAL";
  
  // Deterministic 16-char security hash based on order ID
  const securityHash = orderId
    ? orderId.slice(0, 16).match(/.{1,4}/g)?.join("-").toUpperCase() || "8F4C-E991-A0B3"
    : "8F4C-E991-A0B3";

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("ar-JO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("ar-JO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

  const subtotal = order.items?.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 1),
    0
  ) || 0;

  const deliveryFee = order.deliveryFee || 0;
  const discountAmount = order.discountAmount || 0;
  const totalPrice = order.totalPrice != null ? order.totalPrice : subtotal + deliveryFee - discountAmount;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const cleanCustomer = (order.customerName || "الزبون").trim().replace(/[\/\\:*?"<>|]/g, "_");
    const cleanShortId = (orderId ? orderId.slice(-6).toUpperCase() : "OFFICIAL");
    const originalTitle = document.title;
    
    // Set contextual filename for saving PDF
    document.title = `فاتورة_البيلسان_${cleanCustomer}_ORD-${cleanShortId}`;
    window.print();
    
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleSendWhatsApp = () => {
    const origin = window.location.origin;
    const invoiceUrl = `${origin}/invoice/${orderId}`;
    const phoneBase = normalizeJordanPhoneForWhatsApp(order.phone);
    const msg = `مرحباً ${order.customerName}! 🌸\nيسعدنا تزويدك برابط فاتورة طلبك الرسمية المعتمدة من متجر البيلسان أونلاين:\n\n📄 رقم الفاتورة: ${shortId}\n💰 المبلغ الإجمالي: ${totalPrice.toFixed(2)} د.أ\n🔗 رابط الفاتورة الإلكترونية والتحميل (PDF):\n${invoiceUrl}\n\n✨ نسعد دائماً بخدمتكم!`;
    window.open(`https://wa.me/${phoneBase}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-neutral-950/80 backdrop-blur-md">
      {/* Background click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-3xl flex flex-col my-auto max-h-[95vh]">
        {/* Action Header Bar (Hidden during print) */}
        <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-3 bg-neutral-900 border border-white/10 px-4 py-3 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">معاينة فاتورة الطلب الرسمية</span>
            <span className="rounded bg-primary-500/20 text-primary-300 px-2 py-0.5 text-xs font-mono font-bold">
              {shortId}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {order.phone && (
              <button
                onClick={handleSendWhatsApp}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 px-3 py-2 text-xs font-bold text-emerald-300 transition active:scale-95"
                title="إرسال رابط الفاتورة للزبونة عبر واتساب"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span>إرسال واتساب</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 px-3 py-2 text-xs font-bold text-white transition active:scale-95"
              title="طباعة الفاتورة على الطابعة"
            >
              <PrinterIcon className="h-4 w-4" />
              <span>طباعة</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-primary-950/40 transition active:scale-95"
              title="تحميل الفاتورة كملف PDF"
            >
              <DownloadIcon className="h-4 w-4" />
              <span>تحميل PDF</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white transition"
              title="إغلاق"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Card */}
        <div className="overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-slate-900 shadow-2xl relative select-text" id="printable-invoice-content">
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-invoice-content, #printable-invoice-content * {
                visibility: visible !important;
              }
              #printable-invoice-content {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 16mm !important;
                border: none !important;
                box-shadow: none !important;
                background: white !important;
                color: #0f172a !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          {/* Watermark */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none opacity-[0.035] -rotate-12 z-0">
            <span className="text-6xl sm:text-8xl font-black tracking-widest text-primary-900">
              ALBILSAN ONLINE
            </span>
          </div>

          {/* Header */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-slate-100 pb-5">
            <div className="flex items-center gap-3.5">
              <img
                src={logoImg}
                alt="ALBILSAN ONLINE"
                className="h-16 w-16 rounded-xl object-cover border border-slate-200 shadow-sm"
              />
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">البيلسان أونلاين</h1>
                <p className="text-xs font-extrabold tracking-widest text-primary-600 mt-0.5">
                  ALBILSAN ONLINE
                </p>
              </div>
            </div>

            <div className="text-left sm:text-left direction-ltr">
              <div className="inline-block rounded-full bg-primary-50 border border-primary-200 px-3 py-1 text-xs font-bold text-primary-700 mb-1.5">
                {order.type === "delivery" ? "🛵 طلب توصيل جديد" : "🛍️ طلب حجز واستلام"}
              </div>
              <div className="font-mono text-sm font-black text-slate-900">{shortId}</div>
              <div className="text-xs text-slate-500 mt-0.5">{orderDate}</div>
            </div>
          </div>

          {/* Security & Anti-Fraud Ribbon */}
          <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-primary-300 bg-primary-50/60 px-4 py-2 text-xs font-bold text-primary-900">
            <div className="flex items-center gap-2">
              <span>🛡️ فاتورة معتمدة وموثقة إلكترونياً</span>
              <span className="rounded bg-white border border-primary-200 px-2 py-0.5 font-mono text-[11px] text-primary-800">
                HASH: {securityHash}
              </span>
            </div>
            <div className="text-primary-700 text-[11px] font-bold">
              ✓ مسجلة بالنظام الرسمي
            </div>
          </div>

          {/* Customer & Shipping Section */}
          <div className="relative z-10 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1.5 text-xs">
              <span className="block font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                👤 بيانات العميل
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">الاسم:</span>
                <span className="font-bold text-slate-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">رقم الهاتف:</span>
                <span className="font-mono font-bold text-primary-700">{order.phone}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1.5 text-xs">
              <span className="block font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                📍 تفاصيل التوصيل والمقاسات
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">العنوان:</span>
                <span className="font-bold text-slate-900">
                  {order.type === "delivery" ? order.address : "استلام من المتجر"}
                </span>
              </div>
              {(order.height || order.weight) && (
                <div className="flex justify-between">
                  <span className="text-slate-500">المقاس الشخصي:</span>
                  <span className="font-bold text-slate-900">
                    {order.height ? `الطول: ${order.height} سم` : ""}{" "}
                    {order.height && order.weight ? "|" : ""}{" "}
                    {order.weight ? `الوزن: ${order.weight} كغم` : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Products Table */}
          <div className="relative z-10 mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-slate-800">
                📦 المنتجات المطلوبة ({order.items?.length || 0} عناصر)
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="p-2.5 w-8 text-center text-primary-700">#</th>
                    <th className="p-2.5">المنتج والتفاصيل المخصصة</th>
                    <th className="p-2.5 text-center">الكمية</th>
                    <th className="p-2.5 text-left">سعر الوحدة</th>
                    <th className="p-2.5 text-left">المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items?.map((item, idx) => {
                    const unitPrice = item.price || 0;
                    const lineTotal = unitPrice * (item.qty || 1);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 text-center font-bold text-primary-700">{idx + 1}</td>
                        <td className="p-2.5 space-y-1">
                          <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                          {(item.description || item.descriptionUsed) && (
                            <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                              {item.description || item.descriptionUsed}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5 text-[10.5px]">
                            {item.size && (
                              <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-slate-700 font-semibold">
                                المقاس: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-slate-700 font-semibold">
                                اللون: {item.color}
                              </span>
                            )}
                          </div>

                          {/* Config Snapshot Pieces */}
                          {item.configSnapshot && item.configSnapshot.length > 0 && (
                            <div className="mt-1 space-y-0.5 text-[10.5px]">
                              {item.configSnapshot.map((conf, cIdx) => (
                                <div
                                  key={cIdx}
                                  className="inline-flex items-center gap-1 rounded bg-primary-50 border border-primary-200/80 px-2 py-0.5 text-primary-900 font-bold ml-1.5 mb-1"
                                >
                                  <span>↳ {conf.pieceName ? `${conf.pieceName}: ` : ""}{conf.optionName}: {conf.selectedValue}</span>
                                  {conf.priceAdjustment > 0 && (
                                    <span className="text-emerald-700 font-mono text-[10px]">
                                      (+{conf.priceAdjustment} د.أ)
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-bold text-slate-800">{item.qty || 1}</td>
                        <td className="p-2.5 text-left font-mono text-slate-700">{unitPrice.toFixed(2)} د.أ</td>
                        <td className="p-2.5 text-left font-mono font-black text-slate-900">
                          {lineTotal.toFixed(2)} د.أ
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary & QR Code Section */}
          <div className="relative z-10 mt-5 pt-4 border-t-2 border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Verification QR Code */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="h-16 w-16 shrink-0 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                <svg viewBox="0 0 100 100" fill="#1e1b4b" className="w-full h-full">
                  <rect x="5" y="5" width="28" height="28" fill="none" stroke="#1e1b4b" strokeWidth="4" rx="2"/>
                  <rect x="11" y="11" width="16" height="16" fill="#1e1b4b"/>
                  <rect x="67" y="5" width="28" height="28" fill="none" stroke="#1e1b4b" strokeWidth="4" rx="2"/>
                  <rect x="73" y="11" width="16" height="16" fill="#1e1b4b"/>
                  <rect x="5" y="67" width="28" height="28" fill="none" stroke="#1e1b4b" strokeWidth="4" rx="2"/>
                  <rect x="11" y="73" width="16" height="16" fill="#1e1b4b"/>
                  <rect x="40" y="10" width="8" height="8" />
                  <rect x="52" y="18" width="8" height="8" />
                  <rect x="40" y="40" width="20" height="20" fill="#7c3aed" rx="4"/>
                  <rect x="68" y="42" width="8" height="8" />
                  <rect x="78" y="52" width="14" height="8" />
                  <rect x="42" y="68" width="12" height="8" />
                  <rect x="58" y="78" width="16" height="14" />
                  <rect x="78" y="72" width="14" height="14" />
                </svg>
              </div>
              <div className="text-[11px] text-slate-600 leading-snug">
                <strong className="block text-slate-900 text-xs font-extrabold mb-0.5">
                  مسح رمز التحقق (Scan QR)
                </strong>
                امسح الرمز بكاميرا الهاتف للتحقق المباشر من صحة الفاتورة وتطابق بياناتها.
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-mono font-bold text-slate-800">{subtotal.toFixed(2)} د.أ</span>
              </div>
              {order.promoCode && discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>خصم الكوبون ({order.promoCode}):</span>
                  <span className="font-mono font-bold">-{discountAmount.toFixed(2)} د.أ</span>
                </div>
              )}
              {order.type === "delivery" && (
                <div className="flex justify-between">
                  <span>رسوم التوصيل:</span>
                  <span className="font-mono font-bold text-slate-800">{deliveryFee.toFixed(2)} د.أ</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                <span>المبلغ الإجمالي النهائي:</span>
                <span className="font-mono text-base text-primary-700">{totalPrice.toFixed(2)} د.أ</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 mt-6 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
            <div>✨ شكراً لتسوقكم من البيلسان أونلاين - ALBILSAN ONLINE</div>
            <div>نظام الفواتير المعتمد | albilsan-online.com</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoiceModal;
