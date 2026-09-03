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
        PostgrestVersion: "14.5"
    }
    public: {
        Tables: {
            note_types: {
                Row: {
                    created_at: string
                    deleted_at: string | null
                    email: string | null
                    id: number
                    name: string
                }
                Insert: {
                    created_at: string
                    deleted_at?: string | null
                    email?: string | null
                    id?: number
                    name: string
                }
                Update: {
                    created_at?: string
                    deleted_at?: string | null
                    email?: string | null
                    id?: number
                    name?: string
                }
                Relationships: []
            }
            notes: {
                Row: {
                    created_at: string | null
                    created_by: number | null
                    deleted_at: string | null
                    id: number
                    note: string | null
                    project_id: number | null
                }
                Insert: {
                    created_at?: string | null
                    created_by?: number | null
                    deleted_at?: string | null
                    id?: number
                    note?: string | null
                    project_id?: number | null
                }
                Update: {
                    created_at?: string | null
                    created_by?: number | null
                    deleted_at?: string | null
                    id?: number
                    note?: string | null
                    project_id?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "notes_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "notes_project_id_fkey"
                        columns: ["project_id"]
                        isOneToOne: false
                        referencedRelation: "projects"
                        referencedColumns: ["id"]
                    },
                ]
            }
            product_types: {
                Row: {
                    created_at: string
                    deleted_at: string | null
                    description: string | null
                    id: number
                    name: string
                }
                Insert: {
                    created_at: string
                    deleted_at?: string | null
                    description?: string | null
                    id?: number
                    name: string
                }
                Update: {
                    created_at?: string
                    deleted_at?: string | null
                    description?: string | null
                    id?: number
                    name?: string
                }
                Relationships: []
            }
            products: {
                Row: {
                    created_at: string
                    deleted_at: string | null
                    description: string | null
                    id: number
                    name: string
                    product_type_id: number | null
                    profit_percentage: number | null
                    value: number | null
                }
                Insert: {
                    created_at: string
                    deleted_at?: string | null
                    description?: string | null
                    id?: number
                    name: string
                    product_type_id?: number | null
                    profit_percentage?: number | null
                    value?: number | null
                }
                Update: {
                    created_at?: string
                    deleted_at?: string | null
                    description?: string | null
                    id?: number
                    name?: string
                    product_type_id?: number | null
                    profit_percentage?: number | null
                    value?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "products_product_type_id_fkey"
                        columns: ["product_type_id"]
                        isOneToOne: false
                        referencedRelation: "product_types"
                        referencedColumns: ["id"]
                    },
                ]
            }
            projects: {
                Row: {
                    address: string | null
                    agreed_days: number | null
                    agreed_percentages: string | null
                    city: string | null
                    country: string | null
                    created_at: string
                    deleted_at: string | null
                    id: number
                    installation_date: string | null
                    name: string
                    notes: string | null
                    payments_completed: Json | null
                    reponsible: string
                    reponsible_id: number | null
                    request_date: string | null
                    shipment_date: string | null
                    state: number | null
                    state_started_at: string | null
                    "sub_state": number | null
                    total_value: number
                }
                Insert: {
                    address?: string | null
                    agreed_days?: number | null
                    agreed_percentages?: string | null
                    city?: string | null
                    country?: string | null
                    created_at?: string
                    deleted_at?: string | null
                    id?: number
                    installation_date?: string | null
                    name: string
                    notes?: string | null
                    payments_completed?: Json | null
                    reponsible: string
                    reponsible_id?: number | null
                    request_date?: string | null
                    shipment_date?: string | null
                    state?: number | null
                    state_started_at?: string | null
                    "sub_state"?: number | null
                    total_value: number
                }
                Update: {
                    address?: string | null
                    agreed_days?: number | null
                    agreed_percentages?: string | null
                    city?: string | null
                    country?: string | null
                    created_at?: string
                    deleted_at?: string | null
                    id?: number
                    installation_date?: string | null
                    name?: string
                    notes?: string | null
                    payments_completed?: Json | null
                    reponsible?: string
                    reponsible_id?: number | null
                    request_date?: string | null
                    shipment_date?: string | null
                    state?: number | null
                    state_started_at?: string | null
                    "sub_state"?: number | null
                    total_value?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "projects_reponsible_id_fkey"
                        columns: ["reponsible_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            roles: {
                Row: {
                    created_at: string
                    id: number
                    name: string | null
                }
                Insert: {
                    created_at?: string
                    id?: number
                    name?: string | null
                }
                Update: {
                    created_at?: string
                    id?: number
                    name?: string | null
                }
                Relationships: []
            }
            states: {
                Row: {
                    created_at: string
                    id: number
                    name: string | null
                }
                Insert: {
                    created_at?: string
                    id?: number
                    name?: string | null
                }
                Update: {
                    created_at?: string
                    id?: number
                    name?: string | null
                }
                Relationships: []
            }
            sub_state: {
                Row: {
                    created_at: string
                    id: number
                    name: string | null
                    state_id: number | null
                }
                Insert: {
                    created_at?: string
                    id?: number
                    name?: string | null
                    state_id?: number | null
                }
                Update: {
                    created_at?: string
                    id?: number
                    name?: string | null
                    state_id?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "sub_state_state_id_fkey"
                        columns: ["state_id"]
                        isOneToOne: false
                        referencedRelation: "states"
                        referencedColumns: ["id"]
                    },
                ]
            }
            users: {
                Row: {
                    created_at: string
                    email: string
                    id: number
                    name: string
                    photo: string | null
                    role_id: number | null
                    status: boolean | null
                }
                Insert: {
                    created_at?: string
                    email: string
                    id?: number
                    name: string
                    photo?: string | null
                    role_id?: number | null
                    status?: boolean | null
                }
                Update: {
                    created_at?: string
                    email?: string
                    id?: number
                    name?: string
                    photo?: string | null
                    role_id?: number | null
                    status?: boolean | null
                }
                Relationships: [
                    {
                        foreignKeyName: "users_role_id_fkey"
                        columns: ["role_id"]
                        isOneToOne: false
                        referencedRelation: "roles"
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
        Enums: {},
    },
} as const
