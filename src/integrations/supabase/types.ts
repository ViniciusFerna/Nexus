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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      calculos: {
        Row: {
          consumo_combustivel_l: number | null
          created_at: string
          custo_combustivel: number | null
          custo_fixo_rateado: number | null
          custo_pedagios: number | null
          custo_por_entrega: number
          custo_por_km: number
          custo_total: number
          custo_variaveis: number | null
          distancia_km: number
          entregas_na_rota: number
          id: string
          nome_cenario: string | null
          rota_id: string
          tempo_estimado_h: number | null
          updated_at: string
          user_id: string
          veiculo_id: string
        }
        Insert: {
          consumo_combustivel_l?: number | null
          created_at?: string
          custo_combustivel?: number | null
          custo_fixo_rateado?: number | null
          custo_pedagios?: number | null
          custo_por_entrega?: number
          custo_por_km?: number
          custo_total?: number
          custo_variaveis?: number | null
          distancia_km?: number
          entregas_na_rota?: number
          id?: string
          nome_cenario?: string | null
          rota_id: string
          tempo_estimado_h?: number | null
          updated_at?: string
          user_id: string
          veiculo_id: string
        }
        Update: {
          consumo_combustivel_l?: number | null
          created_at?: string
          custo_combustivel?: number | null
          custo_fixo_rateado?: number | null
          custo_pedagios?: number | null
          custo_por_entrega?: number
          custo_por_km?: number
          custo_total?: number
          custo_variaveis?: number | null
          distancia_km?: number
          entregas_na_rota?: number
          id?: string
          nome_cenario?: string | null
          rota_id?: string
          tempo_estimado_h?: number | null
          updated_at?: string
          user_id?: string
          veiculo_id?: string
        }
        Relationships: []
      }
      cargo: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          type: string
          updated_at: string
          user_id: string
          value: number
          weight: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          type?: string
          updated_at?: string
          user_id: string
          value?: number
          weight: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
          value?: number
          weight?: number
        }
        Relationships: []
      }
      custos_fixos: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          updated_at: string
          user_id: string
          valor_mensal: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
          user_id: string
          valor_mensal?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string
          valor_mensal?: number
        }
        Relationships: []
      }
      custos_variaveis: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          updated_at: string
          user_id: string
          valor_por_km: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
          user_id: string
          valor_por_km?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string
          valor_por_km?: number
        }
        Relationships: []
      }
      custos_veiculo: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          updated_at: string
          user_id: string
          valor_mensal: number
          veiculo_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
          user_id: string
          valor_mensal?: number
          veiculo_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string
          valor_mensal?: number
          veiculo_id?: string
        }
        Relationships: []
      }
      parametros_globais: {
        Row: {
          created_at: string
          id: string
          moeda: string
          preco_diesel_litro: number
          updated_at: string
          user_id: string
          velocidade_media_kmh: number
        }
        Insert: {
          created_at?: string
          id?: string
          moeda?: string
          preco_diesel_litro?: number
          updated_at?: string
          user_id: string
          velocidade_media_kmh?: number
        }
        Update: {
          created_at?: string
          id?: string
          moeda?: string
          preco_diesel_litro?: number
          updated_at?: string
          user_id?: string
          velocidade_media_kmh?: number
        }
        Relationships: []
      }
      pedagios: {
        Row: {
          created_at: string
          descricao: string
          id: string
          rota_id: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          rota_id: string
          updated_at?: string
          user_id: string
          valor?: number
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          rota_id?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          created_at: string
          destino: string
          distancia_km: number
          id: string
          origem: string
          tempo_estimado_h: number
          updated_at: string
          user_id: string
          valor_pedagio: number | null
        }
        Insert: {
          created_at?: string
          destino: string
          distancia_km: number
          id?: string
          origem: string
          tempo_estimado_h: number
          updated_at?: string
          user_id: string
          valor_pedagio?: number | null
        }
        Update: {
          created_at?: string
          destino?: string
          distancia_km?: number
          id?: string
          origem?: string
          tempo_estimado_h?: number
          updated_at?: string
          user_id?: string
          valor_pedagio?: number | null
        }
        Relationships: []
      }
      simulacoes: {
        Row: {
          consumo_combustivel_l: number | null
          created_at: string
          custo_combustivel: number | null
          custo_fixo_rateado: number | null
          custo_pedagios: number | null
          custo_por_entrega: number | null
          custo_por_tonelada_km: number | null
          custo_total: number | null
          custo_var_extra_por_km: number | null
          custo_variaveis: number | null
          entregas_na_rota: number | null
          id: string
          km_por_litro: number | null
          margem: number | null
          nome_cenario: string
          ocupacao_pct: number | null
          pedagios_extra: number | null
          preco_diesel_litro: number | null
          tempo_estimado_h: number | null
          updated_at: string
          user_id: string
          velocidade_media_kmh: number | null
          viagem_base_id: string
        }
        Insert: {
          consumo_combustivel_l?: number | null
          created_at?: string
          custo_combustivel?: number | null
          custo_fixo_rateado?: number | null
          custo_pedagios?: number | null
          custo_por_entrega?: number | null
          custo_por_tonelada_km?: number | null
          custo_total?: number | null
          custo_var_extra_por_km?: number | null
          custo_variaveis?: number | null
          entregas_na_rota?: number | null
          id?: string
          km_por_litro?: number | null
          margem?: number | null
          nome_cenario: string
          ocupacao_pct?: number | null
          pedagios_extra?: number | null
          preco_diesel_litro?: number | null
          tempo_estimado_h?: number | null
          updated_at?: string
          user_id: string
          velocidade_media_kmh?: number | null
          viagem_base_id: string
        }
        Update: {
          consumo_combustivel_l?: number | null
          created_at?: string
          custo_combustivel?: number | null
          custo_fixo_rateado?: number | null
          custo_pedagios?: number | null
          custo_por_entrega?: number | null
          custo_por_tonelada_km?: number | null
          custo_total?: number | null
          custo_var_extra_por_km?: number | null
          custo_variaveis?: number | null
          entregas_na_rota?: number | null
          id?: string
          km_por_litro?: number | null
          margem?: number | null
          nome_cenario?: string
          ocupacao_pct?: number | null
          pedagios_extra?: number | null
          preco_diesel_litro?: number | null
          tempo_estimado_h?: number | null
          updated_at?: string
          user_id?: string
          velocidade_media_kmh?: number | null
          viagem_base_id?: string
        }
        Relationships: []
      }
      trips: {
        Row: {
          consumo_combustivel_l: number | null
          created_at: string
          custo_combustivel: number | null
          custo_fixo_rateado: number | null
          custo_pedagios: number | null
          custo_total_estimado: number | null
          custo_variaveis: number | null
          end_date: string
          id: string
          observacoes: string | null
          peso_ton: number | null
          receita: number | null
          route_id: string
          start_date: string
          status: string
          tempo_estimado_h: number | null
          updated_at: string
          user_id: string
          vehicle_id: string
          volume_m3: number | null
        }
        Insert: {
          consumo_combustivel_l?: number | null
          created_at?: string
          custo_combustivel?: number | null
          custo_fixo_rateado?: number | null
          custo_pedagios?: number | null
          custo_total_estimado?: number | null
          custo_variaveis?: number | null
          end_date: string
          id?: string
          observacoes?: string | null
          peso_ton?: number | null
          receita?: number | null
          route_id: string
          start_date: string
          status?: string
          tempo_estimado_h?: number | null
          updated_at?: string
          user_id: string
          vehicle_id: string
          volume_m3?: number | null
        }
        Update: {
          consumo_combustivel_l?: number | null
          created_at?: string
          custo_combustivel?: number | null
          custo_fixo_rateado?: number | null
          custo_pedagios?: number | null
          custo_total_estimado?: number | null
          custo_variaveis?: number | null
          end_date?: string
          id?: string
          observacoes?: string | null
          peso_ton?: number | null
          receita?: number | null
          route_id?: string
          start_date?: string
          status?: string
          tempo_estimado_h?: number | null
          updated_at?: string
          user_id?: string
          vehicle_id?: string
          volume_m3?: number | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          capacidade_ton: number
          created_at: string
          id: string
          km_por_litro: number
          status: string
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capacidade_ton: number
          created_at?: string
          id?: string
          km_por_litro: number
          status?: string
          tipo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capacidade_ton?: number
          created_at?: string
          id?: string
          km_por_litro?: number
          status?: string
          tipo?: string
          updated_at?: string
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
