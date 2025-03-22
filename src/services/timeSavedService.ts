
import { ExecutionLog } from "@/hooks/use-action-analytics";

export interface TimelineDataPoint {
  date: string;
  value: number;
  count: number;
}

export const calculateTimelineData = (executionLogs: ExecutionLog[]): TimelineDataPoint[] => {
  if (!executionLogs || executionLogs.length === 0) {
    return [];
  }

  // Group logs by date
  const logsByDate: Record<string, { date: string; count: number; timeSaved: number }> = {};
  
  executionLogs.forEach(log => {
    const date = new Date(log.created_at).toISOString().split('T')[0];
    
    if (!logsByDate[date]) {
      logsByDate[date] = { date, count: 0, timeSaved: 0 };
    }
    
    logsByDate[date].count += 1;
    logsByDate[date].timeSaved += log.time_saved || 0;
  });

  // Convert to array and sort by date
  return Object.values(logsByDate)
    .map(item => ({
      date: item.date,
      value: item.timeSaved,
      count: item.count
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};
