
export type PropertyStatus = 'Sale' | 'Rent' | 'Buy';
export type PropertyType = 'Residential' | 'Commercial' | 'Land';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'seeker' | 'owner' | 'admin' | 'developer';
  company_name?: string;
  public_preference?: 'Anonymized' | 'Full';
  created_at?: string;
}

export interface Property {
  id: string | number;
  title: string;
  location: string;
  landmark?: string;
  area: number;
  dimensions: string;
  description: string;
  price: number;
  status: PropertyStatus;
  type: PropertyType;
  imageUrl: string;
  images?: string;
  is_verified?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  is_negotiable?: boolean;
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
  is_verified?: boolean;
  is_active?: boolean;
  user?: User;
  user_id?: number | string;
  created_at?: string;
}
