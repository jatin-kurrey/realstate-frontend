
import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Map, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { propertyService, API_URL } from '@/services/api';
import { Property } from '@/types/types';

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

  const [formData, setFormData] = useState({
    title: '',
    status: 'Sale',
    type: 'Residential',
    area: '',
    dimensions: '',
    description: '',
    price: '',
    location: '',
    landmark: '',
    is_negotiable: false,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
  });

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || '',
        status: property.status || 'Sale',
        type: property.type || 'Residential',
        area: property.area?.toString() || '',
        dimensions: property.dimensions || '',
        description: property.description || '',
        price: property.price?.toString() || '',
        location: property.location || '',
        landmark: property.landmark || '',
        is_negotiable: property.is_negotiable || false,
        imageUrl: property.imageUrl || ''
      });
    } else {
      setFormData({
        title: '',
        status: 'Sale',
        type: 'Residential',
        area: '',
        dimensions: '',
        description: '',
        price: '',
        location: '',
        landmark: '',
        is_negotiable: false,
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
      });
    }
  }, [property, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return null;

    const uploadData = new FormData();
    selectedFiles.forEach(file => {
      uploadData.append('images', file);
    });

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
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

      const payload = {
        ...formData,
        area: parseFloat(formData.area),
        price: parseFloat(formData.price),
        status: formData.status as any,
        type: formData.type as any,
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
      <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">
              {property ? 'Edit Property' : 'List New Property'}
            </h2>
            <p className="text-[10px] font-bold text-[#40a28f] uppercase tracking-widest">
              {property ? 'Update your listing details' : 'Listing will be visible after admin approval'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-2xl transition-all">
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
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
                <span className="text-[10px] font-black uppercase tracking-widest">Add Photo</span>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Listing Details</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Spacious 3BHK near Market"
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Purpose</label>
                  <div className="relative">
                    <select name="status" value={formData.status} onChange={handleChange}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 cursor-pointer">
                      <option value="Sale">For Sale</option>
                      <option value="Rent">For Rent</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type</label>
                  <div className="relative">
                    <select name="type" value={formData.type} onChange={handleChange}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 cursor-pointer">
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Land">Land / Plot</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Area (Sq Ft)</label>
                  <input type="number" name="area" value={formData.area} onChange={handleChange} placeholder="1200"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="25,00,000"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 font-mono tracking-tight" required />
                  <div className="flex items-center gap-2 mt-2 ml-1">
                    <input type="checkbox" name="is_negotiable" id="is_negotiable" checked={formData.is_negotiable} onChange={handleChange}
                      className="w-4 h-4 text-[#40a28f] border-gray-300 rounded focus:ring-[#40a28f]" />
                    <label htmlFor="is_negotiable" className="text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer">Price is Negotiable</label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location / Locality</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Kacheri Chowk"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Landmark (Public)</label>
                  <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="e.g. Near City Mall"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Tell us more about your property..."
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 resize-none" required />
              </div>
            </div>
          </section>
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 sticky bottom-0 z-10">
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
