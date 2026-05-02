import { useState } from 'react';
import { useDrop } from 'react-dnd';
import { ResourceRibbon } from './ResourceRibbon';
import { StageCanvas } from './StageCanvas';
import { IndianRupee } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DroppedItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string | any;
  x: number;
  y: number;
}

export function DesignStudio() {
  const { isDark } = useTheme();
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState<string>('');

  const bg = isDark ? '#1a1025' : '#f0f7ff';
  const card = isDark ? '#231534' : '#ddeeff';
  const border = isDark ? 'rgba(192,156,222,0.2)' : 'rgba(42,125,212,0.18)';
  const text = isDark ? '#f0e6ff' : '#0d2d52';
  const textMuted = isDark ? 'rgba(240,230,255,0.6)' : '#3a6898';
  const purple = isDark ? '#c09cde' : '#2a7dd4';

  const handleDrop = (item: any, position: { x: number; y: number }) => {
    const newItem: DroppedItem = {
      id: `${item.id}-${Date.now()}`,
      name: item.name,
      price: item.price,
      category: item.category,
      image: item.image,
      x: position.x,
      y: position.y,
    };
    setDroppedItems([...droppedItems, newItem]);
    setTotalCost(totalCost + item.price);
  };

  const removeItem = (id: string) => {
    const item = droppedItems.find(i => i.id === id);
    if (item) {
      setDroppedItems(droppedItems.filter(i => i.id !== id));
      setTotalCost(totalCost - item.price);
    }
  };

  const moveItem = (id: string, x: number, y: number) => {
    setDroppedItems(droppedItems.map(item =>
      item.id === id ? { ...item, x, y } : item
    ));
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: bg, color: text }}>
      {/* Header */}
      <div
        className="px-4 py-3 sticky top-0 z-10"
        style={{
          background: isDark ? 'rgba(26,16,37,0.9)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${border}`,
        }}
      >
        <h1 className="text-lg font-black tracking-tight" style={{ color: text }}>Design Studio</h1>
        <p className="text-xs mt-0.5" style={{ color: textMuted }}>Drag items to build your stage layout</p>
      </div>

      {/* Total Cost Badge */}
      <div
        className="fixed top-16 right-3 z-20 flex items-center gap-2 px-3 py-2 rounded-full text-sm shadow-lg"
        style={{ background: card, border: `1px solid ${border}`, color: text }}
      >
        <IndianRupee className="w-4 h-4" style={{ color: purple }} />
        <div>
          <div className="text-[10px] hidden sm:block" style={{ color: textMuted }}>Total</div>
          <div className="font-black text-sm">₹{totalCost.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-2 sm:p-4">
        <StageCanvas
          droppedItems={droppedItems}
          onDrop={handleDrop}
          onRemoveItem={removeItem}
          onMoveItem={moveItem}
          backgroundImage={backgroundImage}
          onSetBackground={setBackgroundImage}
        />
      </div>

      {/* Resource Ribbon */}
      <ResourceRibbon />
    </div>
  );
}
