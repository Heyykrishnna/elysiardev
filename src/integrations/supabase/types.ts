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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: Database["public"]["Enums"]["achievement_type"]
          created_at: string
          criteria: Json
          description: string
          icon: string
          id: string
          name: string
          xp_reward: number
        }
        Insert: {
          achievement_type: Database["public"]["Enums"]["achievement_type"]
          created_at?: string
          criteria: Json
          description: string
          icon: string
          id?: string
          name: string
          xp_reward?: number
        }
        Update: {
          achievement_type?: Database["public"]["Enums"]["achievement_type"]
          created_at?: string
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          name?: string
          xp_reward?: number
        }
        Relationships: []
      }
      ai_flashcards: {
        Row: {
          cards: Json
          created_at: string
          grade: string
          id: string
          student_id: string
          subject: string
          topic: string
        }
        Insert: {
          cards?: Json
          created_at?: string
          grade: string
          id?: string
          student_id: string
          subject: string
          topic: string
        }
        Update: {
          cards?: Json
          created_at?: string
          grade?: string
          id?: string
          student_id?: string
          subject?: string
          topic?: string
        }
        Relationships: []
      }
      ai_test_attempts: {
        Row: {
          answers: Json
          created_at: string
          difficulty: string
          grade: string
          id: string
          questions: Json
          score: number
          student_id: string
          subject: string
          topic: string
          total_questions: number
        }
        Insert: {
          answers?: Json
          created_at?: string
          difficulty: string
          grade: string
          id?: string
          questions?: Json
          score: number
          student_id: string
          subject: string
          topic: string
          total_questions: number
        }
        Update: {
          answers?: Json
          created_at?: string
          difficulty?: string
          grade?: string
          id?: string
          questions?: Json
          score?: number
          student_id?: string
          subject?: string
          topic?: string
          total_questions?: number
        }
        Relationships: []
      }
      attendance: {
        Row: {
          class: string
          created_at: string
          date: string
          email: string
          full_name: string
          id: string
          phone_number: number
          status: string
          student_id: string
          time_marked: string
          updated_at: string
        }
        Insert: {
          class: string
          created_at?: string
          date?: string
          email: string
          full_name: string
          id?: string
          phone_number: number
          status?: string
          student_id: string
          time_marked?: string
          updated_at?: string
        }
        Update: {
          class?: string
          created_at?: string
          date?: string
          email?: string
          full_name?: string
          id?: string
          phone_number?: number
          status?: string
          student_id?: string
          time_marked?: string
          updated_at?: string
        }
        Relationships: []
      }
      attendance_qr_codes: {
        Row: {
          class_name: string
          created_at: string
          date: string
          expires_at: string | null
          id: string
          is_active: boolean
          owner_id: string
          qr_data: Json
          updated_at: string
        }
        Insert: {
          class_name: string
          created_at?: string
          date: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          owner_id: string
          qr_data: Json
          updated_at?: string
        }
        Update: {
          class_name?: string
          created_at?: string
          date?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          owner_id?: string
          qr_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      attendances: {
        Row: {
          created_at: string | null
          distance_meters: number | null
          id: string
          session_id: string | null
          student_id: string | null
          student_lat: number | null
          student_lng: number | null
          student_name: string | null
        }
        Insert: {
          created_at?: string | null
          distance_meters?: number | null
          id?: string
          session_id?: string | null
          student_id?: string | null
          student_lat?: number | null
          student_lng?: number | null
          student_name?: string | null
        }
        Update: {
          created_at?: string | null
          distance_meters?: number | null
          id?: string
          session_id?: string | null
          student_id?: string | null
          student_lat?: number | null
          student_lng?: number | null
          student_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendances_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      book_issues: {
        Row: {
          book_id: string
          created_at: string | null
          due_date: string
          id: string
          issued_at: string | null
          notes: string | null
          returned_at: string | null
          status: string
          student_email: string
          student_id: string
          student_name: string
          updated_at: string | null
        }
        Insert: {
          book_id: string
          created_at?: string | null
          due_date: string
          id?: string
          issued_at?: string | null
          notes?: string | null
          returned_at?: string | null
          status?: string
          student_email: string
          student_id: string
          student_name: string
          updated_at?: string | null
        }
        Update: {
          book_id?: string
          created_at?: string | null
          due_date?: string
          id?: string
          issued_at?: string | null
          notes?: string | null
          returned_at?: string | null
          status?: string
          student_email?: string
          student_id?: string
          student_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_issues_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          added_by: string
          author: string
          available_copies: number
          category: string
          cover_url: string | null
          created_at: string | null
          description: string | null
          id: string
          isbn: string | null
          title: string
          total_copies: number
          updated_at: string | null
        }
        Insert: {
          added_by: string
          author: string
          available_copies?: number
          category: string
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          isbn?: string | null
          title: string
          total_copies?: number
          updated_at?: string | null
        }
        Update: {
          added_by?: string
          author?: string
          available_copies?: number
          category?: string
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          isbn?: string | null
          title?: string
          total_copies?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      complaints: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          is_anonymous: boolean
          status: string
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          id?: string
          is_anonymous?: boolean
          status?: string
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_anonymous?: boolean
          status?: string
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          color: string
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          owner_id: string
          title: string
          updated_at: string
          visibility: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          event_type?: string
          id?: string
          owner_id: string
          title: string
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          owner_id?: string
          title?: string
          updated_at?: string
          visibility?: string | null
        }
        Relationships: []
      }
      owner_notifications: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          owner_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          owner_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          owner_id?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string
          id: string
          options: Json | null
          order_number: number
          points: number
          question_text: string
          question_type: string
          test_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          id?: string
          options?: Json | null
          order_number: number
          points?: number
          question_text: string
          question_type?: string
          test_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          id?: string
          options?: Json | null
          order_number?: number
          points?: number
          question_text?: string
          question_type?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_requests: {
        Row: {
          book_name: string
          created_at: string
          edition: string | null
          id: string
          reason: string | null
          status: string
          student_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          book_name: string
          created_at?: string
          edition?: string | null
          id?: string
          reason?: string | null
          status?: string
          student_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          book_name?: string
          created_at?: string
          edition?: string | null
          id?: string
          reason?: string | null
          status?: string
          student_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          active: boolean | null
          class_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          qr_token: string
          radius_meters: number | null
          teacher_id: string | null
        }
        Insert: {
          active?: boolean | null
          class_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          qr_token: string
          radius_meters?: number | null
          teacher_id?: string | null
        }
        Update: {
          active?: boolean | null
          class_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          qr_token?: string
          radius_meters?: number | null
          teacher_id?: string | null
        }
        Relationships: []
      }
      student_notifications: {
        Row: {
          book_issue_id: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          notification_type: string
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          book_issue_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          notification_type?: string
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          book_issue_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_notifications_book_issue_id_fkey"
            columns: ["book_issue_id"]
            isOneToOne: false
            referencedRelation: "book_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      study_resources: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          file_name: string | null
          file_url: string | null
          id: string
          is_public: boolean
          owner_id: string
          resource_type: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_public?: boolean
          owner_id: string
          resource_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_public?: boolean
          owner_id?: string
          resource_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_resources_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          items_completed: number
          session_type: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          items_completed?: number
          session_type: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          items_completed?: number
          session_type?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      test_attempts: {
        Row: {
          answers: Json | null
          completed_at: string | null
          id: string
          is_completed: boolean
          score: number | null
          started_at: string
          student_id: string
          test_id: string
          total_points: number | null
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          is_completed?: boolean
          score?: number | null
          started_at?: string
          student_id: string
          test_id: string
          total_points?: number | null
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          is_completed?: boolean
          score?: number | null
          started_at?: string
          student_id?: string
          test_id?: string
          total_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "test_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          created_at: string
          description: string | null
          hide_scores_after_submission: boolean | null
          id: string
          is_active: boolean
          owner_id: string
          password: string | null
          time_limit: number | null
          title: string
          total_questions: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hide_scores_after_submission?: boolean | null
          id?: string
          is_active?: boolean
          owner_id: string
          password?: string | null
          time_limit?: number | null
          title: string
          total_questions?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hide_scores_after_submission?: boolean | null
          id?: string
          is_active?: boolean
          owner_id?: string
          password?: string | null
          time_limit?: number | null
          title?: string
          total_questions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_type: Database["public"]["Enums"]["achievement_type"]
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_type: Database["public"]["Enums"]["achievement_type"]
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_type?: Database["public"]["Enums"]["achievement_type"]
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_gamification: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_study_date: string | null
          level: number
          longest_streak: number
          total_flashcards_reviewed: number
          total_study_sessions: number
          total_tests_completed: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_study_date?: string | null
          level?: number
          longest_streak?: number
          total_flashcards_reviewed?: number
          total_study_sessions?: number
          total_tests_completed?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_study_date?: string | null
          level?: number
          longest_streak?: number
          total_flashcards_reviewed?: number
          total_study_sessions?: number
          total_tests_completed?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_level: { Args: { xp_amount: number }; Returns: number }
      calculate_test_score: {
        Args: { p_answers: Json; p_test_id: string }
        Returns: {
          calculated_score: number
          total_points: number
        }[]
      }
      check_overdue_books: { Args: never; Returns: undefined }
      xp_for_next_level: { Args: { current_level: number }; Returns: number }
    }
    Enums: {
      achievement_type:
        | "first_study"
        | "study_streak_3"
        | "study_streak_7"
        | "study_streak_30"
        | "flashcards_master_50"
        | "flashcards_master_100"
        | "flashcards_master_500"
        | "test_ace_5"
        | "test_ace_10"
        | "perfect_score"
        | "early_bird"
        | "night_owl"
        | "weekend_warrior"
        | "level_up_5"
        | "level_up_10"
        | "level_up_25"
      user_role: "owner" | "student"
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
      achievement_type: [
        "first_study",
        "study_streak_3",
        "study_streak_7",
        "study_streak_30",
        "flashcards_master_50",
        "flashcards_master_100",
        "flashcards_master_500",
        "test_ace_5",
        "test_ace_10",
        "perfect_score",
        "early_bird",
        "night_owl",
        "weekend_warrior",
        "level_up_5",
        "level_up_10",
        "level_up_25",
      ],
      user_role: ["owner", "student"],
    },
  },
} as const
