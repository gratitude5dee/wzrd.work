
import { useEffect, useState } from "react"

export function useIsMobile() {
  // Make sure React is available - fixing the 'Cannot read properties of null (reading 'useState')' error
  // by checking if window is defined before using React hooks
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Skip if window is not defined (during SSR)
    if (typeof window === 'undefined') return;

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Clean up
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  return isMobile;
}
