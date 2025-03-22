
import React from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import Features from '../components/Features';
import FadeIn from '../components/animations/FadeIn';
import Button from '../components/Button';

const Index: React.FC = () => {
  return (
    <Layout>
      <Hero />
      <Features />
      
      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <FadeIn className="text-center mb-12">
            <h2 className="font-bold mb-4">Trusted by Knowledge Workers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              See how our digital assistant is transforming workflows across industries.
            </p>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <FadeIn key={i} delay={i * 100} direction="up">
                <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 mr-3"></div>
                    <div>
                      <h4 className="font-medium text-base">User Name</h4>
                      <p className="text-muted-foreground text-sm">Company</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    "This digital assistant has completely transformed how I work. It saves me hours every day by automating routine tasks and providing relevant information exactly when I need it."
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <h2 className="font-bold mb-4">Ready to Transform Your Workflow?</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
                Join thousands of knowledge workers who are using our digital assistant to work smarter, not harder.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg">
                  Get Started for Free
                </Button>
                <Button variant="outline" size="lg">
                  Schedule a Demo
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
