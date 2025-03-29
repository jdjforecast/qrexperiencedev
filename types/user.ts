export interface User {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    company_name?: string
  }
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  company_name?: string
  coins: number
  is_admin: boolean
  created_at: string
  updated_at?: string
}

