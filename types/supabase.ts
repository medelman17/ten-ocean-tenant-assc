export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_configuration: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_active: boolean | null
          max_tokens: number | null
          model_name: string
          system_prompt: string | null
          temperature: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model_name: string
          system_prompt?: string | null
          temperature?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model_name?: string
          system_prompt?: string | null
          temperature?: number
          updated_at?: string
        }
        Relationships: []
      }
      ai_context_sources: {
        Row: {
          content_path: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_enabled: boolean | null
          last_updated: string
          name: string
          priority: number
          source_type: string
          update_frequency: string
        }
        Insert: {
          content_path?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          last_updated?: string
          name: string
          priority?: number
          source_type: string
          update_frequency?: string
        }
        Update: {
          content_path?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          last_updated?: string
          name?: string
          priority?: number
          source_type?: string
          update_frequency?: string
        }
        Relationships: []
      }
      alumni_membership_tiers: {
        Row: {
          benefits: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          benefits?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          benefits?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_pinned: boolean | null
          priority: string
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_pinned?: boolean | null
          priority?: string
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_pinned?: boolean | null
          priority?: string
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      category_subscriptions: {
        Row: {
          category_id: string
          created_at: string
          subscription_type: string
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          subscription_type?: string
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          subscription_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_subscriptions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          referenced_documents: Json | null
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          referenced_documents?: Json | null
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          referenced_documents?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          is_archived: boolean | null
          metadata: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived?: boolean | null
          metadata?: Json | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_archived?: boolean | null
          metadata?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string
          parent_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id: string
          parent_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string
          parent_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          status: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          status?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_time: string
          id: string
          is_private: boolean | null
          location: string | null
          max_attendees: number | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_time: string
          id?: string
          is_private?: boolean | null
          location?: string | null
          max_attendees?: number | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string
          id?: string
          is_private?: boolean | null
          location?: string | null
          max_attendees?: number | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      file_attachments: {
        Row: {
          added_at: string
          added_by: string
          attachable_id: string
          attachable_type: string
          description: string | null
          display_order: number | null
          file_id: string
          id: string
        }
        Insert: {
          added_at?: string
          added_by: string
          attachable_id: string
          attachable_type: string
          description?: string | null
          display_order?: number | null
          file_id: string
          id?: string
        }
        Update: {
          added_at?: string
          added_by?: string
          attachable_id?: string
          attachable_type?: string
          description?: string | null
          display_order?: number | null
          file_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_attachments_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      file_categories: {
        Row: {
          color_code: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color_code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color_code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      file_category_items: {
        Row: {
          category_id: string
          file_id: string
        }
        Insert: {
          category_id: string
          file_id: string
        }
        Update: {
          category_id?: string
          file_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_category_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "file_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_category_items_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          file_size: number
          file_type: string
          id: string
          metadata: Json | null
          mime_type: string
          original_filename: string
          privacy_level: string
          sha256_hash: string | null
          status: string
          storage_path: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          file_size: number
          file_type: string
          id?: string
          metadata?: Json | null
          mime_type: string
          original_filename: string
          privacy_level?: string
          sha256_hash?: string | null
          status?: string
          storage_path: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          file_size?: number
          file_type?: string
          id?: string
          metadata?: Json | null
          mime_type?: string
          original_filename?: string
          privacy_level?: string
          sha256_hash?: string | null
          status?: string
          storage_path?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      floor_captain_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          floor_number: number
          id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          floor_number: number
          id?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          floor_number?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          display_order: number
          icon_file_id: string | null
          id: string
          is_private: boolean | null
          name: string
          parent_category_id: string | null
          required_role_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          display_order?: number
          icon_file_id?: string | null
          id?: string
          is_private?: boolean | null
          name: string
          parent_category_id?: string | null
          required_role_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          display_order?: number
          icon_file_id?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
          parent_category_id?: string | null
          required_role_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_categories_icon_file_id_fkey"
            columns: ["icon_file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_categories_required_role_id_fkey"
            columns: ["required_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          is_edited: boolean | null
          is_solution: boolean | null
          parent_post_id: string | null
          topic_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_edited?: boolean | null
          is_solution?: boolean | null
          parent_post_id?: string | null
          topic_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_edited?: boolean | null
          is_solution?: boolean | null
          parent_post_id?: string | null
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          author_id: string
          category_id: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          is_locked: boolean | null
          is_pinned: boolean | null
          last_post_at: string
          slug: string
          status: string
          title: string
          view_count: number
        }
        Insert: {
          author_id: string
          category_id: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_post_at?: string
          slug: string
          status?: string
          title: string
          view_count?: number
        }
        Update: {
          author_id?: string
          category_id?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_post_at?: string
          slug?: string
          status?: string
          title?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string
          id: string
          priority: string
          reported_by: string
          resolution_notes: string | null
          resolved_at: string | null
          status: string
          title: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: string
          reported_by: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          title: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string
          reported_by?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          title?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      question_responses: {
        Row: {
          answer_text: string | null
          id: string
          question_id: string
          selected_options: Json | null
          survey_response_id: string
        }
        Insert: {
          answer_text?: string | null
          id?: string
          question_id: string
          selected_options?: Json | null
          survey_response_id: string
        }
        Update: {
          answer_text?: string | null
          id?: string
          question_id?: string
          selected_options?: Json | null
          survey_response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_responses_survey_response_id_fkey"
            columns: ["survey_response_id"]
            isOneToOne: false
            referencedRelation: "survey_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          permissions: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          permissions?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          permissions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      survey_questions: {
        Row: {
          id: string
          options: Json | null
          order_position: number
          question_text: string
          question_type: string
          required: boolean | null
          survey_id: string
        }
        Insert: {
          id?: string
          options?: Json | null
          order_position?: number
          question_text: string
          question_type: string
          required?: boolean | null
          survey_id: string
        }
        Update: {
          id?: string
          options?: Json | null
          order_position?: number
          question_text?: string
          question_type?: string
          required?: boolean | null
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          id: string
          submitted_at: string
          survey_id: string
          user_id: string
        }
        Insert: {
          id?: string
          submitted_at?: string
          survey_id: string
          user_id: string
        }
        Update: {
          id?: string
          submitted_at?: string
          survey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          expires_at: string | null
          id: string
          published: boolean | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          expires_at?: string | null
          id?: string
          published?: boolean | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          published?: boolean | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      topic_subscriptions: {
        Row: {
          created_at: string
          subscription_type: string
          topic_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          subscription_type?: string
          topic_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          subscription_type?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_subscriptions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          floor: number
          id: string
          square_footage: number | null
          unit_number: string
          updated_at: string
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          floor: number
          id?: string
          square_footage?: number | null
          unit_number: string
          updated_at?: string
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          floor?: number
          id?: string
          square_footage?: number | null
          unit_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_connections: {
        Row: {
          connected_user_id: string
          created_at: string
          established_at: string | null
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          connected_user_id: string
          created_at?: string
          established_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          connected_user_id?: string
          created_at?: string
          established_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_memberships: {
        Row: {
          approved_by: string | null
          created_at: string
          end_date: string | null
          id: string
          membership_tier_id: string | null
          payment_status: string | null
          renewal_date: string | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          membership_tier_id?: string | null
          payment_status?: string | null
          renewal_date?: string | null
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          membership_tier_id?: string | null
          payment_status?: string | null
          renewal_date?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_memberships_membership_tier_id_fkey"
            columns: ["membership_tier_id"]
            isOneToOne: false
            referencedRelation: "alumni_membership_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          accessibility_settings: Json | null
          communication_preferences: Json | null
          created_at: string
          email_digest_frequency: string | null
          notification_settings: Json | null
          privacy_settings: Json | null
          theme_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accessibility_settings?: Json | null
          communication_preferences?: Json | null
          created_at?: string
          email_digest_frequency?: string | null
          notification_settings?: Json | null
          privacy_settings?: Json | null
          theme_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accessibility_settings?: Json | null
          communication_preferences?: Json | null
          created_at?: string
          email_digest_frequency?: string | null
          notification_settings?: Json | null
          privacy_settings?: Json | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          alumni_since: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string | null
          forwarding_address: string | null
          id: string
          languages_spoken: string[] | null
          last_name: string | null
          move_in_date: string | null
          move_out_date: string | null
          occupation: string | null
          pet_information: Json | null
          phone: string | null
          profile_completeness: number | null
          profile_picture_url: string | null
          profile_visibility: string | null
          residency_status: string | null
          social_media_links: Json | null
          unit_id: string | null
          updated_at: string
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          alumni_since?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string | null
          forwarding_address?: string | null
          id: string
          languages_spoken?: string[] | null
          last_name?: string | null
          move_in_date?: string | null
          move_out_date?: string | null
          occupation?: string | null
          pet_information?: Json | null
          phone?: string | null
          profile_completeness?: number | null
          profile_picture_url?: string | null
          profile_visibility?: string | null
          residency_status?: string | null
          social_media_links?: Json | null
          unit_id?: string | null
          updated_at?: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          alumni_since?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string | null
          forwarding_address?: string | null
          id?: string
          languages_spoken?: string[] | null
          last_name?: string | null
          move_in_date?: string | null
          move_out_date?: string | null
          occupation?: string | null
          pet_information?: Json | null
          phone?: string | null
          profile_completeness?: number | null
          profile_picture_url?: string | null
          profile_visibility?: string | null
          residency_status?: string | null
          social_media_links?: Json | null
          unit_id?: string | null
          updated_at?: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skills: {
        Row: {
          community_involvement: string[] | null
          created_at: string
          id: string
          interests: string[] | null
          skills: string[] | null
          updated_at: string
          user_id: string
          volunteer_availability: Json | null
        }
        Insert: {
          community_involvement?: string[] | null
          created_at?: string
          id?: string
          interests?: string[] | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
          volunteer_availability?: Json | null
        }
        Update: {
          community_involvement?: string[] | null
          created_at?: string
          id?: string
          interests?: string[] | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
          volunteer_availability?: Json | null
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

