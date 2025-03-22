
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import MetricCard from '../components/dashboard/MetricCard';
import EmptyState from '../components/dashboard/EmptyState';
import NotificationItem, { NotificationItemProps } from '../components/dashboard/NotificationItem';
import { useAuth } from '../contexts/AuthContext';
import FadeIn from '../components/animations/FadeIn';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainCog, Fingerprint, Lightbulb, Timer, CheckCheck, Sparkles, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
  
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
          {/* Welcome section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Welcome, {userName}!</h1>
              <p className="text-muted-foreground">
                {isNewUser 
                  ? "Let's get started with automating your work." 
                  : "Here's your productivity overview for today."}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Lightbulb className="h-4 w-4" />
                View Tutorial
              </Button>
              <Button className="gap-2" onClick={() => navigate('/dashboard/recordings/new')}>
                <BrainCog className="h-4 w-4" />
                Start Recording
              </Button>
            </div>
          </div>
          
          {/* Metrics section */}
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
          
          {/* Main content tabs */}
          <Tabs defaultValue="overview" onValueChange={handleTabChange} className="space-y-6 pt-4">
            <TabsList className="grid w-full md:w-[400px] grid-cols-3">
              <TabsTrigger value="overview" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="learn" className="gap-2">
                <BrainCog className="h-4 w-4" />
                Learn
              </TabsTrigger>
              <TabsTrigger value="act" className="gap-2">
                <Fingerprint className="h-4 w-4" />
                Act
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
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
                  <Button onClick={() => navigate('/dashboard/recordings/new')}>Start Recording</Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="act" className="space-y-6">
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
                <Button variant="outline" onClick={() => handleTabChange('learn')}>Start Learning First</Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Notifications section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Notifications</h2>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
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
                <p className="text-muted-foreground text-sm py-4">No notifications to display.</p>
              )}
            </div>
          </div>
        </div>
      </FadeIn>
    </DashboardLayout>
  );
};

export default Dashboard;
