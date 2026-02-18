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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_summaries: {
        Row: {
          created_at: string | null
          id: number
          scope: string | null
          summary_text: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          scope?: string | null
          summary_text: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          scope?: string | null
          summary_text?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_summaries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          created_at: string | null
          id: number
          message: string
          resolved_at: string | null
          severity: string | null
          tenant_id: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          message: string
          resolved_at?: string | null
          severity?: string | null
          tenant_id: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          message?: string
          resolved_at?: string | null
          severity?: string | null
          tenant_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      benchmarks: {
        Row: {
          created_at: string
          id: string
          metric_key: string
          metric_label: string
          tenant_id: string
          tier1_max: number
          tier2_max: number
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_key: string
          metric_label: string
          tenant_id: string
          tier1_max?: number
          tier2_max?: number
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_key?: string
          metric_label?: string
          tenant_id?: string
          tier1_max?: number
          tier2_max?: number
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "benchmarks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      csat_responses: {
        Row: {
          comment: string | null
          created_at: string | null
          csat_1_5: number | null
          id: number
          nps_0_10: number | null
          respondent_email: string | null
          tenant_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          csat_1_5?: number | null
          id?: number
          nps_0_10?: number | null
          respondent_email?: string | null
          tenant_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          csat_1_5?: number | null
          id?: number
          nps_0_10?: number | null
          respondent_email?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "csat_responses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_tracking: {
        Row: {
          avg_days_to_payment: number | null
          cash_collected: number | null
          costs_ads: number | null
          costs_other: number | null
          costs_personnel: number | null
          costs_tools: number | null
          created_at: string
          id: string
          invoices_open_amount: number | null
          invoices_open_count: number | null
          invoices_overdue_amount: number | null
          invoices_overdue_count: number | null
          notes: string | null
          period_month: string
          revenue_onetime: number | null
          revenue_recurring: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          avg_days_to_payment?: number | null
          cash_collected?: number | null
          costs_ads?: number | null
          costs_other?: number | null
          costs_personnel?: number | null
          costs_tools?: number | null
          created_at?: string
          id?: string
          invoices_open_amount?: number | null
          invoices_open_count?: number | null
          invoices_overdue_amount?: number | null
          invoices_overdue_count?: number | null
          notes?: string | null
          period_month: string
          revenue_onetime?: number | null
          revenue_recurring?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          avg_days_to_payment?: number | null
          cash_collected?: number | null
          costs_ads?: number | null
          costs_other?: number | null
          costs_personnel?: number | null
          costs_tools?: number | null
          created_at?: string
          id?: string
          invoices_open_amount?: number | null
          invoices_open_count?: number | null
          invoices_overdue_amount?: number | null
          invoices_overdue_count?: number | null
          notes?: string | null
          period_month?: string
          revenue_onetime?: number | null
          revenue_recurring?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_tracking_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fulfillment_tracking: {
        Row: {
          churn_reason: string | null
          contract_end: string | null
          contract_renewed: boolean | null
          contract_start: string | null
          created_at: string
          csat_score: number | null
          deal_closed_at: string | null
          id: string
          milestones_completed: number | null
          milestones_total: number | null
          notes: string | null
          nps_score: number | null
          onboarding_completed_at: string | null
          onboarding_started_at: string | null
          project_actual_end: string | null
          project_planned_end: string | null
          project_start_date: string | null
          project_status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          churn_reason?: string | null
          contract_end?: string | null
          contract_renewed?: boolean | null
          contract_start?: string | null
          created_at?: string
          csat_score?: number | null
          deal_closed_at?: string | null
          id?: string
          milestones_completed?: number | null
          milestones_total?: number | null
          notes?: string | null
          nps_score?: number | null
          onboarding_completed_at?: string | null
          onboarding_started_at?: string | null
          project_actual_end?: string | null
          project_planned_end?: string | null
          project_start_date?: string | null
          project_status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          churn_reason?: string | null
          contract_end?: string | null
          contract_renewed?: boolean | null
          contract_start?: string | null
          created_at?: string
          csat_score?: number | null
          deal_closed_at?: string | null
          id?: string
          milestones_completed?: number | null
          milestones_total?: number | null
          notes?: string | null
          nps_score?: number | null
          onboarding_completed_at?: string | null
          onboarding_started_at?: string | null
          project_actual_end?: string | null
          project_planned_end?: string | null
          project_start_date?: string | null
          project_status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fulfillment_tracking_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      health_scores: {
        Row: {
          color: string | null
          created_at: string | null
          id: number
          rationale_text: string | null
          score: number
          tenant_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: number
          rationale_text?: string | null
          score: number
          tenant_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: number
          rationale_text?: string | null
          score?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_scores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_entries: {
        Row: {
          appointments_scheduled: number | null
          created_at: string
          engagement_rate: number | null
          id: string
          impressions: number | null
          leads_generated: number | null
          new_followers: number | null
          posts_count: number | null
          qualified_leads: number | null
          revenue: number | null
          sales_closed: number | null
          updated_at: string
          user_id: string
          week_start_date: string
        }
        Insert: {
          appointments_scheduled?: number | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          leads_generated?: number | null
          new_followers?: number | null
          posts_count?: number | null
          qualified_leads?: number | null
          revenue?: number | null
          sales_closed?: number | null
          updated_at?: string
          user_id: string
          week_start_date: string
        }
        Update: {
          appointments_scheduled?: number | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          leads_generated?: number | null
          new_followers?: number | null
          posts_count?: number | null
          qualified_leads?: number | null
          revenue?: number | null
          sales_closed?: number | null
          updated_at?: string
          user_id?: string
          week_start_date?: string
        }
        Relationships: []
      }
      metrics_snapshot: {
        Row: {
          appointments: number | null
          calls_interested: number | null
          calls_made: number | null
          calls_reached: number | null
          cash_collected: number | null
          closings: number | null
          closings_held: number | null
          closings_planned: number | null
          comments: number | null
          created_at: string | null
          deal_volume: number | null
          deals: number | null
          dms_sent: number | null
          followers_current: number | null
          id: number
          impressions: number | null
          leads_qualified: number | null
          leads_total: number | null
          likes: number | null
          link_clicks: number | null
          monthly_retainer: number | null
          new_followers: number | null
          period_date: string
          period_type: string | null
          post_type: string | null
          post_url: string | null
          posts: string | null
          revenue: number | null
          settings_held: number | null
          settings_planned: number | null
          tenant_id: string
          words_spoken: number | null
        }
        Insert: {
          appointments?: number | null
          calls_interested?: number | null
          calls_made?: number | null
          calls_reached?: number | null
          cash_collected?: number | null
          closings?: number | null
          closings_held?: number | null
          closings_planned?: number | null
          comments?: number | null
          created_at?: string | null
          deal_volume?: number | null
          deals?: number | null
          dms_sent?: number | null
          followers_current?: number | null
          id?: number
          impressions?: number | null
          leads_qualified?: number | null
          leads_total?: number | null
          likes?: number | null
          link_clicks?: number | null
          monthly_retainer?: number | null
          new_followers?: number | null
          period_date: string
          period_type?: string | null
          post_type?: string | null
          post_url?: string | null
          posts?: string | null
          revenue?: number | null
          settings_held?: number | null
          settings_planned?: number | null
          tenant_id: string
          words_spoken?: number | null
        }
        Update: {
          appointments?: number | null
          calls_interested?: number | null
          calls_made?: number | null
          calls_reached?: number | null
          cash_collected?: number | null
          closings?: number | null
          closings_held?: number | null
          closings_planned?: number | null
          comments?: number | null
          created_at?: string | null
          deal_volume?: number | null
          deals?: number | null
          dms_sent?: number | null
          followers_current?: number | null
          id?: number
          impressions?: number | null
          leads_qualified?: number | null
          leads_total?: number | null
          likes?: number | null
          link_clicks?: number | null
          monthly_retainer?: number | null
          new_followers?: number | null
          period_date?: string
          period_type?: string | null
          post_type?: string | null
          post_url?: string | null
          posts?: string | null
          revenue?: number | null
          settings_held?: number | null
          settings_planned?: number | null
          tenant_id?: string
          words_spoken?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_snapshot_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          linkedin_url: string | null
          profile_image_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          linkedin_url?: string | null
          profile_image_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          linkedin_url?: string | null
          profile_image_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          company_name: string
          contact_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          linkedin_url: string | null
          sheet_mapping: Json | null
          sheet_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_name: string
          contact_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          linkedin_url?: string | null
          sheet_mapping?: Json | null
          sheet_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_name?: string
          contact_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          linkedin_url?: string | null
          sheet_mapping?: Json | null
          sheet_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_metrics_daily: {
        Row: {
          appointments: number | null
          calls_interested: number | null
          calls_made: number | null
          calls_reached: number | null
          cash_collected: number | null
          closing_rate: number | null
          closing_show_rate: number | null
          closings: number | null
          closings_held: number | null
          closings_planned: number | null
          comments: number | null
          comments_delta: number | null
          cost_per_lead: number | null
          cr_appt_to_deal: number | null
          cr_lead_to_appt: number | null
          cr_lead_to_deal: number | null
          created_at: string | null
          deal_volume: number | null
          deals: number | null
          dms_sent: number | null
          followers_current: number | null
          followers_delta: number | null
          id: number | null
          impressions: number | null
          impressions_delta: number | null
          interest_rate: number | null
          lead_quality_rate: number | null
          leads_per_closing: number | null
          leads_qualified: number | null
          leads_total: number | null
          likes: number | null
          likes_delta: number | null
          link_clicks: number | null
          monthly_retainer: number | null
          new_followers: number | null
          period_date: string | null
          period_type: string | null
          post_type: string | null
          post_url: string | null
          posts: string | null
          reach_rate: number | null
          revenue: number | null
          revenue_per_lead: number | null
          setting_show_rate: number | null
          settings_held: number | null
          settings_planned: number | null
          tenant_id: string | null
          words_spoken: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_snapshot_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_metrics_monthly: {
        Row: {
          appointments: number | null
          calls_interested: number | null
          calls_made: number | null
          calls_reached: number | null
          cash_collected: number | null
          closing_rate: number | null
          closing_show_rate: number | null
          closings: number | null
          closings_held: number | null
          closings_planned: number | null
          comments: number | null
          cost_per_lead: number | null
          cr_appt_to_deal: number | null
          cr_lead_to_appt: number | null
          cr_lead_to_deal: number | null
          created_at: string | null
          deal_volume: number | null
          deals: number | null
          dms_sent: number | null
          followers_current: number | null
          impressions: number | null
          interest_rate: number | null
          lead_quality_rate: number | null
          leads_per_closing: number | null
          leads_qualified: number | null
          leads_total: number | null
          likes: number | null
          link_clicks: number | null
          monthly_retainer: number | null
          period_end: string | null
          period_start: string | null
          posts_count: number | null
          reach_rate: number | null
          revenue: number | null
          revenue_per_lead: number | null
          setting_show_rate: number | null
          settings_held: number | null
          settings_planned: number | null
          tenant_id: string | null
          words_spoken: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_snapshot_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_metrics_weekly: {
        Row: {
          appointments: number | null
          calls_interested: number | null
          calls_made: number | null
          calls_reached: number | null
          cash_collected: number | null
          closing_rate: number | null
          closing_show_rate: number | null
          closings: number | null
          closings_held: number | null
          closings_planned: number | null
          comments: number | null
          cost_per_lead: number | null
          cr_appt_to_deal: number | null
          cr_lead_to_appt: number | null
          cr_lead_to_deal: number | null
          created_at: string | null
          deal_volume: number | null
          deals: number | null
          dms_sent: number | null
          followers_current: number | null
          impressions: number | null
          interest_rate: number | null
          lead_quality_rate: number | null
          leads_per_closing: number | null
          leads_qualified: number | null
          leads_total: number | null
          likes: number | null
          link_clicks: number | null
          monthly_retainer: number | null
          period_end: string | null
          period_start: string | null
          posts_count: number | null
          reach_rate: number | null
          revenue: number | null
          revenue_per_lead: number | null
          setting_show_rate: number | null
          settings_held: number | null
          settings_planned: number | null
          tenant_id: string | null
          words_spoken: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_snapshot_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_metrics_yearly: {
        Row: {
          appointments: number | null
          calls_interested: number | null
          calls_made: number | null
          calls_reached: number | null
          cash_collected: number | null
          closing_rate: number | null
          closing_show_rate: number | null
          closings: number | null
          closings_held: number | null
          closings_planned: number | null
          comments: number | null
          cost_per_lead: number | null
          cr_appt_to_deal: number | null
          cr_lead_to_appt: number | null
          cr_lead_to_deal: number | null
          created_at: string | null
          deal_volume: number | null
          deals: number | null
          dms_sent: number | null
          followers_current: number | null
          impressions: number | null
          interest_rate: number | null
          lead_quality_rate: number | null
          leads_per_closing: number | null
          leads_qualified: number | null
          leads_total: number | null
          likes: number | null
          link_clicks: number | null
          monthly_retainer: number | null
          period_end: string | null
          period_start: string | null
          posts_count: number | null
          reach_rate: number | null
          revenue: number | null
          revenue_per_lead: number | null
          setting_show_rate: number | null
          settings_held: number | null
          settings_planned: number | null
          tenant_id: string | null
          words_spoken: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_snapshot_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client"
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
      app_role: ["admin", "client"],
    },
  },
} as const
