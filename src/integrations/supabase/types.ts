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
      generated_assets: {
        Row: {
          id: string
          user_id: string
          asset_type: string
          content: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          asset_type: string
          content?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          asset_type?: string
          content?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_tasks: {
        Row: {
          id: string
          user_id: string
          day_number: number
          task_text: string
          category: string
          completed: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          day_number: number
          task_text: string
          category: string
          completed?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          day_number?: number
          task_text?: string
          category?: string
          completed?: boolean
          created_at?: string | null
        }
        Relationships: []
      }
      content_posts: {
        Row: {
          id: string
          user_id: string
          scheduled_date: string
          topic: string
          caption: string | null
          status: string
          post_type: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          scheduled_date: string
          topic: string
          caption?: string | null
          status?: string
          post_type?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          scheduled_date?: string
          topic?: string
          caption?: string | null
          status?: string
          post_type?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
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
      icp_customers: {
        Row: {
          annual_revenue: string | null
          close_date: string | null
          close_duration: string | null
          collaboration_score: number | null
          contact_name: string | null
          created_at: string
          customer_name: string
          days_to_payment: number | null
          deal_value: number | null
          employee_count: string | null
          has_paid: boolean | null
          id: string
          industry: string | null
          lead_source: string | null
          notes: string | null
          onboarding_date: string | null
          payment_speed: string | null
          payment_status: string | null
          problem_awareness: string | null
          project_end_date: string | null
          project_start_date: string | null
          result_score: number | null
          sort_order: number | null
          tenant_id: string
        }
        Insert: {
          annual_revenue?: string | null
          close_date?: string | null
          close_duration?: string | null
          collaboration_score?: number | null
          contact_name?: string | null
          created_at?: string
          customer_name: string
          days_to_payment?: number | null
          deal_value?: number | null
          employee_count?: string | null
          has_paid?: boolean | null
          id?: string
          industry?: string | null
          lead_source?: string | null
          notes?: string | null
          onboarding_date?: string | null
          payment_speed?: string | null
          payment_status?: string | null
          problem_awareness?: string | null
          project_end_date?: string | null
          project_start_date?: string | null
          result_score?: number | null
          sort_order?: number | null
          tenant_id: string
        }
        Update: {
          annual_revenue?: string | null
          close_date?: string | null
          close_duration?: string | null
          collaboration_score?: number | null
          contact_name?: string | null
          created_at?: string
          customer_name?: string
          days_to_payment?: number | null
          deal_value?: number | null
          employee_count?: string | null
          has_paid?: boolean | null
          id?: string
          industry?: string | null
          lead_source?: string | null
          notes?: string | null
          onboarding_date?: string | null
          payment_speed?: string | null
          payment_status?: string | null
          problem_awareness?: string | null
          project_end_date?: string | null
          project_start_date?: string | null
          result_score?: number | null
          sort_order?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "icp_customers_tenant_id_fkey"
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
          cold_emails_replies: number | null
          cold_emails_sent: number | null
          comments: number | null
          created_at: string | null
          deal_volume: number | null
          deals: number | null
          dms_replies: number | null
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
          cold_emails_replies?: number | null
          cold_emails_sent?: number | null
          comments?: number | null
          created_at?: string | null
          deal_volume?: number | null
          deals?: number | null
          dms_replies?: number | null
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
          cold_emails_replies?: number | null
          cold_emails_sent?: number | null
          comments?: number | null
          created_at?: string | null
          deal_volume?: number | null
          deals?: number | null
          dms_replies?: number | null
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
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          answers: Json
          avg_score: number | null
          created_at: string
          id: string
          nps: number | null
          review_clicked: string | null
          survey_id: string
          tags: string[] | null
          tenant_id: string
          testimonials: Json | null
          total_score: number | null
        }
        Insert: {
          answers?: Json
          avg_score?: number | null
          created_at?: string
          id?: string
          nps?: number | null
          review_clicked?: string | null
          survey_id: string
          tags?: string[] | null
          tenant_id: string
          testimonials?: Json | null
          total_score?: number | null
        }
        Update: {
          answers?: Json
          avg_score?: number | null
          created_at?: string
          id?: string
          nps?: number | null
          review_clicked?: string | null
          survey_id?: string
          tags?: string[] | null
          tenant_id?: string
          testimonials?: Json | null
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          ads_spend_monthly: number | null
          advisor_id: string | null
          aov_existing_customer: number | null
          aov_new_customer: number | null
          cac_actual: number | null
          cac_target: number | null
          closing_rate: number | null
          commission_rate_actual: number | null
          commission_rate_target: number | null
          company_name: string
          contact_name: string | null
          contract_duration: string | null
          cost_per_appointment: number | null
          cost_per_customer: number | null
          cost_per_customer_fulfillment: number | null
          cost_per_lead: number | null
          created_at: string | null
          current_conversion_rate: number | null
          current_leads_per_month: number | null
          current_offer: string | null
          current_revenue_monthly: number | null
          delivery_costs_monthly: number | null
          existing_customer_volume: number | null
          existing_customers: number | null
          fulfillment_gross_salary: number | null
          fulfillment_tool_costs: number | null
          goal_leads_monthly: number | null
          goal_revenue_monthly: number | null
          goal_timeframe: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          last_sync_at: string | null
          linkedin_experience: string | null
          linkedin_followers_current: number | null
          linkedin_url: string | null
          ltv_avg_customer: number | null
          margin_percent: number | null
          monthly_budget: number | null
          new_customer_volume: number | null
          new_customers_monthly: number | null
          offer_price: number | null
          onboarding_completed: boolean | null
          order_volume_monthly: number | null
          other_costs_monthly: number | null
          payment_default_rate: number | null
          personnel_costs_monthly: number | null
          posting_frequency: string | null
          primary_goal: string | null
          product_palette: Json | null
          revenue_onetime: number | null
          revenue_recurring: number | null
          sales_gross_salary: number | null
          sales_side_costs: number | null
          sheet_mapping: Json | null
          sheet_url: string | null
          target_audience: string | null
          team_size: string | null
          tools_costs_monthly: number | null
          total_customers: number | null
          updated_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          ads_spend_monthly?: number | null
          advisor_id?: string | null
          aov_existing_customer?: number | null
          aov_new_customer?: number | null
          cac_actual?: number | null
          cac_target?: number | null
          closing_rate?: number | null
          commission_rate_actual?: number | null
          commission_rate_target?: number | null
          company_name: string
          contact_name?: string | null
          contract_duration?: string | null
          cost_per_appointment?: number | null
          cost_per_customer?: number | null
          cost_per_customer_fulfillment?: number | null
          cost_per_lead?: number | null
          created_at?: string | null
          current_conversion_rate?: number | null
          current_leads_per_month?: number | null
          current_offer?: string | null
          current_revenue_monthly?: number | null
          delivery_costs_monthly?: number | null
          existing_customer_volume?: number | null
          existing_customers?: number | null
          fulfillment_gross_salary?: number | null
          fulfillment_tool_costs?: number | null
          goal_leads_monthly?: number | null
          goal_revenue_monthly?: number | null
          goal_timeframe?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          linkedin_experience?: string | null
          linkedin_followers_current?: number | null
          linkedin_url?: string | null
          ltv_avg_customer?: number | null
          margin_percent?: number | null
          monthly_budget?: number | null
          new_customer_volume?: number | null
          new_customers_monthly?: number | null
          offer_price?: number | null
          onboarding_completed?: boolean | null
          order_volume_monthly?: number | null
          other_costs_monthly?: number | null
          payment_default_rate?: number | null
          personnel_costs_monthly?: number | null
          posting_frequency?: string | null
          primary_goal?: string | null
          product_palette?: Json | null
          revenue_onetime?: number | null
          revenue_recurring?: number | null
          sales_gross_salary?: number | null
          sales_side_costs?: number | null
          sheet_mapping?: Json | null
          sheet_url?: string | null
          target_audience?: string | null
          team_size?: string | null
          tools_costs_monthly?: number | null
          total_customers?: number | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          ads_spend_monthly?: number | null
          advisor_id?: string | null
          aov_existing_customer?: number | null
          aov_new_customer?: number | null
          cac_actual?: number | null
          cac_target?: number | null
          closing_rate?: number | null
          commission_rate_actual?: number | null
          commission_rate_target?: number | null
          company_name?: string
          contact_name?: string | null
          contract_duration?: string | null
          cost_per_appointment?: number | null
          cost_per_customer?: number | null
          cost_per_customer_fulfillment?: number | null
          cost_per_lead?: number | null
          created_at?: string | null
          current_conversion_rate?: number | null
          current_leads_per_month?: number | null
          current_offer?: string | null
          current_revenue_monthly?: number | null
          delivery_costs_monthly?: number | null
          existing_customer_volume?: number | null
          existing_customers?: number | null
          fulfillment_gross_salary?: number | null
          fulfillment_tool_costs?: number | null
          goal_leads_monthly?: number | null
          goal_revenue_monthly?: number | null
          goal_timeframe?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          linkedin_experience?: string | null
          linkedin_followers_current?: number | null
          linkedin_url?: string | null
          ltv_avg_customer?: number | null
          margin_percent?: number | null
          monthly_budget?: number | null
          new_customer_volume?: number | null
          new_customers_monthly?: number | null
          offer_price?: number | null
          onboarding_completed?: boolean | null
          order_volume_monthly?: number | null
          other_costs_monthly?: number | null
          payment_default_rate?: number | null
          personnel_costs_monthly?: number | null
          posting_frequency?: string | null
          primary_goal?: string | null
          product_palette?: Json | null
          revenue_onetime?: number | null
          revenue_recurring?: number | null
          sales_gross_salary?: number | null
          sales_side_costs?: number | null
          sheet_mapping?: Json | null
          sheet_url?: string | null
          target_audience?: string | null
          team_size?: string | null
          tools_costs_monthly?: number | null
          total_customers?: number | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
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
      webhook_endpoints: {
        Row: {
          created_at: string
          description: string | null
          event_type: string
          id: string
          is_active: boolean
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          is_active?: boolean
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      webhook_log: {
        Row: {
          created_at: string
          endpoint_id: string | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          status_code: number | null
        }
        Insert: {
          created_at?: string
          endpoint_id?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          payload?: Json
          response_body?: string | null
          status_code?: number | null
        }
        Update: {
          created_at?: string
          endpoint_id?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_log_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_advisor: { Args: { _user_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "client" | "advisor"
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
      app_role: ["admin", "client", "advisor"],
    },
  },
} as const
