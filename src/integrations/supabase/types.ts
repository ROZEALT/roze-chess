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
      club_members: {
        Row: {
          club_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          club_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          club_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_messages: {
        Row: {
          club_id: string
          content: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          club_id: string
          content: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          club_id?: string
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_messages_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          avatar_url: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          member_count: number
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          member_count?: number
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          member_count?: number
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_login_tracker: {
        Row: {
          id: string
          last_login_date: string
          user_id: string
        }
        Insert: {
          id?: string
          last_login_date?: string
          user_id: string
        }
        Update: {
          id?: string
          last_login_date?: string
          user_id?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Relationships: []
      }
      game_history: {
        Row: {
          id: string
          moves_count: number | null
          opening_name: string | null
          opponent_name: string | null
          opponent_rating: number | null
          opponent_type: string
          pgn: string | null
          played_at: string | null
          rating_change: number | null
          result: string
          time_control: string | null
          user_color: string | null
          user_id: string
        }
        Insert: {
          id?: string
          moves_count?: number | null
          opening_name?: string | null
          opponent_name?: string | null
          opponent_rating?: number | null
          opponent_type?: string
          pgn?: string | null
          played_at?: string | null
          rating_change?: number | null
          result: string
          time_control?: string | null
          user_color?: string | null
          user_id: string
        }
        Update: {
          id?: string
          moves_count?: number | null
          opening_name?: string | null
          opponent_name?: string | null
          opponent_rating?: number | null
          opponent_type?: string
          pgn?: string | null
          played_at?: string | null
          rating_change?: number | null
          result?: string
          time_control?: string | null
          user_color?: string | null
          user_id?: string
        }
        Relationships: []
      }
      matchmaking_queue: {
        Row: {
          id: string
          joined_at: string
          rating: number
          time_control: Database["public"]["Enums"]["time_control"]
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          rating?: number
          time_control: Database["public"]["Enums"]["time_control"]
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          rating?: number
          time_control?: Database["public"]["Enums"]["time_control"]
          user_id?: string
        }
        Relationships: []
      }
      online_games: {
        Row: {
          black_player_id: string | null
          black_time_remaining: number
          created_at: string
          current_turn: string | null
          fen: string
          id: string
          is_private: boolean | null
          last_move_at: string | null
          moves: Json | null
          pgn: string | null
          result: string | null
          room_code: string | null
          status: Database["public"]["Enums"]["game_status"]
          time_control: Database["public"]["Enums"]["time_control"]
          updated_at: string
          white_player_id: string | null
          white_time_remaining: number
          winner_id: string | null
        }
        Insert: {
          black_player_id?: string | null
          black_time_remaining?: number
          created_at?: string
          current_turn?: string | null
          fen?: string
          id?: string
          is_private?: boolean | null
          last_move_at?: string | null
          moves?: Json | null
          pgn?: string | null
          result?: string | null
          room_code?: string | null
          status?: Database["public"]["Enums"]["game_status"]
          time_control?: Database["public"]["Enums"]["time_control"]
          updated_at?: string
          white_player_id?: string | null
          white_time_remaining?: number
          winner_id?: string | null
        }
        Update: {
          black_player_id?: string | null
          black_time_remaining?: number
          created_at?: string
          current_turn?: string | null
          fen?: string
          id?: string
          is_private?: boolean | null
          last_move_at?: string | null
          moves?: Json | null
          pgn?: string | null
          result?: string | null
          room_code?: string | null
          status?: Database["public"]["Enums"]["game_status"]
          time_control?: Database["public"]["Enums"]["time_control"]
          updated_at?: string
          white_player_id?: string | null
          white_time_remaining?: number
          winner_id?: string | null
        }
        Relationships: []
      }
      points_history: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          games_drawn: number | null
          games_lost: number | null
          games_played: number | null
          games_won: number | null
          id: string
          is_premium: boolean | null
          points: number
          rating_blitz: number | null
          rating_bullet: number | null
          rating_daily: number | null
          rating_rapid: number | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          games_drawn?: number | null
          games_lost?: number | null
          games_played?: number | null
          games_won?: number | null
          id?: string
          is_premium?: boolean | null
          points?: number
          rating_blitz?: number | null
          rating_bullet?: number | null
          rating_daily?: number | null
          rating_rapid?: number | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          games_drawn?: number | null
          games_lost?: number | null
          games_played?: number | null
          games_won?: number | null
          id?: string
          is_premium?: boolean | null
          points?: number
          rating_blitz?: number | null
          rating_bullet?: number | null
          rating_daily?: number | null
          rating_rapid?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          board_theme: string | null
          created_at: string | null
          highlight_moves: boolean | null
          id: string
          move_confirmation: boolean | null
          piece_set: string | null
          premove_enabled: boolean | null
          show_coordinates: boolean | null
          sounds_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          board_theme?: string | null
          created_at?: string | null
          highlight_moves?: boolean | null
          id?: string
          move_confirmation?: boolean | null
          piece_set?: string | null
          premove_enabled?: boolean | null
          show_coordinates?: boolean | null
          sounds_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          board_theme?: string | null
          created_at?: string | null
          highlight_moves?: boolean | null
          id?: string
          move_confirmation?: boolean | null
          piece_set?: string | null
          premove_enabled?: boolean | null
          show_coordinates?: boolean | null
          sounds_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
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
      friendship_status: "pending" | "accepted" | "blocked"
      game_status: "waiting" | "active" | "completed" | "abandoned"
      time_control:
        | "bullet_1"
        | "bullet_2"
        | "blitz_3"
        | "blitz_5"
        | "rapid_10"
        | "rapid_15"
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
      friendship_status: ["pending", "accepted", "blocked"],
      game_status: ["waiting", "active", "completed", "abandoned"],
      time_control: [
        "bullet_1",
        "bullet_2",
        "blitz_3",
        "blitz_5",
        "rapid_10",
        "rapid_15",
      ],
    },
  },
} as const
