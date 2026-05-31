import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const layoutDirectionClass = isRTL
    ? "md:flex-row-reverse md:text-right"
    : "md:flex-row md:text-left";
  const ctaAlignmentClass = isRTL ? "md:justify-end" : "md:justify-start";

  return (
    <section className="relative overflow-hidden bg-neutral-900/60 py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-secondary-500/10" />
      <div
        className="absolute inset-0 bg-[url('/assets/background-floral.png')] bg-no-repeat bg-right-bottom bg-contain opacity-0 pointer-events-none animate-floralFade"
        aria-hidden="true"
      />
      <div
        className={`relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 text-center ${layoutDirectionClass}`}
      >
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs text-white/70">
            {t("hero.badge")}
          </span>
          <h1 className="text-4xl font-black text-white md:text-5xl">{t("brandName")}</h1>
          <p className="text-lg text-white/80 md:text-xl">{t("tagline")}</p>
          <p className="text-sm text-white/60">{t("hero.description")}</p>
          <div className={`flex flex-wrap justify-center gap-4 ${ctaAlignmentClass}`}>
            <Link to="/shop" className="btn-primary">
              {t("heroCTA")}
            </Link>
            <Link to="/reservation" className="btn-secondary">
              {t("heroSecondaryCTA")}
            </Link>
          </div>
        </div>
        <div className="relative flex h-72 w-full max-w-sm flex-col items-center justify-center gap-4 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 text-white shadow-[0_20px_60px_rgba(124,73,224,0.18)] backdrop-blur-md md:w-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10" />
          <div className="relative flex h-40 w-40 items-center justify-center">
            <div className="absolute inset-5 rounded-full bg-primary-300/20 blur-2xl" aria-hidden="true" />
            <img
              src="/assets/hero-flower.png"
              alt={t("brandName")}
              className="hero-flower-blend relative h-36 w-36 object-contain animate-slowGlow"
              draggable={false}
            />
          </div>
          <p className="relative text-sm leading-relaxed text-white/80">
            {t("hero.cardText")}
          </p>
          <span className="relative text-xs text-white/50">
            {t("hero.note")}
          </span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
