import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import Hero from "../components/Hero.jsx";
import ProductCard from "../components/ProductCard.jsx";

const features = [
  {
    title: "تصاميم حصرية",
    description: "منتجات لا تُباع في الأسواق الأخرى مع لمسات شرعية أنيقة.",
  },
  {
    title: "ورشاتنا الخاصة",
    description: "نعمل من خلال مشاغلنا وفريقنا الداخلي لضمان الجودة والاحتشام.",
  },
  {
    title: "موديلاتنا الخاصة",
    description: "عارضاتنا ملتزمات باللباس الشرعي ويعرضن التصاميم كما صُممت.",
  },
];

const Home = () => {
  const { t } = useTranslation();
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axiosClient.get("/api/products?limit=4");
        setLatestProducts(data.data || []);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Hero />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="glass-card grid gap-8 p-10 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-white/5 bg-white/5 p-6">
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-neutral-900/70 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-right">
            <h2 className="text-3xl font-bold text-white">أحدث التصاميم</h2>
            <p className="text-sm text-white/70">{t("deliveryNote")}</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="glass-card h-80 animate-pulse bg-white/5" />
                ))
              : latestProducts.map((product) => <ProductCard key={product._id} product={product} />)}
            {!loading && latestProducts.length === 0 && (
              <div className="col-span-full text-center text-white/60">
                لم يتم إضافة منتجات بعد، يرجى العودة لاحقاً.
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="glass-card grid gap-8 p-10 md:grid-cols-3">
          <div className="text-center">
            <p className="text-4xl font-black text-primary-200">2019</p>
            <p className="mt-2 text-sm text-white/70">الانطلاق أونلاين</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-secondary-200">2024</p>
            <p className="mt-2 text-sm text-white/70">افتتاح المعرض على أرض الواقع</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-white">+1000</p>
            <p className="mt-2 text-sm text-white/70">عميلة راضية وخدمة حجز مرنة</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

