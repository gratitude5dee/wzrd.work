
import React from 'react';
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
  withNoise = false,
  glassmorphism = false
}) => {
  const location = useLocation();
  
  // Adding animation class based on route change
  const getAnimationClass = () => {
    if (location.pathname === '/') {
      return 'animate-fadeIn';
    }
    return 'animate-slideUp';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar glassmorphism={glassmorphism} />
      {withNoise && (
        <div className="fixed inset-0 z-[-1] opacity-[0.015] bg-repeat pointer-events-none" 
          style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')" }}
        ></div>
      )}
      <main className={cn(
        "flex-grow transition-all", 
        getAnimationClass(), 
        className,
        glassmorphism && "relative z-10"
      )}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
