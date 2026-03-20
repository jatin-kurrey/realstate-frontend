import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Info, ChevronDown, Loader2 } from 'lucide-react';
import AddPropertyModal from '@/components/AddPropertyModal';
import PropertyCard from '@/components/PropertyCard';
import { propertyService } from '@/services/api';
import { Property } from '@/types/types';
import ActivateListingModal from '@/components/ActivateListingModal';
import Breadcrumbs from '@/components/Breadcrumbs';

const MyListingsView: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const fetchMyProperties = async () => {
    setLoading(true);
    try {
      const data = await propertyService.getMyListings();
      setProperties(data);
    } catch (error) {
      console.error('Failed to fetch my properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActivate = (property: Property) => {
    setSelectedProperty(property);
    setIsActivateModalOpen(true);
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setIsAddModalOpen(true);
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    setSelectedProperty(null);
  };
    const handleActivate = async () => {
    if (!selectedProperty) return;
    try {
      // Payment removed - directly activate in the future or keep disabled
      alert('Payment feature removed. Please contact admin for activation.');
      setIsActivateModalOpen(false);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchMyProperties();
  }, []);

  return (
    <main className="min-h-screen bg-[#fcfdfd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumbs />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-[32px] font-black text-gray-800 tracking-tight">My Property Listings</h1>
            <p className="text-gray-400 font-medium pt-1">Manage, edit, and publish your properties in Rajnandgaon</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#40a28f] text-white px-8 py-4 rounded-[18px] font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-[#358a7a] transition-all shadow-xl shadow-[#40a28f]/20 group self-start"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Add New Property
          </button>
        </div>

        {/* Filters section */}
        <div className="bg-[#f3f1ee] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 mb-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-56 space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Status</label>
              <div className="relative">
                <select className="w-full bg-white border border-gray-200/50 rounded-2xl py-3.5 px-5 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-400 text-xs font-bold font-['Inter']">
                  <option>All Statuses</option>
                  <option>Active</option>
                  <option>Expired</option>
                  <option>Draft</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
              </div>
            </div>

            <div className="w-full md:w-56 space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Purpose</label>
              <div className="relative">
                <select className="w-full bg-white border border-gray-200/50 rounded-2xl py-3.5 px-5 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-400 text-xs font-bold font-['Inter']">
                  <option>All Purposes</option>
                  <option>Sale</option>
                  <option>Rent</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-300 mt-6 md:mt-6">
              <Info className="h-6 w-6" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Filters apply automatically</span>
            </div>
          </div>
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#40a28f]" />
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onViewDetails={(prop) => navigate(`/properties/${prop.id}`)}
                  onActivate={handleOpenActivate}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-gray-400 text-sm italic">No listings to display based on current filters.</p>
            </div>
          )}
        </div>
      </div>

      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={handleAddModalClose}
        property={selectedProperty}
      />
      <ActivateListingModal
        isOpen={isActivateModalOpen}
        onClose={() => setIsActivateModalOpen(false)}
        onActivate={handleActivate}
        propertyTitle={selectedProperty?.title || ''}
      />
    </main>
  );
};

export default MyListingsView;
