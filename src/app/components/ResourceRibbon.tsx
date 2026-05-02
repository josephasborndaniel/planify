import { useDrag } from 'react-dnd';
import { Flower2, Armchair, Lightbulb, Wind, Gift, SquareStack } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import flowerImg from './flower.png';
import manImg from './many-removebg.png';
import stgImg from './image.png';
import stgfreeImg from './stagefree.jpg';
import single from './single.png';
interface ResourceItem {
  id: string;
  name: string;
  price: number;
  category: 'Decor' | 'Infrastructure' | 'Lighting' | 'Stage Background';
  icon: any;
  image: string | any;
  isBackground?: boolean;
}

const resources: ResourceItem[] = [
  { 
    id: 'flowers-1', 
    name: 'Flower Arrangement', 
    price: 5000, 
    category: 'Decor', 
    icon: Flower2,
    image: flowerImg
  },
  { 
    id: 'drapes-1', 
    name: 'Elegant Drapes', 
    price: 3500, 
    category: 'Decor', 
    icon: Wind,
    image: manImg
  },
  { 
    id: 'centerpiece-1', 
    name: 'Single speaker', 
    price: 2000, 
    category: 'Decor', 
    icon: Gift,
    image:  single
  },
  { 
    id: 'chair-1', 
    name: 'Folding Chair', 
    price: 150, 
    category: 'Infrastructure', 
    icon: Armchair,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&h=400'
  },
  { 
    id: 'tent-1', 
    name: 'Shamiyana Tent', 
    price: 15000, 
    category: 'Infrastructure', 
    icon: SquareStack,
    image: 'https://images.unsplash.com/photo-1493514789560-586f3ee6c515?auto=format&fit=crop&w=400&h=400'
  },
  { 
    id: 'stage-1', 
    name: 'Stage Platform', 
    price: 12000, 
    category: 'Infrastructure', 
    icon: SquareStack,
    image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=400&h=400'
  },
  { 
    id: 'lights-1', 
    name: 'LED Spotlight', 
    price: 1500, 
    category: 'Lighting', 
    icon: Lightbulb,
    image: 'https://images.unsplash.com/photo-1565636192335-14eccb3c3f29?auto=format&fit=crop&w=400&h=400'
  },
  { 
    id: 'lights-2', 
    name: 'String Lights', 
    price: 800, 
    category: 'Lighting', 
    icon: Lightbulb,
    image: 'https://images.unsplash.com/photo-1542272604-787c62d465d1?auto=format&fit=crop&w=400&h=400'
  },
  { 
    id: 'lights-3', 
    name: 'Chandelier', 
    price: 8000, 
    category: 'Lighting', 
    icon: Lightbulb,
    image: 'https://images.unsplash.com/photo-1565881223467-7e0b6b7ea0de?auto=format&fit=crop&w=400&h=400'
  },
  { 
    id: 'bg-garden', 
    name: 'Garden Venue', 
    price: 0, 
    category: 'Stage Background', 
    icon: Flower2,
    image:stgImg,
    isBackground: true
  },
  { 
    id: 'bg-ballroom', 
    name: 'Ballroom Setting', 
    price: 0, 
    category: 'Stage Background', 
    icon: SquareStack,
    image: stgfreeImg ,
    isBackground: true
  },
  { 
    id: 'bg-outdoor', 
    name: 'Outdoor Banquet', 
    price: 0, 
    category: 'Stage Background', 
    icon: Wind,
    image: 'https://images.unsplash.com/photo-1552072092-25bd00f233de?auto=format&fit=crop&w=1200&h=1200',
    isBackground: true
  },
  { 
    id: 'bg-classic', 
    name: 'Classic Elegance', 
    price: 0, 
    category: 'Stage Background', 
    icon: Gift,
    image: 'https://images.unsplash.com/photo-1496242686353-8bea1b60dd72?auto=format&fit=crop&w=1200&h=1200',
    isBackground: true
  },
  { 
    id: 'bg-modern', 
    name: 'Modern Minimalist', 
    price: 0, 
    category: 'Stage Background', 
    icon: Lightbulb,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&h=1200',
    isBackground: true
  },
];

function DraggableResourceCard({ item }: { item: ResourceItem }) {
  const { isDark } = useTheme();
  const [{ isDragging }, drag] = useDrag({
    type: 'RESOURCE_ITEM',
    item: { id: item.id, name: item.name, price: item.price, category: item.category, image: item.image, isBackground: item.isBackground },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const card = isDark ? '#231534' : '#ddeeff';
  const border = isDark ? 'rgba(192,156,222,0.25)' : 'rgba(42,125,212,0.18)';
  const text = isDark ? '#f0e6ff' : '#0d2d52';
  const textMuted = isDark ? 'rgba(240,230,255,0.5)' : '#7b5aa6';

  return (
    <div
      ref={drag}
      className={`flex-shrink-0 w-24 sm:w-28 rounded-2xl overflow-hidden cursor-move touch-none transition-all ${
        isDragging ? 'opacity-40 scale-90' : 'hover:scale-105'
      }`}
      style={{ touchAction: 'none', background: card, border: `1px solid ${border}` }}
    >
      <div className="w-full h-16 sm:h-20 overflow-hidden flex items-center justify-center p-1" style={{ background: isDark ? '#2d1e45' : '#c8e4ff' }}>
        <img loading="lazy"
          src={item.image}
          alt={item.name}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100"/></svg>';
          }}
        />
      </div>
      <div className="p-1.5 text-center">
        <p className="text-[10px] font-semibold line-clamp-2 leading-tight" style={{ color: text }}>{item.name}</p>
        {item.price > 0 && (
          <p className="text-[10px] font-black mt-0.5" style={{ color: '#c09cde' }}>₹{item.price.toLocaleString('en-IN')}</p>
        )}
      </div>
    </div>
  );
}

export function ResourceRibbon() {
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Stage Background', 'Decor', 'Infrastructure', 'Lighting'];
  const filteredResources = activeCategory === 'All'
    ? resources
    : resources.filter(r => r.category === activeCategory);

  const bg = isDark ? '#1a1025' : '#f0f7ff';
  const border = isDark ? 'rgba(192,156,222,0.2)' : 'rgba(42,125,212,0.18)';
  const text = isDark ? '#f0e6ff' : '#0d2d52';
  const purple = isDark ? '#c09cde' : '#2a7dd4';

  return (
    <div style={{ background: bg, borderTop: `1px solid ${border}` }}>
      {/* Category Tabs */}
      <div className="flex gap-1.5 px-3 pt-3 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all active:scale-95"
            style={{
              background: activeCategory === cat ? purple : (isDark ? '#2d1e45' : '#c8e4ff'),
              color: activeCategory === cat ? '#fff' : text,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resource Cards */}
      <div className="p-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filteredResources.map(item => (
            <DraggableResourceCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
