
import React from 'react';
import Layout from '../components/Layout';
import FadeIn from '../components/animations/FadeIn';
import Button from '../components/Button';

const About: React.FC = () => {
  return (
    <Layout>
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container">
          <FadeIn className="mb-16 text-center">
            <h1 className="font-bold mb-6">About wzrd.work</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              We're building the future of work for knowledge workers through intelligent digital assistance.
            </p>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <FadeIn direction="left">
              <div className="rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Our team" 
                  className="w-full h-auto" 
                />
              </div>
            </FadeIn>
            
            <FadeIn direction="right" delay={200}>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                At wzrd.work, we believe that knowledge workers should spend their time on creative, meaningful work—not on repetitive, mundane tasks.
              </p>
              <p className="text-muted-foreground mb-6">
                Our mission is to create an intelligent digital assistant that learns your workflow, anticipates your needs, and helps you focus on the work that matters most. We're building technology that amplifies human capabilities rather than replacing them.
              </p>
              <Button>Learn More</Button>
            </FadeIn>
          </div>
          
          <FadeIn className="mb-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              The principles that guide our product development and company culture.
            </p>
          </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-8 mb-24">
            {[
              {
                title: "Human-Centered AI",
                description: "We build AI that enhances human capabilities and respects human autonomy. Our technology is designed to be a tool that empowers, not replaces."
              },
              {
                title: "Privacy by Design",
                description: "We believe your data belongs to you. We design our products with privacy as a fundamental principle, not an afterthought."
              },
              {
                title: "Continuous Learning",
                description: "Just as our AI is constantly learning and improving, we are committed to continuous learning and improvement as individuals and as a company."
              }
            ].map((value, index) => (
              <FadeIn key={index} delay={index * 100} direction="up">
                <div className="bg-card p-6 rounded-lg shadow-sm border border-border h-full">
                  <h3 className="text-xl font-medium mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          
          <FadeIn className="mb-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Our Team</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              We're a diverse team of technologists, designers, and problem-solvers passionate about creating tools that make knowledge work better.
            </p>
          </FadeIn>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
            {Array.from({ length: 8 }).map((_, index) => (
              <FadeIn key={index} delay={index * 50} direction="up">
                <div className="text-center">
                  <div className="w-full aspect-square rounded-full bg-muted mb-4 overflow-hidden">
                    <div className="w-full h-full bg-primary/10"></div>
                  </div>
                  <h4 className="font-medium">Team Member</h4>
                  <p className="text-sm text-muted-foreground">Position</p>
                </div>
              </FadeIn>
            ))}
          </div>
          
          <div className="bg-primary/5 rounded-lg p-8 md:p-12 text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                We're always looking for talented people to join us on our mission to transform knowledge work.
              </p>
              <Button>View Open Positions</Button>
            </FadeIn>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
