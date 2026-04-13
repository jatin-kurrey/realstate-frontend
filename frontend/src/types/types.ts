
export type PropertyStatus = 'Sale' | 'Rent' | 'Mortgage';
export type PropertyType = 'Residential' | 'Commercial' | 'Plots';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'seeker' | 'owner' | 'admin' | 'developer' | 'broker';
  company_name?: string;
  public_preference?: 'Anonymized' | 'Full';
  badge?: string;
  is_premium?: boolean;
  created_at?: string;
  deleted_at?: string;
}

export interface Property {
  id: string | number;
  unique_id?: string;
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
  is_auction?: boolean;
  is_premium?: boolean;
  posted_as?: string;
  expiry_date?: string;
  auction_link?: string;
  owner?: User;
  owner_id?: number | string;
  created_at?: string;
  deleted_at?: string;
}

export interface Requirement {
  id: string | number;
  unique_id?: string;
  purpose: 'Buy' | 'Rent' | 'Mortgage';
  type: PropertyType;
  land_use?: string;
  minBudget: number;
  maxBudget: number;
  location: string;
  street_name?: string;
  village?: string;
  revenue_inspector_circle?: string;
  tehsil?: string;
  district?: string;
  landmark?: string;
  minArea: number;
  maxArea: number;
  area_unit?: 'sqft' | 'acre';
  expected_rate?: string;
  loan_duration?: string;
  description: string;
  contactMethod: string;
  contact_name?: string;
  contact_phone?: string;
  is_verified?: boolean;
  is_active?: boolean;
  is_premium?: boolean;
  user?: User;
  user_id?: number | string;
  created_at?: string;
  deleted_at?: string;
}

export interface Advertisement {
  id?: number;
  headline: string;
  displayUrl: string;
  description: string;
  cta: string;
  icon?: string;
  accent?: string;
  imageUrl?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface LocationMetadata {
  id: number;
  type: 'district' | 'tehsil' | 'ri_circle' | 'village';
  name: string;
  parent_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MapProperty {
  id: number;
  unique_id: string;
  title: string;
  price: number;
  location: string;
  district: string;
  tehsil: string;
  latitude: number;
  longitude: number;
  type: PropertyType;
  status: PropertyStatus;
  image_url: string;
  is_verified: boolean;
  is_premium: boolean;
}

export interface MapRequirement {
  id: number;
  unique_id: string;
  purpose: 'Buy' | 'Rent' | 'Mortgage';
  type: PropertyType;
  location: string;
  district: string;
  tehsil: string;
  min_budget: number;
  max_budget: number;
  min_area: number;
  max_area: number;
  latitude: number;
  longitude: number;
  is_verified: boolean;
  is_premium: boolean;
}

export interface NearbyListingsResponse {
  properties: MapProperty[];
  requirements: MapRequirement[];
  count: number;
}
