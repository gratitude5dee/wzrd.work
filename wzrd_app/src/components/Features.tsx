
import React from 'react';
import FadeIn from './animations/FadeIn';
import { cn } from '../lib/utils';

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
}

const Feature: React.FC<FeatureProps> = ({ title, description, icon, delay = 0 }) => {
  return (
    <FadeIn delay={delay} direction="up">
      <div className="rounded-lg p-6 h-full transition-all hover:bg-muted/50">
        <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-lg mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </FadeIn>
  );
};

const Features: React.FC = () => {
  const features = [
    {
      title: "AI-Powered Learning",
      description: "Automatically learns from your work patterns to provide context-aware assistance.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v8"></path>
          <path d="m4.93 10.93 1.41 1.41"></path>
          <path d="M2 18h2"></path>
          <path d="M20 18h2"></path>
          <path d="m19.07 10.93-1.41 1.41"></path>
          <path d="M22 22H2"></path>
          <path d="M16 6 7 22"></path>
          <path d="m8 6 9 16"></path>
        </svg>
      ),
    },
    {
      title: "Task Automation",
      description: "Automates repetitive tasks so you can focus on high-value work that requires human creativity.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="10" x="3" y="11" rx="2"></rect>
          <circle cx="12" cy="5" r="2"></circle>
          <path d="M12 7v4"></path>
          <line x1="8" x2="16" y1="16" y2="16"></line>
        </svg>
      ),
    },
    {
      title: "Screen Intelligence",
      description: "Analyzes your screen to provide contextual assistance and relevant information.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="3" rx="2"></rect>
          <line x1="8" x2="16" y1="21" y2="21"></line>
          <line x1="12" x2="12" y1="17" y2="21"></line>
        </svg>
      ),
    },
    {
      title: "Virtual Assistance",
      description: "Provides real-time guidance and answers to questions based on your work context.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"></path>
          <path d="M15 3v6h6"></path>
          <path d="M10 16s.8-1 2-1 2.2 1 4 1 2-1 2-1"></path>
          <path d="M8 13h0"></path>
          <path d="M16 13h0"></path>
        </svg>
      ),
    },
    {
      title: "Secure & Private",
      description: "Your data stays on your device with privacy-first design and end-to-end encryption.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          <circle cx="12" cy="16" r="1"></circle>
        </svg>
      ),
    },
    {
      title: "Cross-Platform",
      description: "Works seamlessly across all your devices and integrates with your favorite tools.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="10" height="14" x="3" y="8" rx="2"></rect>
          <rect width="10" height="14" x="16" y="2" rx="2"></rect>
          <path d="M10 8 3 5"></path>
          <path d="m10 22-7-3"></path>
          <path d="M16 8h4"></path>
          <path d="M16 12h4"></path>
          <path d="M16 16h4"></path>
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container">
        <FadeIn className="text-center mb-12">
          <h2 className="font-bold mb-4">Supercharge Your Digital Work</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Discover how our intelligent assistant transforms the way you work, learn, and interact with digital tools.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
