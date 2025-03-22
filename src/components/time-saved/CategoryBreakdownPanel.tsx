
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAnalyticsData } from '@/hooks/use-action-analytics';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Folders, Workflow, Search, Mail, Edit, Copy, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface CategoryBreakdownPanelProps {
  userData: UserAnalyticsData | null;
}

const CategoryBreakdownPanel: React.FC<CategoryBreakdownPanelProps> = ({ userData }) => {
  if (!userData) return null;

  // Mock category data - in a real app this would come from analytics
  const categories = [
    { name: 'Document Processing', value: 35, icon: Edit, color: '#8b5cf6', potential: 60 },
    { name: 'Data Entry', value: 25, icon: Copy, color: '#0ea5e9', potential: 45 },
    { name: 'Search & Research', value: 15, icon: Search, color: '#f59e0b', potential: 35 },
    { name: 'Email Management', value: 10, icon: Mail, color: '#10b981', potential: 28 },
    { name: 'Workflow Automation', value: 15, icon: Workflow, color: '#f43f5e', potential: 30 }
  ];

  // Format time in a human-readable way
  const formatTimeSaved = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)} seconds`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)} minutes`;
    } else if (seconds < 86400) {
      return `${Math.round(seconds / 3600 * 10) / 10} hours`;
    } else {
      return `${Math.round(seconds / 86400 * 10) / 10} days`;
    }
  };

  // Calculate absolute time values based on percentages
  const getCategoryTime = (percentage: number) => {
    return (percentage / 100) * userData.totalTimeSaved;
  };

  // Configure chart colors
  const COLORS = categories.map(cat => cat.color);

  // Chart config for the ChartContainer
  const chartConfig = {
    ...Object.fromEntries(
      categories.map(cat => [
        cat.name.toLowerCase().replace(/\s+/g, '_'),
        { label: cat.name, theme: { light: cat.color, dark: cat.color } }
      ])
    )
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folders className="h-5 w-5 text-primary" />
            <span>Task Category Breakdown</span>
          </CardTitle>
          <CardDescription>
            Analyze time saved across different task categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-[300px]">
              <ChartContainer config={chartConfig} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Category List */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Time Saved by Category</h3>
              <div className="space-y-4">
                {categories.map((category, index) => {
                  const timeSaved = getCategoryTime(category.value);
                  const Icon = category.icon;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon style={{ color: category.color }} className="h-4 w-4" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className="text-sm">{formatTimeSaved(timeSaved)}</span>
                      </div>
                      <Progress value={category.value} className="h-2" style={{ 
                        backgroundColor: `${category.color}30`,
                        '--tw-bg-opacity': 0.2 
                      }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <span>Optimization Opportunities</span>
          </CardTitle>
          <CardDescription>
            Areas where you can potentially save more time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map((category, index) => {
              const timeSaved = getCategoryTime(category.value);
              const potentialTime = getCategoryTime(category.potential);
              const remainingPotential = potentialTime - timeSaved;
              const percentRealized = Math.round((category.value / category.potential) * 100);
              const Icon = category.icon;

              return (
                <div key={index} className="p-4 rounded-lg bg-muted/30 border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="p-2 rounded-full" 
                        style={{ backgroundColor: `${category.color}30`, color: category.color }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {percentRealized}% of potential realized
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Optimize
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current</span>
                      <span className="font-medium">{formatTimeSaved(timeSaved)}</span>
                    </div>
                    <Progress value={percentRealized} className="h-2" style={{ 
                      backgroundColor: `${category.color}30`,
                      '--tw-bg-opacity': 0.2 
                    }} />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Potential additional savings</span>
                      <span className="text-primary font-medium">+{formatTimeSaved(remainingPotential)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryBreakdownPanel;
