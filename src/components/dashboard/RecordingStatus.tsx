
import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, Loader2, PlayCircle } from "lucide-react";
import { useTriggerProcessing, useRecordingStatus } from '@/services/recordingService';
import { format, formatDistanceToNow } from 'date-fns';

interface RecordingStatusProps {
  recordingId: string;
}

const RecordingStatus: React.FC<RecordingStatusProps> = ({ recordingId }) => {
  const { data: statusData, isLoading, error } = useRecordingStatus(recordingId);
  const triggerProcessing = useTriggerProcessing();
  
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading status...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center space-x-2 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span>Error loading status</span>
      </div>
    );
  }
  
  if (!statusData) {
    return (
      <div className="flex items-center space-x-2 text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span>No status data available</span>
      </div>
    );
  }
  
  const handleRetryProcessing = () => {
    triggerProcessing.mutate(recordingId);
  };
  
  const getStatusBadge = () => {
    switch (statusData.status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const getStatusIcon = () => {
    switch (statusData.status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getProgressValue = () => {
    switch (statusData.status) {
      case 'pending':
        return 0;
      case 'processing':
        return 50;
      case 'completed':
        return 100;
      case 'error':
        return 100;
      default:
        return 0;
    }
  };
  
  const updatedAt = new Date(statusData.updated_at);
  
  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <div>
            <h4 className="font-medium">Processing Status</h4>
            <p className="text-sm text-muted-foreground">
              Last updated: {formatDistanceToNow(updatedAt, { addSuffix: true })}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>
      
      <Progress value={getProgressValue()} className="h-2" />
      
      <div className="text-sm text-muted-foreground">
        {statusData.status === 'pending' && (
          <p>Waiting to start processing. This may take a moment.</p>
        )}
        {statusData.status === 'processing' && (
          <p>Your recording is being analyzed. This may take several minutes.</p>
        )}
        {statusData.status === 'completed' && (
          <p>Processing completed on {format(updatedAt, 'PPP p')}.</p>
        )}
        {statusData.status === 'error' && (
          <div className="space-y-2">
            <p>There was an error processing your recording.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetryProcessing}
              disabled={triggerProcessing.isPending}
              className="flex items-center space-x-2"
            >
              {triggerProcessing.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4 mr-2" />
              )}
              <span>Retry Processing</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingStatus;
