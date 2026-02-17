
import { Requirement, Property } from '@/types/types';

export const COLORS = {
  primary: '#40a28f',
  primaryHover: '#358a7a',
  lightTeal: '#e2f2f0',
  darkTeal: '#2c7a6b'
};

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'p1',
    title: 'Modern 3BHK Apartment',
    location: 'Civil Lines, Rajnandgaon',
    area: 1500,
    dimensions: '50x30 ft',
    description: 'Beautiful 3BHK apartment with modern amenities and park facing view.',
    price: 4500000,
    status: 'Sale',
    type: 'Residential',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'p2',
    title: 'Commercial Shop in Main Market',
    location: 'Ganj Para, Rajnandgaon',
    area: 400,
    dimensions: '20x20 ft',
    description: 'Prime location shop suitable for retail business.',
    price: 15000,
    status: 'Rent',
    type: 'Commercial',
    imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e730f162b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'p3',
    title: 'Luxury Villa with Garden',
    location: 'Basantpur, Rajnandgaon',
    area: 2400,
    dimensions: '60x40 ft',
    description: 'Independent villa with spacious garden and double car parking.',
    price: 8500000,
    status: 'Sale',
    type: 'Residential',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800'
  }
];

export const MOCK_REQUIREMENTS: Requirement[] = [
  {
    id: '1',
    purpose: 'Buy',
    type: 'Residential',
    minBudget: 600000,
    maxBudget: 900000,
    location: 'Riverside, Lakeview',
    minArea: 1200,
    maxArea: 2200,
    description: 'Seeking family home near good schools with backyard space.',
    contactMethod: 'In-app'
  },
  {
    id: '2',
    purpose: 'Buy',
    type: 'Commercial',
    minBudget: 900000,
    maxBudget: 1500000,
    location: 'Business District, City Center',
    minArea: 2000,
    maxArea: 4000,
    description: 'Prefer modern commercial space with dedicated parking.',
    contactMethod: 'Email'
  },
  {
    id: '3',
    purpose: 'Rent',
    type: 'Commercial',
    minBudget: 3000,
    maxBudget: 7000,
    location: 'Downtown, Civic Center',
    minArea: 800,
    maxArea: 2500,
    description: 'Need ground floor retail with high foot traffic and corner visibility.',
    contactMethod: 'Phone'
  },
  {
    id: '4',
    purpose: 'Rent',
    type: 'Residential',
    minBudget: 1500,
    maxBudget: 2600,
    location: 'Central Park, Brooklyn Arts District',
    minArea: 600,
    maxArea: 1100,
    description: 'Looking for pet friendly apartment with balcony and natural light.',
    contactMethod: 'Email'
  }
];
