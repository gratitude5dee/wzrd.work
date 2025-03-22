
import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItemProps {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  time: string; // ISO string or formatted time
  read?: boolean;
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  title,
  message,
  type,
  time,
  read = false,
  onMarkAsRead,
  onDismiss
}) => {
  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
  };

  const timeAgo = (timeString: string) => {
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return timeString;
    }
  };

  return (
    <div className={cn(
      'relative p-4 rounded-lg border mb-2 transition-all duration-200',
      typeStyles[type],
      !read && 'shadow-md'
    )}>
      {!read && (
        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary animate-pulse" />
      )}
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-sm">{title}</h4>
        <span className="text-xs text-muted-foreground">{timeAgo(time)}</span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{message}</p>
      
      <div className="flex gap-2 mt-3 justify-end">
        {!read && onMarkAsRead && (
          <button 
            onClick={() => onMarkAsRead(id)}
            className="inline-flex items-center text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
          >
            <Check className="h-3 w-3 mr-1" />
            Mark as read
          </button>
        )}
        {onDismiss && (
          <button 
            onClick={() => onDismiss(id)}
            className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-3 w-3 mr-1" />
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
