
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import FadeIn from '../components/animations/FadeIn';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecordings } from '@/services/recordingService';
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { formatDistance } from 'date-fns';

const RecordingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: recordings, isLoading, error } = useRecordings();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Processing
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Completed
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="mr-1 h-3 w-3" /> Error
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <DashboardLayout>
      <FadeIn>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Recordings</h1>
              <p className="text-muted-foreground">
                Manage and analyze your screen recordings
              </p>
            </div>
            <Button onClick={() => navigate('/dashboard/recordings/new')}>
              <Plus className="mr-2 h-4 w-4" /> New Recording
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading recordings...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-destructive">
              <AlertCircle className="h-8 w-8 mr-2" />
              <span>Error loading recordings</span>
            </div>
          ) : recordings && recordings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recordings.map(recording => (
                <Card key={recording.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{recording.title}</CardTitle>
                      {getStatusBadge(recording.status)}
                    </div>
                    <CardDescription>
                      Created {formatDistance(new Date(recording.created_at), new Date(), { addSuffix: true })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm line-clamp-2">
                      {recording.description || "No description provided"}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-auto"
                      onClick={() => navigate(`/dashboard/recordings/${recording.id}`)}
                    >
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/10 p-8">
              <div className="text-center max-w-md">
                <h3 className="text-xl font-medium mb-2">No recordings yet</h3>
                <p className="text-muted-foreground mb-6">
                  Submit your first screen recording to have it analyzed by our AI.
                </p>
                <Button onClick={() => navigate('/dashboard/recordings/new')}>
                  <Plus className="mr-2 h-4 w-4" /> New Recording
                </Button>
              </div>
            </div>
          )}
        </div>
      </FadeIn>
    </DashboardLayout>
  );
};

export default RecordingsPage;
