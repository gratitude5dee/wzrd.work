
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export type CheckpointFrequency = 'low' | 'medium' | 'high';

export interface UserPreferences {
  id?: string;
  user_id?: string;
  checkpoint_frequency: CheckpointFrequency;
  importance_threshold: number;
  saved_decisions: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, create default preferences
          const defaultPreferences: UserPreferences = {
            user_id: user.id,
            checkpoint_frequency: 'medium',
            importance_threshold: 5,
            saved_decisions: {}
          };

          const { data: insertData, error: insertError } = await supabase
            .from('user_preferences')
            .insert(defaultPreferences)
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }

          setPreferences(insertData);
        } else {
          throw error;
        }
      } else {
        setPreferences(data);
      }
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      setError(err as Error);
      toast({
        title: 'Error loading preferences',
        description: 'There was a problem loading your preferences.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!user || !preferences?.id) {
      toast({
        title: 'Error updating preferences',
        description: 'You must be logged in to update preferences.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('id', preferences.id);

      if (error) {
        throw error;
      }

      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: 'Preferences updated',
        description: 'Your preferences have been saved.'
      });
    } catch (err) {
      console.error('Error updating preferences:', err);
      toast({
        title: 'Error updating preferences',
        description: 'There was a problem saving your preferences.',
        variant: 'destructive'
      });
    }
  }, [user, preferences, toast]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    isLoading,
    error,
    fetchPreferences,
    updatePreferences
  };
}
