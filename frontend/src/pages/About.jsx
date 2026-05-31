import { useTranslation } from "react-i18next";
import { ShieldIcon, SparkleIcon, TruckIcon } from "../components/icons.jsx";

const About = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const whyPoints = t("aboutPage.whyPoints", { returnObjects: true });
  const servicesPoints = t("aboutPage.servicesPoints", { returnObjects: true });

  return (
    <section className="relative overflow-hidden py-20">
      <div
        className="absolute inset-0 bg-[url('/assets/background-floral.png')] bg-no-repeat bg-left-top bg-contain opacity-0 pointer-events-none animate-floralFade"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-5xl px-6">
        <section
          className={`glass-card space-y-6 p-10 text-white ${isRTL ? "text-right" : "text-left"}`}
        >
          <h1 className="text-3xl font-bold">{t("aboutPage.title")}</h1>
          <p className="text-sm text-white/70">{t("aboutPage.intro")}</p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                <ShieldIcon className="h-5 w-5 text-secondary-200" />
                {t("aboutPage.whyTitle")}
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                {whyPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <SparkleIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-200" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                <TruckIcon className="h-5 w-5 text-secondary-200" />
                {t("aboutPage.servicesTitle")}
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                {servicesPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <SparkleIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-200" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-sm text-white/70">{t("aboutPage.closing")}</p>
        </section>
      </div>
    </section>
  );
};

export default About;
