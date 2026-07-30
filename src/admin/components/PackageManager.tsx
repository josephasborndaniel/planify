import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PackagePlus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

export default function PackageManager() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});
  
  // Form State
  const [formData, setFormData] = useState({
    event_type: 'wedding',
    tier_id: 'standard',
    name: '',
    price: '',
    description: '',
    cover_image: '',
    image_2: '',
    image_3: '',
    description_2: '',
    description_3: ''
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPackages(data);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'cover_image' | 'image_2' | 'image_3') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingState(prev => ({ ...prev, [field]: true }));
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `packages/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);

    if (uploadError) {
      alert("Upload failed! Make sure you created a public bucket named 'images' in Supabase. Error: " + uploadError.message);
    } else {
      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, [field]: data.publicUrl }));
    }
    
    setUploadingState(prev => ({ ...prev, [field]: false }));
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cover_image) {
      alert('Please upload a cover image first.');
      return;
    }
    
    let error;
    if (editingId) {
      const { error: updateError } = await supabase.from('packages').update({
        ...formData,
        price: parseFloat(formData.price)
      }).eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('packages').insert([{
        ...formData,
        price: parseFloat(formData.price)
      }]);
      error = insertError;
    }

    if (!error) {
      setIsAdding(false);
      setEditingId(null);
      fetchPackages();
      setFormData({
        event_type: 'wedding', tier_id: 'standard', name: '', price: '', description: '', cover_image: '', image_2: '', image_3: '', description_2: '', description_3: ''
      });
    } else {
      alert("Error saving package: " + error.message);
    }
  };

  const handleEdit = (pkg: any) => {
    setFormData({
      event_type: pkg.event_type, tier_id: pkg.tier_id, name: pkg.name, price: pkg.price.toString(),
      description: pkg.description || '', cover_image: pkg.cover_image || '', image_2: pkg.image_2 || '', 
      image_3: pkg.image_3 || '', description_2: pkg.description_2 || '', description_3: pkg.description_3 || ''
    });
    setEditingId(pkg.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      const { error } = await supabase.from('packages').delete().eq('id', id);
      if (!error) fetchPackages();
    }
  };

  if (loading) return <div className="p-6">Loading packages...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Event Packages</h2>
          <p className="text-sm text-purple-300/60">Manage the packages shown on the client home screen.</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            if (isAdding) {
              setEditingId(null);
              setFormData({ event_type: 'wedding', tier_id: 'standard', name: '', price: '', description: '', cover_image: '', image_2: '', image_3: '', description_2: '', description_3: '' });
            }
          }}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl font-bold transition-all"
        >
          <PackagePlus className="w-5 h-5" />
          {isAdding ? 'Cancel' : 'Add New Package'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSavePackage} className="bg-[#231534] border border-purple-500/30 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Event Type</label>
            <select 
              value={formData.event_type} onChange={e => setFormData({...formData, event_type: e.target.value})}
              className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400"
            >
              <option value="wedding">Wedding</option>
              <option value="birthday">Birthday</option>
              <option value="baby">Baby Shower</option>
              <option value="housewarming">Housewarming</option>
              <option value="memorial">Memorial</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Tier</label>
            <select 
              value={formData.tier_id} onChange={e => setFormData({...formData, tier_id: e.target.value})}
              className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400"
            >
              <option value="budget">Starter (Budget)</option>
              <option value="standard">Popular (Standard)</option>
              <option value="premium">VIP (Premium)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Package Name</label>
            <input required type="text" placeholder="e.g. Elegant Basic"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Starting Price (₹)</label>
            <input required type="number" placeholder="50000"
              value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
              className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400" />
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 mt-2 border-t border-purple-500/20 pt-4">
            <div className="space-y-3 bg-[#1a1025]/50 p-4 rounded-xl border border-purple-500/10">
              <label className="block text-xs font-bold text-purple-300 uppercase">Cover Image *</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover_image')} disabled={uploadingState['cover_image']}
                className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-2 text-white focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-purple-500 file:text-white hover:file:bg-purple-600" />
              {uploadingState['cover_image'] && <p className="text-xs text-purple-400">Uploading...</p>}
              {formData.cover_image && <img src={formData.cover_image} alt="Preview" className="h-20 w-full object-cover rounded-xl" />}
              <textarea required rows={2} placeholder="Cover image description..."
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400 text-sm mt-2" />
            </div>
            
            <div className="space-y-3 bg-[#1a1025]/50 p-4 rounded-xl border border-purple-500/10">
              <label className="block text-xs font-bold text-purple-300 uppercase">Gallery Image 2</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image_2')} disabled={uploadingState['image_2']}
                className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-2 text-white focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-purple-500 file:text-white hover:file:bg-purple-600" />
              {uploadingState['image_2'] && <p className="text-xs text-purple-400">Uploading...</p>}
              {formData.image_2 && <img src={formData.image_2} alt="Preview" className="h-20 w-full object-cover rounded-xl" />}
              <textarea rows={2} placeholder="Image 2 description..."
                value={formData.description_2} onChange={e => setFormData({...formData, description_2: e.target.value})}
                className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400 text-sm mt-2" />
            </div>

            <div className="space-y-3 bg-[#1a1025]/50 p-4 rounded-xl border border-purple-500/10">
              <label className="block text-xs font-bold text-purple-300 uppercase">Gallery Image 3</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image_3')} disabled={uploadingState['image_3']}
                className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-2 text-white focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-purple-500 file:text-white hover:file:bg-purple-600" />
              {uploadingState['image_3'] && <p className="text-xs text-purple-400">Uploading...</p>}
              {formData.image_3 && <img src={formData.image_3} alt="Preview" className="h-20 w-full object-cover rounded-xl" />}
              <textarea rows={2} placeholder="Image 3 description..."
                value={formData.description_3} onChange={e => setFormData({...formData, description_3: e.target.value})}
                className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400 text-sm mt-2" />
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-4 border-t border-purple-500/20 pt-4">
            <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 rounded-xl font-bold text-purple-300 hover:bg-purple-500/10">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl font-bold bg-purple-500 hover:bg-purple-400 text-white">Save Package</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-[#231534] border border-purple-500/20 rounded-2xl overflow-hidden group">
            <div className="h-40 bg-black/50 relative overflow-hidden">
              {pkg.cover_image && <img src={pkg.cover_image} alt={pkg.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white">
                {pkg.event_type} • {pkg.tier_id}
              </div>
            </div>
            <div className="p-5 relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg leading-tight">{pkg.name}</h3>
                <span className="text-purple-400 font-black">₹{(pkg.price / 1000).toFixed(0)}k</span>
              </div>
              <p className="text-xs text-purple-300/60 line-clamp-2">{pkg.description}</p>
              
              <div className="mt-4 pt-4 border-t border-purple-500/10 flex justify-end gap-2">
                <button onClick={() => handleEdit(pkg)} className="p-2 rounded-lg text-purple-300 hover:bg-purple-500/20 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(pkg.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {packages.length === 0 && !isAdding && (
          <div className="col-span-full text-center py-12 border-2 border-dashed border-purple-500/20 rounded-2xl text-purple-300/60">
            No packages added yet. Click "Add New Package" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
