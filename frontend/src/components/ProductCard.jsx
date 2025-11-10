import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ProductCard = ({ product }) => {
  const cover = product.images?.[0]?.url;
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <article className="group glass-card relative overflow-hidden transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/40">
      <div className="aspect-[3/4] w-full overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary-500/10 text-white/50">
            {product.name?.slice(0, 2)}
          </div>
        )}
      </div>
      <div className={`space-y-2 p-5 text-white ${isRTL ? "text-right" : "text-left"}`}>
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-white/60">{product.category}</p>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-secondary-200">
            {product.price} {t("product.priceSuffix")}
          </span>
          <Link
            to={`/products/${product._id}`}
            className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/20"
          >
            {t("productCard.details")}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;

