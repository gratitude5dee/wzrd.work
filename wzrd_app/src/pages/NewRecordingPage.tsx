
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import FadeIn from '../components/animations/FadeIn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import RecordingForm from '../components/dashboard/RecordingForm';

const NewRecordingPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <DashboardLayout>
      <FadeIn>
        <div className="space-y-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-4"
              onClick={() => navigate('/dashboard/recordings')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">New Recording</h1>
              <p className="text-muted-foreground">
                Submit a new screen recording for analysis
              </p>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recording Details</CardTitle>
              <CardDescription>
                Provide information about the screen recording you want to analyze
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecordingForm />
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </DashboardLayout>
  );
};

export default NewRecordingPage;
