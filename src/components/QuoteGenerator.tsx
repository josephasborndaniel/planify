import { useState } from 'react';
import { FileText, Download, Package, Utensils, Ruler, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useTheme } from '../app/context/ThemeContext';
import { computeGST } from '../lib/pricingEngine';
import { generateQuotePDF } from '../lib/pdfExport';
import { supabase, type LineItem } from '../lib/supabase';

type QuoteType = 'package' | 'custom_stage' | 'catering';

export function QuoteGenerator() {
  const { isDark } = useTheme();
  const [quoteType, setQuoteType] = useState<QuoteType>('package');
  const [eventType, setEventType] = useState('Wedding');
  const [guestCount, setGuestCount] = useState(100);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', qty: 1, price: 0, costType: 'unit_based' as 'unit_based' | 'fixed_rate' });
  const [dimensions, setDimensions] = useState({ length: 10, width: 8 });
  const [saving, setSaving] = useState(false);

  const bg = isDark ? '#1a1025' : '#f0f7ff';
  const card = isDark ? '#231534' : '#ddeeff';
  const border = isDark ? 'rgba(192,156,222,0.2)' : 'rgba(42,125,212,0.18)';
  const text = isDark ? '#f0e6ff' : '#0d2d52';
  const textMuted = isDark ? 'rgba(240,230,255,0.6)' : '#3a6898';
  const accent = isDark ? '#c09cde' : '#2a7dd4';
  const muted = isDark ? '#2d1e45' : '#c8e4ff';

  const addItem = () => {
    if (!newItem.name || newItem.price <= 0) return;
    const amount = newItem.costType === 'fixed_rate' ? newItem.price : newItem.price * newItem.qty;
    setLineItems(prev => [...prev, {
      name: newItem.name,
      quantity: newItem.qty,
      unit_price: newItem.price,
      amount,
      cost_type: newItem.costType,
    }]);
    setNewItem({ name: '', qty: 1, price: 0, costType: 'unit_based' });
  };

  const removeItem = (idx: number) => setLineItems(prev => prev.filter((_, i) => i !== idx));

  // For custom_stage — calculate from dimensions
  const stageArea = dimensions.length * dimensions.width;
  const STAGE_RATE_PER_SQMT = 2500;

  const getLineItems = (): LineItem[] => {
    if (quoteType === 'custom_stage') {
      return [{
        name: `Stage Platform (${dimensions.length}m × ${dimensions.width}m = ${stageArea} sq.m)`,
        quantity: stageArea,
        unit_price: STAGE_RATE_PER_SQMT,
        amount: stageArea * STAGE_RATE_PER_SQMT,
        cost_type: 'unit_based',
      }, ...lineItems];
    }
    return lineItems;
  };

  const computedItems = getLineItems();
  const subtotal = computedItems.reduce((s, i) => s + i.amount, 0);
  const { gst, total } = computeGST(subtotal);

  const handleExport = async () => {
    setSaving(true);
    const { data } = await supabase.from('quotes').insert({
      quote_type: quoteType,
      event_type: eventType,
      guest_count: guestCount,
      line_items: computedItems,
      subtotal, gst, total,
    }).select('id').single();

    generateQuotePDF({
      quoteType, eventType, guestCount,
      lineItems: computedItems,
      subtotal, gst, total,
      dimensions: quoteType === 'custom_stage' ? dimensions : undefined,
      quoteId: data?.id,
    });
    setSaving(false);
  };

  const inputClass = "w-full px-3 py-2 rounded-xl text-sm outline-none transition-all";

  const QUOTE_TYPES = [
    { id: 'package', label: 'Package', icon: <Package className="w-4 h-4" /> },
    { id: 'custom_stage', label: 'Custom Stage', icon: <Ruler className="w-4 h-4" /> },
    { id: 'catering', label: 'Catering', icon: <Utensils className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="min-h-screen pb-28" style={{ background: bg, color: text }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5" style={{ color: accent }} />
          <h1 className="text-xl font-black" style={{ color: text }}>Quote Generator</h1>
        </div>
        <p className="text-xs" style={{ color: textMuted }}>Build itemized quotes with GST & PDF export</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Quote Type Selector */}
        <div className="flex gap-2">
          {QUOTE_TYPES.map(q => (
            <button
              key={q.id}
              onClick={() => setQuoteType(q.id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl text-[11px] font-bold transition-all active:scale-95"
              style={{
                background: quoteType === q.id ? accent : muted,
                color: quoteType === q.id ? '#fff' : text,
              }}
            >
              {q.icon}
              {q.label}
            </button>
          ))}
        </div>

        {/* Event Info */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: card, border: `1px solid ${border}` }}>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide block mb-1" style={{ color: textMuted }}>Event Type</label>
            <select
              value={eventType}
              onChange={e => setEventType(e.target.value)}
              className={inputClass}
              style={{ background: muted, color: text, border: `1px solid ${border}` }}
            >
              {['Wedding', 'Birthday', 'Baby Shower', 'Housewarming', 'Corporate', 'Memorial'].map(e => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </div>

          {quoteType !== 'custom_stage' && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide block mb-1" style={{ color: textMuted }}>
                Guest Count: {guestCount}
              </label>
              <input
                type="range" min="10" max="2000" step="10" value={guestCount}
                onChange={e => setGuestCount(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: accent }}
              />
            </div>
          )}

          {quoteType === 'custom_stage' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide block mb-1" style={{ color: textMuted }}>Length (m)</label>
                <input
                  type="number" min="1" value={dimensions.length}
                  onChange={e => setDimensions(d => ({ ...d, length: Number(e.target.value) }))}
                  className={inputClass}
                  style={{ background: muted, color: text, border: `1px solid ${border}` }}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide block mb-1" style={{ color: textMuted }}>Width (m)</label>
                <input
                  type="number" min="1" value={dimensions.width}
                  onChange={e => setDimensions(d => ({ ...d, width: Number(e.target.value) }))}
                  className={inputClass}
                  style={{ background: muted, color: text, border: `1px solid ${border}` }}
                />
              </div>
              <div className="col-span-2 rounded-xl px-3 py-2 text-center" style={{ background: muted }}>
                <p className="text-xs font-semibold" style={{ color: textMuted }}>Area: {stageArea} sq.m × ₹{STAGE_RATE_PER_SQMT.toLocaleString()} = <strong style={{ color: text }}>₹{(stageArea * STAGE_RATE_PER_SQMT).toLocaleString('en-IN')}</strong></p>
              </div>
            </div>
          )}
        </div>

        {/* Add Line Item */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: card, border: `1px solid ${border}` }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: textMuted }}>Add Item</p>
          <input
            placeholder="Item name (e.g. Flower Arrangement)"
            value={newItem.name}
            onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))}
            className={inputClass}
            style={{ background: muted, color: text, border: `1px solid ${border}` }}
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px]" style={{ color: textMuted }}>Qty</label>
              <input type="number" min="1" value={newItem.qty}
                onChange={e => setNewItem(n => ({ ...n, qty: Number(e.target.value) }))}
                className={inputClass}
                style={{ background: muted, color: text, border: `1px solid ${border}` }}
              />
            </div>
            <div>
              <label className="text-[10px]" style={{ color: textMuted }}>Unit Price ₹</label>
              <input type="number" min="0" value={newItem.price}
                onChange={e => setNewItem(n => ({ ...n, price: Number(e.target.value) }))}
                className={inputClass}
                style={{ background: muted, color: text, border: `1px solid ${border}` }}
              />
            </div>
            <div>
              <label className="text-[10px]" style={{ color: textMuted }}>Type</label>
              <select value={newItem.costType}
                onChange={e => setNewItem(n => ({ ...n, costType: e.target.value as any }))}
                className={inputClass}
                style={{ background: muted, color: text, border: `1px solid ${border}` }}
              >
                <option value="unit_based">Per Unit</option>
                <option value="fixed_rate">Fixed</option>
              </select>
            </div>
          </div>
          <button
            onClick={addItem}
            className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: accent, color: '#fff' }}
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        {/* Line Items List */}
        {computedItems.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
            <div className="px-4 py-2.5" style={{ background: muted }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: textMuted }}>Items ({computedItems.length})</p>
            </div>
            {computedItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3"
                style={{ background: card, borderBottom: `1px solid ${border}` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: text }}>{item.name}</p>
                  <p className="text-[10px]" style={{ color: textMuted }}>
                    {item.cost_type === 'fixed_rate' ? 'Fixed' : `${item.quantity} × ₹${item.unit_price.toLocaleString('en-IN')}`}
                  </p>
                </div>
                <span className="text-sm font-black" style={{ color: accent }}>₹{item.amount.toLocaleString('en-IN')}</span>
                {i >= (quoteType === 'custom_stage' ? 1 : 0) && (
                  <button onClick={() => removeItem(i - (quoteType === 'custom_stage' ? 1 : 0))}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            ))}

            {/* Totals */}
            <div className="px-4 py-3 space-y-1.5" style={{ background: isDark ? '#1a1025' : '#f0f7ff' }}>
              <div className="flex justify-between text-xs" style={{ color: textMuted }}>
                <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs" style={{ color: textMuted }}>
                <span>GST (18%)</span><span>₹{gst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-black text-base pt-1" style={{ color: text, borderTop: `2px solid ${accent}` }}>
                <span>Total</span><span style={{ color: accent }}>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Export */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 py-4 z-20"
        style={{
          background: isDark ? 'rgba(26,16,37,0.97)' : 'rgba(240,247,255,0.97)',
          backdropFilter: 'blur(12px)',
          borderTop: `1px solid ${border}`,
        }}
      >
        <button
          onClick={handleExport}
          disabled={computedItems.length === 0 || saving}
          className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all active:scale-95 disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${accent}, ${isDark ? '#a07ac8' : '#5aa0e0'})`, color: '#fff' }}
        >
          <Download className="w-4 h-4" />
          {saving ? 'Saving...' : 'Export PDF Quote'}
        </button>
      </div>
    </div>
  );
}
