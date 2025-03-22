
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import FadeIn from '../components/animations/FadeIn';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRecording, useWorkflowUnderstanding, useWorkflowActions } from '@/services/recordingService';
import RecordingStatus from '../components/dashboard/RecordingStatus';
import { ArrowLeft, Loader2, AlertCircle, FileText, Activity, Zap } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const RecordingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: recording, isLoading: isLoadingRecording, error: recordingError } = useRecording(id || '');
  const { data: understanding, isLoading: isLoadingUnderstanding } = useWorkflowUnderstanding(recording?.id || '');
  const { data: actions, isLoading: isLoadingActions } = useWorkflowActions(understanding?.id || '');
  
  if (isLoadingRecording) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading recording details...</span>
        </div>
      </DashboardLayout>
    );
  }
  
  if (recordingError || !recording) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-medium">Recording not found</h2>
          <p className="text-muted-foreground">
            The recording you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate('/dashboard/recordings')}>
            Go back to recordings
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
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
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-bold">{recording.title}</h1>
                {recording.status === 'completed' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Analyzed</Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Created on {format(new Date(recording.created_at), 'PPP')}
              </p>
            </div>
          </div>
          
          <RecordingStatus recordingId={recording.id} />
          
          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" /> Summary
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center">
                <Activity className="mr-2 h-4 w-4" /> Actions
              </TabsTrigger>
              <TabsTrigger value="automation" className="flex items-center">
                <Zap className="mr-2 h-4 w-4" /> Automation
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Summary</CardTitle>
                  <CardDescription>
                    Overall findings from the workflow analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recording.status !== 'completed' ? (
                    <div className="text-muted-foreground py-4">
                      Summary will be available once the analysis is completed.
                    </div>
                  ) : isLoadingUnderstanding ? (
                    <div className="flex items-center text-muted-foreground py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading summary...
                    </div>
                  ) : understanding?.analysis_summary ? (
                    <div>
                      <p className="whitespace-pre-line">{understanding.analysis_summary}</p>
                    </div>
                  ) : (
                    <div className="text-muted-foreground py-4">
                      No summary available. The analysis might not have produced meaningful results.
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recording Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Description</h4>
                      <p className="text-muted-foreground">
                        {recording.description || "No description provided"}
                      </p>
                    </div>
                    
                    {recording.raw_data?.metadata && (
                      <div>
                        <h4 className="font-medium mb-1">Metadata</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {recording.raw_data.metadata.duration && (
                            <div>
                              <p className="text-sm text-muted-foreground">Duration</p>
                              <p>{recording.raw_data.metadata.duration} seconds</p>
                            </div>
                          )}
                          {recording.raw_data.metadata.totalEvents && (
                            <div>
                              <p className="text-sm text-muted-foreground">Events</p>
                              <p>{recording.raw_data.metadata.totalEvents}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="actions" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Actions</CardTitle>
                  <CardDescription>
                    Individual actions identified in your workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recording.status !== 'completed' ? (
                    <div className="text-muted-foreground py-4">
                      Actions will be available once the analysis is completed.
                    </div>
                  ) : isLoadingActions ? (
                    <div className="flex items-center text-muted-foreground py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading actions...
                    </div>
                  ) : actions && actions.length > 0 ? (
                    <div className="space-y-4">
                      {actions.map(action => (
                        <div key={action.id} className="border rounded-lg p-4">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{action.action_type}</h4>
                            {action.confidence_score !== null && (
                              <Badge variant="outline">
                                {Math.round(action.confidence_score * 100)}% confidence
                              </Badge>
                            )}
                          </div>
                          {action.action_data?.description && (
                            <p className="text-sm mt-2">{action.action_data.description}</p>
                          )}
                          {action.action_data?.steps && action.action_data.steps.length > 0 && (
                            <div className="mt-3">
                              <h5 className="text-sm font-medium mb-1">Steps:</h5>
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {action.action_data.steps.map((step: string, index: number) => (
                                  <li key={index}>{step}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground py-4">
                      No actions were identified in this workflow.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="automation" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Automation Opportunities</CardTitle>
                  <CardDescription>
                    Potential ways to automate parts of your workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recording.status !== 'completed' ? (
                    <div className="text-muted-foreground py-4">
                      Automation suggestions will be available once the analysis is completed.
                    </div>
                  ) : understanding?.gemini_response?.candidates?.[0]?.content?.parts?.[0]?.text ? (
                    <div>
                      {(() => {
                        try {
                          const content = understanding.gemini_response.candidates[0].content.parts[0].text;
                          const jsonMatch = content.match(/\{[\s\S]*\}/);
                          if (jsonMatch) {
                            const jsonContent = JSON.parse(jsonMatch[0]);
                            const opportunities = jsonContent.automationOpportunities || [];
                            
                            if (opportunities.length === 0) {
                              return (
                                <div className="text-muted-foreground py-4">
                                  No automation opportunities were identified in this workflow.
                                </div>
                              );
                            }
                            
                            return (
                              <div className="space-y-4">
                                {opportunities.map((opp: any, index: number) => (
                                  <div key={index} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-medium">{opp.description}</h4>
                                      <Badge variant="outline" className={
                                        opp.impact === 'high' ? 'bg-green-50 text-green-700 border-green-200' :
                                        opp.impact === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                        'bg-blue-50 text-blue-700 border-blue-200'
                                      }>
                                        {opp.impact} impact
                                      </Badge>
                                    </div>
                                    {opp.implementation && (
                                      <div className="mt-3">
                                        <h5 className="text-sm font-medium mb-1">Implementation:</h5>
                                        <p className="text-sm">{opp.implementation}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          } else {
                            return (
                              <div className="text-muted-foreground py-4">
                                No structured automation opportunities found in the analysis.
                              </div>
                            );
                          }
                        } catch (error) {
                          console.error("Error parsing automation opportunities:", error);
                          return (
                            <div className="text-muted-foreground py-4">
                              Error parsing automation opportunities from the analysis.
                            </div>
                          );
                        }
                      })()}
                    </div>
                  ) : (
                    <div className="text-muted-foreground py-4">
                      No automation opportunities available.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </FadeIn>
    </DashboardLayout>
  );
};

export default RecordingDetailsPage;
