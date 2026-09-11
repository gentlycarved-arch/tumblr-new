import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { PortfolioGate } from "./PortfolioGate";
import { PortfolioView } from "./PortfolioView";

/** The /portfolio route: password gate first, then the grid. Both hand off to
 * the landing page ("/") on close instead of just toggling local state. */
export default function PortfolioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Already logged in from the landing page's inline password field.
  const [unlocked, setUnlocked] = useState(Boolean((location.state as { unlocked?: boolean } | null)?.unlocked));

  const goHome = () => navigate("/");

  if (!unlocked) {
    return <PortfolioGate darkMode={false} onClose={goHome} onUnlock={() => setUnlocked(true)} />;
  }

  return <PortfolioView onClose={goHome} />;
}
