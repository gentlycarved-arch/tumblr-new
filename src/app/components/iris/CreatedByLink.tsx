import { Link } from "react-router";

/** Fixed footer credit shown on the color picker: the name links back to the main site. */
export function CreatedByLink() {
  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap"
      style={{ fontFamily: "'ETBembo', serif", fontSize: "11px", letterSpacing: "0.08em", color: "#555" }}
    >
      created by{" "}
      <Link
        to="/"
        className="underline underline-offset-2 transition-colors"
        style={{ color: "#333" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#111")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
      >
        Tahreem Rehman
      </Link>
    </div>
  );
}
