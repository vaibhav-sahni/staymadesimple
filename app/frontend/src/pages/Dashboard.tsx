import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { CheckCircle, Calendar, MapPin, Star, Clock, ArrowRight, MessageSquarePlus, Shield, Home, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { apiGet } from '../lib/api';

interface BookingData {
  booking_id: number;
  property_id: number;
  room_id: number;
  room_number: string;
  customer_id: number;
  customer_name: string | null;
  start_date: string | null;
  end_date: string | null;
  booking_status: string | null;
}

interface ReviewData {
  review_id: number;
  property_id: number;
  customer_id: number;
  rating: number;
  review_text: string | null;
  review_date: string | null;
  reviewer_name: string | null;
}

interface PropertyInfo {
  property_id: number;
  property_description: string;
  city: string;
  property_type: string | null;
  average_rent: number | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const [activeBooking, setActiveBooking] = useState<(BookingData & { city?: string; propertyDescription?: string; rentPerMonth?: number | null })|null>(null);
  const [bookingHistory, setBookingHistory] = useState<(BookingData & { city?: string; propertyDescription?: string })[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all bookings for this customer
        const allBookings = await apiGet<BookingData[]>('/customer/mybookings');
        
        // Split into active and completed
        const active = allBookings.find(b => b.booking_status === 'Active') || null;
        const completed = allBookings.filter(b => b.booking_status === 'Completed');

        // Enrich bookings with property info
        const propertyCache: Record<number, PropertyInfo> = {};
        const fetchProperty = async (pid: number) => {
          if (propertyCache[pid]) return propertyCache[pid];
          try {
            const p = await apiGet<PropertyInfo>(`/properties/${pid}`);
            propertyCache[pid] = p;
            return p;
          } catch { return null; }
        };

        if (active) {
          const prop = await fetchProperty(active.property_id);
          setActiveBooking({
            ...active,
            city: prop?.city || '',
            propertyDescription: prop?.property_description || '',
            rentPerMonth: prop?.average_rent || null,
          });
        }

        const enriched = await Promise.all(
          completed.map(async (b) => {
            const prop = await fetchProperty(b.property_id);
            return { ...b, city: prop?.city || '', propertyDescription: prop?.property_description || '' };
          })
        );
        setBookingHistory(enriched);

        // Fetch reviews for all properties the user has bookings in
        const propIds = [...new Set(allBookings.map(b => b.property_id))];
        const allReviews: ReviewData[] = [];
        for (const pid of propIds) {
          try {
            const r = await apiGet<ReviewData[]>(`/properties/${pid}/reviews`);
            allReviews.push(...r);
          } catch { /* no reviews */ }
        }
        // Filter to only user's reviews
        if (allBookings.length > 0) {
          const customerId = allBookings[0].customer_id;
          setReviews(allReviews.filter(r => r.customer_id === customerId));
        }
      } catch { /* not logged in or no data */ }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bone pt-24 pb-20 px-4 md:px-12 flex items-center justify-center">
        <p className="font-serif text-2xl text-charcoal/40">Loading your dashboard...</p>
      </div>
    );
  }

  const customerName = user?.fullName || 'Resident';
  const customerEmail = user?.email || '';

  return (
    <div className="min-h-screen bg-bone pt-24 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Identity Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-serif text-5xl md:text-6xl text-charcoal">
                {customerName}
              </h1>
              <div className="bg-gold/10 text-gold p-1.5 rounded-full" title="Verified Resident">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="font-sans text-charcoal/40 text-sm tracking-wide uppercase">
              {customerEmail}
            </p>
          </div>
          
          <div className="flex gap-3">
             <button className="px-6 py-3 rounded-full border border-charcoal/10 hover:bg-charcoal hover:text-white transition-colors text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                <Shield className="w-4 h-4" /> Support
             </button>
             {user?.role === 'Owner' && (
               <Link to="/my-properties">
                 <button className="px-6 py-3 rounded-full bg-charcoal text-white hover:bg-black transition-colors text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                    <Home className="w-4 h-4" /> Your Property
                 </button>
               </Link>
             )}
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          
          {/* Section 1: Active Lease (Hero Card) */}
          {activeBooking ? (
            <motion.div variants={itemVariants} className="w-full">
              <div className="flex items-center justify-between mb-6 px-2">
                 <h2 className="font-serif text-2xl text-charcoal">Current Residence</h2>
              </div>
              
              <div className="bg-white rounded-[2.5rem] p-3 shadow-xl shadow-charcoal/5 border border-charcoal/5 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">
                  
                  {/* City badge side */}
                  <div className="lg:col-span-5 relative h-64 lg:h-auto rounded-[2rem] overflow-hidden bg-charcoal/5 flex items-end p-6">
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/60 mb-1">Unit {activeBooking.room_number}</p>
                        <p className="font-serif text-2xl text-charcoal">{activeBooking.city}</p>
                     </div>
                  </div>

                  {/* Details Side */}
                  <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-between">
                     <div className="flex justify-between items-start mb-8">
                        <div>
                           <h3 className="font-serif text-3xl md:text-4xl text-charcoal mb-2">{activeBooking.propertyDescription}</h3>
                           <div className="flex items-center gap-2 text-charcoal/60 text-sm">
                              <MapPin className="w-4 h-4" />
                              {activeBooking.city}, India
                           </div>
                        </div>
                        {activeBooking.rentPerMonth && (
                          <div className="text-right">
                             <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-1">Avg. Rent</p>
                             <p className="font-sans text-3xl text-charcoal">₹{activeBooking.rentPerMonth.toLocaleString()}</p>
                          </div>
                        )}
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 py-8 border-y border-charcoal/5">
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> Start Date</p>
                           <p className="font-mono text-sm text-charcoal">{activeBooking.start_date || '-'}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-2 flex items-center gap-1"><Clock className="w-3 h-3" /> End Date</p>
                           <p className="font-mono text-sm text-charcoal">{activeBooking.end_date || '-'}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-2 flex items-center gap-1"><FileText className="w-3 h-3" /> Booking Id</p>
                           <p className="font-mono text-sm text-charcoal">#{activeBooking.booking_id}</p>
                        </div>
                     </div>

                     <div className="flex gap-4">
                        <button className="flex-1 bg-charcoal text-white py-4 rounded-xl font-sans text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors">
                           Extend Lease
                        </button>
                        <button className="flex-1 border border-charcoal/20 text-charcoal py-4 rounded-xl font-sans text-xs uppercase tracking-widest font-bold hover:bg-charcoal/5 transition-colors">
                           Cancel Lease
                        </button>
                     </div>
                  </div>

                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="w-full">
              <h2 className="font-serif text-2xl text-charcoal mb-6 px-2">Current Residence</h2>
              <div className="bg-white rounded-[2.5rem] p-12 shadow-xl shadow-charcoal/5 border border-charcoal/5 text-center">
                <p className="font-serif text-xl text-charcoal/40">No active booking</p>
              </div>
            </motion.div>
          )}

          {/* Section 2: Past Bookings & History */}
          {bookingHistory.length > 0 && (
            <motion.div variants={itemVariants} className="w-full">
              <h2 className="font-serif text-2xl text-charcoal mb-6 px-2">Residence History</h2>
              
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-charcoal/5 border border-charcoal/5">
                <div className="space-y-8">
                  {bookingHistory.map((booking, index) => {
                    const review = reviews.find(r => r.property_id === booking.property_id);
                    
                    return (
                      <div key={booking.booking_id} className="group">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                          
                          {/* Date Column */}
                          <div className="md:w-48 shrink-0">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 block mb-1">Period</span>
                             <div className="font-mono text-xs text-charcoal/80">
                                {booking.start_date || '-'} <br/>
                                <span className="text-charcoal/30">↓</span> <br/>
                                {booking.end_date || '-'}
                             </div>
                          </div>

                          {/* Property Info */}
                          <div className="flex-1">
                             <div className="flex items-baseline gap-3 mb-2">
                                <h3 className="font-serif text-xl text-charcoal group-hover:text-gold transition-colors">{booking.propertyDescription || 'Property'}</h3>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">{booking.city}</span>
                             </div>
                             <p className="text-sm text-charcoal/60 mb-4">Unit {booking.room_number} • Booking #{booking.booking_id}</p>
                             
                             {/* Review Status */}
                             {review ? (
                                <div className="bg-bone rounded-xl p-4 border border-charcoal/5 inline-block max-w-xl">
                                   <div className="flex items-center gap-2 mb-2">
                                      <div className="flex gap-0.5">
                                         {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-gold fill-gold' : 'text-charcoal/20'}`} />
                                         ))}
                                      </div>
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">Your Review</span>
                                   </div>
                                   <p className="text-sm text-charcoal/80 italic">"{review.review_text}"</p>
                                </div>
                             ) : (
                                <button className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 hover:text-charcoal border border-dashed border-charcoal/20 px-4 py-3 rounded-xl hover:border-charcoal/40 hover:bg-white transition-all flex items-center gap-2">
                                   <MessageSquarePlus className="w-4 h-4" /> Write a Review
                                </button>
                             )}
                          </div>

                          {/* Action */}
                          <div className="shrink-0">
                             <button className="p-3 rounded-full border border-charcoal/10 text-charcoal/40 hover:text-charcoal hover:border-charcoal transition-colors">
                                <ArrowRight className="w-4 h-4" />
                             </button>
                          </div>

                        </div>
                        
                        {index !== bookingHistory.length - 1 && (
                          <div className="h-px w-full bg-charcoal/5 my-8" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
