import { useState } from 'react';
import { useDrop } from 'react-dnd';
import { ResourceRibbon } from './ResourceRibbon';
import { StageCanvas } from './StageCanvas';
import { IndianRupee } from 'lucide-react';

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
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState<string>('');

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
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-[#0a1628] text-white px-3 sm:px-4 py-3 sm:py-4 shadow-lg">
        <h1 className="text-lg sm:text-xl font-semibold">Design Studio</h1>
        <p className="text-xs sm:text-sm text-gray-300 mt-1">Plan your event layout</p>
      </div>

      {/* Total Cost Badge */}
      <div className="fixed top-16 right-2 sm:right-4 z-20 bg-gradient-to-r from-[#d4af37] to-[#e8c766] text-[#0a1628] px-3 sm:px-5 py-2 sm:py-3 rounded-full shadow-xl flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
        <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
        <div>
          <div className="text-xs opacity-80 hidden sm:block">Total Est. Cost</div>
          <div className="font-bold text-sm sm:text-lg">₹{totalCost.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Stage Canvas */}
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
