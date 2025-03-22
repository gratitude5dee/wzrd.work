
import React from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import Features from '../components/Features';
import FadeIn from '../components/animations/FadeIn';
import Button from '../components/Button';
import { BrainCog, Fingerprint, LineChart, Star, CheckCircle2 } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <Layout withNoise glassmorphism>
      <Hero />
      <Features />
      
      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <FadeIn className="text-center mb-16">
            <h2 className="font-bold mb-4">How WZRD Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our AI assistant observes, learns, and automates in two powerful modes.
            </p>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <FadeIn direction="left">
              <div className="glass p-1 rounded-xl shadow-xl overflow-hidden border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Screen recording mode" 
                  className="rounded-lg"
                />
              </div>
            </FadeIn>
            
            <FadeIn direction="right" delay={100}>
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <BrainCog className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">Learn Mode</h3>
                <p className="text-muted-foreground">
                  WZRD observes how you work by recording your screen and analyzing your workflow patterns. It identifies repetitive tasks and learns your preferences over time.
                </p>
                <ul className="space-y-3">
                  {['Screen recording with privacy controls', 'Task pattern recognition', 'Contextual understanding'].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
            
            <FadeIn direction="left" delay={200}>
              <div className="space-y-6 md:order-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">Act Mode</h3>
                <p className="text-muted-foreground">
                  Based on what it learns, WZRD can automate repetitive tasks, provide contextual suggestions, and even complete entire workflows for you.
                </p>
                <ul className="space-y-3">
                  {['Automated workflow execution', 'Smart contextual suggestions', 'Customizable automation rules'].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
            
            <FadeIn direction="right" delay={300} className="md:order-1">
              <div className="glass p-1 rounded-xl shadow-xl overflow-hidden border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1629904853716-f0bc54eea481?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Automation mode" 
                  className="rounded-lg"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="container">
          <FadeIn className="text-center mb-12">
            <h2 className="font-bold mb-4">Trusted by Knowledge Workers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              See how our digital assistant is transforming workflows across industries.
            </p>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                name: "Alex Chen",
                role: "Project Manager",
                image: "https://randomuser.me/api/portraits/men/32.jpg",
                quote: "WZRD has completely transformed how I manage projects. It automates status updates, meeting notes, and follow-ups, saving me hours every week.",
              },
              {
                name: "Sophia Rodriguez",
                role: "Marketing Director",
                image: "https://randomuser.me/api/portraits/women/44.jpg",
                quote: "The contextual assistance is mind-blowing. WZRD knows exactly what I need when I'm working on campaigns and provides relevant data without me asking.",
              },
              {
                name: "Marcus Johnson",
                role: "Software Developer",
                image: "https://randomuser.me/api/portraits/men/22.jpg",
                quote: "As a developer, I was skeptical about AI assistance, but WZRD has proven invaluable. It handles routine coding tasks and documentation so I can focus on complex problems.",
              }
            ].map((testimonial, i) => (
              <FadeIn key={i} delay={i * 100} direction="up">
                <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-white/10 hover:shadow-md transition-all h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 mr-3">
                      <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium text-base">{testimonial.name}</h4>
                      <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="mb-4 text-amber-400 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground flex-grow">
                    "{testimonial.quote}"
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <FadeIn className="text-center mb-12">
            <h2 className="font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$9",
                description: "Perfect for individuals and small workflows",
                features: [
                  "Up to 10 automated tasks per day",
                  "Basic screen analysis",
                  "7-day history",
                  "Email support"
                ],
                highlight: false,
                cta: "Start Free Trial"
              },
              {
                name: "Professional",
                price: "$29",
                description: "Ideal for knowledge workers and professionals",
                features: [
                  "Unlimited automated tasks",
                  "Advanced pattern recognition",
                  "30-day history",
                  "Priority support",
                  "Custom automation rules"
                ],
                highlight: true,
                cta: "Start Free Trial"
              },
              {
                name: "Team",
                price: "$99",
                description: "For teams looking to boost productivity",
                features: [
                  "Everything in Professional",
                  "Up to 10 team members",
                  "Team workflow sharing",
                  "Analytics dashboard",
                  "Dedicated support"
                ],
                highlight: false,
                cta: "Contact Sales"
              }
            ].map((plan, i) => (
              <FadeIn key={i} delay={i * 100} direction="up">
                <div className={`rounded-xl p-6 h-full flex flex-col ${plan.highlight 
                  ? 'border-2 border-primary/50 shadow-lg shadow-primary/10 relative bg-gradient-to-b from-primary/5 to-primary/10' 
                  : 'border border-border shadow-sm'}`}>
                  
                  {plan.highlight && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant={plan.highlight ? "default" : "outline"} 
                    size="lg" 
                    className="w-full mt-auto"
                  >
                    {plan.cta}
                  </Button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <FadeIn className="text-center mb-12">
            <h2 className="font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Everything you need to know about WZRD and how it can help you.
            </p>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                question: "How does WZRD learn my workflow?",
                answer: "WZRD uses secure screen recording to analyze your work patterns. It identifies repetitive tasks, common tools, and contextual clues to understand your workflow. All analysis happens on your device for privacy."
              },
              {
                question: "Is my data secure and private?",
                answer: "Absolutely. WZRD processes your screen data locally whenever possible, and any data sent to our servers is fully encrypted. We never store your screen recordings, and you can delete all your data at any time."
              },
              {
                question: "How much time can WZRD save me?",
                answer: "Most users report saving 5-10 hours per week once WZRD has learned their common workflows. The time savings increase as WZRD learns more about your work patterns."
              },
              {
                question: "Does WZRD work with all applications?",
                answer: "WZRD works with most desktop and web applications on Windows and macOS. It can observe and interact with any application visible on your screen, though some specialized software may have limitations."
              },
              {
                question: "Can I customize which tasks WZRD automates?",
                answer: "Yes, you have full control. You can approve, modify, or reject any automation WZRD suggests, and set rules for which applications or tasks should be automated."
              },
              {
                question: "How is WZRD different from other AI assistants?",
                answer: "Unlike general AI assistants, WZRD is specifically designed for knowledge workers and focuses on learning and automating your digital tasks. It combines screen understanding with workflow automation in a unique way."
              }
            ].map((faq, i) => (
              <FadeIn key={i} delay={i * 50}>
                <div className="rounded-lg p-6 bg-card/50 backdrop-blur-sm border border-border hover:border-primary/20 transition-all">
                  <h4 className="font-medium text-lg mb-2">{faq.question}</h4>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 right-0 h-3/4 bg-gradient-to-b from-primary/5 to-transparent"></div>
        </div>
        
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <div className="glass p-8 md:p-12 rounded-2xl shadow-xl border border-white/10">
                <h2 className="font-bold mb-4">Ready to Transform Your Workflow?</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
                  Join thousands of knowledge workers who are using WZRD to work smarter, not harder.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="px-8">
                    Get Started for Free
                  </Button>
                  <Button variant="outline" size="lg">
                    Schedule a Demo
                  </Button>
                </div>
                <div className="mt-8 text-sm text-muted-foreground">
                  No credit card required • 14-day free trial • Cancel anytime
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
