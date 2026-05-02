import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DesignStudio } from './components/DesignStudio';
import { PlateArchitect } from './components/PlateArchitect';
import { 
  Heart, Cake, Baby, Home, Church, ArrowRight, ArrowLeft, 
  Zap, ShieldCheck, Star, Ruler, Sparkles, UtensilsCrossed, X 
} from 'lucide-react';

interface Design {
  id: string;
  image: string;
  title: string;
  description: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  coverImage: string;
  description: string;
  features: string[];
  designs: Design[];
}

const PLANS: Record<string, Plan> = {
  budget: {
    id: 'budget',
    name: 'Budget',
    price: 5000,
    coverImage: 'https://images.unsplash.com/photo-1519167758993-87dde89c1cc3?w=400&h=300&fit=crop',
    description: 'Basic event setup with essential elements and standard services.',
    features: ['Basic decoration', 'Standard setup', 'Single light scheme', 'Basic catering'],
    designs: [
      {
        id: 'budget-1',
        image: 'https://images.unsplash.com/photo-1519167758993-87dde89c1cc3?w=600&h=400&fit=crop',
        title: 'Classic Simple',
        description: 'Clean and minimal design with essential setup'
      },
      {
        id: 'budget-2',
        image: 'https://images.unsplash.com/photo-1540575467063-178f50002c4b?w=600&h=400&fit=crop',
        title: 'Elegant Basic',
        description: 'Elegant yet affordable design concept'
      },
      {
        id: 'budget-3',
        image: 'https://images.unsplash.com/photo-1519671482677-11fbb989edba?w=600&h=400&fit=crop',
        title: 'Modern Minimal',
        description: 'Contemporary minimal design approach'
      }
    ]
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 12000,
    coverImage: 'https://images.unsplash.com/photo-1519671482677-11fbb989edba?w=400&h=300&fit=crop',
    description: 'Complete event package with premium elements and enhanced services.',
    features: ['Premium decoration', 'Advanced setup', 'Multi-light setup', 'Premium catering'],
    designs: [
      {
        id: 'standard-1',
        image: 'https://images.unsplash.com/photo-1519671482677-11fbb989edba?w=600&h=400&fit=crop',
        title: 'Premium Elegant',
        description: 'Sophisticated design with premium elements'
      },
      {
        id: 'standard-2',
        image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600&h=400&fit=crop',
        title: 'Modern Chic',
        description: 'Contemporary chic aesthetic'
      },
      {
        id: 'standard-3',
        image: 'https://images.unsplash.com/photo-1519224283042-481453be6f32?w=600&h=400&fit=crop',
        title: 'Luxury Standard',
        description: 'Luxurious yet accessible design'
      }
    ]
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 25000,
    coverImage: 'https://images.unsplash.com/photo-1519224283042-481453be6f32?w=400&h=300&fit=crop',
    description: 'Luxury event experience with exclusive elements and VIP services.',
    features: ['Luxury decoration', 'Full customization', 'Advanced lighting design', 'Gourmet catering'],
    designs: [
      {
        id: 'premium-1',
        image: 'https://images.unsplash.com/photo-1519224283042-481453be6f32?w=600&h=400&fit=crop',
        title: 'Grand Luxury',
        description: 'Grand and luxurious event experience'
      },
      {
        id: 'premium-2',
        image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600&h=400&fit=crop',
        title: 'Opulent Elegance',
        description: 'Opulent and elegant celebration'
      },
      {
        id: 'premium-3',
        image: 'https://images.unsplash.com/photo-1540575467063-178f50002c4b?w=600&h=400&fit=crop',
        title: 'Exclusive VIP',
        description: 'Exclusive VIP luxury experience'
      }
    ]
  }
};

