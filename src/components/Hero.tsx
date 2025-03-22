
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import FadeIn from './animations/FadeIn';
import { Wand2, SparklesIcon } from 'lucide-react';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl"></div>
        
        {/* Animated shapes */}
        <div className="absolute top-1/3 right-[15%] w-24 h-24 bg-primary/5 rounded-full animate-float"></div>
        <div className="absolute bottom-1/3 left-[10%] w-12 h-12 bg-primary/10 rounded-lg rotate-45 animate-float animation-delay-1000"></div>
        <div className="absolute top-[20%] left-[30%] w-16 h-16 bg-secondary/20 rounded-full animate-float animation-delay-2000"></div>
      </div>

      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center px-3 py-1 mb-6 text-sm rounded-full bg-primary/10 text-primary">
              <SparklesIcon className="w-4 h-4 mr-2" />
              <span>Productivity, reimagined</span>
            </div>
            
            <h1 className="font-bold tracking-tight text-foreground mb-6">
              The Digital Assistant for{" "}
              <span className="relative">
                <span className="relative z-10 text-primary">Knowledge Workers</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-primary/20 -z-10 skew-x-3"></span>
              </span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={150}>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              WZRD learns from how you work, automates repetitive tasks, and helps you focus on high-value work. 
              It's your AI copilot for every digital task.
            </p>
          </FadeIn>
          
          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/auth')} className="px-8 gap-2">
                <Wand2 className="w-4 h-4" />
                Get Started
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
          </FadeIn>
          
          <FadeIn delay={450}>
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 h-16 bottom-0 rounded-b-lg"></div>
              <div className="glass rounded-lg shadow-xl overflow-hidden border border-white/10">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <Button variant="default" size="lg" className="shadow-2xl">Watch Demo</Button>
                  </div>
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                    alt="WZRD AI assistant interface" 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute bottom-4 right-4 p-2 rounded-lg glass shadow-xl flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-xs text-white ml-1">Recording</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default Hero;
