import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Utility component that resets window scroll position to (0,0)
 * whenever the route changes. This prevents a new page from 
 * starting halfway down if the previous page was scrolled.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
