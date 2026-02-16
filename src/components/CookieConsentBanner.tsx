import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const COOKIE_CONSENT_KEY = "cookie_consent_dismissed";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 text-white px-4 py-3 flex items-center justify-center gap-4 text-sm">
      <span>
        We use cookies to improve your experience.{" "}
        <Link to="/privacy" className="underline hover:text-slate-200">
          Privacy Policy
        </Link>
      </span>
      <button
        onClick={handleDismiss}
        className="ml-2 p-1 hover:bg-slate-700 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
