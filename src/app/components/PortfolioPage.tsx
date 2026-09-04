import { useState } from "react";
import { useNavigate } from "react-router";
import { PortfolioGate } from "./PortfolioGate";
import { PortfolioView } from "./PortfolioView";

/** The /portfolio route: password gate first, then the grid. Both hand off to
 * the landing page ("/") on close instead of just toggling local state. */
export default function PortfolioPage() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);

  const goHome = () => navigate("/");

  if (!unlocked) {
    return <PortfolioGate darkMode={false} onClose={goHome} onUnlock={() => setUnlocked(true)} />;
  }

  return <PortfolioView onClose={goHome} />;
}
