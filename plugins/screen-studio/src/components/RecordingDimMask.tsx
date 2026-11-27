import React from "react";

/**
 * Click-through fullscreen recording mask:
 * The active recording region is 100% transparent & bright,
 * while everything outside the region is dimmed semi-transparent gray.
 */
export const RecordingDimMask: React.FC = () => {
  React.useEffect(() => {
    document.body.style.background = "transparent";
    document.documentElement.style.background = "transparent";
  }, []);

  const rect = React.useMemo(() => {
    const hash = window.location.hash || "";
    const qIdx = hash.indexOf("?");
    const params =
      qIdx !== -1 ? new URLSearchParams(hash.slice(qIdx + 1)) : null;

    const nx = Number(params?.get("x") ?? 0.15);
    const ny = Number(params?.get("y") ?? 0.15);
    const nw = Number(params?.get("w") ?? 0.7);
    const nh = Number(params?.get("h") ?? 0.7);

    return {
      left: `${(nx * 100).toFixed(2)}%`,
      top: `${(ny * 100).toFixed(2)}%`,
      width: `${(nw * 100).toFixed(2)}%`,
      height: `${(nh * 100).toFixed(2)}%`,
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none">
      <div
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.52)",
        }}
        className="absolute rounded-lg border border-dashed border-white/65"
      />
    </div>
  );
};
