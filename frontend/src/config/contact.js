const normalizeDigits = (value) => (value || "").replace(/\D/g, "");

export const CONTACT_PHONE_LOCAL = "0798522935";
export const CONTACT_WHATSAPP_E164 = "962798522935";

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/share/1JJ8FLx3Xs/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/albaylsan_online?igsh=cDdpenhia212dW5l",
};

export const buildWhatsAppLink = ({ message = "" } = {}) => {
  const phone = normalizeDigits(CONTACT_WHATSAPP_E164);
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${phone}${encodedMessage}`;
};

export const normalizeJordanPhoneForWhatsApp = (rawPhone) => {
  const digits = normalizeDigits(rawPhone);
  if (!digits) return "";
  if (digits.startsWith("962")) return digits;
  if (digits.startsWith("0")) return `962${digits.slice(1)}`;
  return digits;
};
