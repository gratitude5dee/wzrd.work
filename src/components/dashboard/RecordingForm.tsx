
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSubmitRecording } from '@/services/recordingService';
import { Loader2, Upload } from "lucide-react";
import { useNavigate } from 'react-router-dom';

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().optional(),
  // In a real app, you'd validate rawData too
  rawData: z.any()
});

type FormValues = z.infer<typeof formSchema>;

const RecordingForm: React.FC = () => {
  const navigate = useNavigate();
  const submitRecording = useSubmitRecording();
  
  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      rawData: null
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    try {
      // For demonstration, create some mock raw data
      // In a real app, this would come from the screenpipe library
      const mockRawData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        duration: 120, // seconds
        events: [
          {
            type: "click",
            timestamp: new Date().toISOString(),
            target: { type: "button", id: "submit-btn", text: "Submit" },
            position: { x: 100, y: 200 }
          },
          {
            type: "keypress",
            timestamp: new Date().toISOString(),
            target: { type: "input", id: "search-input" },
            value: "search query"
          },
          // More mock events...
        ]
      };
      
      const result = await submitRecording.mutateAsync({
        title: values.title,
        description: values.description || '',
        rawData: values.rawData || mockRawData
      });
      
      // Navigate to the recording details page
      if (result?.recordingId) {
        navigate(`/dashboard/recordings/${result.recordingId}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Error handling is done in the mutation hook
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recording Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a title for this recording" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what this recording contains" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="border rounded-lg p-6 bg-muted/20">
          <div className="text-center space-y-2">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="font-medium">Upload Recording Data</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              In a real application, this would integrate with screenpipe to capture and upload screen recording data.
              For this demo, mock data will be generated.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={submitRecording.isPending}
            className="flex items-center space-x-2"
          >
            {submitRecording.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <span>Submit Recording</span>
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RecordingForm;
