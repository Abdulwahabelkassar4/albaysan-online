import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section className="glass-card grid gap-10 p-10 md:grid-cols-2">
        <div className="space-y-4 text-white">
          <h1 className="text-3xl font-bold">{t("nav.contact")}</h1>
          <p className="text-sm text-white/70">{t("mission")}</p>
          <div className="space-y-3 text-sm text-white/70">
            <p>📍 {t("contact.address")}</p>
            <p>⏰ {t("contact.hours")}</p>
            <p>📱 واتساب: {t("contact.phone")}</p>
          </div>
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/share/1JJ8FLx3Xs/?mibextid=wwXIfr"
              target="_blank"
              rel="noreferrer"
              className="btn-primary px-5 py-2 text-xs"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com/albaylsan_online?igsh=cDdpenhia212dW5l"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary px-5 py-2 text-xs"
            >
              Instagram
            </a>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <iframe
            title="البيلسان أونلاين"
            src="https://maps.google.com/maps?q=32.5463,35.8540&z=16&output=embed"
            width="100%"
            height="320"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
          />
        </div>
      </section>
    </div>
  );
};

export default Contact;

