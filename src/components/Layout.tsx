
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
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
      <Navbar />
      <main className={cn("flex-grow transition-all", getAnimationClass(), className)}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
