
import { useEffect, useState } from "react"

export function useIsMobile() {
  // Initialize with a default value based on window width if available
  const [isMobile, setIsMobile] = useState(() => {
    // Check if window is defined (we're in the browser, not during SSR)
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768
    }
    // Default to desktop during initial render
    return false
  })

  useEffect(() => {
    // Skip if window is not defined
    if (typeof window === 'undefined') return

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  return isMobile
}
