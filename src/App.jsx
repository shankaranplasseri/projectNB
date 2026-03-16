import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter, Menu as MenuIcon, X, ChevronRight, Calendar, Users, Sparkles, ChevronLeft, ArrowRight, Settings, Plus, Trash2, ImageIcon, CheckCircle } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, addDoc, onSnapshot } from 'firebase/firestore';

// --- FIREBASE INITIALIZATION ---
// Hardcoded for your exact projectnb-5708e database
const firebaseConfig = {
  apiKey: "AIzaSyC3WIUzkJ9VO98ffZbHZjj89s0ZZMkh43w",
  authDomain: "projectnb-5708e.firebaseapp.com",
  projectId: "projectnb-5708e",
  storageBucket: "projectnb-5708e.firebasestorage.app",
  messagingSenderId: "570947524721",
  appId: "1:570947524721:web:e87205d7c75d08d3cce3d0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'nalla-bhoomi-live';

// --- THEME CONFIGURATION ---
const THEME = {
  primary: '#731c55', // Deep Plum/Beet color
  accent: '#5a992a',  // Leaf Green
  background: '#fcfaf7', 
  surface: '#ffffff', 
  text: '#2a2428', 
  muted: '#8a8287', 
};

// --- INITIAL DYNAMIC STATE ---
const INITIAL_DATA = {
  assets: {
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=200',
    coverPhotos: [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=2000',
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=2000'
    ],
    heroBg: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=2874',
    philosophyImg: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=2000',
    aboutImg: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=2000'
  },
  contact: {
    address: '3G5P+RCM, near KC Center High School Junction, Karunagappalli, Kerala 690518',
    phone: '+91 98765 43210',
    email: 'reservations@nallabhoomi.com',
    hours1: 'Mon - Fri: 11:00 AM - 10:30 PM',
    hours2: 'Sat - Sun: 10:00 AM - 11:30 PM',
    mapUrl: 'https://www.google.com/maps?q=KC+Center+High+School+Junction,+Karunagappalli,+Kerala+690518&output=embed'
  },
  menu: [
    { id: 1, category: 'Starters', name: 'Roasted Root Carpaccio', desc: 'Thinly sliced heirloom beets, goat cheese crumble, toasted pine nuts, truffle oil.', price: '₹450', img: 'https://images.unsplash.com/photo-1594992111453-33b66433e56c?auto=format&fit=crop&q=80&w=300', isSpecial: false, showOnHome: false },
    { id: 2, category: 'Starters', name: 'Heritage Plantain Fritters', desc: 'Spiced plantain, crispy batter, tamarind emulsion.', price: '₹380', img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800', isSpecial: false, showOnHome: true },
    { id: 4, category: 'Mains', name: 'Nalla Bhoomi Signature Curry', desc: 'Slow-cooked farm vegetables, rich coconut milk, aromatic coastal spices.', price: '₹750', isSpecial: true, img: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=800', showOnHome: true },
    { id: 7, category: 'Desserts', name: 'Tender Coconut Pannacotta', desc: 'Silky coconut cream, palm sugar caramel, fresh berries.', price: '₹420', img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=300', isSpecial: false, showOnHome: false },
    { id: 8, category: 'Desserts', name: 'Cardamom Chocolate Delice', desc: 'Dark chocolate ganache, infused with green cardamom, gold leaf.', price: '₹550', img: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80&w=800', isSpecial: false, showOnHome: true },
  ],
  gallery: [
    { id: 1, src: "https://images.unsplash.com/photo-1414235077428-33898dd14582?auto=format&fit=crop&q=80&w=1000", category: 'Food', showOnHome: true },
    { id: 2, src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000", category: 'Ambiance', showOnHome: true },
    { id: 3, src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1000", category: 'Food', showOnHome: true },
    { id: 4, src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000", category: 'Ambiance', showOnHome: true },
  ]
};

// --- HELPER: Image Compression ---
const compressImage = (file, callback) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 1200; // Limit size to keep Base64 small for Firestore
      let { width, height } = img;

      if (width > height && width > MAX_SIZE) {
        height *= MAX_SIZE / width;
        width = MAX_SIZE;
      } else if (height > MAX_SIZE) {
        width *= MAX_SIZE / height;
        height = MAX_SIZE;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
};

export default function App() {
  const [siteData, setSiteData] = useState(INITIAL_DATA);
  const [user, setUser] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [currentPage, setCurrentPage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  
  // Admin Login States
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // 1. Initialize Firebase Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth error:", err);
        setIsLoadingData(false);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Sync Site Data with Firestore
  useEffect(() => {
    if (!user) return;
    const siteDataRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteData', 'main');

    const unsubscribe = onSnapshot(siteDataRef, (docSnap) => {
      if (docSnap.exists()) {
        setSiteData(docSnap.data());
      } else {
        // First run: save INITIAL_DATA to DB
        setDoc(siteDataRef, INITIAL_DATA).catch(console.error);
      }
      setIsLoadingData(false);
    }, (error) => {
      console.error("Firestore sync error:", error);
      setIsLoadingData(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Update Function for Admin Dashboard
  const updateGlobalData = async (newData) => {
    setSiteData(newData); // Optimistic UI update
    if (user) {
      const siteDataRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteData', 'main');
      await setDoc(siteDataRef, newData).catch(console.error);
    }
  };

  // 4. Handle Submissions & Email Triggering
  const submitReservation = async (formData) => {
    if (!user) {
      console.warn("Auth not configured. Simulating successful reservation locally.");
      return true;
    }
    try {
      const mailRef = collection(db, 'artifacts', appId, 'public', 'data', 'mail');
      await addDoc(mailRef, {
        to: 'shankaranplasseri@gmail.com',
        message: {
          subject: `New Table Reservation from ${formData.name}`,
          html: `
            <h3>New Table Reservation Request</h3>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Phone:</strong> ${formData.phone}</p>
            <p><strong>Date:</strong> ${formData.date}</p>
            <p><strong>Time:</strong> ${formData.time}</p>
            <p><strong>Guests:</strong> ${formData.guests}</p>
          `
        },
        createdAt: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const submitContact = async (formData) => {
    if (!user) {
      console.warn("Auth not configured. Simulating successful message dispatch locally.");
      return true;
    }
    try {
      const mailRef = collection(db, 'artifacts', appId, 'public', 'data', 'mail');
      await addDoc(mailRef, {
        to: 'shankaranplasseri@gmail.com',
        message: {
          subject: `New Website Contact from ${formData.name}`,
          html: `
            <h3>New Message via Nalla Bhoomi Website</h3>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Message:</strong></p>
            <p>${formData.message}</p>
          `
        },
        createdAt: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfaf7]">
        <div className="animate-spin text-[#731c55]"><Settings size={40} /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: THEME.background, color: THEME.text }}>
      
      {/* Navigation */}
      <nav 
        className={`fixed w-full z-40 transition-all duration-500 ${
          isScrolled || currentPage !== 'home' ? 'bg-white shadow-md py-3' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo Section */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => navigateTo('home')}
          >
            <img 
              src={siteData.assets.logo} 
              alt="Nalla Bhoomi Logo" 
              className={`transition-all duration-500 rounded-full object-cover group-hover:scale-105 ${isScrolled || currentPage !== 'home' ? 'h-10 w-10' : 'h-14 w-14 shadow-lg'}`}
            />
            <div 
              className="text-xl md:text-2xl font-serif tracking-widest uppercase hidden sm:block" 
              style={{ color: isScrolled || currentPage !== 'home' ? THEME.primary : '#ffffff' }}
            >
              Nalla Bhoomi
            </div>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {['home', 'menu', 'about', 'gallery', 'contact'].map((page) => (
              <button
                key={page}
                onClick={() => navigateTo(page)}
                className={`uppercase tracking-widest text-sm transition-colors duration-300 ${
                  currentPage === page ? 'border-b-2 font-medium' : 'opacity-90 hover:opacity-100'
                }`}
                style={{ 
                  color: isScrolled || currentPage !== 'home' ? THEME.primary : '#ffffff',
                  borderColor: currentPage === page ? THEME.accent : 'transparent'
                }}
              >
                {page}
              </button>
            ))}
            
            <button 
              onClick={() => setIsReservationOpen(true)}
              className="px-6 py-2 rounded-full text-white text-sm uppercase tracking-widest transition-transform hover:scale-105 shadow-md"
              style={{ backgroundColor: THEME.accent }}
            >
              Book Table
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <button 
              className="p-2 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ color: isScrolled || currentPage !== 'home' ? THEME.primary : '#ffffff', backgroundColor: isScrolled || currentPage !== 'home' ? 'transparent' : 'rgba(0,0,0,0.3)' }}
            >
              {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-white flex flex-col items-center justify-center space-y-8 animate-fadeIn">
          {['home', 'menu', 'about', 'gallery', 'contact'].map((page) => (
            <button
              key={page}
              onClick={() => navigateTo(page)}
              className="text-2xl uppercase tracking-widest font-serif"
              style={{ color: currentPage === page ? THEME.accent : THEME.primary }}
            >
              {page}
            </button>
          ))}
          <button 
            onClick={() => { setIsReservationOpen(true); setIsMobileMenuOpen(false); }}
            className="mt-8 px-8 py-3 rounded-full text-white text-lg uppercase tracking-widest shadow-lg"
            style={{ backgroundColor: THEME.accent }}
          >
            Book A Table
          </button>
        </div>
      )}

      {/* Reservation Modal */}
      {isReservationOpen && (
        <ReservationModal 
          closeModal={() => setIsReservationOpen(false)} 
          onSubmit={submitReservation}
        />
      )}

      {/* Secret Admin Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative p-8">
            <button 
              onClick={() => { setShowLogin(false); setLoginError(''); setPassword(''); }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex justify-center mb-6">
              <img src={siteData.assets.logo} alt="Logo" className="w-16 h-16 rounded-full object-cover" />
            </div>
            <h2 className="text-2xl font-serif mb-6 text-center" style={{ color: THEME.primary }}>Admin Access</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (password === 'admin123') { // Admin password
                setIsAdmin(true);
                setShowLogin(false);
                setPassword('');
                setLoginError('');
                navigateTo('admin');
              } else {
                setLoginError('Incorrect password. Please try again.');
              }
            }} className="space-y-4">
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:border-[#731c55] bg-gray-50"
                autoFocus
              />
              {loginError && <p className="text-red-500 text-sm text-center font-medium">{loginError}</p>}
              <button type="submit" className="w-full py-4 text-white uppercase tracking-widest text-sm rounded-lg hover:opacity-90 shadow-md transition-opacity font-bold" style={{ backgroundColor: THEME.primary }}>
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Page Content Routes */}
      <main className="min-h-screen">
        {currentPage === 'home' && <Home navigateTo={navigateTo} openReservation={() => setIsReservationOpen(true)} data={siteData} />}
        {currentPage === 'menu' && <Menu data={siteData} />}
        {currentPage === 'about' && <About data={siteData} />}
        {currentPage === 'gallery' && <Gallery data={siteData} />}
        {currentPage === 'contact' && <Contact data={siteData} onSubmit={submitContact} />}
        {currentPage === 'admin' && isAdmin && <AdminDashboard data={siteData} updateData={updateGlobalData} logout={() => { setIsAdmin(false); navigateTo('home'); }} />}
      </main>

      {/* Footer */}
      {currentPage !== 'admin' && (
        <footer className="py-16 px-6 md:px-12" style={{ backgroundColor: THEME.primary, color: '#ffffff' }}>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left items-center md:items-start">
            
            {/* Secret Admin Trigger: Clicking the Footer Logo */}
            <div 
              className="flex flex-col items-center md:items-start space-y-4 cursor-pointer group" 
              onClick={() => setShowLogin(true)}
              title="Admin Login"
            >
               <img src={siteData.assets.logo} alt="Nalla Bhoomi Logo" className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white p-2 object-cover shadow-lg group-hover:scale-105 transition-transform duration-300" />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-serif tracking-widest mb-6" style={{ color: THEME.accent }}>NALLA BHOOMI</h3>
              <p className="opacity-80 leading-relaxed text-sm max-w-xs mx-auto md:mx-0">
                A celebration of the earth's bounty, bringing you premium, locally-sourced ingredients crafted into culinary masterpieces.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg tracking-widest uppercase mb-6" style={{ color: THEME.accent }}>Visit Us</h4>
              <p className="opacity-80 text-sm">{siteData.contact.address}</p>
              <p className="opacity-80 text-sm mt-4">{siteData.contact.phone}</p>
              <p className="opacity-80 text-sm">{siteData.contact.email}</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg tracking-widest uppercase mb-6" style={{ color: THEME.accent }}>Hours</h4>
              <p className="opacity-80 text-sm">{siteData.contact.hours1}</p>
              <p className="opacity-80 text-sm">{siteData.contact.hours2}</p>
              <div className="flex justify-center md:justify-start space-x-6 mt-6">
                <button className="hover:text-[#5a992a] transition-colors"><Instagram size={20}/></button>
                <button className="hover:text-[#5a992a] transition-colors"><Facebook size={20}/></button>
                <button className="hover:text-[#5a992a] transition-colors"><Twitter size={20}/></button>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/20 text-center text-sm opacity-60">
            &copy; {new Date().getFullYear()} Nalla Bhoomi Restaurant. All rights reserved.
          </div>
        </footer>
      )}
    </div>
  );
}

// --- RESERVATION MODAL (Connected to Firebase) ---
function ReservationModal({ closeModal, onSubmit }) {
  const [formData, setFormData] = useState({ date: '', time: '', guests: '', name: '', phone: '' });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const success = await onSubmit(formData);
    if (success) {
      setStatus('success');
      setTimeout(() => closeModal(), 3000);
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-10"><X size={24} /></button>
        
        {status === 'success' ? (
          <div className="p-12 text-center space-y-4 flex flex-col items-center">
            <CheckCircle size={64} className="text-[#5a992a] mb-4" />
            <h2 className="text-3xl font-serif text-[#731c55]">Table Reserved!</h2>
            <p className="text-gray-600">A confirmation has been sent to our team. We look forward to hosting you.</p>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 p-8 text-center border-b border-gray-100">
              <h2 className="text-3xl font-serif mb-2" style={{ color: THEME.primary }}>Reserve Your Table</h2>
              <p className="text-sm opacity-70 text-gray-600">Join us for an unforgettable dining experience.</p>
            </div>
            <form className="p-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative"><Calendar className="absolute left-3 top-3 opacity-40 text-gray-600" size={20} /><input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5a992a] transition-colors" /></div>
                <div className="relative"><Clock className="absolute left-3 top-3 opacity-40 text-gray-600" size={20} /><input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5a992a] transition-colors" /></div>
              </div>
              <div className="relative">
                <Users className="absolute left-3 top-3 opacity-40 text-gray-600" size={20} />
                <select required value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5a992a] transition-colors text-gray-700">
                  <option value="">Number of Guests</option>
                  {[1,2,3,4,5,6,7,8].map(num => <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>)}
                  <option value="9+">9+ Guests</option>
                </select>
              </div>
              <input type="text" placeholder="Your Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5a992a] transition-colors" />
              <input type="tel" placeholder="Phone Number" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5a992a] transition-colors" />
              
              {status === 'error' && <p className="text-red-500 text-sm text-center">Failed to submit reservation. Please try again.</p>}
              
              <button disabled={status === 'loading'} type="submit" className={`w-full py-4 text-white uppercase tracking-widest text-sm font-semibold rounded-lg transition-opacity mt-4 shadow-lg shadow-[#5a992a]/30 ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`} style={{ backgroundColor: THEME.accent }}>
                {status === 'loading' ? 'Confirming...' : 'Confirm Reservation'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// --- PAGE COMPONENTS ---

function Home({ navigateTo, openReservation, data }) {
  const featuredItems = data.menu.filter(item => item.showOnHome).slice(0, 3);
  const homeGalleryImages = data.gallery.filter(item => item.showOnHome).slice(0, 4);
  const [currentCoverSlide, setCurrentCoverSlide] = useState(0);

  useEffect(() => {
    if (!data.assets.coverPhotos || data.assets.coverPhotos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentCoverSlide(prev => (prev + 1) % data.assets.coverPhotos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [data.assets.coverPhotos]);

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center bg-gray-900">
        <div className="absolute inset-0">
          <img src={data.assets.heroBg} alt="Restaurant Interior" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
          <div className="flex justify-center mb-8"><Sparkles className="text-[#5a992a] animate-pulse" size={32} /></div>
          <h2 className="text-sm md:text-base tracking-[0.4em] text-white uppercase mb-6 font-medium">Welcome to</h2>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-8 leading-tight drop-shadow-lg">
            The Taste of <br/> <span style={{ color: THEME.accent }}>Good Earth</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-light mb-12 max-w-2xl mx-auto">
            Experience the finest culinary traditions, rooted in nature and elevated by passion.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button onClick={() => navigateTo('menu')} className="px-8 py-4 bg-transparent border border-white text-white hover:bg-white hover:text-[#731c55] transition-all duration-300 uppercase tracking-widest text-sm w-full sm:w-auto">Discover Our Menu</button>
            <button onClick={openReservation} className="px-8 py-4 text-white transition-all duration-300 uppercase tracking-widest text-sm shadow-lg hover:shadow-xl w-full sm:w-auto" style={{ backgroundColor: THEME.accent }}>Book a Table</button>
          </div>
        </div>
      </div>

      {/* Featured Banner (Slideshow) */}
      <div className="w-full bg-[#f4f0eb] py-16 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 text-center">
           <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-xl shadow-2xl overflow-hidden mb-8 bg-gray-200">
             {data.assets.coverPhotos && data.assets.coverPhotos.length > 0 ? (
               data.assets.coverPhotos.map((photo, idx) => (
                 <img 
                   key={idx}
                   src={photo} 
                   alt={`Cover Banner ${idx + 1}`} 
                   className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentCoverSlide === idx ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'}`} 
                 />
               ))
             ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400">No cover photos available</div>
             )}
             
             {data.assets.coverPhotos && data.assets.coverPhotos.length > 1 && (
               <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
                 {data.assets.coverPhotos.map((_, idx) => (
                   <div key={idx} className={`w-2 h-2 rounded-full transition-all duration-500 ${currentCoverSlide === idx ? 'bg-white w-6' : 'bg-white/50'}`} />
                 ))}
               </div>
             )}
           </div>
           
           <p className="mt-4 text-xl font-serif italic text-gray-600 max-w-2xl mx-auto px-4">
             "Where local heritage meets contemporary elegance. Our name is our promise: nothing but the finest from the Good Earth."
           </p>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h3 className="text-sm tracking-[0.2em] uppercase font-semibold" style={{ color: THEME.accent }}>Our Philosophy</h3>
            <h2 className="text-4xl md:text-5xl font-serif" style={{ color: THEME.primary }}>Nature on a Plate</h2>
            <p className="leading-relaxed text-lg opacity-80">
              At Nalla Bhoomi, we believe that the best flavors come directly from our vibrant soil. 
              Our chefs meticulously select premium, locally-sourced ingredients to create 
              dishes that are both a visual masterpiece and a symphony of taste.
            </p>
            <button onClick={() => navigateTo('about')} className="flex items-center space-x-2 pb-1 border-b transition-all hover:opacity-70" style={{ color: THEME.primary, borderColor: THEME.primary }}>
              <span className="uppercase tracking-widest text-sm font-medium">Read Our Story</span><ChevronRight size={16} />
            </button>
          </div>
          <div className="relative">
            <img src={data.assets.philosophyImg} alt="Signature Dish" className="w-full h-[500px] object-cover rounded-tl-[100px] rounded-br-[100px] shadow-2xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 hidden md:block rounded-full" style={{ backgroundColor: THEME.accent, zIndex: -1 }}></div>
          </div>
        </div>
      </div>

      {/* Mini Menu Section */}
      <div className="py-24 px-6 md:px-12 bg-[#fcfaf7] border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 space-y-4 md:space-y-0">
            <div>
              <h3 className="text-sm tracking-[0.2em] uppercase font-semibold mb-2" style={{ color: THEME.accent }}>Culinary Delights</h3>
              <h2 className="text-4xl md:text-5xl font-serif" style={{ color: THEME.primary }}>Featured Menu</h2>
            </div>
            <button onClick={() => navigateTo('menu')} className="group flex items-center space-x-2 pb-1 border-b transition-all hover:opacity-70" style={{ color: THEME.primary, borderColor: THEME.primary }}>
              <span className="uppercase tracking-widest text-sm font-medium">View Full Menu</span><ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {featuredItems.map((item, index) => (
              <div key={index} onClick={() => navigateTo('menu')} className="cursor-pointer group flex flex-col items-center text-center">
                <img src={item.img} alt={item.name} className="w-full h-64 md:h-72 object-cover rounded-xl shadow-sm group-hover:opacity-80 transition-opacity mb-6" />
                <span className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: THEME.accent }}>{item.category}</span>
                <h4 className="text-xl md:text-2xl font-serif leading-tight px-4" style={{ color: THEME.primary }}>{item.name}</h4>
              </div>
            ))}
            {featuredItems.length === 0 && <p className="col-span-3 text-center opacity-50 italic py-10">No featured items selected. Admin can add them.</p>}
          </div>
        </div>
      </div>

      {/* Mini Gallery Section */}
      <div className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-gray-100">
         <div className="flex flex-col md:flex-row justify-between items-end mb-12 space-y-4 md:space-y-0">
            <div>
              <h3 className="text-sm tracking-[0.2em] uppercase font-semibold mb-2" style={{ color: THEME.accent }}>Atmosphere</h3>
              <h2 className="text-4xl md:text-5xl font-serif" style={{ color: THEME.primary }}>A Glimpse Inside</h2>
            </div>
            <button onClick={() => navigateTo('gallery')} className="group flex items-center space-x-2 pb-1 border-b transition-all hover:opacity-70" style={{ color: THEME.primary, borderColor: THEME.primary }}>
              <span className="uppercase tracking-widest text-sm font-medium">View Gallery</span><ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {homeGalleryImages.map((img, i) => (
               <img key={i} src={img.src} className="w-full h-40 md:h-64 object-cover rounded-xl shadow-sm hover:opacity-80 transition-opacity cursor-pointer" alt={`Gallery ${i+1}`} onClick={() => navigateTo('gallery')} />
            ))}
            {homeGalleryImages.length === 0 && <p className="col-span-4 text-center opacity-50 italic py-10">No featured gallery images selected. Admin can add them.</p>}
          </div>
      </div>
    </div>
  );
}

function Menu({ data }) {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', ...Array.from(new Set(data.menu.map(item => item.category)))];
  const displayedItems = activeTab === 'All' ? data.menu : data.menu.filter(c => c.category === activeTab);

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto animate-fadeIn min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-serif mb-4" style={{ color: THEME.primary }}>Our Menu</h1>
        <div className="w-24 h-1 mx-auto mb-6" style={{ backgroundColor: THEME.accent }}></div>
        <p className="text-lg opacity-80 max-w-2xl mx-auto">Curated with love, served with elegance. Explore our rich array of flavors.</p>
      </div>

      <div className="max-w-4xl mx-auto mb-16 overflow-x-auto">
        <div className="flex sm:grid sm:grid-cols-4 gap-3 bg-gray-50/80 p-2 rounded-2xl border border-gray-200 shadow-inner min-w-max sm:min-w-0">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 rounded-xl text-sm md:text-base font-semibold tracking-widest uppercase transition-all duration-300 whitespace-nowrap ${
                activeTab === tab ? 'bg-white shadow-lg border-b-2 border-transparent' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{ color: activeTab === tab ? THEME.primary : '', borderColor: activeTab === tab ? THEME.accent : 'transparent' }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8 animate-fadeIn">
        {displayedItems.length === 0 && <p className="text-center text-gray-400 py-10">No items in this category yet.</p>}
        {displayedItems.map((item, idx) => (
          <div key={idx} className={`flex flex-col sm:flex-row gap-6 items-center p-4 rounded-2xl transition-all duration-300 ${item.isSpecial ? 'bg-[#731c55]/5 border border-[#731c55]/20 shadow-sm' : 'hover:bg-gray-50 hover:shadow-md border border-transparent'}`}>
            <div className="w-full sm:w-40 h-48 sm:h-32 flex-shrink-0 overflow-hidden rounded-xl">
               <img src={item.img} alt={item.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <h3 className="text-xl md:text-2xl font-medium tracking-wide" style={{ color: THEME.primary }}>{item.name}</h3>
                  {item.isSpecial && (
                    <span className="text-xs px-3 py-1 rounded-full text-white font-medium tracking-wider uppercase animate-pulse" style={{ backgroundColor: THEME.accent }}>Chef's Special</span>
                  )}
                </div>
                <div className="text-xl md:text-2xl font-serif mt-2 sm:mt-0 whitespace-nowrap" style={{ color: THEME.accent }}>{item.price}</div>
              </div>
              <p className="text-sm md:text-base italic opacity-70 leading-relaxed max-w-2xl">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function About({ data }) {
  return (
    <div className="pt-32 pb-24 animate-fadeIn min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif mb-4" style={{ color: THEME.primary }}>Our Story</h1>
          <div className="w-24 h-1 mx-auto mb-6" style={{ backgroundColor: THEME.accent }}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
          <div className="relative">
             <img src={data.assets.aboutImg} alt="Chef cooking" className="w-full h-[600px] object-cover rounded-3xl shadow-xl" />
            <div className="absolute -bottom-10 -right-10 bg-white p-2 rounded-full shadow-2xl hidden md:block">
               <img src={data.assets.logo} alt="Seal" className="w-32 h-32 rounded-full object-cover" />
            </div>
          </div>
          <div className="space-y-6 md:pl-8">
            <h2 className="text-3xl font-serif" style={{ color: THEME.primary }}>Rooted in Kerala's Soil</h2>
            <p className="text-lg opacity-80 leading-relaxed">
              "Nalla Bhoomi" translates to the Good Earth. Our journey began with a simple belief: the finest meals are grown, not manufactured. We partnered with local farmers across Karunagappalli to bring the freshest, seasonal ingredients directly to our kitchen.
            </p>
            <p className="text-lg opacity-80 leading-relaxed">
              Every dish we serve is a tribute to our agricultural heritage, reimagined with modern culinary techniques to provide a truly premium dining experience. Our space is designed to bring you peace—a calm oasis wrapped in the hues of plum and green, where the ambiance is as soothing as the food is satisfying.
            </p>
            <div className="pt-8 border-t border-gray-200 mt-8">
              <p className="text-sm tracking-widest uppercase font-semibold mb-2" style={{ color: THEME.accent }}>Executive Chef & Founder</p>
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_of_John_Hancock.svg" alt="Chef Signature" className="h-12 opacity-80 filter invert sepia hue-rotate-[280deg] saturate-[300%]" /> 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Gallery({ data }) {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedImgIndex, setSelectedImgIndex] = useState(null);

  const categories = ['All', ...Array.from(new Set(data.gallery.map(img => img.category)))];
  const filteredImages = activeTab === 'All' ? data.gallery : data.gallery.filter(img => img.category === activeTab);

  const openLightbox = (index) => setSelectedImgIndex(index);
  const closeLightbox = () => setSelectedImgIndex(null);
  
  const showNext = (e) => { e.stopPropagation(); setSelectedImgIndex((prev) => (prev + 1) % filteredImages.length); };
  const showPrev = (e) => { e.stopPropagation(); setSelectedImgIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length); };

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto animate-fadeIn min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-serif mb-4" style={{ color: THEME.primary }}>Gallery</h1>
        <div className="w-24 h-1 mx-auto mb-6" style={{ backgroundColor: THEME.accent }}></div>
        <p className="text-lg opacity-80">A visual taste of our ambiance and creations.</p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="flex flex-wrap justify-center gap-2 md:space-x-4">
          {categories.map((cat) => (
             <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-2 rounded-full text-sm md:text-base uppercase tracking-widest transition-all ${
                activeTab === cat ? 'text-white shadow-md' : 'bg-transparent text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400'
              }`}
              style={{ backgroundColor: activeTab === cat ? THEME.primary : '' }}
             >
               {cat}
             </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredImages.length === 0 && <p className="col-span-full text-center text-gray-400">No images in this category yet.</p>}
        {filteredImages.map((item, index) => (
          <div key={index} onClick={() => openLightbox(index)} className="group relative overflow-hidden h-72 bg-gray-200 cursor-pointer rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
            <img src={item.src} alt={`${item.category} ${index + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#731c55]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
               <span className="text-white tracking-widest uppercase text-sm font-medium flex items-center gap-2"><Sparkles size={16} /> View Full</span>
            </div>
          </div>
        ))}
      </div>

      {selectedImgIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fadeIn backdrop-blur-sm" onClick={closeLightbox}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-black/40 p-2 rounded-full" onClick={closeLightbox}><X size={32} /></button>
          <button className="absolute left-4 md:left-10 text-white/70 hover:text-white transition-all bg-black/40 hover:bg-black/60 p-3 rounded-full hidden sm:block transform hover:-translate-x-1" onClick={showPrev}><ChevronLeft size={36} /></button>
          <div className="relative max-w-5xl max-h-[85vh] w-full px-4 md:px-24 flex justify-center" onClick={(e) => e.stopPropagation()}>
             <img src={filteredImages[selectedImgIndex].src} alt="Fullscreen view" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-fadeIn" />
             <div className="absolute inset-0 flex items-center justify-between px-4 sm:hidden">
                <button onClick={showPrev} className="bg-black/40 p-2 rounded-full text-white"><ChevronLeft size={24}/></button>
                <button onClick={showNext} className="bg-black/40 p-2 rounded-full text-white"><ChevronRight size={24}/></button>
             </div>
          </div>
          <button className="absolute right-4 md:right-10 text-white/70 hover:text-white transition-all bg-black/40 hover:bg-black/60 p-3 rounded-full hidden sm:block transform hover:translate-x-1" onClick={showNext}><ChevronRight size={36} /></button>
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/80 tracking-widest text-sm font-medium bg-black/40 px-4 py-2 rounded-full">{selectedImgIndex + 1} / {filteredImages.length}</div>
        </div>
      )}
    </div>
  );
}

function Contact({ data, onSubmit }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const success = await onSubmit(formData);
    if (success) {
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="pt-32 pb-0 animate-fadeIn bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif mb-4" style={{ color: THEME.primary }}>Location & Connect</h1>
          <div className="w-24 h-1 mx-auto mb-6" style={{ backgroundColor: THEME.accent }}></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-12 bg-[#fcfaf7] p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="space-y-6">
              <h2 className="text-3xl font-serif" style={{ color: THEME.primary }}>Get in Touch</h2>
              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-4"><div className="p-3 bg-white rounded-full shadow-sm text-[#5a992a]"><MapPin size={20} /></div><span className="font-medium text-gray-700">{data.contact.address}</span></div>
                <div className="flex items-center space-x-4"><div className="p-3 bg-white rounded-full shadow-sm text-[#5a992a]"><Phone size={20} /></div><span className="font-medium text-gray-700">{data.contact.phone}</span></div>
                <div className="flex items-center space-x-4"><div className="p-3 bg-white rounded-full shadow-sm text-[#5a992a]"><Mail size={20} /></div><span className="font-medium text-gray-700">{data.contact.email}</span></div>
              </div>
            </div>
            
            <form className="space-y-6 pt-8 border-t border-gray-200" onSubmit={handleSubmit}>
              <h3 className="text-2xl font-serif mb-6" style={{ color: THEME.primary }}>Send a Message</h3>
              
              {status === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3">
                  <CheckCircle size={20}/> Message sent successfully! Our team will reply soon.
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" required placeholder="Your Name" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full pb-3 border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#731c55] transition-colors" />
                <input type="email" required placeholder="Email Address" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full pb-3 border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#731c55] transition-colors" />
              </div>
              <textarea required placeholder="Your Message" rows="4" value={formData.message} onChange={e=>setFormData({...formData, message: e.target.value})} className="w-full pb-3 border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#731c55] transition-colors resize-none"></textarea>
              
              {status === 'error' && <p className="text-red-500 text-sm">Failed to send message. Please try again.</p>}
              
              <button disabled={status==='loading'} type="submit" className={`px-10 py-4 text-white uppercase tracking-widest text-sm rounded-lg transition-opacity w-full sm:w-auto shadow-md ${status==='loading'?'opacity-70 cursor-not-allowed':'hover:opacity-90'}`} style={{ backgroundColor: THEME.primary }}>
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="h-[500px] lg:h-[700px] w-full bg-gray-100 rounded-3xl overflow-hidden shadow-xl relative border-4 border-white">
             <iframe src={data.contact.mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Nalla Bhoomi Location" className="absolute inset-0"></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- ADMIN DASHBOARD ---

function AdminDashboard({ data, updateData, logout }) {
  const [activeTab, setActiveTab] = useState('general');
  const [newMenu, setNewMenu] = useState({ name: '', desc: '', price: '', img: '', category: 'Starters', isSpecial: false });
  const [newGallery, setNewGallery] = useState({ src: '', category: 'Food' });
  const [isSaving, setIsSaving] = useState(false);

  // Use the compression helper for Admin Dashboard uploads
  const handleImageUpload = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, callback);
    }
  };

  const handleAssetChange = (e) => updateData({ ...data, assets: { ...data.assets, [e.target.name]: e.target.value } });
  const handleAssetFileChange = (key) => (e) => handleImageUpload(e, (base64) => updateData({ ...data, assets: { ...data.assets, [key]: base64 } }));
  const handleContactChange = (e) => updateData({ ...data, contact: { ...data.contact, [e.target.name]: e.target.value } });

  // Menu Management
  const handleAddMenu = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await updateData({ ...data, menu: [{ ...newMenu, id: Date.now(), showOnHome: false }, ...data.menu] });
    setNewMenu({ name: '', desc: '', price: '', img: '', category: 'Starters', isSpecial: false });
    setIsSaving(false);
  };
  const toggleMenuHome = (id) => updateData({ ...data, menu: data.menu.map(m => m.id === id ? { ...m, showOnHome: !m.showOnHome } : m) });
  const deleteMenu = (id) => updateData({ ...data, menu: data.menu.filter(m => m.id !== id) });

  // Gallery Management
  const handleAddGallery = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await updateData({ ...data, gallery: [{ ...newGallery, id: Date.now(), showOnHome: false }, ...data.gallery] });
    setNewGallery({ src: '', category: 'Food' });
    setIsSaving(false);
  };
  const toggleGalleryHome = (id) => updateData({ ...data, gallery: data.gallery.map(g => g.id === id ? { ...g, showOnHome: !g.showOnHome } : g) });
  const deleteGallery = (id) => updateData({ ...data, gallery: data.gallery.filter(g => g.id !== id) });

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto animate-fadeIn min-h-screen">
      <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Settings className="flex-shrink-0 mt-1 sm:mt-0" />
        <div className="flex-1">
          <h3 className="font-bold">Admin Database Connected</h3>
          <p className="text-sm opacity-90">Changes made here are permanently saved to Firebase. Form submissions automatically dispatch emails.</p>
        </div>
        <button onClick={logout} className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors">
          Log Out
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-col space-y-2">
          {['general', 'menu', 'gallery'].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`text-left px-6 py-4 rounded-xl font-medium uppercase tracking-widest text-sm transition-colors ${activeTab === tab ? 'text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
               style={{ backgroundColor: activeTab === tab ? THEME.primary : '' }}
             >
               {tab} Settings
             </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
          
          {/* GENERAL SETTINGS TAB */}
          {activeTab === 'general' && (
            <div className="space-y-10 animate-fadeIn">
              <section>
                <h3 className="text-2xl font-serif mb-6 border-b pb-2" style={{ color: THEME.primary }}>Website Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(data.assets).map(([key, value]) => {
                    if (key === 'coverPhotos') {
                      return (
                        <div key={key} className="space-y-4 md:col-span-2 border border-gray-200 p-4 rounded-xl bg-gray-50/50">
                           <label className="text-xs uppercase tracking-widest font-bold text-gray-500">Cover Photos (Slideshow)</label>
                           
                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                             {value.map((photo, idx) => (
                                <div key={idx} className="relative group rounded-lg overflow-hidden h-24 border border-gray-200 shadow-sm">
                                  <img src={photo} className="w-full h-full object-cover" alt={`Cover ${idx}`} />
                                  <button type="button" onClick={() => {
                                    const newPhotos = value.filter((_, i) => i !== idx);
                                    updateData({...data, assets: {...data.assets, coverPhotos: newPhotos}});
                                  }} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-bold uppercase tracking-widest">Remove</button>
                                </div>
                             ))}
                             {value.length === 0 && <p className="col-span-4 text-sm text-gray-400 italic">No cover photos added.</p>}
                           </div>
                           
                           <div className="flex flex-col xl:flex-row gap-2 mt-4">
                              <input type="text" id="new-cover-photo" placeholder="Add via Image URL" className="flex-1 p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#731c55] text-sm" />
                              <span className="self-center text-xs font-bold text-gray-400 hidden xl:block">OR</span>
                              <input type="file" accept="image/*" onChange={(e) => {
                                 handleImageUpload(e, base64 => {
                                   updateData({...data, assets: {...data.assets, coverPhotos: [...value, base64]}});
                                   e.target.value = '';
                                 });
                              }} className="w-full xl:w-auto text-sm file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#731c55]/10 file:text-[#731c55] hover:file:bg-[#731c55]/20 cursor-pointer" />
                              <button type="button" onClick={() => {
                                 const input = document.getElementById('new-cover-photo');
                                 if (input.value) {
                                   updateData({...data, assets: {...data.assets, coverPhotos: [...value, input.value]}});
                                   input.value = '';
                                 }
                              }} className="px-6 py-3 bg-[#731c55] text-white rounded-lg text-sm font-bold uppercase tracking-widest hover:opacity-90">Add Slide</button>
                           </div>
                        </div>
                      );
                    }
                    return (
                      <div key={key} className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-gray-500">{key.replace(/([A-Z])/g, ' $1')}</label>
                        <div className="flex flex-col xl:flex-row gap-2">
                          <input type="text" name={key} value={value.startsWith('data:') ? 'Database Encoded Image' : value} onChange={handleAssetChange} className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#731c55] text-sm" placeholder="Image URL" readOnly={value.startsWith('data:')} />
                          <input type="file" accept="image/*" onChange={handleAssetFileChange(key)} className="w-full xl:w-auto text-sm file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#731c55]/10 file:text-[#731c55] hover:file:bg-[#731c55]/20 cursor-pointer" />
                        </div>
                        <div className="h-24 bg-gray-100 rounded overflow-hidden border border-gray-200"><img src={value} className="w-full h-full object-cover" alt="Preview" /></div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-serif mb-6 border-b pb-2" style={{ color: THEME.primary }}>Contact Information & Map</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(data.contact).map(([key, value]) => (
                    <div key={key} className={`space-y-2 ${key === 'mapUrl' ? 'md:col-span-2' : ''}`}>
                      <label className="text-xs uppercase tracking-widest font-bold text-gray-500">{key.replace(/([A-Z])/g, ' $1')}</label>
                      <input type="text" name={key} value={value} onChange={handleContactChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#731c55]" />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* MENU SETTINGS TAB */}
          {activeTab === 'menu' && (
            <div className="space-y-10 animate-fadeIn">
               <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                 <h3 className="text-xl font-serif mb-4 flex items-center gap-2" style={{ color: THEME.primary }}><Plus size={20} /> Add New Dish</h3>
                 <form onSubmit={handleAddMenu} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Dish Name" required value={newMenu.name} onChange={e=>setNewMenu({...newMenu, name: e.target.value})} className="p-3 border border-gray-200 rounded-lg bg-white" />
                    <input type="text" placeholder="Price (e.g., ₹450)" required value={newMenu.price} onChange={e=>setNewMenu({...newMenu, price: e.target.value})} className="p-3 border border-gray-200 rounded-lg bg-white" />
                    <input type="text" placeholder="Category (e.g., Starters, Mains)" required value={newMenu.category} onChange={e=>setNewMenu({...newMenu, category: e.target.value})} className="p-3 border border-gray-200 rounded-lg bg-white" />
                    <input type="text" placeholder="Description" required value={newMenu.desc} onChange={e=>setNewMenu({...newMenu, desc: e.target.value})} className="p-3 border border-gray-200 rounded-lg bg-white" />
                    
                    <div className="sm:col-span-2 flex flex-col md:flex-row items-start md:items-center gap-4 bg-white p-3 border border-gray-200 rounded-lg">
                      {newMenu.img ? (
                        <img src={newMenu.img} className="w-16 h-16 object-cover rounded shadow-sm border border-gray-100" alt="Preview" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-gray-400"><ImageIcon size={24}/></div>
                      )}
                      <div className="flex-1 w-full flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Dish Image</label>
                        <div className="flex flex-col xl:flex-row gap-2 w-full">
                            <input type="text" placeholder="Image URL" value={newMenu.img.startsWith('data:') ? 'Database Encoded Image' : newMenu.img} onChange={e=>setNewMenu({...newMenu, img: e.target.value})} className="flex-1 p-2 border border-gray-200 rounded text-sm bg-gray-50" readOnly={newMenu.img.startsWith('data:')} />
                            <span className="self-center text-xs font-bold text-gray-400 hidden xl:block">OR</span>
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, base64 => setNewMenu({...newMenu, img: base64}))} className="text-sm file:mr-2 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#5a992a]/10 file:text-[#5a992a] hover:file:bg-[#5a992a]/20 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                    
                    <label className="flex items-center gap-2 sm:col-span-2 text-sm text-gray-700 font-medium cursor-pointer mt-2">
                      <input type="checkbox" checked={newMenu.isSpecial} onChange={e=>setNewMenu({...newMenu, isSpecial: e.target.checked})} className="w-5 h-5 accent-[#731c55]" />
                      Mark as Chef's Special
                    </label>
                    <button disabled={isSaving} type="submit" className={`sm:col-span-2 py-3 bg-[#5a992a] text-white rounded-lg font-bold uppercase tracking-widest mt-2 ${isSaving?'opacity-50':'hover:opacity-90'}`}>{isSaving ? 'Saving...' : 'Add Dish'}</button>
                 </form>
               </section>

               <section>
                 <h3 className="text-xl font-serif mb-4" style={{ color: THEME.primary }}>Current Menu Items</h3>
                 <div className="space-y-4">
                   {data.menu.map(item => (
                     <div key={item.id} className="flex flex-col sm:flex-row gap-4 items-center bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                       <img src={item.img} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                       <div className="flex-1 text-center sm:text-left">
                         <h4 className="font-bold text-gray-800">{item.name} <span className="text-xs font-normal text-gray-500 ml-2">({item.category})</span></h4>
                         <p className="text-sm text-gray-500 truncate max-w-xs">{item.desc}</p>
                       </div>
                       <div className="flex items-center gap-4">
                         <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer whitespace-nowrap text-gray-600">
                            <input type="checkbox" checked={item.showOnHome} onChange={() => toggleMenuHome(item.id)} className="w-5 h-5 accent-[#5a992a]" />
                            Show On Home
                         </label>
                         <button onClick={() => deleteMenu(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={20}/></button>
                       </div>
                     </div>
                   ))}
                 </div>
               </section>
            </div>
          )}

          {/* GALLERY SETTINGS TAB */}
          {activeTab === 'gallery' && (
            <div className="space-y-10 animate-fadeIn">
               <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                 <h3 className="text-xl font-serif mb-4 flex items-center gap-2" style={{ color: THEME.primary }}><ImageIcon size={20} /> Add New Image</h3>
                 <form onSubmit={handleAddGallery} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Category (e.g., Food, Ambiance)" required value={newGallery.category} onChange={e=>setNewGallery({...newGallery, category: e.target.value})} className="p-3 border border-gray-200 bg-white rounded-lg sm:col-span-2" />
                    
                    <div className="sm:col-span-2 flex flex-col md:flex-row items-start md:items-center gap-4 bg-white p-3 border border-gray-200 rounded-lg">
                      {newGallery.src ? (
                        <img src={newGallery.src} className="w-16 h-16 object-cover rounded shadow-sm border border-gray-100" alt="Preview" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-gray-400"><ImageIcon size={24}/></div>
                      )}
                      <div className="flex-1 w-full flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Gallery Image</label>
                        <div className="flex flex-col xl:flex-row gap-2 w-full">
                            <input type="text" placeholder="Image URL" value={newGallery.src.startsWith('data:') ? 'Database Encoded Image' : newGallery.src} onChange={e=>setNewGallery({...newGallery, src: e.target.value})} className="flex-1 p-2 border border-gray-200 rounded text-sm bg-gray-50" readOnly={newGallery.src.startsWith('data:')} />
                            <span className="self-center text-xs font-bold text-gray-400 hidden xl:block">OR</span>
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, base64 => setNewGallery({...newGallery, src: base64}))} className="text-sm file:mr-2 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#5a992a]/10 file:text-[#5a992a] hover:file:bg-[#5a992a]/20 cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    <button disabled={isSaving} type="submit" className={`sm:col-span-2 py-3 bg-[#5a992a] text-white rounded-lg font-bold uppercase tracking-widest mt-2 ${isSaving?'opacity-50':'hover:opacity-90'}`}>{isSaving ? 'Saving...' : 'Add to Gallery'}</button>
                 </form>
               </section>

               <section>
                 <h3 className="text-xl font-serif mb-4" style={{ color: THEME.primary }}>Current Gallery Images</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {data.gallery.map(img => (
                     <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-200 h-40 shadow-sm">
                       <img src={img.src} alt={img.category} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-3">
                          <label className="flex items-center gap-2 text-xs text-white font-bold uppercase tracking-widest cursor-pointer">
                            <input type="checkbox" checked={img.showOnHome} onChange={() => toggleGalleryHome(img.id)} className="w-4 h-4 accent-[#5a992a]" />
                            Home Screen
                          </label>
                          <button onClick={() => deleteGallery(img.id)} className="px-3 py-1 bg-red-500 text-white text-xs rounded uppercase font-bold tracking-widest hover:bg-red-600">Delete</button>
                       </div>
                       <span className="absolute top-2 left-2 text-[10px] uppercase tracking-widest bg-black/50 text-white px-2 py-1 rounded">{img.category}</span>
                     </div>
                   ))}
                 </div>
               </section>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
