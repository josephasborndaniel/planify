import { useState } from 'react';
import { ResourceRibbon } from './ResourceRibbon';
import { StageCanvas } from './StageCanvas';
import { IndianRupee, Share2, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { buildWhatsAppLink, saveDesignToSupabase } from '../../lib/whatsapp';

interface DroppedItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string | any;
  x: number;
  y: number;
}

interface DesignStudioProps {
  initialPackage?: string | null;
  eventType?: string | null;
}

export function DesignStudio({ initialPackage, eventType }: DesignStudioProps) {
  const { isDark } = useTheme();
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [sharing, setSharing] = useState(false);

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

  // ── Feature 7: WhatsApp Share ──────────────────────────────────
  const handleWhatsAppShare = async () => {
    if (!droppedItems.length) return;
    setSharing(true);

    const itemList = droppedItems.map(i => ({ name: i.name, quantity: 1 }));
    const canvasState = { items: droppedItems, background: backgroundImage };

    // Save to Supabase and get shareable ID
    const designId = await saveDesignToSupabase(
      eventType ?? 'Event',
      canvasState,
      itemList,
    );

    const waLink = buildWhatsAppLink({
      eventType: eventType ?? 'Event',
      items: itemList,
      designId: designId ?? undefined,
    });

    window.open(waLink, '_blank');
    setSharing(false);
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: bg, color: text }}>
      {/* Header */}
      <div
        className="px-4 py-3 sticky top-0 z-10"
        style={{
          background: isDark ? 'rgba(26,16,37,0.9)' : 'rgba(240,247,255,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${border}`,
        }}
      >
        <h1 className="text-lg font-black tracking-tight" style={{ color: text }}>Design Studio</h1>
        <p className="text-xs mt-0.5" style={{ color: textMuted }}>Drag items to build your stage layout</p>
      </div>

      {/* Top-right buttons */}
      <div className="fixed top-14 right-3 z-20 flex flex-col gap-2">
        {/* Total Cost Badge */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-full text-sm shadow-lg"
          style={{ background: card, border: `1px solid ${border}`, color: text }}
        >
          <IndianRupee className="w-4 h-4" style={{ color: purple }} />
          <div>
            <div className="text-[10px] hidden sm:block" style={{ color: textMuted }}>Total</div>
            <div className="font-black text-sm">₹{totalCost.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* WhatsApp Share */}
        <button
          onClick={handleWhatsAppShare}
          disabled={sharing || droppedItems.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-40"
          style={{ background: '#25d366', color: '#fff' }}
          title="Share via WhatsApp"
        >
          {sharing
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Share2 className="w-4 h-4" />
          }
          <span className="hidden sm:inline">Share</span>
        </button>
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
