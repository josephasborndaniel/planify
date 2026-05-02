import { useRef, useState, useEffect } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { X, RotateCw, Maximize2, FlipHorizontal } from 'lucide-react';

interface DroppedItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string | any;
  x: number;
  y: number;
}

interface StageCanvasProps {
  droppedItems: DroppedItem[];
  onDrop: (item: any, position: { x: number; y: number }) => void;
  onRemoveItem: (id: string) => void;
  onMoveItem?: (id: string, x: number, y: number) => void;
  backgroundImage?: string;
  onSetBackground?: (imageUrl: string) => void;
}

function DraggableItem({ item, onRemove, onMove, canvasRef }: {
  item: DroppedItem;
  onRemove: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}) {
  const [isSelected, setIsSelected] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  
  // Transformation States
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentX, setCurrentX] = useState(item.x);
  const [currentY, setCurrentY] = useState(item.y);

  const [{ isDragging }, drag] = useDrag({
    type: 'PLACED_ITEM',
    item: { ...item, isPlaced: true, x: currentX, y: currentY },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Touch handling for moving items
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const itemStartX = currentX;
    const itemStartY = currentY;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!canvasRef.current) return;
      
      const moveTouch = moveEvent.touches[0];
      const deltaX = moveTouch.clientX - startX;
      const deltaY = moveTouch.clientY - startY;

      setCurrentX(itemStartX + deltaX);
      setCurrentY(itemStartY + deltaY);
    };

    const handleTouchEnd = () => {
      onMove(item.id, currentX, currentY);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  // Mouse handling for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const itemStartX = currentX;
    const itemStartY = currentY;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      setCurrentX(itemStartX + deltaX);
      setCurrentY(itemStartY + deltaY);
    };

    const onMouseUp = () => {
      onMove(item.id, currentX, currentY);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Seamless Rotation Logic (touch + mouse)
  const handleRotateStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startAngle = rotation;
    const startPos = 'touches' in e ? e.touches[0].clientX : e.clientX;

    const onMove = (moveEvent: TouchEvent | MouseEvent) => {
      const currentPos = moveEvent instanceof TouchEvent ? moveEvent.touches[0].clientX : (moveEvent as MouseEvent).clientX;
      const deltaX = currentPos - startPos;
      setRotation(startAngle + deltaX * 2);
    };

    const onEnd = () => {
      document.removeEventListener('mousemove', onMove as EventListener);
      document.removeEventListener('touchmove', onMove as EventListener);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
    };

    document.addEventListener('mousemove', onMove as EventListener);
    document.addEventListener('touchmove', onMove as EventListener, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
  };

  // Seamless Resize Logic (touch + mouse)
  const handleResizeStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startScale = scale;
    const startPos = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const onMove = (moveEvent: TouchEvent | MouseEvent) => {
      const currentPos = moveEvent instanceof TouchEvent ? moveEvent.touches[0].clientY : (moveEvent as MouseEvent).clientY;
      const deltaY = startPos - currentPos;
      const newScale = Math.max(0.3, startScale + deltaY * 0.01);
      setScale(newScale);
    };

    const onEnd = () => {
      document.removeEventListener('mousemove', onMove as EventListener);
      document.removeEventListener('touchmove', onMove as EventListener);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
    };

    document.addEventListener('mousemove', onMove as EventListener);
    document.addEventListener('touchmove', onMove as EventListener, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
  };

  return (
    <div
      ref={itemRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={(e) => {
        e.stopPropagation();
        setIsSelected(!isSelected);
      }}
      className={`absolute cursor-move touch-none select-none transition-shadow ${
        isSelected ? 'z-50' : 'z-10'
      }`}
      style={{
        left: `${currentX}px`,
        top: `${currentY}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${isFlipped ? -scale : scale}, ${scale})`,
        width: 'clamp(80px, 25vw, 140px)',
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
      }}
    >
      {/* Control Handles */}
      {isSelected && !isDragging && (
        <>
          <div 
            onMouseDown={handleRotateStart}
            onTouchStart={handleRotateStart}
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#FFFFFF] border-2 border-[#c09cde] rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-[70] shadow-md touch-none"
          >
            <RotateCw className="w-4 h-4 text-[#c09cde]" />
          </div>

          <div 
            onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}
            className="absolute top-1/2 -left-10 -translate-y-1/2 w-8 h-8 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center cursor-pointer z-[70] shadow-md"
          >
            <FlipHorizontal className="w-4 h-4 text-blue-500" />
          </div>

          <div 
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            className="absolute -bottom-4 -right-4 w-8 h-8 bg-[#c09cde] rounded-full flex items-center justify-center cursor-nwse-resize z-[70] shadow-lg border-2 border-white touch-none"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </>
      )}

      {/* Image Display */}
      <div className="relative flex items-center justify-center">
        <img
          src={item.image}
          alt={item.name}
          className={`w-full h-auto object-contain transition-all ${
            isSelected ? 'ring-2 ring-[#c09cde] ring-offset-2 rounded-sm' : ''
          }`}
          draggable={false}
        />
      </div>

      {/* Item Label */}
      {isSelected && scale > 0.6 && (
        <div className="mt-2 p-1 text-center bg-white/40 backdrop-blur-md rounded shadow-xl border border-[#c09cde] text-[#c09cde]">
          <div className="font-medium text-[10px] line-clamp-1">{item.name}</div>
          <div className="text-[#c09cde] text-[10px] font-bold">₹{item.price}</div>
        </div>
      )}

      {/* Remove Button */}
      {isSelected && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors z-[80]"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export function StageCanvas({ droppedItems, onDrop, onRemoveItem, onMoveItem, backgroundImage, onSetBackground }: StageCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: ['RESOURCE_ITEM', 'PLACED_ITEM'],
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = canvasRef.current?.getBoundingClientRect();

      if (offset && canvasRect) {
        const x = offset.x - canvasRect.left;
        const y = offset.y - canvasRect.top;

        if (item.isBackground && onSetBackground) {
          onSetBackground(item.image);
        } else if (item.isPlaced && onMoveItem) {
          onMoveItem(item.id, x, y);
        } else {
          onDrop(item, { x, y });
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-xs sm:text-sm text-[#c09cde] bg-white/40 backdrop-blur-md border border-[#c09cde] px-4 py-2 rounded-full">
        <span className="font-bold text-[#c09cde]">Stage Area:</span> 10m × 10m
      </div>

      <div
        ref={(node) => {
          canvasRef.current = node;
          drop(node);
        }}
        className={`relative w-full aspect-[4/3] md:h-[650px] rounded-3xl shadow-2xl transition-all overflow-hidden bg-[#ffffff] touch-none ${
          isOver ? 'ring-4 ring-[#c09cde]' : 'ring-1 ring-[#c09cde]'
        }`}
        style={{ maxWidth: '900px', margin: '0 auto', touchAction: 'none' }}
      >
        {backgroundImage ? (
          <img 
            src={backgroundImage}
            alt="background"
            className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none opacity-90"
            style={{ zIndex: 0 }}
          />
        ) : (
          <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: 'radial-gradient(#c09cde 1px, transparent 1px)', 
            backgroundSize: '30px 30px' 
          }} />
        )}

        <div className="absolute inset-0" style={{ zIndex: 2 }}>
          {droppedItems.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              onRemove={onRemoveItem}
              onMove={onMoveItem!}
              canvasRef={canvasRef}
            />
          ))}

          {droppedItems.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-[#c09cde] pointer-events-none">
              <div className="text-center">
                <Maximize2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-lg font-light">Stage is empty</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
