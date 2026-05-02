import { useState } from 'react';
import { Minus, Plus, Download, Users, Utensils, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import plateImg from './plate.png';
import waterImg from './water.png';
import birImg from './biriyani.png';

interface MenuItem {
  id: string;
  category: 'Main Course' | 'Sides' | 'Desserts' | 'Drinks';
  name: string;
  pricePerPlate: number;
  quantity: number;
  imgUrl: string;
}

const menuItems: MenuItem[] = [
  { id: 'm1', category: 'Main Course', name: 'Paneer Butter Masala', pricePerPlate: 120, quantity: 0, imgUrl: 'https://images.unsplash.com/photo-1603894584214-51e43343360b?w=400&h=400&fit=crop' },
  { id: 'm3', category: 'Main Course', name: 'Hyderabadi Biryani', pricePerPlate: 150, quantity: 0, imgUrl: birImg },
  { id: 's1', category: 'Sides', name: 'Butter Naan', pricePerPlate: 30, quantity: 0, imgUrl: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=400&h=400&fit=crop' },
  { id: 'd1', category: 'Desserts', name: 'Gulab Jamun', pricePerPlate: 40, quantity: 0, imgUrl: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=400&h=400&fit=crop' },
  { id: 'dr1', category: 'Drinks', name: 'Fresh Mango Lassi', pricePerPlate: 45, quantity: 0, imgUrl: waterImg },
];

const CATEGORY_EMOJIS: Record<string, string> = {
  'Main Course': '🍛',
  'Sides': '🫓',
  'Desserts': '🍮',
  'Drinks': '🥛',
};

export function PlateArchitect() {
  const { isDark } = useTheme();
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [guestCount, setGuestCount] = useState(500);
  const [showPlate, setShowPlate] = useState(true);

  const bg = isDark ? '#1a1025' : '#f0f7ff';
  const card = isDark ? '#231534' : '#ddeeff';
  const border = isDark ? 'rgba(192,156,222,0.2)' : 'rgba(42,125,212,0.18)';
  const text = isDark ? '#f0e6ff' : '#0d2d52';
  const textMuted = isDark ? 'rgba(240,230,255,0.6)' : '#3a6898';
  const muted = isDark ? '#2d1e45' : '#c8e4ff';
  const purple = isDark ? '#c09cde' : '#2a7dd4';

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ));
  };

  const selectedItems = items.filter(i => i.quantity > 0 && i.category !== 'Drinks');
  const selectedDrinks = items.filter(i => i.quantity > 0 && i.category === 'Drinks');
  const pricePerPlate = items.reduce((sum, item) => sum + (item.pricePerPlate * item.quantity), 0);
  const totalCost = pricePerPlate * guestCount;
  const totalSelected = selectedItems.length + selectedDrinks.length;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: bg, color: text }}>

      {/* Header */}
      <div
        className="px-4 py-3 flex justify-between items-center z-20"
        style={{
          background: isDark ? 'rgba(26,16,37,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div>
          <h1 className="text-lg font-black flex items-center gap-2" style={{ color: text }}>
            <Utensils className="w-5 h-5" style={{ color: purple }} />
            Plate Architect
          </h1>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: textMuted }}>Gastronomy Planner</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide" style={{ color: textMuted }}>Total</p>
          <p className="text-xl font-black" style={{ color: text }}>₹{totalCost.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-3 px-4 py-2.5" style={{ borderBottom: `1px solid ${border}`, background: muted }}>
        {[
          { label: 'Guests', value: guestCount },
          { label: 'Dishes', value: totalSelected },
          { label: '/ Plate', value: `₹${pricePerPlate}` },
        ].map((stat, i) => (
          <div key={i} className="flex-1 text-center">
            <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: textMuted }}>{stat.label}</p>
            <p className="text-sm font-black" style={{ color: text }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">

        {/* Plate Preview (collapsible on mobile) */}
        <div style={{ borderBottom: `1px solid ${border}` }}>
          <button
            onClick={() => setShowPlate(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3"
            style={{ color: text }}
          >
            <span className="text-sm font-bold">🍽️ Plate Preview</span>
            {showPlate ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showPlate && (
            <div className="flex items-center justify-center gap-6 px-4 pb-5" style={{ background: isDark ? '#1a1025' : '#faf8ff' }}>
              {/* Plate */}
              <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex-shrink-0">
                <img src={plateImg} alt="Plate" className="w-full h-full object-contain drop-shadow-xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {selectedItems.length === 0 && (
                    <p className="text-[10px] text-center italic px-4" style={{ color: textMuted }}>Select dishes to populate</p>
                  )}
                  <div className="relative w-full h-full">
                    {selectedItems.map((item, index) => {
                      const angle = (index / selectedItems.length) * 2 * Math.PI;
                      const radius = 55;
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      return (
                        <div
                          key={item.id}
                          className="absolute transition-all duration-500"
                          style={{ left: `calc(50% + ${x}px - 24px)`, top: `calc(50% + ${y}px - 24px)` }}
                        >
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full overflow-hidden shadow-md border-2 border-white">
                              <img src={item.imgUrl} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white" style={{ background: purple }}>
                              {item.quantity}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Drinks */}
              {selectedDrinks.length > 0 && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: textMuted }}>Drinks</p>
                  {selectedDrinks.map(drink => (
                    <div key={drink.id} className="flex flex-col items-center gap-1 animate-in fade-in zoom-in-75">
                      <div className="w-14 h-20 rounded-xl overflow-hidden shadow-md">
                        <img src={drink.imgUrl} alt={drink.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: purple, color: '#fff' }}>×{drink.quantity}</span>
                      <p className="text-[9px] text-center font-medium max-w-16" style={{ color: textMuted }}>{drink.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Guest Count */}
        <div className="px-4 py-4" style={{ borderBottom: `1px solid ${border}` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: purple }} />
              <span className="text-sm font-bold" style={{ color: text }}>Guest Count</span>
            </div>
            <span className="text-2xl font-black" style={{ color: text }}>{guestCount}</span>
          </div>
          <input
            type="range"
            min="50"
            max="2000"
            step="50"
            value={guestCount}
            onChange={e => setGuestCount(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: purple, background: `linear-gradient(to right, ${purple} ${(guestCount - 50) / 1950 * 100}%, ${isDark ? 'rgba(192,156,222,0.2)' : 'rgba(138,79,196,0.2)'} 0%)` }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px]" style={{ color: textMuted }}>50</span>
            <span className="text-[10px]" style={{ color: textMuted }}>2,000</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-4 py-4 space-y-5">
          {(['Main Course', 'Sides', 'Desserts', 'Drinks'] as const).map(category => {
            const catItems = items.filter(i => i.category === category);
            if (!catItems.length) return null;
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">{CATEGORY_EMOJIS[category]}</span>
                  <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: text }}>{category}</h3>
                  <div className="flex-1 h-px" style={{ background: border }} />
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {catItems.map(item => (
                    <div
                      key={item.id}
                      className="rounded-2xl p-2.5 transition-all"
                      style={{
                        background: item.quantity > 0 ? (isDark ? '#2d1e45' : '#f5f0fb') : card,
                        border: `1px solid ${item.quantity > 0 ? purple + '66' : border}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <img src={item.imgUrl} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" alt={item.name} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-tight line-clamp-2" style={{ color: text }}>{item.name}</p>
                          <p className="text-[10px] mt-0.5 font-semibold" style={{ color: purple }}>₹{item.pricePerPlate}/plate</p>
                        </div>
                      </div>
                      <div
                        className="flex items-center justify-between rounded-full px-1 py-1"
                        style={{ background: isDark ? '#1a1025' : '#e8f3ff', border: `1px solid ${border}` }}
                      >
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity === 0}
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-25"
                          style={{ color: text }}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black" style={{ color: text }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                          style={{ background: purple, color: '#fff' }}
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
        </div>
      </div>

      {/* Sticky Footer CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 py-4 z-20"
        style={{
          background: isDark ? 'rgba(26,16,37,0.97)' : 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(12px)',
          borderTop: `1px solid ${border}`,
        }}
      >
        <button
          className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${purple}, $(isDark ? isDark ? '#a07ac8' : '#5aa0e0' : '#5aa0e0'))`, color: '#fff' }}
        >
          <Download className="w-4 h-4" />
          Export PDF Quotation
        </button>
        <p className="mt-2 text-center flex items-center justify-center gap-1 text-[10px]" style={{ color: textMuted }}>
          <Info className="w-3 h-3" /> Taxes & service charges applied at checkout
        </p>
      </div>
    </div>
  );
}
