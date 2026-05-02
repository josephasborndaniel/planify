import { useState } from 'react';
import { Minus, Plus, Download, Users, Utensils, Info } from 'lucide-react';
import plateImg from './plate.png';
import waterImg from './water.png';
import birImg from './biriyani.png';

interface MenuItem {
  id: string;
  category: 'Main Course' | 'Sides' | 'Desserts' | 'Drinks';
  name: string;
  pricePerPlate: number;
  quantity: number;
  imgUrl: string; // Real image path
}

const menuItems: MenuItem[] = [
  { 
    id: 'm1', 
    category: 'Main Course', 
    name: 'Paneer Butter Masala', 
    pricePerPlate: 120, 
    quantity: 0, 
    imgUrl: 'https://images.unsplash.com/photo-1603894584214-51e43343360b?w=400&h=400&fit=crop' 
  },
  { 
    id: 'm3', 
    category: 'Main Course', 
    name: 'Hyderabadi Biryani', 
    pricePerPlate: 150, 
    quantity: 0, 
    imgUrl: birImg
  },
  { 
    id: 's1', 
    category: 'Sides', 
    name: 'Butter Naan', 
    pricePerPlate: 30, 
    quantity: 0, 
    imgUrl: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=400&h=400&fit=crop' 
  },
  { 
    id: 'd1', 
    category: 'Desserts', 
    name: 'Gulab Jamun', 
    pricePerPlate: 40, 
    quantity: 0, 
    imgUrl: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=400&h=400&fit=crop' 
  },
  { 
    id: 'dr1', 
    category: 'Drinks', 
    name: 'Fresh Mango Lassi', 
    pricePerPlate: 45, 
    quantity: 0, 
    imgUrl: waterImg 
  },
];

