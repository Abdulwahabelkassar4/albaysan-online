import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FireIcon, SparkleIcon, TagIcon } from "./icons.jsx";
import { bounceFlower } from "../utils/animeEffects.js";

const calculateTimeLeft = (targetDate) => {
  if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const difference = new Date(targetDate).getTime() - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false,
  };
};

const formatNumber = (num) => String(num).padStart(2, "0");

const DEFAULT_AR_TITLE = "تخفيضات البيلسان الحصرية";
const DEFAULT_AR_SUBTITLE = "خصومات مميزة على أرقى تشكيلات العباءات والسبورات الشرعية والنقابات لفترة محدودة";
const DEFAULT_AR_BADGE = "عرض لفترة محدودة 🔥";

const OfferCountdown = ({
  targetDate,
  title,
  subtitle,
  badgeText,
  promoCode = "",
  isEnabled = true,
}) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));
  const [copied, setCopied] = useState(false);
  const badgeRef = useRef(null);
  const promoButtonRef = useRef(null);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(targetDate));

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft(targetDate);
      setTimeLeft(remaining);
      if (remaining.expired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!isEnabled) return null;

  const handleCopyCode = () => {
    if (!promoCode) return;
    try {
      navigator.clipboard.writeText(promoCode);
      sessionStorage.setItem("applied_promo_code", promoCode);
    } catch (e) {
      console.warn("Failed to copy code", e);
    }
    if (promoButtonRef.current) {
      bounceFlower(promoButtonRef.current);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const displayBadge =
    !badgeText || badgeText === DEFAULT_AR_BADGE
      ? t("countdown.badgeDefault")
      : badgeText;

  const displayTitle =
    !title || title === DEFAULT_AR_TITLE
      ? t("countdown.titleDefault")
      : title;

  const displaySubtitle =
    !subtitle || subtitle.includes("خصومات مميزة")
      ? t("countdown.subtitleDefault")
      : subtitle;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-rose-300/30 bg-gradient-to-br from-rose-950/60 via-neutral-900/90 to-purple-950/70 p-6 md:p-8 text-center text-white shadow-2xl shadow-rose-950/40 backdrop-blur-xl mb-12">
      {/* Background Glow Orbs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />

      {/* Floating Girlish Badge */}
      <div
        ref={badgeRef}
        onMouseEnter={() => bounceFlower(badgeRef.current)}
        className="mx-auto inline-flex cursor-pointer items-center gap-2 rounded-full border border-rose-300/40 bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-purple-500/20 px-4 py-1.5 text-xs font-bold text-rose-200 shadow-inner backdrop-blur-md transition-all duration-300 hover:scale-105"
      >
        <span className="text-sm">🌸</span>
        <FireIcon className="h-4 w-4 text-amber-300 animate-bounce" />
        <span>{displayBadge}</span>
      </div>

      {/* Title & Subtitle */}
      <h2 className="mt-4 text-2xl font-black md:text-4xl text-white tracking-wide">
        <span className="bg-gradient-to-r from-white via-rose-100 to-pink-200 bg-clip-text text-transparent">
          {displayTitle}
        </span>
      </h2>
      {displaySubtitle && (
        <p className="mx-auto mt-2 max-w-xl text-xs md:text-sm text-rose-100/70 leading-relaxed">
          {displaySubtitle}
        </p>
      )}

      {/* Timer Digits Container */}
      {!timeLeft.expired ? (
        <div className="mt-8 flex justify-center items-center gap-2.5 md:gap-5">
          {/* Days */}
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl border border-rose-300/30 bg-neutral-900/80 font-mono text-2xl md:text-4xl font-black text-rose-300 shadow-lg shadow-rose-950/50 backdrop-blur-md">
              {formatNumber(timeLeft.days)}
            </div>
            <span className="mt-2 text-[10px] md:text-xs font-semibold text-rose-200/70">
              {t("countdown.days")}
            </span>
          </div>

          <span className="text-xl md:text-3xl font-bold text-rose-400/60 pb-5">:</span>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl border border-rose-300/30 bg-neutral-900/80 font-mono text-2xl md:text-4xl font-black text-pink-300 shadow-lg shadow-pink-950/50 backdrop-blur-md">
              {formatNumber(timeLeft.hours)}
            </div>
            <span className="mt-2 text-[10px] md:text-xs font-semibold text-rose-200/70">
              {t("countdown.hours")}
            </span>
          </div>

          <span className="text-xl md:text-3xl font-bold text-rose-400/60 pb-5">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl border border-rose-300/30 bg-neutral-900/80 font-mono text-2xl md:text-4xl font-black text-purple-300 shadow-lg shadow-purple-950/50 backdrop-blur-md">
              {formatNumber(timeLeft.minutes)}
            </div>
            <span className="mt-2 text-[10px] md:text-xs font-semibold text-rose-200/70">
              {t("countdown.minutes")}
            </span>
          </div>

          <span className="text-xl md:text-3xl font-bold text-rose-400/60 pb-5">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl border border-amber-300/40 bg-neutral-900/80 font-mono text-2xl md:text-4xl font-black text-amber-300 shadow-lg shadow-amber-950/50 backdrop-blur-md animate-pulse">
              {formatNumber(timeLeft.seconds)}
            </div>
            <span className="mt-2 text-[10px] md:text-xs font-semibold text-amber-200/70">
              {t("countdown.seconds")}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-3 text-sm font-semibold text-rose-300">
          <SparkleIcon className="h-5 w-5" />
          <span>{t("countdown.expired")}</span>
        </div>
      )}

      {/* Promo Code Box */}
      {promoCode && (
        <div className="mt-7 flex items-center justify-center gap-3">
          <span className="text-xs text-rose-200/80">{t("countdown.promoCodeLabel")}</span>
          <button
            ref={promoButtonRef}
            onClick={handleCopyCode}
            className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 font-mono text-xs font-bold text-amber-200 shadow-md backdrop-blur-md transition hover:bg-amber-400/20 active:scale-95"
            title={t("countdown.promoCodeLabel")}
          >
            <TagIcon className="h-4 w-4 text-amber-300" />
            <span>{promoCode}</span>
            <span className="text-[10px] text-amber-300/80 bg-amber-400/20 px-2 py-0.5 rounded-full">
              {copied ? t("countdown.copied") : t("countdown.copy")}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default OfferCountdown;
