import { useTranslation } from "react-i18next";
import { CalendarIcon, TruckIcon, WhatsAppIcon } from "./icons.jsx";
import { CONTACT_PHONE_LOCAL, SOCIAL_LINKS } from "../config/contact.js";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto bg-neutral-900/90">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 text-white/80 md:grid-cols-3">
        <div>
          <h3 className="mb-3 text-lg font-bold text-white">{t("brandName")}</h3>
          <p className="text-sm">{t("mission")}</p>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-secondary-200">{t("footer.locationTitle")}</h4>
          <p className="text-sm">{t("contact.address")}</p>
          <p className="mt-2 flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-secondary-200" />
            <span>{t("contact.hours")}</span>
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm">
            <TruckIcon className="h-4 w-4 text-secondary-200" />
            <span>{t("deliveryNote")}</span>
          </p>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-secondary-200">{t("footer.contactTitle")}</h4>
          <p className="flex items-center gap-2 text-sm">
            <WhatsAppIcon className="h-4 w-4 text-emerald-400" />
            <span>
              {t("footer.whatsapp")}: {CONTACT_PHONE_LOCAL}
            </span>
          </p>
          <div className="mt-3 flex gap-3">
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-4 py-2 text-xs transition hover:bg-white/10"
            >
              {t("footerLinks.facebook")}
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-4 py-2 text-xs transition hover:bg-white/10"
            >
              {t("footerLinks.instagram")}
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {t("brandName")} — {t("footer.rights")}
      </div>
    </footer>
  );
};

export default Footer;
