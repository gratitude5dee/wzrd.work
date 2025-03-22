
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from './Button';
import { cn } from '../lib/utils';
import { Menu, X, LogIn } from 'lucide-react';

interface NavbarProps {
  glassmorphism?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ glassmorphism = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4',
        isScrolled || isMobileMenuOpen
          ? glassmorphism 
            ? 'backdrop-blur-xl bg-background/70 shadow-sm border-b border-white/10'
            : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm' 
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="font-bold text-xl tracking-tight">
            <span className="text-primary">wzrd</span>.work
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary relative group',
                location.pathname === link.path
                  ? 'text-primary'
                  : 'text-foreground/70'
              )}
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/auth')}
            className="border-primary/30 hover:border-primary hover:bg-primary/5"
          >
            Sign In
          </Button>
          <Button 
            size="sm" 
            onClick={() => navigate('/auth')}
            className="gap-1 shadow-md shadow-primary/20"
          >
            <LogIn className="w-4 h-4" />
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-md text-foreground/80 hover:text-primary transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden backdrop-blur-xl bg-background/90 fixed inset-x-0 top-[61px] animate-slideDown border-b border-white/10">
          <div className="container py-4 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-sm font-medium py-2 transition-colors',
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-foreground/70'
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col space-y-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/auth')}
                className="border-primary/30 hover:border-primary"
              >
                Sign In
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate('/auth')}
                className="gap-1"
              >
                <LogIn className="w-4 h-4" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
