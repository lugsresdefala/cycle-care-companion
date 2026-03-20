export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      exam_history: {
        Row: {
          calc_type: Database["public"]["Enums"]["calculation_type"]
          created_at: string
          doctor_id: string
          gestational_age_days: number | null
          gestational_age_weeks: number | null
          id: string
          input_data: Json
          notes: string | null
          patient_id: string | null
          result_data: Json
        }
        Insert: {
          calc_type: Database["public"]["Enums"]["calculation_type"]
          created_at?: string
          doctor_id: string
          gestational_age_days?: number | null
          gestational_age_weeks?: number | null
          id?: string
          input_data?: Json
          notes?: string | null
          patient_id?: string | null
          result_data?: Json
        }
        Update: {
          calc_type?: Database["public"]["Enums"]["calculation_type"]
          created_at?: string
          doctor_id?: string
          gestational_age_days?: number | null
          gestational_age_weeks?: number | null
          id?: string
          input_data?: Json
          notes?: string | null
          patient_id?: string | null
          result_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "exam_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          age: number | null
          created_at: string
          doctor_id: string
          id: string
          medical_record_id: string | null
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          doctor_id: string
          id?: string
          medical_record_id?: string | null
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          created_at?: string
          doctor_id?: string
          id?: string
          medical_record_id?: string | null
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          crm_number: string | null
          full_name: string
          id: string
          phone: string | null
          specialty: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          crm_number?: string | null
          full_name?: string
          id: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          crm_number?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_months: number
          features: Json
          id: string
          is_active: boolean
          name: string
          price_cents: number
          stripe_price_id: string | null
          tier: Database["public"]["Enums"]["plan_tier"]
          tokens_per_period: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_months?: number
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price_cents?: number
          stripe_price_id?: string | null
          tier: Database["public"]["Enums"]["plan_tier"]
          tokens_per_period?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_months?: number
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
          tier?: Database["public"]["Enums"]["plan_tier"]
          tokens_per_period?: number
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          doctor_id: string
          end_date: string
          id: string
          plan_id: string
          start_date: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tokens_remaining: number
          tokens_used: number
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          end_date: string
          id?: string
          plan_id: string
          start_date?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tokens_remaining?: number
          tokens_used?: number
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          end_date?: string
          id?: string
          plan_id?: string
          start_date?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tokens_remaining?: number
          tokens_used?: number
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_remaining_tokens: { Args: { _user_id: string }; Returns: number }
      has_active_subscription: { Args: { _user_id: string }; Returns: boolean }
      is_in_trial: { Args: { _user_id: string }; Returns: boolean }
      use_token: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      calculation_type:
        | "biometry"
        | "bpd"
        | "crl"
        | "efw"
        | "doppler"
        | "growth_curve"
        | "gestational"
        | "fertility"
      plan_tier: "free_trial" | "basic" | "professional" | "premium"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      calculation_type: [
        "biometry",
        "bpd",
        "crl",
        "efw",
        "doppler",
        "growth_curve",
        "gestational",
        "fertility",
      ],
      plan_tier: ["free_trial", "basic", "professional", "premium"],
    },
  },
} as const
