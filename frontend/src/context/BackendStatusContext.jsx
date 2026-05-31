import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import axiosClient from "../api/axiosClient.js";
import { requestWithRetry } from "../utils/requestWithRetry.js";

const BackendStatusContext = createContext(null);

export const BackendStatusProvider = ({ children }) => {
  const [phase, setPhase] = useState("checking");
  const [attempts, setAttempts] = useState(0);
  const startedRef = useRef(false);

  const warmUpNow = async () => {
    setPhase("checking");
    setAttempts(0);
    try {
      await requestWithRetry(() => axiosClient.get("/api/health", { timeout: 10000 }), {
        timeoutMs: 65000,
        baseDelayMs: 1500,
        maxDelayMs: 6000,
        onRetry: ({ attempt }) => {
          setAttempts(attempt);
          setPhase("warming");
        },
      });
      setPhase("ready");
    } catch (_error) {
      setPhase("offline");
    }
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    warmUpNow();
  }, []);

  const value = useMemo(
    () => ({
      phase,
      attempts,
      isReady: phase === "ready",
      isWarming: phase === "warming" || phase === "checking",
      warmUpNow,
    }),
    [phase, attempts]
  );

  return <BackendStatusContext.Provider value={value}>{children}</BackendStatusContext.Provider>;
};

export const useBackendStatus = () => {
  const context = useContext(BackendStatusContext);
  if (!context) {
    throw new Error("useBackendStatus must be used within BackendStatusProvider");
  }
  return context;
};
