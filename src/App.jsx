import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Scissors, 
  Sparkles, 
  MapPin, 
  Phone, 
  ChevronRight, 
  Star, 
  Menu, 
  X,
  Clock,
  CheckCircle,
  ArrowRight,
  Loader2,
  Zap
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'aurelius-tn-salon';

const SALON_PHONE = "00000000000";

// --- Frequent "Quick" Services ---
const QUICK_SERVICES = [
  { name: "Men's Basic Haircut", price: "350", icon: <Scissors size={18} /> },
  { name: "Women's Trim & Style", price: "1,500", icon: <Scissors size={18} /> },
  { name: "Luxury Beard Grooming", price: "450", icon: <Sparkles size={18} /> },
  { name: "Organic Hair Wash", price: "300", icon: <Zap size={18} /> },
  { name: "Kid's Styling", price: "250", icon: <Star size={18} /> },
  { name: "Express Head Massage", price: "400", icon: <Clock size={18} /> },
];

// --- Luxury Bundle Services Data ---
const SERVICE_DATA = [
  { 
    id: 'haircut',
    name: 'Signature Haircut Bundle', 
    price: '1,800', 
    individualTotal: '2,400',
    desc: 'Premium precision styling with a relaxing head massage and organic wash.', 
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800",
    icon: <Scissors className="w-6 h-6" />,
    breakdown: [
      { part: "Consultation", price: "300" },
      { part: "Luxury Haircut", price: "1,200" },
      { part: "Herbal Wash", price: "500" },
      { part: "Blow Dry & Style", price: "400" }
    ],
    uses: ["Enhances facial structure", "Smooth finish", "Professional styling"]
  },
  { 
    id: 'grooming',
    name: 'Temple City Grooming', 
    price: '1,200', 
    individualTotal: '1,800',
    desc: 'Classic beard trim and sculpting with steam towel therapy.', 
    image: "https://images.unsplash.com/photo-1512690196252-741d20b6ad26?auto=format&fit=crop&q=80&w=800",
    icon: <Sparkles className="w-6 h-6" />,
    breakdown: [
      { part: "Beard Shaping", price: "600" },
      { part: "Traditional Shave", price: "700" },
      { part: "Cooling Massage", price: "500" }
    ],
    uses: ["Sharp jawline definition", "Skin exfoliation", "Uniform beard growth"]
  },
  { 
    id: 'color',
    name: 'Botanical Coloring', 
    price: '5,500', 
    individualTotal: '7,000',
    desc: 'Ammonia-free coloring using natural extracts for vibrant shine.', 
    image: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&q=80&w=800",
    icon: <CheckCircle className="w-6 h-6" />,
    breakdown: [
      { part: "Color Selection", price: "1,000" },
      { part: "Application", price: "4,000" },
      { part: "Deep Conditioner", price: "2,000" }
    ],
    uses: ["Natural coverage", "UV protection", "Sulfate-free shine"]
  },
  { 
    id: 'skin',
    name: 'Silk Route Facial', 
    price: '3,800', 
    individualTotal: '4,500',
    desc: 'Ayurvedic inspired facial treatment for deep hydration.', 
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800",
    icon: <Star className="w-6 h-6" />,
    breakdown: [
      { part: "Cleanse & Steam", price: "800" },
      { part: "Hydrating Pack", price: "1,700" },
      { part: "Gold Radiance Massage", price: "2,000" }
    ],
    uses: ["Sun tan removal", "Healthy skin glow", "Pore tightening"]
  },
  { 
    id: 'keratin',
    name: 'Kerala Keratin', 
    price: '9,500', 
    individualTotal: '12,000',
    desc: 'Intense smoothing treatment designed for tropical humidity.', 
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800",
    icon: <Clock className="w-6 h-6" />,
    breakdown: [
      { part: "Deep Prep Wash", price: "1,000" },
      { part: "Protein Infusion", price: "8,500" },
      { part: "Bond Sealing", price: "2,500" }
    ],
    uses: ["Zero frizz in humidity", "Silky texture", "Manageable hair"]
  },
  { 
    id: 'spa',
    name: 'Aurelius Heritage Spa', 
    price: '15,000', 
    individualTotal: '20,000',
    desc: 'The ultimate luxury experience: Hair, Skin, and Full Body Therapy.', 
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800",
    icon: <MapPin className="w-6 h-6" />,
    breakdown: [
      { part: "Aromatherapy Massage", price: "6,000" },
      { part: "Royal Hair Spa", price: "4,000" },
      { part: "Premium Facial", price: "5,000" },
      { part: "Nail Care & Lounge", price: "5,000" }
    ],
    uses: ["Stress detoxification", "Full body rejuvenation", "Holiday readiness"]
  },
];

