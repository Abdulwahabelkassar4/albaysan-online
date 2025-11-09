import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";
import { useCart } from "../context/CartContext.jsx";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [loading, setLoading] = useState(true);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axiosClient.get(`/api/products/${id}`);
        setProduct(data);
        setSelectedSize(data.sizes?.[0] || "حر");
        setSelectedColor(data.colors?.[0] || "افتراضي");
        setMainImage(data.images?.[0]?.url || "");
        setActiveImageIndex(0);
      } catch (error) {
        console.error("Product not found", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const colorIndex = product.colors?.indexOf(selectedColor);
    if (colorIndex !== undefined && colorIndex >= 0 && product.images?.[colorIndex]) {
      setMainImage(product.images[colorIndex].url);
      setActiveImageIndex(colorIndex);
    }
  }, [selectedColor, product]);

  const handleImageSelect = (index) => {
    if (!product?.images?.[index]) return;
    setActiveImageIndex(index);
    setMainImage(product.images[index].url);
    const colorAtIndex = product.colors?.[index];
    if (colorAtIndex) {
      setSelectedColor(colorAtIndex);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      image: mainImage || product.images?.[0]?.url || "",
      qty: 1,
    });
    openCart();
  };

  if (loading) {
    return <div className="mx-auto max-w-6xl px-6 py-16">جاري التحميل...</div>;
  }

  if (!product) {
    return <div className="mx-auto max-w-6xl px-6 py-16">المنتج غير متاح.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="glass-card aspect-[3/4] overflow-hidden">
            {mainImage ? (
              <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-white/5 text-white/40">
                لا توجد صورة
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {product.images?.map((image, index) => (
              <button
                key={image.publicId || image.url || index}
                onClick={() => handleImageSelect(index)}
                className={`h-20 w-20 overflow-hidden rounded-2xl border-2 transition ${
                  index === activeImageIndex ? "border-secondary-300" : "border-transparent opacity-70"
                }`}
              >
                <img src={image.url} alt={product.name} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="glass-card space-y-6 p-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">{product.name}</h1>
            <p className="text-secondary-200 text-2xl font-black">{product.price} د.أ</p>
            <p className="text-sm text-white/70">{product.description || "تفاصيل المنتج ستتوفر قريباً."}</p>
          </div>

          {product.sizes?.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-white/70">اختاري المقاس</label>
              <select
                value={selectedSize}
                onChange={(event) => setSelectedSize(event.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                {product.sizes.map((size) => (
                  <option key={size} value={size} className="text-neutral-900">
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-white/70">اختاري اللون</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color, index) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      if (product.images?.[index]) {
                        setMainImage(product.images[index].url);
                        setActiveImageIndex(index);
                      }
                    }}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition hover:scale-105 ${
                      selectedColor === color
                        ? "bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-400 text-white"
                        : "bg-white/10 text-white/70"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 text-sm text-white/70">
            {product.category && <p>الفئة: <span className="text-white">{product.category}</span></p>}
            {product.collection && <p>المجموعة: <span className="text-white">{product.collection}</span></p>}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full rounded-full bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-400 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary-900/30 transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-secondary-200"
          >
            أضف إلى السلة
          </button>
          <a
            href="https://wa.me/962798522935"
            className="btn-primary w-full"
            target="_blank"
            rel="noreferrer"
          >
            تواصلي عبر واتساب للطلب
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

