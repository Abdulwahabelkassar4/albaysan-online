import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-neutral-900/60 py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-secondary-500/10" />
      <div
        className="absolute inset-0 bg-[url('/assets/background-floral.png')] bg-no-repeat bg-right-bottom bg-contain opacity-0 pointer-events-none animate-floralFade"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 text-center md:flex-row md:text-right">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs text-white/70">
            منذ 2019 — خياطة راقية بتفاصيل عربية معاصرة
          </span>
          <h1 className="text-4xl font-black text-white md:text-5xl">{t("brandName")}</h1>
          <p className="text-lg text-white/80 md:text-xl">{t("tagline")}</p>
          <p className="text-sm text-white/60">
            نحن نؤمن بأن كل إطلالة تستحق أن تكون استثنائية، لذلك نصمم مجموعات موسمية محدودة بعناية ونقدم تجربة حجز وتوصيل مرنة لتلائم أسلوب حياتك.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:justify-start">
            <Link to="/shop" className="btn-primary">
              {t("heroCTA")}
            </Link>
            <Link to="/reservation" className="btn-secondary">
              {t("heroSecondaryCTA")}
            </Link>
          </div>
        </div>
        <div className="glass-card flex h-72 w-full max-w-sm flex-col items-center justify-center gap-4 p-6 text-white md:w-auto">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <div className="h-full w-full rounded-full bg-gradient-to-br from-primary-500/40 to-secondary-500/40 ring-4 ring-white/10" />
            <img
              src="/assets/hero-flower.png"
              alt="زهرة البيلسان"
              className="absolute h-28 w-28 object-contain mix-blend-lighten animate-slowGlow"
              draggable={false}
            />
          </div>
          <p className="text-sm leading-relaxed text-white/80">
            نصنع كل قطعة بشغف للتفاصيل، من اختيار الأقمشة المخملية إلى اللمسات اليدوية الدقيقة، لنضمن لك حضورًا يعبر عن أناقتك الهادئة وثقتك.
          </p>
          <span className="text-xs text-white/50">
            10 صباحًا - 8 مساءً — توصيل لكل محافظات الأردن وفلسطين وبعض محافظات سوريا
          </span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
