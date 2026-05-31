import { useTranslation } from "react-i18next";
import { useBackendStatus } from "../context/BackendStatusContext.jsx";

const BackendWarmupBanner = () => {
  const { t } = useTranslation();
  const { phase, attempts, isReady, warmUpNow } = useBackendStatus();

  if (isReady) return null;

  const primaryText =
    phase === "offline"
      ? t("status.connectionIssue", { defaultValue: "We’re reconnecting the boutique services." })
      : t("status.preparingCollection", { defaultValue: "Preparing the latest collection…" });

  const secondaryText =
    phase === "offline"
      ? t("status.retryHint", { defaultValue: "Please try again in a moment." })
      : attempts >= 3
        ? t("status.almostReady", { defaultValue: "Almost ready — loading products." })
        : t("status.connecting", { defaultValue: "Connecting you to the boutique…" });

  return (
    <div className="mx-auto mt-4 w-full max-w-6xl px-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white backdrop-blur-md">
        <p className="text-sm font-semibold">{primaryText}</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="text-xs text-white/70">{secondaryText}</p>
          {phase === "offline" && (
            <button
              onClick={warmUpNow}
              className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              {t("status.retry", { defaultValue: "Retry" })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackendWarmupBanner;
