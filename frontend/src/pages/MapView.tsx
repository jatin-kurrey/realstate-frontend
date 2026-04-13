import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Polyline, CircleMarker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, X, Search, Filter, Navigation, Home, Building2, DollarSign, 
  Loader2, CheckCircle2, Star, Compass, Heart, Share2, ZoomIn, ZoomOut,
  List, Map as MapIcon, ArrowLeft, Layout, Grid, LayoutDashboard, Maximize, ShieldCheck, Layers,
  Ruler, Flame, Radio, Globe, School, Hospital, Train, ShoppingBag, Coffee
} from 'lucide-react';
import { mapService } from '@/services/api';
import { MapProperty, MapRequirement } from '@/types/types';

type ViewMode = 'map' | 'list' | 'split';
type MarkerType = 'all' | 'properties' | 'requirements';
type MapStyle = 'light' | 'dark' | 'satellite' | 'snapchat' | 'terrain';
type ListingType = MapProperty | MapRequirement;

const MAP_STYLES: Record<MapStyle, { url: string; attribution: string }> = {
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO'
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri'
  },
  snapchat: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO'
  },
  terrain: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri & contributors'
  }
};

const SAMPLE_PROPERTIES: MapProperty[] = [
  { id: 1, unique_id: 'P1', title: 'Modern 3BHK Apartment in Heart of City', price: 4500000, location: 'Shankar Nagar, Rajnandgaon', district: 'Rajnandgaon', tehsil: 'Rajnandgaon', latitude: 20.7047, longitude: 81.0013, type: 'Residential', status: 'Sale', image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', is_verified: true, is_premium: false },
  { id: 2, unique_id: 'P2', title: 'Luxury Villa with Garden View', price: 12500000, location: 'Civil Lines, Rajnandgaon', district: 'Rajnandgaon', tehsil: 'Rajnandgaon', latitude: 20.7147, longitude: 81.0113, type: 'Residential', status: 'Sale', image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400', is_verified: true, is_premium: true },
  { id: 3, unique_id: 'P3', title: 'Commercial Shop Space Main Road', price: 2500000, location: 'Tucker Line, Rajnandgaon', district: 'Rajnandgaon', tehsil: 'Rajnandgaon', latitude: 20.6947, longitude: 80.9913, type: 'Commercial', status: 'Sale', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', is_verified: false, is_premium: false },
  { id: 4, unique_id: 'P4', title: 'Spacious Plot Near Highway', price: 1800000, location: 'Kawardha Road, Rajnandgaon', district: 'Rajnandgaon', tehsil: 'Rajnandgaon', latitude: 20.7247, longitude: 81.0213, type: 'Plots', status: 'Sale', image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400', is_verified: true, is_premium: false },
  { id: 5, unique_id: 'P5', title: 'Premium Penthouse with City View', price: 8500000, location: 'Lake Road, Rajnandgaon', district: 'Rajnandgaon', tehsil: 'Rajnandgaon', latitude: 20.6897, longitude: 81.0413, type: 'Residential', status: 'Sale', image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400', is_verified: true, is_premium: true },
  { id: 6, unique_id: 'P6', title: 'Cozy 2BHK Flat for Rent', price: 12000, location: 'Station Road, Rajnandgaon', district: 'Rajnandgaon', tehsil: 'Rajnandgaon', latitude: 20.7347, longitude: 80.9813, type: 'Residential', status: 'Rent', image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400', is_verified: false, is_premium: false },
  { id: 7, unique_id: 'P7', title: 'Industrial Warehouse Space', price: 35000000, location: 'Industrial Area, Raipur', district: 'Raipur', tehsil: 'Raipur', latitude: 21.2514, longitude: 81.6296, type: 'Commercial', status: 'Sale', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400', is_verified: true, is_premium: true },
  { id: 8, unique_id: 'P8', title: 'Farm House with Open Fields', price: 6200000, location: 'Dongargaon, Rajnandgaon', district: 'Rajnandgaon', tehsil: 'Dongargaon', latitude: 20.6547, longitude: 81.1513, type: 'Residential', status: 'Sale', image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400', is_verified: false, is_premium: false },
];

const SAMPLE_REQUIREMENTS: MapRequirement[] = [
  { id: 1, unique_id: 'R1', purpose: 'Buy', type: 'Residential', location: 'Rajnandgaon', district: 'Rajnandgaon', tehsil: 'Rajnandgaon', min_budget: 3000000, max_budget: 5000000, min_area: 1200, max_area: 2000, latitude: 20.7147, longitude: 81.0013, is_verified: true, is_premium: false },
  { id: 2, unique_id: 'R2', purpose: 'Rent', type: 'Commercial', location: 'Station Road, Rajnandgaon', district: 'Rajnandgaon', tehsil: 'Rajnandgaon', min_budget: 15000, max_budget: 30000, min_area: 500, max_area: 1000, latitude: 20.7047, longitude: 81.0213, is_verified: false, is_premium: false },
  { id: 3, unique_id: 'R3', purpose: 'Buy', type: 'Plots', location: 'Kawardha, Rajnandgaon', district: 'Rajnandgaon', tehsil: 'Kawardha', min_budget: 1500000, max_budget: 2500000, min_area: 1500, max_area: 3000, latitude: 21.8333, longitude: 81.2333, is_verified: true, is_premium: true },
  { id: 4, unique_id: 'R4', purpose: 'Buy', type: 'Residential', location: 'Durg', district: 'Durg', tehsil: 'Durg', min_budget: 4000000, max_budget: 7000000, min_area: 1500, max_area: 2500, latitude: 21.1896, longitude: 81.2848, is_verified: false, is_premium: false },
  { id: 5, unique_id: 'R5', purpose: 'Rent', type: 'Residential', location: 'Bhilai', district: 'Durg', tehsil: 'Bhilai', min_budget: 8000, max_budget: 15000, min_area: 400, max_area: 800, latitude: 21.2094, longitude: 81.4285, is_verified: true, is_premium: false },
];

const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, notation: val >= 100000 ? 'compact' : 'standard' }).format(val);

const DEFAULT_CENTER: [number, number] = [20.7047, 81.0013];
const DEFAULT_ZOOM = 10;

const createIcon = (type: 'property' | 'requirement', isPremium: boolean, isSelected: boolean, price?: number, minBudget?: number, maxBudget?: number) => {
  const colors = {
    property: { normal: '#40a28f', premium: '#C5A059' },
    requirement: { normal: '#6366F1', premium: '#8B5CF6' }
  };
  const color = isPremium ? colors[type].premium : colors[type].normal;
  const scale = isSelected ? 1.1 : 1;
  
  // Format price for the tag
  let displayPrice = '';
  if (type === 'property' && price) {
    displayPrice = formatCurrency(price).replace('₹', '');
  } else if (type === 'requirement' && minBudget) {
    displayPrice = `${(minBudget/100000).toFixed(0)}L+`;
  }

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="marker-wrapper ${isSelected ? 'is-selected' : ''}" style="transform: scale(${scale});">
        <div class="price-tag shadow-2xl" style="background:${color};">
          <div class="tag-content">
            <span class="currency-symbol">₹</span>
            <span class="price-value">${displayPrice}</span>
            ${isPremium ? '<div class="premium-badge-dot"></div>' : ''}
          </div>
          <div class="tag-beak" style="border-top-color:${color};"></div>
        </div>
        ${isSelected ? `<div class="selection-glow" style="background:${color}30;"></div>` : ''}
      </div>
    `,
    iconSize: [60, 40],
    iconAnchor: [30, 40],
  });
};

// Production-grade Geospatial Utilities
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const CITY_LANDMARKS = [
  { name: 'District High School', lat: 21.0964, lon: 81.0267, icon: <School className="w-4 h-4" /> },
  { name: 'City Civil Hospital', lat: 21.1012, lon: 81.0345, icon: <Hospital className="w-4 h-4" /> },
  { name: 'Rajnandgaon Jn.', lat: 21.0921, lon: 81.0398, icon: <Train className="w-4 h-4" /> },
  { name: 'Shopping Hub Center', lat: 21.0988, lon: 81.0312, icon: <ShoppingBag className="w-4 h-4" /> },
  { name: 'Metro Cafe Square', lat: 21.1045, lon: 81.0289, icon: <Coffee className="w-4 h-4" /> }
];

const useResizeObserver = (target: React.RefObject<HTMLDivElement>, onResize: () => void) => {
  useEffect(() => {
    if (!target.current) return;
    const observer = new ResizeObserver(() => onResize());
    observer.observe(target.current);
    return () => observer.disconnect();
  }, [target, onResize]);
};

function MapController({ center, zoom, viewMode, onBoundsChange, mapRef }: { 
  center: [number, number]; 
  zoom: number; 
  viewMode: string;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
  mapRef?: React.RefObject<HTMLDivElement>;
}) {
  const map = useMap();
  
  useMapEvents({
    moveend: () => onBoundsChange?.(map.getBounds()),
    zoomend: () => onBoundsChange?.(map.getBounds())
  });

  useResizeObserver(mapRef as any, () => map.invalidateSize());

  useEffect(() => { 
    map.setView(center, zoom, { animate: true, duration: 0.5 }); 
  }, [center, zoom, map]);
  
  return null;
}

// Interactive Ruler Component
function RulerController({ active, points, setPoints }: { active: boolean; points: [number, number][]; setPoints: React.Dispatch<React.SetStateAction<[number, number][]>> }) {
  const map = useMap();

  useEffect(() => {
    if (!active) return;
    const onClick = (e: L.LeafletMouseEvent) => setPoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
    map.on('click', onClick);
    return () => { map.off('click', onClick); };
  }, [active, map, setPoints]);

  if (points.length < 2) return null;

  const totalDist = points.slice(1).reduce((acc, p, i) => acc + map.distance(L.latLng(p[0], p[1]), L.latLng(points[i][0], points[i][1])), 0);

  return (
    <>
      <Polyline positions={points} color="#40a28f" weight={3} dashArray="10, 10" lineCap="round" />
      {points.map((p, i) => (
        <CircleMarker key={i} center={p} radius={i === points.length - 1 ? 6 : 4} fillColor={i === points.length - 1 ? "#40a28f" : "white"} fillOpacity={1} color="#40a28f" weight={2} />
      ))}
      <Marker position={points[points.length - 1]} icon={L.divIcon({
        className: 'total-dist-label',
        html: `<div class="bg-[#40a28f] text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-2xl border-2 border-white translate-y-8 whitespace-nowrap pulse">TOTAL: ${(totalDist / 1000).toFixed(2)} km</div>`,
        iconSize: [100, 30],
        iconAnchor: [50, 0]
      })} />
    </>
  );
}

// Heatmap Visualization Layer (Gaussian Glow Saturation)
function HeatmapLayer({ properties, active }: { properties: MapProperty[]; active: boolean }) {
  if (!active || properties.length === 0) return null;
  
  const maxPrice = Math.max(...properties.map(p => p.price));
  
  return (
    <>
      {properties.map((p, i) => {
        if (!p.latitude) return null;
        const intensity = p.price / maxPrice;
        // Determine color based on intensity (Growth -> Value -> Capital)
        const color = intensity > 0.8 ? '#f97316' : intensity > 0.4 ? '#C5A059' : '#10b981';
        const size = 300 + (intensity * 400); // 300px to 700px glow radius
        
        return (
          <Marker 
            key={`heat-${i}`} 
            position={[p.latitude, p.longitude]} 
            interactive={false}
            icon={L.divIcon({
              className: 'heatmap-glow-container',
              html: `<div style="
                width: ${size}px; 
                height: ${size}px; 
                background: radial-gradient(circle, ${color}33 0%, ${color}00 70%); 
                filter: blur(${size / 6}px);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                pointer-events: none;
              "></div>`,
              iconSize: [0, 0],
              iconAnchor: [0, 0]
            })} 
          />
        );
      })}
    </>
  );
}

