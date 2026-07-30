import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { ChevronLeft, ChevronRight, X, CheckCircle, Clock, MapPin, Image as ImageIcon, Calendar as CalIcon, ChevronDown, ChevronUp } from 'lucide-react';

// ── Color map — 100% inline styles, purge-safe ───────────────────────────────
function getColor(type: string) {
  const t = (type || '').toLowerCase();
  if (t.includes('wedding'))      return { bg: '#3d3100', border: '#eab308', dot: '#fbbf24', text: '#fde047' };
  if (t.includes('housewarming')) return { bg: '#0c2340', border: '#3b82f6', dot: '#60a5fa', text: '#93c5fd' };
  if (t.includes('birthday'))     return { bg: '#3b0a24', border: '#ec4899', dot: '#f472b6', text: '#f9a8d4' };
  if (t.includes('corporate'))    return { bg: '#3b2300', border: '#f59e0b', dot: '#fbbf24', text: '#fcd34d' };
  if (t.includes('baby'))         return { bg: '#052e1e', border: '#10b981', dot: '#34d399', text: '#6ee7b7' };
  return                                 { bg: '#2a1040', border: '#a855f7', dot: '#c084fc', text: '#d8b4fe' };
}

function formatDate(dateStr: string) {
  const d = new Date(String(dateStr).slice(0, 10) + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ── Single Event Card inside modal ────────────────────────────────────────────
function EventCard({ order, defaultOpen }: { order: any; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const c = getColor(order.event_type || order.quote_type || '');

  return (
    <div style={{ borderRadius: 14, border: `2px solid ${c.border}`, marginBottom: 10, overflow: 'hidden' }}>
      {/* Card header — always visible */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', background: c.bg, border: 'none', cursor: 'pointer', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div style={{ textAlign: 'left' }}>
          <div style={{ color: c.text, fontWeight: 900, fontSize: 14 }}>{order.client_name || 'Guest Booking'}</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {order.event_type || order.quote_type?.replace('_', ' ')}
            {order.guest_count ? ` • ${order.guest_count} Guests` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>₹{order.total?.toLocaleString('en-IN') || '0'}</span>
          {open ? <ChevronUp size={14} color={c.text} /> : <ChevronDown size={14} color={c.text} />}
        </div>
      </button>

      {/* Expandable details */}
      {open && (
        <div style={{ background: '#1a1025', padding: 14 }}>
          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#c084fc', fontSize: 12, fontWeight: 600 }}>
            <CalIcon size={13} />
            {order.event_date ? formatDate(order.event_date) : 'Date not set'}
          </div>

          {/* To-Do checklist */}
          <div style={{ background: '#231534', borderRadius: 10, padding: 10, marginBottom: 10, border: '1px solid rgba(168,85,247,0.1)' }}>
            <div style={{ color: '#a855f7', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Daily Schedule / To-Do</div>
            {[
              { icon: <CheckCircle size={12} color="#34d399" />, text: `Prepare ${order.line_items?.length || 0} item(s) for venue setup` },
              { icon: <Clock size={12} color="#fbbf24" />,       text: 'Confirm logistics & arrival time with client' },
              { icon: <MapPin size={12} color="#60a5fa" />,      text: 'Dispatch team to location' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5 }}>
                {row.icon}
                <span style={{ color: '#d8b4fe', fontSize: 11 }}>{row.text}</span>
              </div>
            ))}
          </div>

          {/* Custom stage note */}
          {order.quote_type === 'custom_stage' && (
            <div style={{ background: 'rgba(168,85,247,0.1)', borderRadius: 10, padding: 10, marginBottom: 10, border: '1px solid rgba(168,85,247,0.2)', textAlign: 'center' }}>
              <ImageIcon size={16} color="#a855f7" style={{ margin: '0 auto 4px' }} />
              <p style={{ color: '#d8b4fe', fontSize: 11, margin: 0 }}>Custom Stage Design — check Design Studio.</p>
            </div>
          )}

          {/* Line items */}
          {order.line_items?.length > 0 && (
            <div style={{ background: '#231534', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(168,85,247,0.1)' }}>
              <div style={{ background: '#2a1a3a', padding: '6px 12px', borderBottom: '1px solid rgba(168,85,247,0.1)' }}>
                <span style={{ color: '#a855f7', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Order Items ({order.line_items.length})
                </span>
              </div>
              <div style={{ padding: '8px 12px' }}>
                {order.line_items.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ color: '#d8b4fe', fontSize: 11 }}>×{item.qty} {item.name}</span>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 11 }}>₹{(item.qty * item.unitPrice).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Calendar ─────────────────────────────────────────────────────────────
export default function OrderCalendar() {
  const [orders, setOrders]           = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{ day: number; orders: any[] } | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('status', 'accepted');
    if (error) console.error('Calendar fetch error:', error);
    console.log('Accepted orders:', data);
    setOrders(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    const handler = () => fetchOrders();
    window.addEventListener('orderStatusUpdated', handler);
    return () => window.removeEventListener('orderStatusUpdated', handler);
  }, [fetchOrders]);

  const year         = currentDate.getFullYear();
  const month        = currentDate.getMonth();
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const ordersForDay = (day: number) =>
    orders.filter(o => {
      if (!o.event_date) return false;
      const raw = String(o.event_date).slice(0, 10);
      const [y, m, d] = raw.split('-').map(Number);
      return d === day && (m - 1) === month && y === year;
    });

  const today = new Date();
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const handleDayClick = (day: number, dayOrders: any[]) => {
    if (dayOrders.length === 0) return;
    setSelectedDay({ day, orders: dayOrders });
  };

  return (
    <div style={{ background: '#231534', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalIcon size={18} color="#a855f7" />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>Event Calendar</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#1a1025', borderRadius: 12, padding: '2px 6px', border: '1px solid rgba(168,85,247,0.2)' }}>
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a855f7', padding: 4 }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, width: 120, textAlign: 'center' }}>{MONTHS[month]} {year}</span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a855f7', padding: 4 }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', marginBottom: 10 }}>
        {[
          { label: 'Wedding',      color: '#fbbf24' },
          { label: 'Housewarming', color: '#60a5fa' },
          { label: 'Birthday',     color: '#f472b6' },
          { label: 'Corporate',    color: '#fbbf24' },
          { label: 'Baby Shower',  color: '#34d399' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
            <span style={{ color: 'rgba(216,180,254,0.6)', fontSize: 9, fontWeight: 700 }}>{l.label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', fontSize: 13 }}>Loading…</div>
      ) : (
        <>
          {/* Weekday labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 3 }}>
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 900, color: 'rgba(216,180,254,0.4)', padding: '1px 0' }}>{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, flex: 1 }}>
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`e-${i}`} style={{ borderRadius: 8, background: 'rgba(26,16,37,0.3)', minHeight: 42 }} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day       = i + 1;
              const dayOrders = ordersForDay(day);
              const hasEvent  = dayOrders.length > 0;
              const tod       = isToday(day);
              // Use the first event's color for the box, but show count badge for multiples
              const c         = hasEvent ? getColor(dayOrders[0].event_type || dayOrders[0].quote_type || '') : null;

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day, dayOrders)}
                  style={{
                    borderRadius: 8,
                    border: `2px solid ${hasEvent ? c!.border : tod ? '#a855f7' : 'rgba(168,85,247,0.08)'}`,
                    background: hasEvent ? c!.bg : tod ? 'rgba(168,85,247,0.08)' : 'rgba(26,16,37,0.5)',
                    cursor: hasEvent ? 'pointer' : 'default',
                    minHeight: 42,
                    padding: '3px 3px 2px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.12s, box-shadow 0.12s',
                    boxShadow: hasEvent ? `0 0 12px ${c!.border}55` : undefined,
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (hasEvent) (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                  title={hasEvent ? dayOrders.map(o => `${o.event_type || 'Event'}: ${o.client_name || 'Guest'}`).join('\n') : undefined}
                >
                  <span style={{ fontSize: 10, fontWeight: 900, color: hasEvent ? c!.text : tod ? '#c084fc' : 'rgba(216,180,254,0.4)', lineHeight: 1.2 }}>
                    {day}
                  </span>

                  {hasEvent && (
                    <span style={{ fontSize: 8, fontWeight: 800, color: c!.text, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                      {dayOrders[0].event_type || dayOrders[0].quote_type || 'Event'}
                    </span>
                  )}

                  {/* Badge for multiple events */}
                  {dayOrders.length > 1 && (
                    <div style={{
                      position: 'absolute', top: 2, right: 2,
                      background: c!.border, color: '#000',
                      borderRadius: '50%', width: 14, height: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, fontWeight: 900,
                    }}>
                      {dayOrders.length}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Multi-event day modal ────────────────────────────────────────────── */}
      {selectedDay && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(26,16,37,0.92)',
          backdropFilter: 'blur(6px)',
          borderRadius: 20, zIndex: 20,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: 16, overflowY: 'auto',
        }}>
          <div style={{ background: '#231534', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 20, width: '100%', maxWidth: 380, boxShadow: '0 0 40px rgba(168,85,247,0.3)' }}>

            {/* Modal header */}
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(168,85,247,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>
                  {MONTHS[month]} {selectedDay.day}, {year}
                </div>
                <div style={{ color: 'rgba(216,180,254,0.6)', fontSize: 11, marginTop: 2 }}>
                  {selectedDay.orders.length} event{selectedDay.orders.length > 1 ? 's' : ''} scheduled
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#fff', padding: 6 }}
              >
                <X size={16} />
              </button>
            </div>

            {/* All events — each expandable */}
            <div style={{ padding: 14 }}>
              {selectedDay.orders.map((order, idx) => (
                <EventCard key={order.id || idx} order={order} defaultOpen={selectedDay.orders.length === 1} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
