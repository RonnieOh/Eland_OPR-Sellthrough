export type UserRole = 'admin' | 'viewer'

export interface Database {
  public: {
    Tables: {
      user_roles: {
        Row: { user_id: string; role: UserRole; created_at: string }
        Insert: { user_id: string; role?: UserRole }
        Update: { role?: UserRole }
        Relationships: []
      }
      seasons: {
        Row: Season
        Insert: Omit<Season, 'id' | 'created_at'>
        Update: Partial<Omit<Season, 'id' | 'created_at'>>
        Relationships: []
      }
      uploads: {
        Row: Upload
        Insert: Omit<Upload, 'id' | 'created_at'>
        Update: Partial<Omit<Upload, 'id' | 'created_at'>>
        Relationships: []
      }
      items: {
        Row: Item
        Insert: Omit<Item, 'id' | 'created_at'>
        Update: Partial<Omit<Item, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

export type Season = {
  id: string
  season_name: string
  start_date: string | null
  end_date: string
  target_rate_amount: number
  target_rate_qty: number
  is_active: boolean
  created_at: string
}

export type Upload = {
  id: string
  user_id: string | null
  filename: string
  upload_date: string
  reference_date: string
  season_id: string | null
  row_count: number
  created_at: string
}

export type Item = {
  id: string
  upload_id: string
  brand_name: string
  item_code: string | null
  item_name: string
  purchase_amount: number
  sales_cost: number
  sales_rate_amount: number | null
  expected_eod_rate_amount: number | null
  days_to_clearance_amount: number | null
  daily_speed_amount: number | null
  purchase_qty: number | null
  sales_qty: number | null
  sales_rate_qty: number | null
  expected_eod_rate_qty: number | null
  days_to_clearance_qty: number | null
  daily_speed_qty: number | null
  avg_selling_price: number | null
  remaining_qty: number | null
  remaining_amount: number | null
  reference_date: string
  created_at: string
}

export type Metric = 'amount' | 'qty'