export function PlateArchitect() {
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [guestCount, setGuestCount] = useState(500);

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item =>
      item.id === id
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    ));
  };

  const selectedItems = items.filter(item => item.quantity > 0 && item.category !== 'Drinks');
  const selectedDrinks = items.filter(item => item.quantity > 0 && item.category === 'Drinks');
  const pricePerPlate = items.reduce((sum, item) => sum + (item.pricePerPlate * item.quantity), 0);
  const totalCost = pricePerPlate * guestCount;

  return (
    <div className="flex flex-col h-screen bg-[#fcfcfc] font-sans overflow-hidden">
      {/* Premium Header */}
      <div className="bg-[#0a1628] text-white px-8 py-5 shadow-lg flex justify-between items-center z-50">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Utensils className="text-[#d4af37] w-5 h-5" /> Plate Architect
          </h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Gastronomy Visualization Engine</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
             <p className="text-[10px] text-gray-400 uppercase">Total Estimate</p>
             <p className="text-lg font-bold text-[#d4af37]">₹{totalCost.toLocaleString('en-IN')}</p>
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* THE REALISTIC 2D PLATE VIEW */}
        <div className="w-full lg:flex-1 bg-gray-100 flex items-center justify-center p-4 relative">
          <div className="flex items-center justify-center gap-8 w-full">
            
            {/* Plate with Food Items */}
            <div className="relative w-72 h-72 md:w-[450px] md:h-[450px] flex-shrink-0">
            
            {/* Plate Image */}
            <img 
              src={plateImg} 
              alt="Ceramic Plate" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />

            {/* Food Items Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              {selectedItems.length === 0 && (
                <p className="text-gray-400 font-medium italic text-sm text-center px-4">Select dishes to populate the plate</p>
              )}

              {/* Dynamic Food Placement */}
              <div className="relative w-full h-full">
                {selectedItems.map((item, index) => {
                  const angle = (index / selectedItems.length) * 2 * Math.PI;
                  const radius = 110; 
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <div
                      key={item.id}
                      className="absolute transition-all duration-700 ease-[cubic-bezier(0.23, 1, 0.32, 1)]"
                      style={{
                        left: `calc(50% + ${x}px - 45px)`,
                        top: `calc(50% + ${y}px - 45px)`,
                      }}
                    >
                      <div className="relative group animate-in fade-in zoom-in-75 slide-in-from-top-12">
                        {/* Realistic Dish Container */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-lg">
                           <img 
                             src={item.imgUrl} 
                             alt={item.name} 
                             className="w-full h-full object-cover"
                           />
                        </div>
                        {/* Quantity Badge */}
                        <div className="absolute -top-1 -right-1 bg-[#d4af37] text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white">
                          {item.quantity}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </div>

            {/* Drinks Section Next to Plate */}
            {selectedDrinks.length > 0 && (
              <div className="flex flex-col gap-4 items-center justify-center h-full">
                <h3 className="text-sm font-bold text-[#0a1628] uppercase">Drinks</h3>
                <div className="flex flex-col gap-3">
                  {selectedDrinks.map((drink) => (
                    <div key={drink.id} className="flex flex-col items-center gap-2 animate-in fade-in zoom-in-75">
                      {/* Water Bottle Image */}
                      <div className="w-24 h-[138px] rounded-lg overflow-hidden">
                        <img 
                          src={drink.imgUrl} 
                          alt={drink.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Quantity Badge */}
                      <div className="bg-[#d4af37] text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md">
                        Qty: {drink.quantity}
                      </div>
                      {/* Drink Name */}
                      <p className="text-[11px] font-semibold text-[#0a1628] text-center max-w-24">{drink.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Floating Plate Stats */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-white shadow-lg flex gap-6">
            <div className="text-center">
              <span className="block text-[8px] uppercase text-gray-500 font-bold">Items</span>
              <span className="text-sm font-bold text-[#0a1628]">{selectedItems.length + selectedDrinks.length}</span>
            </div>
            <div className="w-px h-6 bg-gray-200 self-center" />
            <div className="text-center">
              <span className="block text-[8px] uppercase text-gray-500 font-bold">Cost / Plate</span>
              <span className="text-sm font-bold text-[#d4af37]">₹{pricePerPlate}</span>
            </div>
          </div>
        </div>

        {/* CONTROLS & MENU SELECTION */}
        <div className="w-full lg:w-2/5 p-6 md:p-10 overflow-y-auto bg-white">
          <div className="max-w-md mx-auto">
            
            {/* Guest Count Card */}
            <div className="bg-[#0a1628] rounded-3xl p-6 mb-10 shadow-xl">
               <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-white">
                    <Users className="w-4 h-4 text-[#d4af37]" />
                    <span className="text-sm font-semibold">Guest Logistics</span>
                  </div>
                  <span className="text-2xl font-black text-[#d4af37] tracking-tighter">{guestCount}</span>
               </div>
               <input
                 type="range"
                 min="50"
                 max="2000"
                 step="50"
                 value={guestCount}
                 onChange={(e) => setGuestCount(parseInt(e.target.value))}
                 className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
               />
               <p className="text-[10px] text-gray-400 mt-3 italic">*Adjusting guest count updates live PDF quotation</p>
            </div>

            {/* Menu Sections */}
            {['Main Course', 'Sides', 'Desserts', 'Drinks'].map((category) => {
              const categoryItems = items.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category} className="mb-10">
                  <h3 className="text-xs font-bold text-[#0a1628] uppercase tracking-widest mb-6 flex items-center gap-3">
                    {category}
                    <div className="h-[1px] flex-1 bg-gray-100" />
                  </h3>
                  <div className="space-y-4">
                    {categoryItems.map((item) => (
                      <div 
                        key={item.id} 
                        className={`flex items-center justify-between p-2 rounded-2xl border transition-all ${
                          item.quantity > 0 ? 'bg-[#d4af37]/5 border-[#d4af37]/30 shadow-sm' : 'bg-white border-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <img 
                            src={item.imgUrl} 
                            className="w-14 h-14 rounded-xl object-cover shadow-sm"
                            alt={item.name}
                          />
                          <div>
                            <p className="text-sm font-bold text-[#0a1628]">{item.name}</p>
                            <p className="text-[10px] text-gray-500 font-medium">₹{item.pricePerPlate}/plate</p>
                          </div>
                        </div>

                        <div className="flex items-center bg-white rounded-full p-1 shadow-sm border border-gray-100">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 disabled:opacity-20"
                            disabled={item.quantity === 0}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 bg-[#0a1628] text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Action Footer */}
            <div className="pt-6 border-t border-gray-100 mt-10">
               <button className="w-full bg-[#d4af37] text-[#0a1628] font-black py-4 rounded-2xl shadow-[0_10px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_15px_30px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-3">
                 <Download className="w-5 h-5" /> EXPORT PDF QUOTATION
               </button>
               <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-medium">
                  <Info className="w-3 h-3" /> Taxes and service charges applied at checkout
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}