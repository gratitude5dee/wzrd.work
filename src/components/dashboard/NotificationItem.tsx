
import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface NotificationItemProps {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  read: boolean;
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  title,
  message,
  type,
  time,
  read,
  onMarkAsRead,
  onDismiss
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };
  
  const getTimeString = () => {
    const date = new Date(time);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };
  
  return (
    <Card glass={true} className={cn(
      "relative p-4 transition-all duration-300 hover:shadow-md",
      !read ? "border-l-4 border-l-orange-light" : "",
      "bg-black/30 backdrop-blur-md"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent opacity-70 pointer-events-none rounded-xl"></div>
      
      <div className="flex items-start gap-3 relative z-10">
        <div className={cn(
          "rounded-full p-2",
          type === 'success' ? "bg-green-500/20" : "",
          type === 'warning' ? "bg-amber-500/20" : "",
          type === 'error' ? "bg-red-500/20" : "",
          type === 'info' ? "bg-blue-500/20" : ""
        )}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className={cn(
              "font-medium text-white text-shadow-sm",
              !read ? "font-semibold" : ""
            )}>
              {title}
            </h4>
            <span className="text-xs text-white/60 whitespace-nowrap ml-2">{getTimeString()}</span>
          </div>
          <p className="text-sm text-white/80 mt-1 text-shadow-sm">{message}</p>
          
          {!read && onMarkAsRead && (
            <div className="mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs p-0 h-auto text-white/70 hover:text-white"
                onClick={() => onMarkAsRead(id)}
              >
                Mark as read
              </Button>
            </div>
          )}
        </div>
        
        {onDismiss && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 h-auto text-white/50 hover:text-white hover:bg-white/10"
            onClick={() => onDismiss(id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};

export default NotificationItem;
