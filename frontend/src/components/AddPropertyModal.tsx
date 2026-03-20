import * as React from 'react';
import { useState, useEffect } from 'react';
import { X, ChevronDown, Map, Upload, Loader2, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { propertyService, locationService, API_URL } from '@/services/api';
import { Property, LocationMetadata } from '@/types/types';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { useAuth } from '@/contexts/AuthContext';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  onSuccess?: () => void;
}

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ isOpen, onClose, property, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { config } = useSiteConfig();
  const { isPremium, userRole } = useAuth();
  const [locations, setLocations] = useState<LocationMetadata[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      setLocationLoading(true);
      try {
        const data = await locationService.getAll();
        setLocations(data);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      } finally {
        setLocationLoading(false);
      }
    };
    if (isOpen) fetchLocations();
  }, [isOpen]);

  const [formData, setFormData] = useState({
    title: '',
    status: 'Sale',
    type: 'Residential Building',
    area: '',
    area_unit: 'sqft',
    dimensions: '',
    frontage: '',
    description: '',
    price: '',
    street_name: '',
    village: '',
    revenue_inspector_circle: '',
    tehsil: '',
    district: '',
    google_map_url: '',
    land_use: 'Residential',
    location: '',
    distance_from_main_location: '',
    landmark: '',
    is_negotiable: false,
    posted_as: 'Owner',
    is_auction: false,
    expiry_date: '',
    auction_link: '',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
  });

  const premiumThreshold = parseFloat(config['premium_price_threshold'] || '30000000');
  const isHighValue = parseFloat(formData.price) >= premiumThreshold;
  const canListPremium = isPremium || userRole === 'admin';

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || '',
        status: property.status || 'Sale',
        type: property.type || 'Residential Building',
        area: property.area?.toString() || '',
        area_unit: property.area_unit || 'sqft',
        dimensions: property.dimensions || '',
        frontage: property.frontage || '',
        description: property.description || '',
        price: property.price?.toString() || '',
        street_name: property.street_name || '',
        village: property.village || '',
        revenue_inspector_circle: property.revenue_inspector_circle || '',
        tehsil: property.tehsil || '',
        district: property.district || '',
        google_map_url: property.google_map_url || '',
        land_use: property.land_use || '',
        location: property.location || '',
        distance_from_main_location: property.distance_from_main_location || '',
        landmark: property.landmark || '',
        is_negotiable: property.is_negotiable || false,
        posted_as: property.posted_as || 'Owner',
        is_auction: property.is_auction || false,
        expiry_date: property.expiry_date ? new Date(property.expiry_date).toISOString().split('T')[0] : '',
        auction_link: property.auction_link || '',
        imageUrl: property.imageUrl || ''
      });
    } else {
      setFormData({
        title: '',
        status: 'Sale',
        type: 'Residential Building',
        area: '',
        area_unit: 'sqft',
        dimensions: '',
        frontage: '',
        description: '',
        price: '',
        street_name: '',
        village: '',
        revenue_inspector_circle: '',
        tehsil: '',
        district: '',
        google_map_url: '',
        land_use: 'Residential',
        location: '',
        distance_from_main_location: '',
        landmark: '',
        is_negotiable: false,
        posted_as: 'Owner',
        is_auction: false,
        expiry_date: '',
        auction_link: '',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
      });
    }
  }, [property, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files) as File[];
      if (selectedFiles.length + filesArray.length > 10) {
        alert('Maximum 10 photos allowed');
        const remaining = 10 - selectedFiles.length;
        if (remaining > 0) {
           setSelectedFiles(prev => [...prev, ...filesArray.slice(0, remaining)]);
        }
        return;
      }
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return null;

    const token = localStorage.getItem('token');
    const uploadData = new FormData();
    selectedFiles.forEach(file => {
      uploadData.append('images', file);
    });

    try {
      setUploading(true);
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });
      const data = await response.json();
      return data.urls;
    } catch (err) {
      console.error('Upload failed:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const imageUrls = await uploadImages();
      const locationString = `${formData.street_name}, ${formData.village}`;

      const payload = {
        ...formData,
        location: locationString,
        area: parseFloat(formData.area),
        price: parseFloat(formData.price),
        status: formData.status as any,
        type: formData.type as any,
        area_unit: formData.area_unit as 'sqft' | 'acre',
        imageUrl: imageUrls && imageUrls.length > 0 ? imageUrls[0] : formData.imageUrl,
        images: imageUrls ? imageUrls.join(',') : (property?.images || '')
      };

      if (property?.id) {
        await propertyService.update(property.id.toString(), payload);
      } else {
        await propertyService.create(payload);
      }

      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to list property. Are you logged in?');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white w-[95%] sm:w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-gray-800 tracking-tight uppercase">
              {property ? 'Edit Property' : 'List New Property'}
            </h2>
            <p className="text-[9px] sm:text-[10px] font-bold text-[#40a28f] uppercase tracking-widest">
              {property ? 'Update your listing details' : 'Listing will be visible after admin approval'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-2xl transition-all">
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 sm:space-y-10 custom-scrollbar">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl text-center">
              {error}
            </div>
          )}

          <section className="space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Property Photos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Selected" />
                  <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <label className="aspect-square bg-[#e2f2f0] border-2 border-dashed border-[#40a28f]/20 rounded-2xl flex flex-col items-center justify-center text-[#40a28f] cursor-pointer hover:bg-[#d1e8e5] transition-all gap-2">
                <Upload className="h-6 w-6" />
                <span className="text-[10px] font-black uppercase tracking-widest">Add Photo ({selectedFiles.length}/10)</span>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" disabled={selectedFiles.length >= 10} />
              </label>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Listing Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Property Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Luxury 3BHK Villa with Garden"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 placeholder:font-medium"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">I want to</label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600"
                    >
                      <option value="Sale">Sell</option>
                      <option value="Rent">Rent</option>
                      <option value="Mortgage">Mortgage</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Property Type</label>
                  <div className="relative">
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600"
                    >
                      <option value="Residential Building">Residential Building</option>
                      <option value="Commercial Building">Commercial Building</option>
                      <option value="Residential Land/Plot">Residential Land/Plot</option>
                      <option value="Commercial Land/Plot">Commercial Land/Plot</option>
                      <option value="Industrial Land/Plot">Industrial Land/Plot</option>
                      <option value="Agricultural Land">Agricultural Land</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Posted By</label>
                  <div className="relative">
                    <select
                      name="posted_as"
                      value={formData.posted_as}
                      onChange={handleChange}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600"
                    >
                      <option value="Owner">Property Owner / Seeker</option>
                      <option value="Broker">Real Estate Broker</option>
                      <option value="Builder">Real Estate Developer</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Property Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 2500000"
                    className={`w-full bg-gray-50/50 border rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 transition-all text-sm font-bold text-gray-600 placeholder:font-medium ${isHighValue ? 'border-emerald-200 focus:ring-emerald-500/5 focus:border-emerald-500' : 'border-gray-100 focus:ring-[#40a28f]/5 focus:border-[#40a28f]'}`}
                    required
                  />
                  {isHighValue && (
                    <div className="mt-3 p-4 bg-emerald-50 rounded-[24px] border border-emerald-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                       <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-tight">Premium Listing Protection</p>
                          <p className="text-[9px] text-emerald-600 font-medium leading-tight">
                            {canListPremium 
                              ? "As a Premium Member, you can list this high-value property. It will be marked as 'Premium' for verified buyers."
                              : `Properties above ₹${(premiumThreshold/10000000).toFixed(1)} Cr require Premium status. Admin approval will be required.`
                            }
                          </p>
                       </div>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Land Use</label>
                  <div className="relative">
                    <select
                      name="land_use"
                      value={formData.land_use}
                      onChange={handleChange}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 cursor-pointer"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Commercial Cum Residential">Commercial Cum Residential</option>
                      <option value="Agriculture">Agriculture</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Area</label>
                  <input type="number" name="area" value={formData.area} onChange={handleChange} placeholder="1200"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unit</label>
                  <div className="relative">
                    <select name="area_unit" value={formData.area_unit} onChange={handleChange}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-3 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600">
                      <option value="sqft">Sq Ft</option>
                      <option value="acre">Acres</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Frontage</label>
                  <input type="text" name="frontage" value={formData.frontage} onChange={handleChange} placeholder="e.g. 40ft"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dimensions</label>
                  <input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange} placeholder="e.g. 50×30 ft"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600" />
                </div>
              </div>

              {/* Location fields — District → Tehsil → RI → Village → Street → Distance → Landmark */}
              <div className="space-y-4">
                {/* Row 1: District + Tehsil + RI Circle */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">District</label>
                    <div className="relative">
                      <select name="district" value={formData.district} onChange={handleChange}
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600">
                        <option value="">Select District</option>
                        {locations.filter(l => l.type === 'district').map(l => (
                          <option key={l.id} value={l.name}>{l.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tehsil</label>
                    <div className="relative">
                      <select name="tehsil" value={formData.tehsil} onChange={handleChange}
                        disabled={!formData.district}
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 disabled:opacity-50">
                        <option value="">Select Tehsil</option>
                        {locations.filter(l => l.type === 'tehsil' && 
                          l.parent_id === locations.find(p => p.name === formData.district)?.id
                        ).map(l => (
                          <option key={l.id} value={l.name}>{l.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">RI Circle</label>
                    <div className="relative">
                      <select name="revenue_inspector_circle" value={formData.revenue_inspector_circle} onChange={handleChange}
                        disabled={!formData.tehsil}
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 disabled:opacity-50">
                        <option value="">Select RI Circle</option>
                        {locations.filter(l => l.type === 'ri_circle' && 
                          l.parent_id === locations.find(p => p.name === formData.tehsil)?.id
                        ).map(l => (
                          <option key={l.id} value={l.name}>{l.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 2: Village + Street Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Village / Locality</label>
                    <div className="relative">
                      <select name="village" value={formData.village} onChange={handleChange}
                        disabled={!formData.revenue_inspector_circle}
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 disabled:opacity-50" required>
                        <option value="">Select Village</option>
                        {locations.filter(l => l.type === 'village' && 
                          l.parent_id === locations.find(p => p.name === formData.revenue_inspector_circle)?.id
                        ).map(l => (
                          <option key={l.id} value={l.name}>{l.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Name</label>
                    <input type="text" name="street_name" value={formData.street_name} onChange={handleChange} placeholder="e.g. Main Road, Ward 4"
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600" />
                  </div>
                </div>

                {/* Row 3: Distance from Main Location */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Distance from Main Location</label>
                  <input type="text" name="distance_from_main_location" value={formData.distance_from_main_location} onChange={handleChange} placeholder="e.g. 300M from Temple"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600" />
                </div>

                {/* Row 4: Landmark */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Landmark</label>
                  <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="e.g. Near City Mall"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600" />
                </div>

                {/* Row 5: Google Map URL */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Google Map URL</label>
                  <div className="relative">
                    <Map className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="url" name="google_map_url" value={formData.google_map_url} onChange={handleChange} placeholder="https://maps.google.com/..."
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 pl-12 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600" />
                  </div>
                </div>
              </div>

              <div className="space-y-6 md:col-span-2">
                <div className="flex flex-wrap gap-6 border-y border-gray-50 py-4 my-2">
                   <div className="flex items-center gap-3 ml-1">
                    <div className="relative flex items-center">
                      <input type="checkbox" name="is_negotiable" id="is_negotiable" checked={formData.is_negotiable} onChange={handleChange}
                        className="w-5 h-5 text-[#40a28f] border-gray-200 rounded-lg focus:ring-[#40a28f] transition-all cursor-pointer" />
                    </div>
                    <label htmlFor="is_negotiable" className="text-[11px] font-black text-gray-500 uppercase tracking-widest cursor-pointer select-none">Price is Negotiable</label>
                  </div>
                  {userRole === 'admin' && (
                    <div className="space-y-4 w-full">
                      <div className="flex items-center gap-3 ml-1 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm transition-all hover:bg-amber-100/50">
                        <div className="relative flex items-center">
                          <input type="checkbox" name="is_auction" id="is_auction" checked={formData.is_auction} onChange={handleChange}
                            className="w-5 h-5 text-amber-500 border-amber-300 rounded-lg focus:ring-amber-500 transition-all cursor-pointer" />
                        </div>
                        <label htmlFor="is_auction" className="text-[11px] font-black text-amber-600 uppercase tracking-widest cursor-pointer select-none flex items-center gap-2">
                          Mark as Bank Auction
                          <ShieldCheck className="h-3 w-3" />
                        </label>
                      </div>

                      {formData.is_auction && (
                        <div className="space-y-4 ml-1 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Auction End Date (Expiry Date)</label>
                            <input
                              type="date"
                              name="expiry_date"
                              value={formData.expiry_date}
                              onChange={handleChange}
                              className="w-full bg-amber-50/30 border border-amber-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all text-sm font-bold text-gray-600"
                              required={formData.is_auction}
                            />
                            <p className="text-[8px] text-amber-500 font-bold uppercase tracking-wider ml-1">Bidding will automatically stop after this date</p>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">External Auction Link (Optional)</label>
                            <input
                              type="url"
                              name="auction_link"
                              value={formData.auction_link}
                              onChange={handleChange}
                              placeholder="https://example.com/auction-details"
                              className="w-full bg-amber-50/30 border border-amber-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all text-sm font-bold text-gray-600"
                            />
                            <p className="text-[8px] text-amber-500 font-bold uppercase tracking-wider ml-1">Link to official auction page or documents</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description (Highlight key features)</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Highlight the best things about this property..."
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 resize-none shadow-inner"
                    required
                  />
                </div>
              </div>
            </div>
          </section>
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 sticky bottom-0 z-10 backdrop-blur-md">
          <button onClick={onClose} className="px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-400 hover:bg-gray-100 transition-all">
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} disabled={loading || uploading}
            className="px-10 py-3.5 bg-[#40a28f] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#358a7a] transition-all shadow-xl shadow-[#40a28f]/20 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group">
            {loading || uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                {property ? 'Update Listing' : 'Submit for Approval'}
                <ChevronDown className="h-4 w-4 -rotate-90 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2f2f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #40a28f20; }
      `}</style>
    </div>
  );
};

export default AddPropertyModal;
