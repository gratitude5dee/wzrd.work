import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import MetricCard from '../components/dashboard/MetricCard';
import EmptyState from '../components/dashboard/EmptyState';
import NotificationItem, { NotificationItemProps } from '../components/dashboard/NotificationItem';
import { useStytchUser } from '../contexts/StytchContext';
import FadeIn from '../components/animations/FadeIn';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainCog, Fingerprint, Lightbulb, Timer, CheckCheck, Sparkles, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useStytchUser();
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Mock data for a new user
  const isNewUser = true;
  const actionsLearned = 0;
  const actionsExecuted = 0;
  const timeSaved = 0;
  
  // Mock notifications
  const [notifications, setNotifications] = useState<NotificationItemProps[]>([
    {
      id: '1',
      title: 'Welcome to WZRD!',
      message: 'Start by recording your workflow to teach WZRD how you work.',
      type: 'info',
      time: new Date().toISOString(),
      read: false
    },
    {
      id: '2',
      title: 'New Features Available',
      message: 'Check out our new keyboard shortcut detection system.',
      type: 'success',
      time: new Date(Date.now() - 3600000).toISOString(),
      read: false
    },
    {
      id: '3',
      title: 'Upgrade Your Plan',
      message: 'Upgrade to Pro for unlimited recording and automation.',
      type: 'warning',
      time: new Date(Date.now() - 86400000).toISOString(),
      read: true
    }
  ]);
  
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };
  
  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };
  
  const userName = user?.name?.first_name || (user?.emails?.[0]?.email?.split('@')[0]) || 'there';
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Navigate to corresponding routes for Learn and Act tabs
    if (value === 'learn') {
      navigate('/dashboard/recordings');
    } else if (value === 'act') {
      navigate('/dashboard/act');
    }
  };
  
  return (
    <DashboardLayout>
      <FadeIn>
        <div className="flex flex-col gap-6">
          {/* Welcome section with enhanced text contrast */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/30 p-4 rounded-xl backdrop-blur-sm">
            <div>
              <h1 className="text-3xl font-bold mb-1 text-white text-shadow">Welcome, {userName}!</h1>
              <p className="text-white/90 text-shadow-sm">
                {isNewUser 
                  ? "Let's get started with automating your work." 
                  : "Here's your productivity overview for today."}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2 bg-black/30 text-white border-white/20 hover:bg-black/40 hover:border-white/30">
                <Lightbulb className="h-4 w-4" />
                View Tutorial
              </Button>
              <Button className="gap-2 bg-gradient-orange text-white border-none" onClick={() => navigate('/dashboard/recordings/new')}>
                <BrainCog className="h-4 w-4" />
                Start Recording
              </Button>
            </div>
          </div>
          
          {/* Main tabs section moved to the top */}
          <div className="flex justify-center w-full mb-6">
            <Tabs defaultValue="overview" onValueChange={handleTabChange} className="w-full space-y-6">
              <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3 bg-black/50 backdrop-blur-md rounded-xl p-1.5 shadow-lg border border-white/10">
                <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-gradient-orange data-[state=active]:text-white py-8 text-white/90 rounded-lg">
                  <Sparkles className="h-6 w-6" />
                  <span className="text-xl font-medium">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="learn" className="gap-2 data-[state=active]:bg-gradient-orange data-[state=active]:text-white py-8 text-white/90 rounded-lg">
                  <BrainCog className="h-6 w-6" />
                  <span className="text-xl font-medium">Learn</span>
                </TabsTrigger>
                <TabsTrigger value="act" className="gap-2 data-[state=active]:bg-gradient-orange data-[state=active]:text-white py-8 text-white/90 rounded-lg">
                  <Fingerprint className="h-6 w-6" />
                  <span className="text-xl font-medium">Act</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Card-style buttons for each tab content */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard 
                    title="Actions Learned" 
                    value={actionsLearned}
                    description="Workflows that WZRD has learned"
                    icon={BrainCog}
                  />
                  <MetricCard 
                    title="Actions Executed" 
                    value={actionsExecuted}
                    description="Automated workflows run by WZRD"
                    icon={CheckCheck}
                  />
                  <MetricCard 
                    title="Time Saved" 
                    value={`${timeSaved}h`}
                    description="Hours saved through automation"
                    icon={Timer}
                  />
                </div>
                
                {isNewUser ? (
                  <EmptyState 
                    title="No activity yet" 
                    description="Start by recording your workflow in Learn mode to teach WZRD how you work."
                    icon={Lightbulb}
                    action={{
                      label: "Start Learning",
                      onClick: () => handleTabChange('learn')
                    }}
                    className="my-8"
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-lg border shadow-sm p-6">
                      <h3 className="font-medium mb-4">Recent Activity</h3>
                      {/* Activity content would go here */}
                      <p className="text-muted-foreground text-sm">No recent activity to display.</p>
                    </div>
                    <div className="rounded-lg border shadow-sm p-6">
                      <h3 className="font-medium mb-4">Suggested Actions</h3>
                      {/* Suggested actions would go here */}
                      <p className="text-muted-foreground text-sm">No suggested actions available.</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="learn" className="space-y-6">
                <div className="max-w-3xl mx-auto">
                  <Card className="glass-card shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-8 text-center">
                        <BrainCog className="w-16 h-16 mx-auto mb-4 text-white/90" />
                        <h2 className="text-2xl font-bold mb-4 text-white text-shadow">Learn Mode</h2>
                        <p className="text-white/90 text-shadow-sm mb-6 max-w-lg mx-auto">
                          In this mode, WZRD observes how you work and learns your patterns. Start a recording session to help WZRD understand your workflow.
                        </p>
                        <div className="bg-black/30 rounded-lg p-4 border border-white/20 mb-6 max-w-lg mx-auto">
                          <p className="text-sm text-white/90 text-shadow-sm">
                            <strong>Privacy Note:</strong> Screen recordings are processed locally first for privacy. You control what data is shared.
                          </p>
                        </div>
                        <Button 
                          onClick={() => navigate('/dashboard/recordings/new')} 
                          className="bg-gradient-orange text-white border-none text-lg py-6 px-8 rounded-xl shadow-lg hover:shadow-xl">
                          Start Recording
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="act" className="space-y-6">
                <div className="max-w-3xl mx-auto">
                  <Card className="glass-card shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-8 text-center">
                        <Fingerprint className="w-16 h-16 mx-auto mb-4 text-white/90" />
                        <h2 className="text-2xl font-bold mb-4 text-white text-shadow">Act Mode</h2>
                        <p className="text-white/90 text-shadow-sm mb-6 max-w-lg mx-auto">
                          Based on what WZRD has learned, it can help you automate tasks. This feature will be available once WZRD learns your workflow.
                        </p>
                        <div className="relative rounded-lg overflow-hidden bg-black/20 p-6 border border-dashed border-white/20 mb-6 max-w-lg mx-auto">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-light/10 to-transparent animate-shimmer"></div>
                          <p className="text-white/80 text-shadow-sm">
                            No automations available yet. Complete a learning session first.
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => handleTabChange('learn')}
                          className="bg-black/30 text-white border-white/20 hover:bg-black/40 hover:border-white/30 text-lg py-6 px-8 rounded-xl">
                          Start Learning First
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Notifications section with improved contrast */}
          <div className="mt-6 glass-card p-4">
            <div className="flex items-center gap-2 mb-4 p-2 bg-black/20 rounded-lg">
              <Bell className="h-5 w-5 text-orange-light" />
              <h2 className="text-xl font-semibold text-white text-shadow">Notifications</h2>
              <span className="text-xs bg-orange-light/20 text-white px-2 py-0.5 rounded-full text-shadow-sm">
                {notifications.filter(n => !n.read).length} unread
              </span>
            </div>
            
            <div className="space-y-2">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <NotificationItem 
                    key={notification.id}
                    {...notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDismiss={handleDismiss}
                  />
                ))
              ) : (
                <p className="text-white/80 text-shadow-sm text-sm py-4">No notifications to display.</p>
              )}
            </div>
          </div>
        </div>
      </FadeIn>
    </DashboardLayout>
  );
};

export default Dashboard;