interface PropertyModalProps {
  property: MapProperty;
  onClose: () => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  navigate: ReturnType<typeof useNavigate>;
}

const PropertyModal: React.FC<PropertyModalProps> = ({ property, onClose, favorites, onToggleFavorite, navigate }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
    <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="relative h-56 sm:h-64">
        <img src={property.image_url || 'https://via.placeholder.com/600x300/40a28f/ffffff?text=Property'} alt={property.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <button onClick={onClose} className="absolute top-5 right-5 p-2.5 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all z-10" aria-label="Close">
          <X className="w-6 h-6" />
        </button>
        <div className="absolute bottom-5 left-6 right-6">
          <div className="flex gap-2 mb-3">
            {property.is_premium && <span className="px-2.5 py-1 bg-[#C5A059] rounded-lg text-[10px] font-black text-white uppercase flex items-center gap-1.5 shadow-lg shadow-[#C5A059]/20"><Star className="w-3 h-3 fill-current" />Premium</span>}
            {property.is_verified && <span className="px-2.5 py-1 bg-green-500 rounded-lg text-[10px] font-black text-white uppercase flex items-center gap-1.5 shadow-lg shadow-green-500/20"><CheckCircle2 className="w-3 h-3" />Verified</span>}
          </div>
          <h2 id="modal-title" className="text-2xl font-black text-white leading-tight drop-shadow-md">{property.title}</h2>
          <p className="text-white/90 text-sm font-medium flex items-center gap-2 mt-2"><MapPin className="w-4 h-4 text-[#4ba995]" />{property.location}</p>
        </div>
      </div>
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Asset Valuation</p>
            <p className="text-3xl font-black text-[#40a28f] tracking-tight">{formatCurrency(property.price)}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => onToggleFavorite(property.id)} className={`p-4 rounded-[20px] border transition-all ${favorites.includes(property.id) ? 'bg-red-50 border-red-100 text-red-500 shadow-xl shadow-red-500/10' : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50'}`} aria-label={favorites.includes(property.id) ? 'Remove from favorites' : 'Add to favorites'}>
              <Heart className={`w-7 h-7 ${favorites.includes(property.id) ? 'fill-current' : ''}`} />
            </button>
            <button className="p-4 rounded-[20px] bg-gray-50 border border-gray-100 text-gray-400 hover:text-[#40a28f] hover:bg-[#40a28f]/5 transition-all" aria-label="Share"><Share2 className="w-7 h-7" /></button>
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset Specifications</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100/50">
              <p className="text-[9px] font-black text-[#40a28f] uppercase tracking-widest mb-1.5 flex items-center gap-2"><Maximize className="w-3 h-3" /> Area</p>
              <p className="text-sm font-black text-gray-900">2,450 <span className="text-[10px] opacity-60">SqFt</span></p>
            </div>
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100/50">
              <p className="text-[9px] font-black text-[#40a28f] uppercase tracking-widest mb-1.5 flex items-center gap-2"><Compass className="w-3 h-3" /> Facing</p>
              <p className="text-sm font-black text-gray-900">East</p>
            </div>
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100/50">
              <p className="text-[9px] font-black text-[#40a28f] uppercase tracking-widest mb-1.5 flex items-center gap-2"><LayoutDashboard className="w-3 h-3" /> Floor</p>
              <p className="text-sm font-black text-gray-900">4th of 12</p>
            </div>
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100/50">
              <p className="text-[9px] font-black text-[#40a28f] uppercase tracking-widest mb-1.5 flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Status</p>
              <p className="text-sm font-black text-gray-900">Verified</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={() => navigate(`/properties/${property.id}`)} className="flex-1 py-4.5 bg-[#40a28f] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-[#40a28f]/20 hover:bg-[#348e7c] hover:translate-y-[-2px] transition-all active:translate-y-0">
            View Complete Portfolio
          </button>
          <button className="px-8 py-4 border-2 border-gray-100 text-gray-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] hover:border-[#40a28f] hover:text-[#40a28f] transition-all">
            Call
          </button>
        </div>
      </div>
    </div>
  </div>
);

