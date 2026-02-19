
export type PropertyStatus = 'Sale' | 'Rent' | 'Buy';
export type PropertyType = 'Residential Building' | 'Commercial Building' | 'Plot';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'seeker' | 'owner' | 'admin' | 'developer';
  company_name?: string;
  public_preference?: 'Anonymized' | 'Full';
  badge?: string;
  created_at?: string;
}

export interface Property {
  id: string | number;
  title: string;
  location: string;
  landmark?: string;
  area: number;
  area_unit: 'sqft' | 'acre';
  frontage?: string;
  land_use?: string;
  street_name?: string;
  village?: string;
  revenue_inspector_circle?: string;
  tehsil?: string;
  district?: string;
  dimensions?: string;
  google_map_url?: string;
  distance_from_main_location?: string;
  description: string;
  price: number;
  price_per_unit?: number;
  status: PropertyStatus;
  type: PropertyType;
  imageUrl: string;
  images?: string;
  is_verified?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  is_negotiable?: boolean;
  posted_as?: string;
  owner?: User;
  owner_id?: number | string;
  created_at?: string;
}

export interface Requirement {
  id: string | number;
  purpose: 'Buy' | 'Rent';
  type: PropertyType;
  minBudget: number;
  maxBudget: number;
  location: string;
  minArea: number;
  maxArea: number;
  description: string;
  contactMethod: string;
  contact_name?: string;
  contact_phone?: string;
  is_verified?: boolean;
  is_active?: boolean;
  user?: User;
  user_id?: number | string;
  created_at?: string;
}