const EVENTS = [
  {
    id: 'wedding',
    title: 'Weddings & Engagements',
    desc: 'Grand stages, floral drapes, and complex seating.',
    icon: <Heart className="w-6 h-6 text-red-400" />,
    needsStageCustomization: true
  },
  {
    id: 'birthday',
    title: 'Birthdays & Anniversaries',
    desc: 'Photo booths, balloons, and intimate lighting.',
    icon: <Cake className="w-6 h-6 text-pink-400" />,
    needsStageCustomization: true
  },
  {
    id: 'baby',
    title: 'Baby Shower / Naming',
    desc: 'Soft pastels and central seating for parents.',
    icon: <Baby className="w-6 h-6 text-blue-400" />,
    needsStageCustomization: true
  },
  {
    id: 'housewarming',
    title: 'Housewarming (Griha Pravesh)',
    desc: 'Traditional floral hangings and entrance decor.',
    icon: <Home className="w-6 h-6 text-orange-400" />,
    needsStageCustomization: false
  },
  {
    id: 'memorial',
    title: 'Memorial Services',
    desc: 'Classic white drapes and subtle floral arrangements.',
    icon: <Church className="w-6 h-6 text-gray-400" />,
    needsStageCustomization: false
  }
];

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'home' | 'studio' | 'catering'>('home');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [activePackage, setActivePackage] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [currentDesignIndex, setCurrentDesignIndex] = useState(0);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);

  const startDesign = (packageId: string | null = null) => {
    setActivePackage(packageId);
    setActiveScreen('studio');
  };

  const currentEvent = EVENTS.find(e => e.id === selectedEvent);

  const handleNextDesign = () => {
    if (selectedPlan) {
      setCurrentDesignIndex((prev) => (prev + 1) % selectedPlan.designs.length);
    }
  };

  const handlePrevDesign = () => {
    if (selectedPlan) {
      setCurrentDesignIndex((prev) => (prev - 1 + selectedPlan.designs.length) % selectedPlan.designs.length);
    }
  };

  if (selectedPlan) {
    const currentDesign = selectedPlan.designs[currentDesignIndex];
    
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
          {/* Close Button */}
          <button
            onClick={() => {
              setSelectedPlan(null);
              setCurrentDesignIndex(0);
              setSelectedDesign(null);
            }}
            className="absolute top-4 right-4 z-10 bg-[#0a1628] text-white p-2 rounded-full hover:bg-[#d4af37] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 md:p-12">
            
            {/* LEFT: Design Carousel */}
            <div className="flex flex-col">
              {/* Design Image */}
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-lg mb-6 bg-gray-200">
                <img 
                  src={currentDesign.image} 
                  alt={currentDesign.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Buttons */}
                <button
                  onClick={handlePrevDesign}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#d4af37] text-white p-3 rounded-full transition-all"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextDesign}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#d4af37] text-white p-3 rounded-full transition-all"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>

                {/* Design Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-bold">
                  {currentDesignIndex + 1} / {selectedPlan.designs.length}
                </div>
              </div>

              {/* Design Info */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="text-xl font-bold text-[#0a1628] mb-1">{currentDesign.title}</h3>
                <p className="text-gray-600 text-sm">{currentDesign.description}</p>
              </div>

              {/* Design Selection Dots */}
              <div className="flex gap-2 justify-center mt-4">
                {selectedPlan.designs.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentDesignIndex(idx)}
                    className={`h-3 rounded-full transition-all ${
                      idx === currentDesignIndex 
                        ? 'w-8 bg-[#d4af37]' 
                        : 'w-3 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT: Plan Details */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[#0a1628] mb-2">{selectedPlan.name} Plan</h1>
                <div className="mb-6">
                  <p className="text-gray-500 text-sm uppercase">Starting From</p>
                  <p className="text-5xl font-bold text-[#d4af37]">₹{selectedPlan.price.toLocaleString('en-IN')}</p>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-base mb-8 leading-relaxed">{selectedPlan.description}</p>

                {/* Features */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-[#0a1628] mb-4">Included Features</h3>
                  <div className="space-y-3">
                    {selectedPlan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#d4af37] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <p className="text-gray-700 text-sm">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setSelectedDesign(currentDesign);
                    setSelectedPlan(null);
                    setActivePackage(`${selectedEvent}-${selectedPlan.id}`);
                    setActiveScreen('studio');
                  }}
                  className="w-full bg-[#0a1628] text-white py-4 rounded-2xl font-bold hover:bg-[#d4af37] hover:text-[#0a1628] transition-all text-lg"
                >
                  Start with {currentDesign.title}
                </button>
                <button
                  onClick={() => {
                    setSelectedPlan(null);
                    setCurrentDesignIndex(0);
                    setSelectedDesign(null);
                  }}
                  className="w-full bg-gray-200 text-[#0a1628] py-4 rounded-2xl font-bold hover:bg-gray-300 transition-all"
                >
                  Back
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (activeScreen === 'studio') {
    return (
      <DndProvider backend={HTML5Backend}>
        <DesignStudio initialPackage={activePackage} eventType={selectedEvent} />
        <button
          onClick={() => setActiveScreen('home')}
          className="fixed top-4 left-4 z-50 bg-white text-[#0a1628] px-4 py-2 rounded-full shadow-lg font-medium hover:shadow-xl transition-all"
        >
          ← Back
        </button>
      </DndProvider>
    );
  }

  if (activeScreen === 'catering') {
    return (
      <>
        <PlateArchitect />
        <button
          onClick={() => setActiveScreen('home')}
          className="fixed top-4 left-4 z-50 bg-white text-[#0a1628] px-4 py-2 rounded-full shadow-lg font-medium hover:shadow-xl transition-all"
        >
          ← Back
        </button>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <div className="text-center mt-10 mb-16">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Sparkles className="w-10 h-10 text-[#d4af37]" />
          <h1 className="text-5xl font-bold text-white tracking-tight">Planify</h1>
        </div>
        <p className="text-[#d4af37] text-lg font-medium">Professional Event & Stage Planner</p>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: EVENT SELECTION & DESIGN */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white pl-2">Event Planning</h2>
            {selectedEvent && (
              <button onClick={() => setSelectedEvent(null)} className="text-[#d4af37] text-xs flex items-center gap-1 hover:underline">
                <ArrowLeft className="w-3 h-3" /> All Events
              </button>
            )}
          </div>

          <div className="space-y-4">
            {!selectedEvent ? (
              // STEP 1: All Events List
              EVENTS.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event.id)}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between group hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                      {event.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{event.title}</h3>
                      <p className="text-gray-400 text-sm">{event.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-600 group-hover:text-[#d4af37]" />
                </button>
              ))
            ) : (
              // STEP 2: Selection based on event type
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                
                {/* SHOW CUSTOMIZATION BUTTON ONLY FOR STAGE-FOCUSED EVENTS */}
                {currentEvent?.needsStageCustomization && (
                  <button
                    onClick={() => startDesign()}
                    className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#0a1628] border border-[#d4af37]/30 rounded-2xl p-5 flex items-center justify-between group hover:border-[#d4af37] transition-all shadow-lg"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="p-3 bg-[#d4af37]/20 rounded-xl">
                        <Ruler className="w-6 h-6 text-[#d4af37]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Customize Your Stage</h3>
                        <p className="text-gray-400 text-xs">Start with a blank canvas</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#d4af37]" />
                  </button>
                )}

                {/* 3 PLANS FOR ALL EVENTS */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'budget', icon: <Zap className="text-green-500 w-6 h-6" /> },
                    { id: 'standard', icon: <ShieldCheck className="text-blue-500 w-6 h-6" /> },
                    { id: 'premium', icon: <Star className="text-[#d4af37] w-6 h-6" /> }
                  ].map((tier) => {
                    const plan = PLANS[tier.id];
                    return (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedPlan(plan)}
                        className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                      >
                        <div className="aspect-square overflow-hidden">
                          <img 
                            src={plan.coverImage} 
                            alt={plan.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-[#0a1628] text-[11px] font-bold uppercase tracking-tighter">{plan.name}</h4>
                            <span className="text-[#d4af37] text-[10px] font-bold">₹{plan.price}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CATERING */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white pl-2">Food & Catering</h2>
          <button
            onClick={() => setActiveScreen('catering')}
            className="w-full h-[calc(100%-3rem)] bg-white rounded-[40px] p-10 flex flex-col items-center justify-center text-center group hover:shadow-[0_0_50px_rgba(212,175,55,0.15)] transition-all"
          >
            <div className="w-24 h-24 bg-[#0a1628] rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
              <UtensilsCrossed className="w-12 h-12 text-[#d4af37]" />
            </div>
            <h3 className="text-3xl font-bold text-[#0a1628] mb-4">Plate Architect</h3>
            <p className="text-gray-500 text-base leading-relaxed">
              Create the perfect catering menu and scale quantities for your guests.
            </p>
            <div className="mt-10 flex flex-wrap gap-2 justify-center">
              <span className="px-4 py-2 bg-gray-100 text-[#0a1628] rounded-full text-xs font-bold">Menu Builder</span>
              <span className="px-4 py-2 bg-gray-100 text-[#0a1628] rounded-full text-xs font-bold">PDF Quotes</span>
            </div>
          </button>
        </div>
      </div>

      <footer className="mt-auto pt-20 pb-6 text-gray-600 text-[10px] uppercase tracking-[0.2em]">
        EventFlow Management • Est. 2026
      </footer>
    </div>
  );
}