interface RequirementModalProps {
  requirement: MapRequirement;
  onClose: () => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  navigate: ReturnType<typeof useNavigate>;
}

const RequirementModal: React.FC<RequirementModalProps> = ({ requirement, onClose, favorites, onToggleFavorite, navigate }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
    <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex gap-2 mb-3">
              {requirement.is_premium && <span className="px-2.5 py-1 bg-[#8B5CF6] rounded-lg text-[10px] font-black text-white uppercase flex items-center gap-1.5 shadow-lg shadow-[#8B5CF6]/20"><Star className="w-3 h-3 fill-current" />Premium</span>}
              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{requirement.purpose}</span>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{requirement.type}</span>
            </div>
            <h2 className="text-2xl font-black text-gray-800 leading-tight">Property Requirement</h2>
            <p className="text-gray-500 text-sm font-medium flex items-center gap-2 mt-2"><MapPin className="w-4 h-4 text-indigo-400" />{requirement.location}</p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 transition-all shadow-sm" aria-label="Close"><X className="w-6 h-6" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em] mb-1">Capital Range</p>
            <p className="text-xl font-black text-indigo-600">{formatCurrency(requirement.min_budget)} - {formatCurrency(requirement.max_budget)}</p>
          </div>
          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em] mb-1">Preferred Footprint</p>
            <p className="text-xl font-black text-indigo-600 truncate">{requirement.min_area}-{requirement.max_area} <span className="text-[10px] font-medium">SqFt</span></p>
          </div>
        </div>

        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Geographic Scope</p>
          <div className="flex items-center justify-between text-xs font-black text-gray-600">
            <div className="flex items-center gap-2">
              <MapIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>{requirement.district}</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <span>{requirement.tehsil}</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={() => navigate(`/requirements/${requirement.id}`)} className="flex-1 py-4 bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-500/30 transition-all active:scale-95">Analyze Requirement</button>
          <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(requirement.id); }} className={`p-4 rounded-2xl border transition-all ${favorites.includes(requirement.id) ? 'bg-red-50 border-red-200 text-red-500 shadow-lg shadow-red-500/10' : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50'}`} aria-label="Add to favorites">
            <Heart className={`w-6 h-6 ${favorites.includes(requirement.id) ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const MapView: React.FC = () => {
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [properties] = useState<MapProperty[]>(SAMPLE_PROPERTIES);
  const [requirements] = useState<MapRequirement[]>(SAMPLE_REQUIREMENTS);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [markerType, setMarkerType] = useState<MarkerType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ListingType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem('map_favorites') || '[]'); } catch { return []; } });
  const [showPremium, setShowPremium] = useState(false);
  const [visibleStats, setVisibleStats] = useState({ name: 'Global Market', count: 0, avgPrice: 0, hotspots: 0 });
  const [mapStyle, setMapStyle] = useState<MapStyle>('light');
  const [showStyleDrawer, setShowStyleDrawer] = useState(false);
  const [isRulerActive, setIsRulerActive] = useState(false);
  const [rulerPoints, setRulerPoints] = useState<[number, number][]>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showAmenities, setShowAmenities] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { localStorage.setItem('map_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); } }, [toast]);

  const filteredProperties = useMemo(() => {
    let list = properties;
    if (searchQuery) { const q = searchQuery.toLowerCase(); list = list.filter(p => p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.district.toLowerCase().includes(q)); }
    if (showPremium) { list = list.filter(p => p.is_premium || p.price >= 30000000); }
    return list;
  }, [properties, searchQuery, showPremium]);

  const filteredRequirements = useMemo(() => {
    let list = requirements;
    if (searchQuery) { const q = searchQuery.toLowerCase(); list = list.filter(r => r.location.toLowerCase().includes(q) || r.district.toLowerCase().includes(q)); }
    if (showPremium) { list = list.filter(r => r.is_premium || r.max_budget >= 30000000); }
    return list;
  }, [requirements, searchQuery, showPremium]);

  const handleMarkerClick = useCallback((item: ListingType) => { setSelectedItem(item); if ('latitude' in item && item.latitude) { setMapCenter([item.latitude, item.longitude]); setZoom(14); } }, []);
  const handleCardClick = useCallback((item: ListingType) => { setSelectedItem(item); if ('latitude' in item && item.latitude) { setMapCenter([item.latitude, item.longitude]); } }, []);
  const toggleFavorite = useCallback((id: number) => { 
    setFavorites(prev => {
      const isRemoving = prev.includes(id);
      setToast({ msg: isRemoving ? 'Removed from favorites' : 'Added to favorites', type: 'success' }); 
      return isRemoving ? prev.filter(f => f !== id) : [...prev, id];
    });
  }, []);
  const resetView = useCallback(() => { setMapCenter(DEFAULT_CENTER); setZoom(DEFAULT_ZOOM); setSelectedItem(null); }, []);
  const handleLocate = useCallback(() => { if (navigator.geolocation) { navigator.geolocation.getCurrentPosition((pos) => { setMapCenter([pos.coords.latitude, pos.coords.longitude]); setZoom(14); setToast({ msg: 'Location updated', type: 'success' }); }, () => setToast({ msg: 'Could not get location', type: 'error' })); } else { setToast({ msg: 'Geolocation not supported', type: 'error' }); } }, []);
  const isProperty = (item: ListingType): item is MapProperty => 'status' in item;

  const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
    const visible = filteredProperties.filter(p => p.latitude && bounds.contains(L.latLng(p.latitude, p.longitude)));
    const avgPrice = visible.length > 0 ? visible.reduce((acc, p) => acc + p.price, 0) / visible.length : 0;
    
    // Calculate hotspots (clusters of high density)
    const hotspots = visible.filter(p => p.is_premium).length;

    // Determine the most common district in view
    const districtSales: Record<string, number> = {};
    visible.forEach(p => districtSales[p.district] = (districtSales[p.district] || 0) + 1);
    const topDistrict = Object.entries(districtSales).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Visible Region';

    setVisibleStats({ name: topDistrict, count: visible.length, avgPrice, hotspots });
  }, [filteredProperties]);

  const dynamicAmenities = useMemo(() => {
    if (!selectedItem || !isProperty(selectedItem)) return [];
    return CITY_LANDMARKS.map(l => {
      const dist = calculateDistance(selectedItem.latitude, selectedItem.longitude, l.lat, l.lon);
      const time = dist < 1 ? Math.round(dist * 15).toString() + 'm walk' : Math.round(dist * 5).toString() + 'm drive';
      return { icon: l.icon, name: l.name, dist: `${dist.toFixed(1)} km`, time };
    }).sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist)).slice(0, 4);
  }, [selectedItem]);

  const totalCount = filteredProperties.length + filteredRequirements.length;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-gray-50 font-['Outfit']">
      {/* Header */}
      {/* Header with Luxury Glassmorphism */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-8 py-5 z-40 sticky top-0 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] font-['Outfit']">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-gradient-to-br from-[#40a28f] to-[#348e7c] rounded-2xl flex items-center justify-center shadow-xl shadow-[#40a28f]/20 group-hover:scale-105 transition-transform duration-500">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1.5">Property Map</h1>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{totalCount} Selective Listings</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 max-w-2xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#40a28f] transition-colors" />
            <input 
              type="search" 
              placeholder="Locate area, society or project..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-12 pr-6 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f]/50 transition-all placeholder:text-gray-300" 
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-[18px] border border-gray-100/80">
              {(['map', 'split', 'list'] as const).map((mode) => (
                <button 
                  key={mode} 
                  onClick={() => setViewMode(mode)} 
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${viewMode === mode ? 'bg-[#40a28f] text-white shadow-lg shadow-[#40a28f]/25 scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                >
                  {mode === 'map' ? <MapIcon className="w-3.5 h-3.5" /> : mode === 'split' ? <Layout className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                  <span className={viewMode === mode ? 'inline' : 'hidden md:inline'}>{mode}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className={`p-3.5 rounded-2xl border transition-all duration-300 ${showFilters ? 'bg-gray-900 border-gray-900 text-white rotate-180 shadow-xl' : 'bg-white border-gray-100 text-gray-500 hover:border-[#40a28f] hover:text-[#40a28f] shadow-sm'}`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-8 mt-5 pt-5 border-t border-gray-100/80 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Listing Focus:</span>
              <div className="flex gap-2">
                {(['all', 'properties', 'requirements'] as MarkerType[]).map((type) => (
                  <button 
                    key={type} 
                    onClick={() => setMarkerType(type)} 
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${markerType === type ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {type === 'all' ? 'All Assets' : type === 'properties' ? 'Properties' : 'Demands'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-6 w-px bg-gray-100 hidden sm:block" />

            <button 
              onClick={() => setShowPremium(!showPremium)} 
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${showPremium ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              <Star className={`w-3.5 h-3.5 ${showPremium ? 'fill-current' : ''}`} /> Exclusive Only
            </button>
            
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Bookmarked:</span>
              <div className="px-3 py-1.5 bg-red-50 text-red-500 rounded-xl text-[10px] font-black flex items-center gap-2 border border-red-100/50">
                <Heart className="w-3.5 h-3.5 fill-current" /> {favorites.length}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Content Container */}
      <div className={`flex-1 relative overflow-hidden bg-gray-100 ${viewMode === 'list' ? 'p-4 sm:p-10' : 'p-0 sm:p-5'}`}>
        {/* Map Column */}
        {(viewMode === 'map' || viewMode === 'split') && (
          <div ref={containerRef} className="absolute inset-0 sm:inset-5 z-10 rounded-[32px] overflow-hidden shadow-2xl border border-white/50 bg-white group/map">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-xl z-[100] animate-in fade-in duration-500">
                <div className="text-center group-hover/map:scale-110 transition-transform duration-700">
                  <div className="w-16 h-16 border-[6px] border-[#40a28f]/10 border-t-[#40a28f] rounded-full animate-spin shadow-2xl shadow-[#40a28f]/20 mx-auto"></div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-6 animate-pulse">Syncing Intelligence...</p>
                </div>
              </div>
            )}
            
            <MapContainer center={mapCenter} zoom={zoom} className={`h-full w-full ${isRulerActive ? 'cursor-crosshair' : ''}`} zoomControl={false} attributionControl={false}>
              <MapController center={mapCenter} zoom={zoom} viewMode={viewMode} onBoundsChange={handleBoundsChange} mapRef={containerRef} />
              <TileLayer key={mapStyle} url={MAP_STYLES[mapStyle].url} attribution={MAP_STYLES[mapStyle].attribution} />
              
              {/* Intelligent Map Layers */}
              <HeatmapLayer active={showHeatmap} properties={filteredProperties} />
              <RulerController active={isRulerActive} points={rulerPoints} setPoints={setRulerPoints} />

              {(markerType === 'all' || markerType === 'properties') && filteredProperties.map((p) => p.latitude ? <Marker key={`p-${p.id}`} position={[p.latitude, p.longitude]} icon={createIcon('property', p.is_premium, selectedItem?.id === p.id, p.price)} eventHandlers={{ click: () => handleMarkerClick(p) }} /> : null)}
              {(markerType === 'all' || markerType === 'requirements') && filteredRequirements.map((r) => r.latitude ? <Marker key={`r-${r.id}`} position={[r.latitude, r.longitude]} icon={createIcon('requirement', r.is_premium, selectedItem?.id === r.id, undefined, r.min_budget, r.max_budget)} eventHandlers={{ click: () => handleMarkerClick(r) }} /> : null)}
            </MapContainer>

          </div>
        )}

        {/* Info/List/Detail Column */}
        {(viewMode === 'list' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-[480px] absolute right-12 top-12 bottom-12 z-20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.35)]' : 'relative w-full h-full z-10'} bg-white/95 backdrop-blur-2xl rounded-[32px] overflow-hidden border border-white/60 flex flex-col transition-all duration-500`}>
            {viewMode === 'split' && selectedItem ? (
              /* Detail Sidebar Mode */
              <div className="h-full flex flex-col bg-white animate-in slide-in-from-right-8 duration-500 ease-out">
                {/* Header with Glassmorphic feel */}
                <div className="sticky top-0 bg-white/90 backdrop-blur-xl z-30 px-8 py-5 border-b border-gray-100/50 flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedItem(null)} 
                    className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-[#40a28f] group-hover:border-[#40a28f] group-hover:text-white transition-all">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover:text-[#40a28f] transition-colors">Back to Browse</span>
                  </button>
                  <div className="flex gap-2.5">
                    <button 
                      onClick={() => toggleFavorite(selectedItem.id)} 
                      className={`p-3 rounded-2xl border transition-all duration-300 shadow-sm ${favorites.includes(selectedItem.id) ? 'bg-red-50 border-red-200 text-red-500 scale-105 shadow-red-500/10' : 'bg-white border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100'}`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(selectedItem.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-[#40a28f] hover:border-[#40a28f]/30 shadow-sm transition-all active:scale-95">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto font-['Outfit']">
                  <div className="relative h-64 sm:h-80">
                    <img src={(isProperty(selectedItem) ? selectedItem.image_url : null) || 'https://via.placeholder.com/600x400/40a28f/ffffff?text=Property'} className="w-full h-full object-cover" alt="Property" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex gap-2 mb-3">
                        {selectedItem.is_premium && <span className="px-2.5 py-1 bg-[#C5A059] rounded-lg text-[10px] font-black text-white uppercase flex items-center gap-1.5 shadow-lg shadow-[#C5A059]/20"><Star className="w-3 h-3 fill-current" />Premium</span>}
                        {isProperty(selectedItem) && selectedItem.is_verified && <span className="px-2.5 py-1 bg-green-500 rounded-lg text-[10px] font-black text-white uppercase flex items-center gap-1.5 shadow-lg shadow-green-500/20"><CheckCircle2 className="w-3 h-3" />Verified</span>}
                      </div>
                      <h2 className="text-2xl font-black text-white leading-tight font-['Outfit'] truncate">{isProperty(selectedItem) ? selectedItem.title : 'Property Requirement'}</h2>
                      <p className="text-white/80 text-sm font-medium flex items-center gap-2 mt-2"><MapPin className="w-4 h-4 text-[#4ba995]" />{selectedItem.location}</p>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{isProperty(selectedItem) ? 'Asset Valuation' : 'Capital Allocation'}</p>
                        <p className="text-4xl font-black text-[#40a28f] tracking-tight hover:scale-[1.02] transition-transform origin-left cursor-default">
                          {isProperty(selectedItem) ? formatCurrency(selectedItem.price) : `${formatCurrency((selectedItem as MapRequirement).min_budget)}- ${formatCurrency((selectedItem as MapRequirement).max_budget)}`}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">Available Now</span>
                      </div>
                    </div>

                    {/* Quick Media Highlights */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {[1,2,3].map((i) => (
                        <div key={i} className="w-20 h-20 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden border-2 border-white shadow-sm hover:border-[#40a28f] transition-all cursor-pointer">
                          <img src={`https://images.unsplash.com/photo-${i === 1 ? '1568605114967-8130f3a36994' : i === 2 ? '1512917774080-9991f1c4c750' : '1613490493576-7fde63acd811'}?w=200`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <div className="w-20 h-20 rounded-2xl bg-gray-50 flex-shrink-0 flex items-center justify-center border-2 border-dashed border-gray-200 text-gray-400 text-[10px] font-black uppercase text-center hover:bg-gray-100 transition-all cursor-pointer">
                        +8 More
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.25em]">Strategic Highlights</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {isProperty(selectedItem) ? (
                          <>
                            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100/50 group hover:border-[#40a28f]/30 transition-all">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Maximize className="w-3 h-3" /> Built-up Area</p>
                              <p className="text-sm font-black text-gray-900 uppercase tracking-tight">2,450 <span className="text-[10px] opacity-60 font-medium">Sq Ft</span></p>
                            </div>
                            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100/50 group hover:border-[#40a28f]/30 transition-all">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Compass className="w-3 h-3" /> Facing</p>
                              <p className="text-sm font-black text-gray-900 uppercase tracking-tight">North-East</p>
                            </div>
                            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100/50 group hover:border-[#40a28f]/30 transition-all">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><LayoutDashboard className="w-3 h-3" /> Floor</p>
                              <p className="text-sm font-black text-gray-900 uppercase tracking-tight">4th of 12</p>
                            </div>
                            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100/50 group hover:border-[#40a28f]/30 transition-all">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Property Age</p>
                              <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Under 2 Years</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 group hover:border-indigo-500/30 transition-all">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Maximize className="w-3 h-3" /> Preferred Area</p>
                              <p className="text-sm font-black text-indigo-900 uppercase tracking-tight">{(selectedItem as MapRequirement).min_area}-{(selectedItem as MapRequirement).max_area} <span className="text-[10px] opacity-60 font-medium whitespace-nowrap">Sq Ft</span></p>
                            </div>
                            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 group hover:border-indigo-500/30 transition-all">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Navigation className="w-3 h-3" /> Urgency</p>
                              <p className="text-sm font-black text-indigo-900 uppercase tracking-tight">High Priority</p>
                            </div>
                            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 group hover:border-indigo-500/30 transition-all">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Home className="w-3 h-3" /> Structure</p>
                              <p className="text-sm font-black text-indigo-900 uppercase tracking-tight">{(selectedItem as MapRequirement).type}</p>
                            </div>
                            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 group hover:border-indigo-500/30 transition-all">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Layout className="w-3 h-3" /> Purpose</p>
                              <p className="text-sm font-black text-indigo-900 uppercase tracking-tight">{(selectedItem as MapRequirement).purpose}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Geographic Context</p>
                      <div className="flex items-center justify-between text-xs font-black text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapIcon className={`w-3.5 h-3.5 ${isProperty(selectedItem) ? 'text-[#40a28f]' : 'text-indigo-500'}`} />
                          <span>{selectedItem.district}</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                        <span>{selectedItem.tehsil}</span>
                      </div>
                    </div>

                    {/* Surroundings Radar (Feature 1) */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Radio className="w-3 h-3 text-[#40a28f]" /> Surroundings Radar
                        </p>
                        <span className="text-[9px] font-black text-[#40a28f] px-2 py-0.5 bg-[#40a28f]/10 rounded-full uppercase tracking-tighter">Live Analysis</span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {dynamicAmenities.map((poi, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-[#40a28f]/30 transition-all group cursor-pointer hover:shadow-lg hover:shadow-[#40a28f]/5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#40a28f]/10 group-hover:text-[#40a28f] transition-all">
                                {poi.icon}
                              </div>
                              <div>
                                <p className="text-xs font-black text-gray-800 leading-none mb-1">{poi.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{poi.time}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-gray-900">{poi.dist}</p>
                              <div className="w-3 h-0.5 bg-[#40a28f] ml-auto mt-1 rounded-full opacity-30"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-gray-900 rounded-[32px] text-white shadow-2xl space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-[#40a28f]" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Asset Status</p>
                          <p className="text-sm font-black uppercase tracking-tight">Fully Documented & Verified</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button onClick={() => navigate(`/${isProperty(selectedItem) ? 'properties' : 'requirements'}/${selectedItem.id}`)} className="flex-1 py-4 bg-[#40a28f] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#348e7c] transition-all hover:translate-y-[-2px] active:translate-y-0 shadow-lg shadow-[#40a28f]/30">
                          {isProperty(selectedItem) ? 'Secure This Deal' : 'Submit My Offer'}
                        </button>
                        <button className="px-6 rounded-2xl border border-white/10 hover:bg-white/5 transition-all">
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* List Mode */
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-8 font-['Outfit']">
                  {/* Properties Section */}
                  {(markerType === 'all' || markerType === 'properties') && filteredProperties.length > 0 && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between mb-5 sticky top-0 bg-white/40 backdrop-blur-md py-3 z-10 -mx-6 px-6">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#40a28f] shadow-[0_0_8px_#40a28f]"></div>
                          Available Assets ({filteredProperties.length})
                        </h2>
                      </div>
                      <div className="grid gap-5">
                        {filteredProperties.map((p, idx) => (
                          <article 
                            key={p.id} 
                            onClick={() => handleCardClick(p)} 
                            style={{ animationDelay: `${idx * 50}ms` }}
                            className={`group p-4 bg-white/60 backdrop-blur-sm rounded-[24px] border border-white/40 cursor-pointer transition-all duration-500 hover:shadow-[0_32px_48px_-12px_rgba(0,0,0,0.1)] hover:bg-white hover:border-[#40a28f]/30 hover:-translate-y-1 ${selectedItem?.id === p.id ? 'bg-white border-[#40a28f] ring-1 ring-[#40a28f] shadow-2xl shadow-[#40a28f]/10' : ''}`}
                          >
                            <div className="flex gap-5">
                              <div className="relative w-32 h-32 rounded-[20px] overflow-hidden flex-shrink-0 shadow-lg bg-gray-50">
                                <img src={p.image_url || 'https://via.placeholder.com/150/40a28f/ffffff?text=Property'} alt={p.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                {p.is_premium && (
                                  <div className="absolute top-2.5 left-2.5 px-2 py-1 bg-[#C5A059] rounded-lg shadow-lg flex items-center border border-white/20">
                                    <Star className="w-3 h-3 text-white fill-current" />
                                  </div>
                                )}
                                {p.is_verified && (
                                  <div className="absolute bottom-2.5 right-2.5 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-start justify-between gap-3">
                                    <h3 className="font-black text-gray-900 text-lg leading-tight line-clamp-1 group-hover:text-[#40a28f] transition-colors">{p.title}</h3>
                                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }} className={`p-2.5 rounded-xl transition-all duration-300 ${favorites.includes(p.id) ? 'bg-red-50 text-red-500 scale-110 shadow-lg shadow-red-500/10' : 'bg-gray-50/50 text-gray-300 hover:text-red-500 hover:bg-red-50'}`}><Heart className={`w-4.5 h-4.5 ${favorites.includes(p.id) ? 'fill-current' : ''}`} /></button>
                                  </div>
                                  <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5 mt-2"><MapPin className="w-3.5 h-3.5 text-[#40a28f]/60" />{p.location}</p>
                                </div>
                                
                                <div className="flex items-center justify-between mt-auto pt-2">
                                  <span className="text-xl font-black text-[#40a28f] tracking-tighter">{formatCurrency(p.price)}</span>
                                  <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-wider border border-gray-100">{p.type}</span>
                                    <span className={`px-3 py-1 ${p.status === 'Sale' ? 'bg-[#40a28f]/10 text-[#40a28f]' : 'bg-orange-50 text-orange-600'} rounded-lg text-[9px] font-black uppercase tracking-wider border border-current/10`}>{p.status}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Requirements Section */}
                  {(markerType === 'all' || markerType === 'requirements') && filteredRequirements.length > 0 && (
                    <section className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="flex items-center justify-between mb-5 sticky top-0 bg-white/40 backdrop-blur-md py-3 z-10 -mx-6 px-6">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></div>
                          Market Demand ({filteredRequirements.length})
                        </h2>
                      </div>
                      <div className="grid gap-5">
                        {filteredRequirements.map((r, idx) => (
                          <article 
                            key={r.id} 
                            onClick={() => handleCardClick(r)} 
                            style={{ animationDelay: `${(idx + filteredProperties.length) * 50}ms` }}
                            className={`group p-5 bg-white/60 backdrop-blur-sm rounded-[24px] border border-white/40 cursor-pointer transition-all duration-500 hover:shadow-[0_32px_48px_-12px_rgba(0,0,0,0.1)] hover:bg-white hover:border-indigo-200 hover:-translate-y-1 ${selectedItem?.id === r.id ? 'bg-white border-indigo-500 ring-1 ring-indigo-500 shadow-2xl shadow-indigo-500/10' : ''}`}
                          >
                            <div className="flex flex-col gap-5">
                              <div className="flex items-start justify-between">
                                <div className="flex gap-2">
                                  {r.is_premium && <div className="p-2 bg-[#8B5CF6] rounded-xl shadow-lg border border-white/20"><Star className="w-3.5 h-3.5 text-white fill-current" /></div>}
                                  <span className="px-3.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border border-indigo-100">{r.purpose}</span>
                                  <span className="px-3.5 py-1.5 bg-white/80 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border border-gray-100">{r.type}</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(r.id); }} className={`p-2.5 rounded-xl transition-all duration-300 ${favorites.includes(r.id) ? 'bg-red-50 text-red-500 scale-110 shadow-lg shadow-red-500/10' : 'bg-gray-50/50 text-gray-300 hover:text-red-500 shadow-sm'}`}><Heart className={`w-4.5 h-4.5 ${favorites.includes(r.id) ? 'fill-current' : ''}`} /></button>
                              </div>
                              <div>
                                <p className="text-[12px] font-bold text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-400" />{r.location}</p>
                                <div className="flex items-end justify-between mt-4">
                                  <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Capital Profile</p>
                                    <p className="text-xl font-black text-gray-900 tracking-tighter">{formatCurrency(r.min_budget)} <span className="text-gray-300 mx-1.5">—</span> {formatCurrency(r.max_budget)}</p>
                                  </div>
                                  <div className="px-4 py-2 bg-indigo-50 rounded-xl text-[10px] font-black text-indigo-500 uppercase tracking-widest group-hover:bg-indigo-500 group-hover:text-white transition-all flex items-center gap-2">Analyze Asset <ArrowLeft className="w-3 h-3 rotate-180" /></div>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  )}

                  {totalCount === 0 && (
                    <div className="text-center py-32 animate-in fade-in duration-1000">
                      <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-inner group">
                        <Search className="w-8 h-8 text-gray-300 group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-2">Ocean of Listings</h3>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-relaxed">No matching discoverable assets<br/>found in this region</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top-Right Persistent HUD (Instrument Cluster) */}
        {(viewMode === 'map' || viewMode === 'split') && (
          <div className="absolute right-4 sm:right-10 top-0 sm:top-10 h-full sm:h-auto flex flex-col items-center justify-center sm:justify-start gap-3 z-40 pointer-events-none group">
            <div className="flex flex-col bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-2xl overflow-hidden pointer-events-auto sm:opacity-100 transition-opacity">
              <button onClick={() => setShowStyleDrawer(!showStyleDrawer)} className={`p-4 hover:bg-[#40a28f]/10 transition-all border-b border-gray-100/50 ${showStyleDrawer ? 'text-[#40a28f] bg-[#40a28f]/5' : 'text-gray-600'}`} title="Map Layers"><Layers className="w-5 h-5" /></button>
              <button 
                onClick={() => { setIsRulerActive(!isRulerActive); if (!isRulerActive) setRulerPoints([]); }} 
                className={`p-4 hover:bg-[#40a28f]/10 transition-all border-b border-gray-100/50 relative ${isRulerActive ? 'text-[#40a28f] bg-[#40a28f]/5' : 'text-gray-600'}`} 
                title="Distance Ruler"
              >
                <Ruler className="w-5 h-5" />
                {rulerPoints.length > 0 && (
                  <div 
                    onClick={(e) => { e.stopPropagation(); setRulerPoints([]); }}
                    className="absolute -left-12 top-2 p-2 bg-red-500 text-white rounded-xl shadow-xl animate-in zoom-in-50 duration-300 hover:bg-red-600"
                    title="Clear Measurement"
                  >
                    <X className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
              <button 
                onClick={() => setShowHeatmap(!showHeatmap)} 
                className={`p-4 hover:bg-[#40a28f]/10 transition-all border-b border-gray-100/50 ${showHeatmap ? 'text-orange-500 bg-orange-50' : 'text-gray-600'}`} 
                title="Heatmap View"
              >
                <Flame className="w-5 h-5" />
              </button>
              <button onClick={() => setZoom(Math.min(zoom + 1, 18))} className="p-4 hover:bg-[#40a28f]/10 text-gray-600 hover:text-[#40a28f] transition-all border-b border-gray-100/50 hidden sm:block" title="Zoom In"><ZoomIn className="w-5 h-5" /></button>
              <button onClick={() => setZoom(Math.max(zoom - 1, 5))} className="p-4 hover:bg-[#40a28f]/10 text-gray-600 hover:text-[#40a28f] transition-all hidden sm:block" title="Zoom Out"><ZoomOut className="w-5 h-5" /></button>
            </div>
            <button onClick={handleLocate} className="p-4 bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-2xl text-gray-600 hover:text-[#40a28f] hover:bg-white transition-all active:scale-95 pointer-events-auto" title="My Location"><Navigation className="w-5 h-5" /></button>
            <button onClick={resetView} className="p-4 bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-2xl text-gray-600 hover:text-[#40a28f] hover:bg-white transition-all active:scale-95 pointer-events-auto" title="Reset View"><Compass className="w-5 h-5" /></button>
          </div>
        )}

        {/* Regional Overview HUD (5) */}
        {(viewMode === 'map' || viewMode === 'split') && (
          <div className="absolute left-10 top-10 z-40 animate-in slide-in-from-left-8 fade-in duration-1000 select-none pointer-events-none">
            <div className="p-5 bg-white/95 backdrop-blur-2xl rounded-[24px] border border-white/50 shadow-2xl min-w-[200px]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-[#40a28f]/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-[#40a28f]" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Regional Focus</p>
                  <p className="text-sm font-black text-gray-800 leading-none">{visibleStats.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Volume</p>
                  <p className="text-xs font-black text-gray-700">{visibleStats.count} <span className="opacity-50">Active</span></p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Price</p>
                  <p className="text-xs font-black text-[#40a28f]">{formatCurrency(visibleStats.avgPrice)}</p>
                </div>
              </div>

              {/* Dynamic Tool Use Cases (Real-Life Integration) */}
              {(showHeatmap || isRulerActive) && (
                <div className="mt-5 pt-5 border-t border-gray-100 animate-in slide-in-from-top-2 duration-500">
                  {showHeatmap && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                          <Flame className="w-3 h-3" /> Capital Clusters
                        </p>
                        <span className="text-[10px] font-black text-gray-800">{visibleStats.hotspots} Zones</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min((visibleStats.hotspots / 5) * 100, 100)}%` }} />
                      </div>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Market saturation identified in high-capital zones</p>
                    </div>
                  )}

                  {isRulerActive && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] font-black text-[#40a28f] uppercase tracking-widest flex items-center gap-2">
                          <Ruler className="w-3 h-3" /> Site Boundary
                        </p>
                        <span className="text-[10px] font-black text-gray-800">{rulerPoints.length} Markers</span>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-[10px] font-bold text-[#40a28f] uppercase leading-tight">
                          {rulerPoints.length < 3 ? 'Survey in progress...' : 'Boundary Analysis Ready'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Map Style Switcher (Floating Gallery) */}
        {showStyleDrawer && (viewMode === 'map' || viewMode === 'split') && (
          <div className="absolute right-[90px] top-10 z-40 animate-in slide-in-from-right-4 fade-in duration-500">
            <div className="flex gap-3 bg-white/95 backdrop-blur-2xl p-3 rounded-2xl border border-white/40 shadow-2xl items-center">
              {[
                { id: 'light', label: 'Editorial', icon: '⚪' },
                { id: 'dark', label: 'Midnight', icon: '🌑' },
                { id: 'satellite', label: 'Orbital', icon: '🌍' },
                { id: 'snapchat', label: 'Snapchat', icon: '👻' },
                { id: 'terrain', label: 'Nature', icon: '🏔️' }
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => { setMapStyle(style.id as MapStyle); setShowStyleDrawer(false); }}
                  className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border transition-all ${mapStyle === style.id ? 'border-[#40a28f] bg-[#40a28f]/5 ring-4 ring-[#40a28f]/10 scale-105' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <span className="text-xl mb-1">{style.icon}</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter text-gray-500">{style.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Persistent Market Legend HUD */}
        <div className="absolute left-10 bottom-10 bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-2xl p-5 z-40 w-52 font-['Outfit'] animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Market Presence</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#40a28f] shadow-[0_0_8px_#40a28f]"></div><span className="text-[11px] font-bold text-gray-600">Assets</span></div><span className="text-[10px] font-bold text-gray-400 font-black">{filteredProperties.length}</span></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#6366F1] shadow-[0_0_8px_#6366f1]"></div><span className="text-[11px] font-bold text-gray-600">Requests</span></div><span className="text-[10px] font-bold text-gray-400 font-black">{filteredRequirements.length}</span></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#C5A059] shadow-[0_0_8px_#C5A059]"></div><span className="text-[11px] font-bold text-gray-600">Premium</span></div><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse shadow-[0_0_10px_#C5A059]"></div></div>
          </div>
        </div>
      </div>

      {/* Full Screen Modals (only in map/list views) */}
      {selectedItem && (viewMode === 'map' || viewMode === 'list') && (
        <div className="fixed inset-0 z-[9999] animate-in fade-in duration-300">
          {isProperty(selectedItem) ? (
            <PropertyModal property={selectedItem as MapProperty} onClose={() => setSelectedItem(null)} favorites={favorites} onToggleFavorite={toggleFavorite} navigate={navigate} />
          ) : (
            <RequirementModal requirement={selectedItem as MapRequirement} onClose={() => setSelectedItem(null)} favorites={favorites} onToggleFavorite={toggleFavorite} navigate={navigate} />
          )}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 text-sm font-black uppercase tracking-widest animate-in slide-in-from-bottom-8 ${toast.type === 'success' ? 'bg-white border-green-100 text-green-600 ring-2 ring-green-500/10' : 'bg-white border-red-100 text-red-600 ring-2 ring-red-500/10'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default MapView;
