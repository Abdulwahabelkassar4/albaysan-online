import React, { useEffect, useState, useRef } from "react";

/**
 * FloralCursorAndBurst Component
 * 1. Global Click & Mobile Tap Petal Burst:
 *    - On every click or screen tap (phone & laptop), spawns a spray of 6-8 delicate floral petals & gold sparkles.
 * 2. Elegant Custom Floral Pointer:
 *    - Desktop mouse has a soft glowing cherry blossom / rose follower.
 */
const FloralCursorAndBurst = () => {
  const [bursts, setBursts] = useState([]);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100, visible: false });
  const [isPointerDevice, setIsPointerDevice] = useState(false);
  const nextId = useRef(0);

  // Check if device is desktop with a mouse pointer
  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsPointerDevice(mediaQuery.matches);

    const handler = (e) => setIsPointerDevice(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Desktop Mouse Follower
  useEffect(() => {
    if (!isPointerDevice) return;

    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY, visible: true });
    };

    const handleMouseLeave = () => {
      setCursorPos((prev) => ({ ...prev, visible: false }));
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isPointerDevice]);

  // Global Tap & Click Blossom Petal Burst
  useEffect(() => {
    const handlePointerDown = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      if (x === undefined || y === undefined) return;

      const burstId = nextId.current++;
      const petalColors = ["#ff758f", "#ff8fab", "#f43f8e", "#fbcfe8", "#fde047", "#fda4af"];

      // Generate 7 radiating petals
      const petals = Array.from({ length: 7 }).map((_, i) => {
        const angle = (i / 7) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const distance = 28 + Math.random() * 32;
        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance;
        const rotation = Math.random() * 360;
        const color = petalColors[i % petalColors.length];
        const size = 10 + Math.random() * 6;

        return {
          id: i,
          targetX,
          targetY,
          rotation,
          color,
          size,
        };
      });

      const newBurst = {
        id: burstId,
        x,
        y,
        petals,
      };

      setBursts((prev) => [...prev.slice(-10), newBurst]);

      // Automatically clean up after animation finishes (600ms)
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burstId));
      }, 600);
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <>
      {/* Global CSS for Petal Burst Animation */}
      <style>{`
        @keyframes petalFlyOut {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(0.3) rotate(0deg);
          }
          60% {
            opacity: 0.9;
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) scale(1) rotate(var(--rot));
          }
        }
        .animate-petal-burst {
          animation: petalFlyOut 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
      `}</style>

      {/* Click / Tap Petal Bursts Overlay */}
      <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
        {bursts.map((burst) => (
          <div
            key={burst.id}
            className="absolute"
            style={{ left: `${burst.x}px`, top: `${burst.y}px` }}
          >
            {burst.petals.map((petal) => (
              <svg
                key={petal.id}
                viewBox="0 0 24 24"
                className="animate-petal-burst absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: `${petal.size}px`,
                  height: `${petal.size}px`,
                  fill: petal.color,
                  "--tx": `${petal.targetX}px`,
                  "--ty": `${petal.targetY}px`,
                  "--rot": `${petal.rotation}deg`,
                  filter: "drop-shadow(0 2px 4px rgba(244,63,142,0.4))",
                }}
              >
                {/* Curved flower petal SVG */}
                <path d="M12 2C8 6 5 12 12 22C19 12 16 6 12 2Z" />
              </svg>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop Custom Glowing Floral Pointer */}
      {isPointerDevice && cursorPos.visible && (
        <div
          className="pointer-events-none fixed z-[9998] transition-transform duration-75 ease-out"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Subtle soft glowing aura */}
          <div className="absolute -inset-2 rounded-full bg-rose-400/20 blur-sm animate-pulse" />
          
          {/* Small blooming cherry blossom follower */}
          <span className="relative block text-xs drop-shadow-[0_2px_8px_rgba(244,63,142,0.6)] select-none">
            🌸
          </span>
        </div>
      )}
    </>
  );
};

export default React.memo(FloralCursorAndBurst);
