import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Cross-page anchor links (e.g. /signup's "Join the waitlist" ->
      // /#waitlist) land here on a fresh full-page load. Let them settle on
      // their target section instead of forcing the top of the page.
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
