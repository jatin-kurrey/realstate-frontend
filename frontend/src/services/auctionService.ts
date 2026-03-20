import { API_URL } from './api';
import { PropertyStatus, PropertyType } from '@/types/types';

export interface AuctionProperty {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  image_url: string;
  imageUrl: string; 
  is_auction: boolean;
  is_active: boolean;
  is_premium?: boolean;
  status: PropertyStatus;
  type: PropertyType;
  area: number;
  area_unit: "sqft" | "acre";
  is_verified?: boolean;
  owner?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    badge?: string;
    company_name?: string;
    role: 'seeker' | 'owner' | 'admin' | 'developer' | 'broker';
  };
  street_name?: string;
  landmark?: string;
  village?: string;
  distance_from_main_location?: string;
  frontage?: string;
  land_use?: string;
  price_per_unit?: number;
  posted_as?: string;
  expiry_date?: string;
  auction_link?: string;
  created_at: string;
  updated_at: string;
}

class AuctionService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Get all auction properties
  async getAuctionProperties(): Promise<AuctionProperty[]> {
    try {
      const response = await fetch(`${API_URL}/auctions`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch auction properties: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Auction Service Error:', error);
      return [];
    }
  }

  // Toggle auction status of a property
  async toggleAuctionStatus(propertyId: string): Promise<any> {
    const response = await fetch(`${API_URL}/auctions/properties/${propertyId}/toggle`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to toggle auction status');
    }
    
    return response.json();
  }
}

export const auctionService = new AuctionService();
