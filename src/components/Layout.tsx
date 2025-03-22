
import React, { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  withNoise?: boolean;
  glassmorphism?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  className,
  withNoise = true,
  glassmorphism = true
}) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  // Adding animation class based on route change
  const getAnimationClass = () => {
    if (location.pathname === '/') {
      return 'animate-fadeIn';
    }
    return 'animate-slideUp';
  };

  // Handle mouse movement for interactive elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Update custom cursor position if enabled
      if (cursorRef.current && cursorDotRef.current) {
        const x = e.clientX;
        const y = e.clientY;
        
        // Smooth cursor following with slight delay
        cursorRef.current.style.transform = `translate(${x}px, ${y}px)`;
        
        // Dot follows cursor precisely
        cursorDotRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
      
      // Update background gradient position
      if (containerRef.current) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        // Set CSS variables for radial gradient position
        document.documentElement.style.setProperty('--mouse-x', `${x * 100}%`);
        document.documentElement.style.setProperty('--mouse-y', `${y * 100}%`);
        
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };
    
    // Handle element hover states
    const handleElementHover = () => {
      setIsHovering(true);
    };
    
    const handleElementLeave = () => {
      setIsHovering(false);
    };
    
    // Apply hover detection to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, .glass-card, [role="button"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleElementHover);
      el.addEventListener('mouseleave', handleElementLeave);
    });

    // Register event listeners
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleElementHover);
        el.removeEventListener('mouseleave', handleElementLeave);
      });
    };
  }, [location.pathname]);

  return (
    <>
      {/* Custom cursor effects (hidden on touch devices) */}
      <div 
        ref={cursorRef} 
        className="fixed pointer-events-none z-50 opacity-70 mix-blend-screen hidden md:block"
        style={{ 
          width: isHovering ? '45px' : '30px', 
          height: isHovering ? '45px' : '30px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          transition: 'width 0.2s, height 0.2s, transform 0.1s',
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          willChange: 'transform'
        }}
      />
      <div 
        ref={cursorDotRef} 
        className="fixed pointer-events-none z-50 mix-blend-screen hidden md:block" 
        style={{
          width: '4px',
          height: '4px',
          backgroundColor: 'white',
          borderRadius: '50%',
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: 'transform 0.05s linear',
          willChange: 'transform'
        }}
      />
    
      <div 
        ref={containerRef}
        className="flex flex-col min-h-screen relative overflow-hidden"
      >
        <Navbar glassmorphism={glassmorphism} />
        
        <main className={cn(
          "flex-grow transition-all z-10", 
          getAnimationClass(),
          className
        )}>
          {children}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Layout;
