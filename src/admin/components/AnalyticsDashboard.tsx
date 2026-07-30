import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, ShoppingBag, IndianRupee, Clock } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const EVENT_COLORS: Record<string, string> = {
  wedding:      '#eab308',
  housewarming: '#3b82f6',
  birthday:     '#ec4899',
  corporate:    '#f59e0b',
  baby:         '#10b981',
  other:        '#a855f7',
};

function eventColor(type: string) {
  const t = (type || '').toLowerCase();
  for (const [key, color] of Object.entries(EVENT_COLORS)) {
    if (t.includes(key)) return color;
  }
  return EVENT_COLORS.other;
}

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Mini SVG bar chart ────────────────────────────────────────────────────────
function BarChart({ data, color = '#a855f7', label }: { data: number[]; color?: string; label: string }) {
  const max = Math.max(...data, 1);
  const W = 280, H = 80, barW = Math.floor(W / data.length) - 3;

  return (
    <div>
      <div style={{ color: 'rgba(216,180,254,0.5)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H + 18}`} style={{ overflow: 'visible' }}>
        {data.map((v, i) => {
          const barH = max > 0 ? Math.max((v / max) * H, v > 0 ? 4 : 0) : 0;
          const x = i * (barW + 3);
          const y = H - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} fill={color} rx={3} opacity={0.85} />
              {v > 0 && (
                <text x={x + barW / 2} y={y - 3} textAnchor="middle" fill={color} fontSize={8} fontWeight={700}>{v}</text>
              )}
              <text x={x + barW / 2} y={H + 14} textAnchor="middle" fill="rgba(216,180,254,0.4)" fontSize={8}>{MONTHS_SHORT[i]}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function DonutChart({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((s, d) => s + d.value, 0) || 1;
  const R = 52, cx = 65, cy = 65, strokeW = 18;
  const circumference = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <svg width={130} height={130}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(168,85,247,0.1)" strokeWidth={strokeW} />
        {slices.filter(s => s.value > 0).map((s, i) => {
          const dash = (s.value / total) * circumference;
          const gap  = circumference - dash;
          const el = (
            <circle
              key={i}
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={strokeW}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
            />
          );
          offset += dash;
          return el;
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#fff" fontSize={18} fontWeight={900}>{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(216,180,254,0.5)" fontSize={9} fontWeight={700}>TOTAL</text>
      </svg>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ color: 'rgba(216,180,254,0.7)', fontSize: 11, flex: 1 }}>{s.label}</span>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 12 }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mini revenue line sparkline ───────────────────────────────────────────────
function Sparkline({ data, color = '#a855f7' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const W = 280, H = 60;
  const pts = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * W;
    const y = H - (v / max) * H;
    return `${x},${y}`;
  });

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <polygon points={`0,${H} ${pts.join(' ')} ${W},${H}`} fill="url(#sparkGrad)" />
      {data.map((v, i) => {
        const x = (i / Math.max(data.length - 1, 1)) * W;
        const y = H - (v / max) * H;
        return v > 0 ? <circle key={i} cx={x} cy={y} r={3} fill={color} /> : null;
      })}
    </svg>
  );
}

// ── Main Analytics Component ──────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('quotes').select('*').order('created_at', { ascending: true });
    setQuotes(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const h = () => fetchData();
    window.addEventListener('orderStatusUpdated', h);
    return () => window.removeEventListener('orderStatusUpdated', h);
  }, [fetchData]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const total    = quotes.length;
  const accepted = quotes.filter(q => q.status === 'accepted').length;
  const pending  = quotes.filter(q => !q.status || q.status === 'pending').length;
  const rejected = quotes.filter(q => q.status === 'rejected').length;
  const revenue  = quotes.filter(q => q.status === 'accepted').reduce((s, q) => s + (q.total || 0), 0);

  // Monthly bookings (last 6 months)
  const now = new Date();
  const monthlyBookings = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return quotes.filter(q => {
      const qd = new Date(q.created_at);
      return qd.getMonth() === d.getMonth() && qd.getFullYear() === d.getFullYear();
    }).length;
  });
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return quotes.filter(q => {
      const qd = new Date(q.created_at);
      return qd.getMonth() === d.getMonth() && qd.getFullYear() === d.getFullYear() && q.status === 'accepted';
    }).reduce((s, q) => s + (q.total || 0), 0) / 1000; // in K
  });

  // Event type breakdown
  const typeMap: Record<string, number> = {};
  quotes.forEach(q => {
    const t = (q.event_type || q.quote_type || 'Other').split(' ')[0];
    const key = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    typeMap[key] = (typeMap[key] || 0) + 1;
  });
  const typeSlices = Object.entries(typeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value, color: eventColor(label) }));

  const formatRevenue = (v: number) =>
    v >= 100000 ? `₹${(v / 100000).toFixed(1)}L`
    : v >= 1000  ? `₹${(v / 1000).toFixed(0)}K`
    : `₹${v}`;

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ background: '#231534', borderRadius: 20, border: '1px solid rgba(168,85,247,0.15)', height: 120, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>

      {/* ── Card 1: Bookings bar chart ─────────────────────────────────────── */}
      <div style={{ background: '#231534', borderRadius: 20, border: '1px solid rgba(168,85,247,0.2)', padding: 20, gridColumn: 'span 1' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ color: 'rgba(216,180,254,0.5)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Bookings</div>
            <div style={{ color: '#fff', fontSize: 28, fontWeight: 900, lineHeight: 1.1, marginTop: 2 }}>{total}</div>
          </div>
          <div style={{ background: 'rgba(168,85,247,0.15)', borderRadius: 12, padding: 10 }}>
            <ShoppingBag size={20} color="#a855f7" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <span style={{ background: 'rgba(234,179,8,0.15)', color: '#fde047', fontSize: 10, fontWeight: 800, borderRadius: 6, padding: '2px 8px' }}>✓ {accepted} accepted</span>
          <span style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: 10, fontWeight: 800, borderRadius: 6, padding: '2px 8px' }}>⏳ {pending} pending</span>
        </div>
        <BarChart data={monthlyBookings} color="#a855f7" label="Last 6 months" />
      </div>

      {/* ── Card 2: Revenue sparkline ──────────────────────────────────────── */}
      <div style={{ background: '#231534', borderRadius: 20, border: '1px solid rgba(168,85,247,0.2)', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ color: 'rgba(216,180,254,0.5)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Accepted Revenue</div>
            <div style={{ color: '#fff', fontSize: 28, fontWeight: 900, lineHeight: 1.1, marginTop: 2 }}>{formatRevenue(revenue)}</div>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.15)', borderRadius: 12, padding: 10 }}>
            <IndianRupee size={20} color="#10b981" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: 10, fontWeight: 800, borderRadius: 6, padding: '2px 8px' }}>
            <TrendingUp size={9} style={{ display: 'inline', marginRight: 3 }} />
            From {accepted} accepted orders
          </span>
        </div>
        <div style={{ color: 'rgba(216,180,254,0.5)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Revenue trend (₹K)</div>
        <Sparkline data={monthlyRevenue} color="#10b981" />
      </div>

      {/* ── Card 3: Event type donut ───────────────────────────────────────── */}
      <div style={{ background: '#231534', borderRadius: 20, border: '1px solid rgba(168,85,247,0.2)', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ color: 'rgba(216,180,254,0.5)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Event Types</div>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 800, marginTop: 3 }}>Booking breakdown</div>
          </div>
          <div style={{ background: 'rgba(234,179,8,0.15)', borderRadius: 12, padding: 10 }}>
            <Clock size={20} color="#eab308" />
          </div>
        </div>
        {typeSlices.length > 0 ? (
          <DonutChart slices={typeSlices} />
        ) : (
          <div style={{ textAlign: 'center', color: 'rgba(216,180,254,0.4)', fontSize: 12, padding: '20px 0' }}>
            No bookings yet
          </div>
        )}
        {rejected > 0 && (
          <div style={{ marginTop: 10, padding: '6px 10px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.15)' }}>
            <span style={{ color: '#f87171', fontSize: 10, fontWeight: 700 }}>🚫 {rejected} rejected / declined</span>
          </div>
        )}
      </div>
    </div>
  );
}
