import { useEffect, useState } from 'react';
import { supabase, type Quote } from '../../lib/supabase';
import { ShoppingBag, FileText, ChevronDown, CheckCircle, Clock } from 'lucide-react';

export default function QuotesManager() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setQuotes(data as any[]);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('quotes')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('❌ Status update FAILED:', error.message, error);
      alert(`Failed to update status: ${error.message}\n\nPlease run the missing RLS policy in Supabase SQL Editor:\nCREATE POLICY "public_update_quotes" ON quotes FOR UPDATE USING (true) WITH CHECK (true);`);
      return;
    }

    console.log('✅ Status updated to', newStatus, 'for id', id);
    setQuotes(quotes.map(q => q.id === id ? { ...q, status: newStatus } : q));
    // Dispatch event so calendar re-fetches
    window.dispatchEvent(new Event('orderStatusUpdated'));
  };


  if (loading) {
    return <div className="animate-pulse flex space-x-4 p-6">Loading quotes...</div>;
  }

  return (
    <div className="bg-[#231534] rounded-2xl border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Recent Quotes & Orders</h3>
        <button 
          onClick={fetchQuotes}
          className="text-sm text-purple-400 font-semibold hover:text-purple-300 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      {quotes.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-purple-500/20 rounded-xl">
          <ShoppingBag className="w-10 h-10 text-purple-300/30 mx-auto mb-3" />
          <p className="text-sm text-purple-300/60 font-medium">No recent orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-purple-500/20 text-xs uppercase tracking-wider text-purple-300/60">
                <th className="pb-3 px-4 font-semibold">Client Name</th>
                <th className="pb-3 px-4 font-semibold">Event Date</th>
                <th className="pb-3 px-4 font-semibold">Type</th>
                <th className="pb-3 px-4 font-semibold">Guests</th>
                <th className="pb-3 px-4 font-semibold">Total Amount</th>
                <th className="pb-3 px-4 font-semibold">Booked On</th>
                <th className="pb-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-bold text-white">
                        {quote.client_name || 'Guest'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-emerald-400">
                    {quote.event_date ? new Date(quote.event_date).toLocaleDateString() : 'TBD'}
                  </td>
                  <td className="py-4 px-4 text-sm text-purple-200 capitalize">
                    {quote.event_type || quote.quote_type.replace('_', ' ')}
                  </td>
                  <td className="py-4 px-4 text-sm text-purple-200">
                    {quote.guest_count || '-'}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-white">
                    ₹{quote.total?.toLocaleString('en-IN') || '0'}
                  </td>
                  <td className="py-4 px-4 text-xs text-purple-300/60">
                    {new Date(quote.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    {(!quote.status || quote.status === 'pending') ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateStatus(quote.id, 'accepted')}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => updateStatus(quote.id, 'rejected')}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all active:scale-95"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                        quote.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {quote.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
