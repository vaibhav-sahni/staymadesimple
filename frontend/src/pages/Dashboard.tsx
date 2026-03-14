import { motion } from 'motion/react';
import { CheckCircle, Calendar, MapPin, Star, Clock, ArrowRight, MessageSquarePlus, Shield, FileText, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const mockDbData = {
  customer: { 
    fullName: 'Guest User', 
    email: 'guest@example.com', 
    verificationStatus: 'Verified' 
  },
  activeBooking: { 
    id: 'XM-8921-A',
    city: 'Bangalore', 
    propertyType: 'The Kensington Suite', 
    roomNumber: 'A-402', 
    rentPerMonth: 45000, 
    startDate: '2026-03-01', 
    endDate: '2026-08-31', 
    bookingStatus: 'Active',
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop"
  }
};

export default function Dashboard() {

  const { user } = useAuth();

  const customerData = user
    ? {
        ...mockDbData.customer,
        email: user.email,
        fullName: user.email
          ? user.email.split("@")[0].charAt(0).toUpperCase() +
            user.email.split("@")[0].slice(1)
          : "User",
      }
    : mockDbData.customer;

  return (
    <div className="min-h-screen bg-bone pt-24 pb-20 px-4 md:px-12">

      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.8 }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >

          <div>

            <div className="flex items-center gap-3 mb-2">

              <h1 className="font-serif text-5xl md:text-6xl text-charcoal">
                {customerData.fullName}
              </h1>

              {customerData.verificationStatus === "Verified" && (
                <div className="bg-gold/10 text-gold p-1.5 rounded-full">
                  <CheckCircle className="w-5 h-5"/>
                </div>
              )}

            </div>

            <p className="font-sans text-charcoal/40 text-sm tracking-wide uppercase">
              Resident ID:
              <span className="text-charcoal font-mono"> RES-8829-X </span>
              • {customerData.email}
            </p>

          </div>

          <div className="flex gap-3">

            <button className="px-6 py-3 rounded-full border border-charcoal/10 hover:bg-charcoal hover:text-white transition-colors text-xs uppercase tracking-widest font-bold flex items-center gap-2">
              <Shield className="w-4 h-4"/> Support
            </button>

            <Link to="/my-properties">

              <button className="px-6 py-3 rounded-full bg-charcoal text-white hover:bg-black transition-colors text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                <Home className="w-4 h-4"/> Your Property
              </button>

            </Link>

          </div>

        </motion.div>

      </div>

    </div>
  );
}