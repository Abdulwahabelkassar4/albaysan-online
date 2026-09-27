import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FloralCanvas3D from "./FloralCanvas3D.jsx";
import BloomingFlower3D from "./BloomingFlower3D.jsx";
import { SparkleIcon } from "./icons.jsx";
import { bloomStagger } from "../utils/animeEffects.js";

const Hero = () => {
  const { t, i18n } = useTranslation();
  const heroContentRef = useRef(null);
  const isRTL = i18n.language === "ar";
  const layoutDirectionClass = isRTL
    ? "md:flex-row-reverse md:text-right"
    : "md:flex-row md:text-left";
  const ctaAlignmentClass = isRTL ? "md:justify-end" : "md:justify-start";

  useEffect(() => {
    if (heroContentRef.current) {
      const elements = heroContentRef.current.querySelectorAll(".hero-anim-item");
      bloomStagger(elements, { delay: 90 });
    }
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900/90 to-neutral-950 py-20 md:py-28">
      {/* 3D WebGL Floating Flower Petals Canvas */}
      <FloralCanvas3D density={45} className="opacity-90" />

      {/* Radiant Dreamy Ambient Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-rose-500/25 via-secondary-500/20 to-primary-500/25 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-10 -z-10 h-72 w-72 rounded-full bg-rose-400/15 blur-[90px]" />

      <div
        className={`relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 text-center ${layoutDirectionClass}`}
      >
        {/* Text Content */}
        <div ref={heroContentRef} className="flex-1 space-y-6 z-10">
          <div className="hero-anim-item inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-200 backdrop-blur-md shadow-sm shadow-rose-950/40">
            <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
            <SparkleIcon className="h-3.5 w-3.5 text-pink-300" />
            <span>{t("hero.badge")}</span>
          </div>

          <h1 className="hero-anim-item text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-white via-rose-100 to-pink-300 bg-clip-text text-transparent">
              {t("brandName")}
            </span>
          </h1>

          <p className="hero-anim-item text-lg font-medium text-rose-100/90 md:text-2xl">
            {t("tagline")}
          </p>

          <p className="hero-anim-item max-w-xl text-sm leading-relaxed text-white/70">
            {t("hero.description")}
          </p>

          <div className={`hero-anim-item flex flex-wrap justify-center gap-4 pt-2 ${ctaAlignmentClass}`}>
            <Link to="/shop" className="btn-primary group">
              <span>{t("heroCTA")}</span>
              <span className="inline-block transition-transform duration-300 group-hover:rotate-12">🌸</span>
            </Link>
            <Link to="/reservation" className="btn-secondary">
              <span>{t("heroSecondaryCTA")}</span>
            </Link>
          </div>
        </div>

        {/* 21st.dev Style Floral Glassmorphic Showcase Card */}
        <div
          className="hero-anim-item group relative flex w-full max-w-sm flex-col items-center justify-center gap-4 overflow-hidden rounded-[2.5rem] border border-rose-300/25 bg-gradient-to-br from-white/[0.09] via-white/[0.03] to-rose-500/[0.12] p-8 text-white shadow-[0_20px_50px_rgba(244,63,142,0.22)] backdrop-blur-xl transition-all duration-500 hover:border-rose-400/50 hover:shadow-[0_25px_60px_rgba(244,63,142,0.35)]"
        >
          {/* 3D Full Blooming Animated Flower (Seamless with transparent background) */}
          <div className="relative flex items-center justify-center">
            {/* Soft ambient floral glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-400/25 to-purple-400/15 blur-2xl pointer-events-none" />

            <BloomingFlower3D className="transform transition-transform duration-500 group-hover:scale-110" />
          </div>

          <div className="relative space-y-2 text-center z-10">
            <p className="text-sm font-medium leading-relaxed text-rose-100/90">
              {t("hero.cardText")}
            </p>
            <span className="inline-block rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-medium text-rose-200/70">
              ✨ {t("hero.note")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
