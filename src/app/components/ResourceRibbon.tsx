import { useDrag } from 'react-dnd';
import { Flower2, Armchair, Lightbulb, Wind, Gift, SquareStack } from 'lucide-react';
import { useState } from 'react';
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
  const [{ isDragging }, drag] = useDrag({
    type: 'RESOURCE_ITEM',
    item: { 
      id: item.id, 
      name: item.name, 
      price: item.price, 
      category: item.category, 
      image: item.image, 
      isBackground: item.isBackground 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`flex-shrink-0 w-28 sm:w-32 md:w-36 bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm cursor-move touch-none hover:shadow-lg hover:border-[#d4af37] transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
      style={{ touchAction: 'none' }}
    >
      <div className="flex flex-col h-full">
        {/* Container for the image */}
        <div className="w-full h-20 sm:h-24 md:h-28 bg-white overflow-hidden flex items-center justify-center p-1">
          <img 
            src={item.image} 
            alt={item.name}
            /* object-contain ensures the full image is visible without cropping */
            className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100"/></svg>';
            }}
          />
        </div>
        <div className="p-1 sm:p-2 flex-1 flex flex-col justify-between">
          <div className="text-center">
            <div className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 h-6 sm:h-7">
              {item.name}
            </div>
          </div>
          <div className="text-xs sm:text-sm font-bold text-[#d4af37] text-center">
            ₹{item.price.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResourceRibbon() {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Stage Background', 'Decor', 'Infrastructure', 'Lighting'];
  const filteredResources = activeCategory === 'All'
    ? resources
    : resources.filter(r => r.category === activeCategory);

  return (
    <div className="bg-gradient-to-r from-[#0a1628] to-[#1e3a5f] border-t-4 border-[#d4af37] shadow-2xl">
      {/* Category Tabs */}
      <div className="flex gap-1 sm:gap-2 px-2 sm:px-4 pt-2 sm:pt-4 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2 sm:px-4 py-2 rounded-t-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-white text-[#0a1628]'
                : 'bg-[#1e3a5f] text-white hover:bg-[#2a4a7f]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resource Cards */}
      <div className="bg-white p-2 sm:p-4">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
          {filteredResources.map((item) => (
            <DraggableResourceCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}