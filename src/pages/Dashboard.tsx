
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import FadeIn from '../components/animations/FadeIn';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainCog, Fingerprint, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, isLoading } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  if (isLoading) {
    return (
      <Layout className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </Layout>
    );
  }
  
  // In case the user is not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }
  
  const userName = user.user_metadata.full_name || user.email;
  
  return (
    <Layout withNoise glassmorphism>
      <div className="container py-16">
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome, {userName}</h1>
              <p className="text-muted-foreground">Manage your WZRD experience</p>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
          
          <Tabs defaultValue="learn" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="learn" className="gap-2">
                <BrainCog className="w-4 h-4" />
                Learn Mode
              </TabsTrigger>
              <TabsTrigger value="act" className="gap-2">
                <Fingerprint className="w-4 h-4" />
                Act Mode
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="learn" className="space-y-4">
              <div className="glass rounded-xl p-8 shadow-lg border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Learn Mode</h2>
                <p className="text-muted-foreground mb-6">
                  In this mode, WZRD observes how you work and learns your patterns. Start a recording session to help WZRD understand your workflow.
                </p>
                <div className="space-y-4">
                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <p className="text-sm">
                      <strong>Privacy Note:</strong> Screen recordings are processed locally first for privacy. You control what data is shared.
                    </p>
                  </div>
                  <Button>Start Recording</Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="act" className="space-y-4">
              <div className="glass rounded-xl p-8 shadow-lg border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Act Mode</h2>
                <p className="text-muted-foreground mb-6">
                  Based on what WZRD has learned, it can help you automate tasks. This feature will be available once WZRD learns your workflow.
                </p>
                <div className="relative rounded-lg overflow-hidden bg-muted/30 p-6 border border-dashed border-muted mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer"></div>
                  <p className="text-muted-foreground">
                    No automations available yet. Complete a learning session first.
                  </p>
                </div>
                <Button variant="outline">Start Learning First</Button>
              </div>
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </Layout>
  );
};

export default Dashboard;
