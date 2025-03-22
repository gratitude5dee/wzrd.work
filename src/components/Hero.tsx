
import React from 'react';
import Button from './Button';
import FadeIn from './animations/FadeIn';

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h1 className="font-bold tracking-tight text-foreground mb-6">
              The Digital Assistant for{" "}
              <span className="text-primary">Knowledge Workers</span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={150}>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Automate your digital tasks, enhance your productivity, and focus on what matters with our intelligent assistant.
            </p>
          </FadeIn>
          
          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg">
                Get Started
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </FadeIn>
          
          <FadeIn delay={450}>
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 h-16 bottom-0 rounded-b-lg"></div>
              <div className="glass rounded-lg shadow-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Digital assistant interface" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default Hero;
