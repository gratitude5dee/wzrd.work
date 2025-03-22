
import React from 'react';
import { UsagePatternData } from '@/hooks/use-action-analytics';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  ResponsiveContainer, 
  AreaChart,
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
} from 'recharts';

interface OverviewChartProps {
  usagePatterns: UsagePatternData | null;
}

const OverviewChart: React.FC<OverviewChartProps> = ({ usagePatterns }) => {
  // Format date in a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  // Format time value for y-axis
  const formatTime = (value: number) => {
    if (value < 60) {
      return `${value}s`;
    } else if (value < 3600) {
      return `${Math.round(value / 60)}m`;
    } else {
      return `${Math.round(value / 3600)}h`;
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!usagePatterns || !usagePatterns.executionTimes.length) {
      return [];
    }

    // Combine data from all patterns
    return usagePatterns.executionTimes.map((item, index) => {
      const executionCount = usagePatterns.executionCounts[index]?.value || 0;
      const successRate = usagePatterns.successRates[index]?.value || 0;
      
      return {
        date: formatDate(item.date),
        executionTime: item.value,
        executionCount,
        successRate
      };
    });
  };

  const chartData = prepareChartData();

  // Define chart configuration
  const chartConfig = {
    executionTime: { label: 'Time Saved' },
    executionCount: { label: 'Executions' },
    successRate: { label: 'Success Rate' }
  };

  if (!usagePatterns || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Not enough data to display chart</p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="executionTimeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={formatTime}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip content={<ChartTooltipContent />} />
          <Area 
            type="monotone" 
            dataKey="executionTime" 
            stroke="#8b5cf6" 
            fillOpacity={1}
            fill="url(#executionTimeGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default OverviewChart;