const GALLERY_IMAGES = [
  { url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1200", title: "Luxury Lounge" },
  { url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800", title: "Styling Bay" },
  { url: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&q=80&w=800", title: "Wash Sanctuary" },
  { url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800", title: "Grooming Area" },
  { url: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&q=80&w=800", title: "Our Vibe" },
  { url: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=800", title: "Exquisite Care" },
];

const ServiceModal = ({ service, onClose }) => {
  if (!service) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-neutral-900 border border-white/10 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="h-56 relative bg-neutral-800">
          <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-6 right-6 bg-black/50 p-2 rounded-full text-white hover:bg-amber-500 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-8 md:p-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-amber-500">{service.icon}</div>
            <h3 className="text-3xl font-serif text-white">{service.name}</h3>
          </div>
          <p className="text-gray-400 mb-8 font-light leading-relaxed">{service.desc}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <h4 className="text-amber-400 uppercase tracking-widest text-[10px] font-bold mb-4">Breakdown</h4>
              <ul className="space-y-3">
                {service.breakdown.map((item, i) => (
                  <li key={i} className="flex justify-between text-sm border-b border-white/5 pb-2">
                    <span className="text-gray-300">{item.part}</span>
                    <span className="text-gray-500">₹{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-amber-400 uppercase tracking-widest text-[10px] font-bold mb-4">Benefits</h4>
              <ul className="space-y-3">
                {service.uses.map((use, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle size={14} className="text-amber-500 mt-1 flex-shrink-0" />
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-amber-500 text-xs uppercase tracking-widest block mb-1">Exclusive Price</span>
              <span className="text-white text-3xl font-serif font-bold">₹{service.price}</span>
            </div>
            <button onClick={() => { onClose(); const b = document.getElementById('booking'); b?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-amber-500 text-black px-10 py-4 rounded-full font-bold hover:bg-amber-400 transition-all w-full md:w-auto">BOOK NOW</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [selectedService, setSelectedService] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, loading, success, error
  const [formData, setFormData] = useState({ name: '', phone: '', service: '', date: '' });

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Auth error", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => { unsubscribe(); window.removeEventListener('scroll', handleScroll); };
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.name || !formData.phone || !formData.service || !formData.date) return;

    setBookingStatus('loading');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'bookings'), {
        ...formData,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      setBookingStatus('success');
      setFormData({ name: '', phone: '', service: '', date: '' });
      setTimeout(() => setBookingStatus('idle'), 6000);
    } catch (err) {
      console.error(err);
      setBookingStatus('error');
    }
  };

  const scrollTo = (id) => {
    const elem = document.getElementById(id);
    if (elem) window.scrollTo({ top: elem.offsetTop - 80, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/95 py-4 border-b border-white/5' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center"><Scissors className="text-black w-5 h-5" /></div>
            <span className="text-2xl font-serif tracking-tighter text-white uppercase">AURELIUS</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            {['services', 'gallery', 'booking'].map(item => (
              <button key={item} onClick={() => scrollTo(item)} className="text-xs uppercase tracking-[0.2em] text-gray-400 hover:text-amber-400 transition-colors">{item}</button>
            ))}
            <button onClick={() => scrollTo('booking')} className="bg-white text-black px-6 py-2 rounded-full text-xs font-bold hover:bg-amber-500 transition-all">BOOK NOW</button>
          </div>
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X /> : <Menu />}</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=2000" alt="Interior" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-20 text-center px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-amber-400 tracking-[0.5em] uppercase text-xs mb-4 block">Tamil Nadu's Finest Grooming</span>
            <h1 className="text-6xl md:text-8xl font-serif text-white mb-6">Experience <br/> <span className="italic text-amber-500">Excellence</span></h1>
            <p className="text-gray-300 max-w-xl mx-auto mb-10 font-light text-lg">Premier grooming for the modern individual. Redefining style across Tamil Nadu.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => scrollTo('booking')} className="bg-amber-500 text-black px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2">BOOK NOW <ArrowRight size={18}/></button>
              <button onClick={() => scrollTo('services')} className="border border-white/30 text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-black transition-all">OUR SERVICES</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Frequent Services */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-b border-white/5">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-amber-500 tracking-widest text-xs uppercase mb-4 font-bold">Fast & Frequent</h2>
          <h3 className="text-3xl font-serif">Quick Essentials</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_SERVICES.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-6 bg-neutral-900/50 rounded-2xl border border-white/5 hover:border-amber-500/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="text-amber-500">{item.icon}</div>
                <span className="font-medium text-gray-200">{item.name}</span>
              </div>
              <span className="text-amber-500 font-bold">₹{item.price}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Luxury Bundles Services */}
      <section id="services" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="mb-20 text-center md:text-left">
          <h2 className="text-amber-500 tracking-widest text-xs uppercase mb-4 font-bold">The Signature Menu</h2>
          <h3 className="text-4xl md:text-6xl font-serif">Luxury Bundles</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICE_DATA.map((s) => (
            <div key={s.id} className="bg-neutral-900 border border-white/5 rounded-[2rem] p-8 flex flex-col group hover:border-amber-500/30 transition-all hover:bg-neutral-800">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-black transition-all">{s.icon}</div>
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-2xl font-serif">{s.name}</h4>
                <span className="text-amber-500 font-bold font-serif">₹{s.price}</span>
              </div>
              <p className="text-gray-400 font-light mb-8 flex-grow">{s.desc}</p>
              <button onClick={() => setSelectedService(s)} className="flex items-center gap-2 text-xs font-bold tracking-widest text-white hover:text-amber-500 transition-colors">DETAILS <ChevronRight size={16}/></button>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-32 bg-neutral-900/30 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <h2 className="text-amber-500 tracking-widest text-xs uppercase mb-4 font-bold">Atmosphere</h2>
            <h3 className="text-4xl md:text-6xl font-serif">Our Sanctuary</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {GALLERY_IMAGES.map((img, i) => (
              <motion.div key={i} whileHover={{ scale: 0.98 }} className={`relative overflow-hidden rounded-3xl h-80 ${i === 0 ? 'md:col-span-2' : ''}`}>
                <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 flex items-end p-8"><span className="text-xs uppercase tracking-widest text-amber-400">{img.title}</span></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form with Phone Notification */}
      <section id="booking" className="py-32 bg-neutral-950 px-6">
        <div className="max-w-5xl mx-auto bg-neutral-900 rounded-[3rem] overflow-hidden">
           <div className="flex flex-col lg:flex-row">
             <div className="lg:w-1/2 p-12 lg:p-20 bg-amber-600 text-black">
                <h3 className="text-4xl font-serif mb-6">Reserve Your Slot</h3>
                <p className="mb-8 opacity-90 font-medium">Please provide your phone number. Our team will send you a confirmation SMS once the slot is verified.</p>
                <div className="space-y-4 font-bold">
                  <div className="flex items-center gap-3"><Phone size={20}/> +91 {SALON_PHONE}</div>
                  <div className="flex items-center gap-3"><MapPin size={20}/> Anna Nagar, Chennai</div>
                </div>
             </div>
             <div className="lg:w-1/2 p-12 lg:p-20">
                {bookingStatus === 'success' ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center"><CheckCircle size={40}/></div>
                    <h4 className="text-2xl font-serif">Booking Received!</h4>
                    <p className="text-gray-400">Check your phone shortly for an <span className="text-amber-500 font-bold">SMS/WhatsApp confirmation</span> from our staff.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleBooking} className="space-y-6">
                    <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full Name" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 focus:border-amber-500 outline-none text-white" required />
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Phone Number (for SMS confirmation)" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 focus:border-amber-500 outline-none text-white" required />
                    <select value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 focus:border-amber-500 outline-none text-white" required>
                      <option value="">Select Service</option>
                      <optgroup label="Quick Services">
                        {QUICK_SERVICES.map((qs, i) => <option key={`qs-${i}`} value={qs.name}>{qs.name} - ₹{qs.price}</option>)}
                      </optgroup>
                      <optgroup label="Luxury Bundles">
                        {SERVICE_DATA.map((ls, i) => <option key={`ls-${i}`} value={ls.name}>{ls.name} - ₹{ls.price}</option>)}
                      </optgroup>
                    </select>
                    <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 focus:border-amber-500 outline-none text-white" required />
                    <button disabled={bookingStatus === 'loading'} className="w-full bg-amber-500 text-black py-5 rounded-xl font-bold hover:bg-amber-400 transition-all shadow-lg flex items-center justify-center gap-2">
                      {bookingStatus === 'loading' ? <Loader2 className="animate-spin" /> : 'SEND BOOKING REQUEST'}
                    </button>
                    {bookingStatus === 'error' && <p className="text-red-500 text-center text-xs">Error connecting. Please try again.</p>}
                  </form>
                )}
             </div>
           </div>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center text-gray-500 text-xs tracking-widest bg-black">
        <p>© 2024 AURELIUS LUXURY GROOMING. CHENNAI - COIMBATORE - MADURAI.</p>
      </footer>

      <AnimatePresence>{selectedService && <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />}</AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;700&display=swap');
        body { margin: 0; background: black; font-family: 'Plus Jakarta Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        h1, h2, h3, h4, .font-serif { font-family: 'Playfair Display', serif; }
        ::-webkit-scrollbar { display: none; }
        html { scrollbar-width: none; }
      `}</style>
    </div>
  );
}
