import { motion } from 'motion/react';
import { 
  ArrowLeft, Upload, Image as ImageIcon, 
  Home, MapPin
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { apiPost } from '../lib/api';

const propertyTypes = ['Guest House', 'Boys PG', 'Girls PG', 'Serviced Apartment'];

export default function AddProperty() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [rent, setRent] = useState('');
  const [numberOfRooms, setNumberOfRooms] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePublish = async () => {
    if (!title || !selectedType || !city || !address || !rent) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await apiPost('/owner/properties', {
        property_description: title,
        room_description: description || title,
        property_type: selectedType,
        city,
        address,
        google_maps_link: googleMapsLink || null,
        number_of_rooms: parseInt(numberOfRooms) || 1,
        rent_per_month: parseFloat(rent),
      });
      navigate('/my-properties');
    } catch {
      setError('Failed to create property. Make sure you are logged in as an Owner.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-bone pt-32 pb-20 px-4 md:px-12">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Link to="/my-properties" className="inline-flex items-center gap-2 text-charcoal/40 hover:text-charcoal transition-colors mb-4 text-xs uppercase tracking-widest font-bold">
            <ArrowLeft className="w-4 h-4" /> Back to Properties
          </Link>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-3">
            List New Residence
          </h1>
          <p className="font-sans text-charcoal/60 text-sm max-w-2xl">
            Share the details of your property. We'll review and list it on XOOMS for our exclusive community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Form Area */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Image Upload Section */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="font-serif text-xl text-charcoal mb-6">Property Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
                {/* Main Hero Image Upload */}
                <div className="md:col-span-2 h-full border-2 border-dashed border-charcoal/10 rounded-3xl bg-white hover:bg-charcoal/[0.02] transition-colors cursor-pointer flex flex-col items-center justify-center group relative overflow-hidden">
                  <div className="text-center p-8 group-hover:scale-105 transition-transform duration-300">
                    <div className="w-16 h-16 rounded-full bg-charcoal/5 flex items-center justify-center mx-auto mb-4 text-charcoal/40 group-hover:bg-charcoal group-hover:text-white transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="font-serif text-lg text-charcoal mb-1">Main Photo</p>
                    <p className="text-xs text-charcoal/40 uppercase tracking-wider">Drag & Drop or Click</p>
                  </div>
                </div>

                {/* Secondary Images */}
                <div className="flex flex-col gap-4 h-full">
                  <div className="flex-1 border-2 border-dashed border-charcoal/10 rounded-3xl bg-white hover:bg-charcoal/[0.02] transition-colors cursor-pointer flex items-center justify-center group">
                    <div className="text-center">
                      <ImageIcon className="w-6 h-6 text-charcoal/20 mx-auto mb-2 group-hover:text-charcoal transition-colors" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">Bedroom</span>
                    </div>
                  </div>
                  <div className="flex-1 border-2 border-dashed border-charcoal/10 rounded-3xl bg-white hover:bg-charcoal/[0.02] transition-colors cursor-pointer flex items-center justify-center group">
                    <div className="text-center">
                      <ImageIcon className="w-6 h-6 text-charcoal/20 mx-auto mb-2 group-hover:text-charcoal transition-colors" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">Living</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Basic Details */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/60 mb-3">Property Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cozy guest house near downtown" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border-b border-charcoal/10 px-0 py-4 text-2xl font-serif text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-charcoal transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/60 mb-3">Description</label>
                  <textarea 
                    rows={5}
                    placeholder="Describe the unique features, ambiance, and lifestyle of your property..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white rounded-2xl border border-charcoal/10 p-6 text-sm text-charcoal leading-relaxed placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal/30 focus:ring-1 focus:ring-charcoal/30 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/60 mb-3">City</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Bangalore" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-transparent border-b border-charcoal/10 py-4 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/60 mb-3">Property Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/30" />
                    <input 
                      type="text" 
                      placeholder="Enter full address" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-transparent border-b border-charcoal/10 pl-8 pr-4 py-4 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/60 mb-3">Google Maps Link (optional)</label>
                  <input 
                    type="text" 
                    placeholder="https://maps.google.com/..." 
                    value={googleMapsLink}
                    onChange={(e) => setGoogleMapsLink(e.target.value)}
                    className="w-full bg-transparent border-b border-charcoal/10 py-4 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal transition-colors"
                  />
                </div>
              </div>
            </motion.section>

            </div>

          {/* Sidebar Controls */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Key Details Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-charcoal/5 border border-charcoal/5 sticky top-32"
            >
              <h3 className="font-serif text-lg text-charcoal mb-6">Listing Details</h3>
              
              <div className="space-y-6">
                {/* Property Type */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-3">Property Type</label>
                  <div className="flex flex-wrap gap-2">
                    {propertyTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                          selectedType === type 
                            ? 'bg-charcoal text-white' 
                            : 'bg-bone text-charcoal/60 hover:bg-charcoal/10'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-3">Monthly Rent (per room)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40 font-serif text-lg">₹</span>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={rent}
                      onChange={(e) => setRent(e.target.value)}
                      className="w-full bg-bone rounded-xl pl-10 pr-4 py-3 text-lg font-serif text-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal/20"
                    />
                  </div>
                </div>

                {/* Number of Rooms */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-3">Number of Rooms</label>
                  <div className="flex items-center bg-bone rounded-xl px-4 py-3">
                    <Home className="w-4 h-4 text-charcoal/40 mr-3" />
                    <input 
                      type="number" 
                      value={numberOfRooms}
                      onChange={(e) => setNumberOfRooms(e.target.value)}
                      className="w-full bg-transparent text-charcoal font-bold focus:outline-none" 
                      min={1} 
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <div className="pt-6 border-t border-charcoal/5 flex flex-col gap-3">
                  <button 
                    onClick={handlePublish}
                    disabled={submitting}
                    className="w-full bg-charcoal text-white py-4 rounded-xl font-sans text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors shadow-lg shadow-charcoal/20 disabled:opacity-50"
                  >
                    {submitting ? 'Publishing...' : 'Publish Listing'}
                  </button>
                  <Link to="/my-properties">
                    <button className="w-full bg-white border border-charcoal/10 text-charcoal py-4 rounded-xl font-sans text-xs uppercase tracking-widest font-bold hover:bg-charcoal/5 transition-colors">
                      Cancel
                    </button>
                  </Link>
                </div>

              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </div>
  );
}
