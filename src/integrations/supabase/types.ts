export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      action_executions: {
        Row: {
          action_id: string | null
          created_at: string | null
          error_message: string | null
          execution_data: Json | null
          id: string
          progress: number | null
          result: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          action_id?: string | null
          created_at?: string | null
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          progress?: number | null
          result?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          action_id?: string | null
          created_at?: string | null
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          progress?: number | null
          result?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_executions_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
        ]
      }
      actions: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          examples: string[] | null
          expected_outcome: string | null
          id: string
          name: string
          prerequisites: string[] | null
          prompt: string | null
          steps: Json
          triggers: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          examples?: string[] | null
          expected_outcome?: string | null
          id?: string
          name: string
          prerequisites?: string[] | null
          prompt?: string | null
          steps?: Json
          triggers?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          examples?: string[] | null
          expected_outcome?: string | null
          id?: string
          name?: string
          prerequisites?: string[] | null
          prompt?: string | null
          steps?: Json
          triggers?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_data: {
        Row: {
          action_id: string | null
          context: Json | null
          created_at: string | null
          id: string
          metric_type: string
          metric_value: number | null
          user_id: string
        }
        Insert: {
          action_id?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string
          metric_type: string
          metric_value?: number | null
          user_id: string
        }
        Update: {
          action_id?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string
          metric_type?: string
          metric_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_data_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "workflow_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_logs: {
        Row: {
          action_id: string
          checkpoints_cancelled: number | null
          checkpoints_modified: number | null
          checkpoints_shown: number | null
          created_at: string | null
          duration_seconds: number | null
          end_time: string | null
          error_message: string | null
          execution_data: Json | null
          id: string
          start_time: string | null
          status: string
          user_id: string
        }
        Insert: {
          action_id: string
          checkpoints_cancelled?: number | null
          checkpoints_modified?: number | null
          checkpoints_shown?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          start_time?: string | null
          status?: string
          user_id: string
        }
        Update: {
          action_id?: string
          checkpoints_cancelled?: number | null
          checkpoints_modified?: number | null
          checkpoints_shown?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          start_time?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_logs_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "workflow_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      screen_recordings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          raw_data: Json | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          raw_data?: Json | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          raw_data?: Json | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          checkpoint_frequency: string
          created_at: string | null
          id: string
          importance_threshold: number
          saved_decisions: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          checkpoint_frequency?: string
          created_at?: string | null
          id?: string
          importance_threshold?: number
          saved_decisions?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          checkpoint_frequency?: string
          created_at?: string | null
          id?: string
          importance_threshold?: number
          saved_decisions?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workflow_actions: {
        Row: {
          action_data: Json | null
          action_type: string
          checkpoint_config: Json | null
          confidence_score: number | null
          created_at: string
          description: string | null
          estimated_time_seconds: number | null
          id: string
          instructions: string | null
          name: string | null
          tags: string[] | null
          thumbnail_url: string | null
          understanding_id: string
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          checkpoint_config?: Json | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          estimated_time_seconds?: number | null
          id?: string
          instructions?: string | null
          name?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          understanding_id: string
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          checkpoint_config?: Json | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          estimated_time_seconds?: number | null
          id?: string
          instructions?: string | null
          name?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          understanding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_actions_understanding_id_fkey"
            columns: ["understanding_id"]
            isOneToOne: false
            referencedRelation: "workflow_understandings"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_understandings: {
        Row: {
          actions_identified: number | null
          analysis_summary: string | null
          created_at: string
          gemini_response: Json | null
          id: string
          processed_data: Json | null
          recording_id: string
          status: string
          updated_at: string
        }
        Insert: {
          actions_identified?: number | null
          analysis_summary?: string | null
          created_at?: string
          gemini_response?: Json | null
          id?: string
          processed_data?: Json | null
          recording_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          actions_identified?: number | null
          analysis_summary?: string | null
          created_at?: string
          gemini_response?: Json | null
          id?: string
          processed_data?: Json | null
          recording_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_understandings_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "screen_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
