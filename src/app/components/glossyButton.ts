import type { CSSProperties } from "react";

/** Softly lit button fill shared by the corner buttons (light/dark toggle, "leave a confession",
 * "add an image"): yellowy orange in light mode, dark blue at night, with the "?" button's
 * border and white hover ring. */
export function glossyButtonStyle(darkMode: boolean, hover: boolean): CSSProperties {
  const [top, bottom] = darkMode
    ? hover ? ["#4b6d9e", "#223c63"] : ["#3f6191", "#1b3155"]
    : hover ? ["#ffcf70", "#f5962a"] : ["#ffc55a", "#f08a12"];
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
