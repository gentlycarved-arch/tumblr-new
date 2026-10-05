import type { CSSProperties } from "react";

/** Softly lit button fill shared by the corner buttons ("leave a confession", "add an image",
 * the light/dark toggle): dark blue, or yellowy orange for the toggle in light mode, with the
 * "?" button's border and white hover ring. */
export function glossyButtonStyle(hover: boolean, tone: "blue" | "sun" = "blue"): CSSProperties {
  const [top, bottom] = tone === "sun"
    ? hover ? ["#ffcf70", "#f5962a"] : ["#ffc55a", "#f08a12"]
    : hover ? ["#4b6d9e", "#223c63"] : ["#3f6191", "#1b3155"];
  return {
    background: `radial-gradient(70% 70% at 50% 30%, ${top} 0%, ${bottom} 100%)`,
    boxShadow: hover
      ? "0 0 0 1px rgba(0,0,0,0.15), inset 0 0 0 1.5px rgba(255,255,255,0.6)"
      : "0 0 0 1px rgba(0,0,0,0.15)",
    color: "#fff",
    textShadow: "0 1px 2px rgba(0,0,0,0.35)",
    transition: "scale 150ms ease",
  };
}
