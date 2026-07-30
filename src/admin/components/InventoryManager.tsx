import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

export default function InventoryManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Decor',
    base_price: '',
    image_url: '',
    cost_type: 'unit_based',
    description: ''
  });

  const categories = ['Decor', 'Infrastructure', 'Lighting', 'Stage Background', 'Starters', 'Main Course', 'Breads', 'Desserts', 'Hot Beverages', 'Cold Drinks & Juices'];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('items').insert([{
      name: formData.name,
      category: formData.category,
      base_price: parseFloat(formData.base_price || '0'),
      image_url: formData.image_url,
      cost_type: formData.cost_type,
      metadata: { description: formData.description }
    }]);

    if (!error) {
      setIsAdding(false);
      fetchItems();
      setFormData({ name: '', category: 'Decor', base_price: '', image_url: '', cost_type: 'unit_based', description: '' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this item? It will be removed from the Design Studio & Plate Architect.')) {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (!error) fetchItems();
    }
  };

  if (loading) return <div className="p-6">Loading inventory...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">App Content & Inventory</h2>
          <p className="text-sm text-purple-300/60">Manage items for the Design Studio and Plate Architect.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {isAdding ? 'Cancel' : 'Add New Item'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-[#231534] border border-purple-500/30 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Item Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Category</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Price / Rate</label>
            <input required type="number" value={formData.base_price} onChange={e => setFormData({...formData, base_price: e.target.value})}
              className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Image URL</label>
            <input required type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})}
              className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Details / Description</label>
            <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Optional item details..."
              className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400 resize-none" />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="submit" className="px-5 py-2.5 rounded-xl font-bold bg-purple-500 hover:bg-purple-400 text-white">Save Item</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-[#231534] border border-purple-500/20 rounded-2xl overflow-hidden p-3 relative group">
            <div className="aspect-square bg-[#1a1025] rounded-xl overflow-hidden mb-3">
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] font-black uppercase text-purple-400">{item.category}</span>
            <h3 className="font-bold text-sm leading-tight truncate">{item.name}</h3>
            <p className="text-xs text-purple-300/60 mt-1 flex justify-between">
              <span>₹{item.base_price}</span>
              {item.metadata?.description && <span className="text-[10px] bg-purple-500/20 px-1.5 rounded">Has Details</span>}
            </p>
            
            <button onClick={() => handleDelete(item.id)} className="absolute top-4 right-4 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
