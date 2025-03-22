
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Twitter, 
  Github, 
  Linkedin, 
  Heart, 
  Mail, 
  MapPin, 
  Phone 
} from 'lucide-react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#' },
        { name: 'Pricing', href: '#' },
        { name: 'Use Cases', href: '#' },
        { name: 'Roadmap', href: '#' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Tutorials', href: '#' },
        { name: 'Support', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'Careers', href: '#' },
        { name: 'Press', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy', href: '#' },
        { name: 'Terms', href: '#' },
        { name: 'Security', href: '#' },
        { name: 'Cookies', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-secondary/50 backdrop-blur-sm py-12 md:py-16 border-t border-white/5">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="font-bold text-xl">
                <span className="text-primary">wzrd</span>.work
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              Intelligent assistant for knowledge workers that learns your workflow and helps you be more productive.
            </p>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                <span>123 Innovation Way, San Francisco, CA 94107</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Mail className="w-4 h-4 mr-2 text-primary" />
                <span>hello@wzrd.work</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Phone className="w-4 h-4 mr-2 text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {footerLinks.map((category) => (
            <div key={category.title} className="space-y-4">
              <h4 className="font-medium text-lg">{category.title}</h4>
              <ul className="space-y-2">
                {category.links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {year} wzrd.work. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary">
              Terms of Service
            </a>
          </div>
          <div className="text-sm text-muted-foreground flex items-center">
            Made with <Heart className="w-4 h-4 text-red-500 mx-1" /> by WZRD Team
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
