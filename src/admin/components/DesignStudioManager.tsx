import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Brush, Upload, ImagePlus, Pencil, Check, X } from 'lucide-react';

export default function DesignStudioManager() {
  const [items, setItems]               = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [isAdding, setIsAdding]         = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [filterCat, setFilterCat]       = useState('All');
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress]   = useState('');
  const [editingImgId, setEditingImgId]   = useState<string | null>(null);
  const [editingImgFile, setEditingImgFile] = useState<File | null>(null);
  const [editingItem, setEditingItem]       = useState<any | null>(null); // inline field edit
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['Decor', 'Infrastructure', 'Lighting', 'Stage Background'];

  const [formData, setFormData] = useState({
    name: '', category: categories[0], base_price: '', image_url: '', description: ''
  });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('items').select('*')
      .in('category', categories)
      .order('created_at', { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  // ── Core upload helper ──────────────────────────────────────────────────────
  const uploadImageFile = async (file: File, folder = 'studio'): Promise<string | null> => {
    const ext  = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('images').upload(path, file, { upsert: true });
    if (error) { alert('Upload failed: ' + error.message); return null; }
    const { data } = supabase.storage.from('images').getPublicUrl(path);
    return data.publicUrl;
  };

  // ── Form image upload ───────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploadingImage(true);
    const url = await uploadImageFile(e.target.files[0]);
    if (url) setFormData(f => ({ ...f, image_url: url }));
    setUploadingImage(false);
  };

  // ── Save new element ────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('items').insert([{
      name:       formData.name,
      category:   formData.category,
      base_price: parseFloat(formData.base_price || '0'),
      image_url:  formData.image_url,
      cost_type:  'unit_based',
      metadata:   { description: formData.description }
    }]);
    if (!error) {
      setIsAdding(false);
      fetchItems();
      setFormData({ name: '', category: categories[0], base_price: '', image_url: '', description: '' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this design element?')) {
      await supabase.from('items').delete().eq('id', id);
      fetchItems();
    }
  };

  // ── Update image on existing item ───────────────────────────────────────────
  const handleUpdateImage = async (item: any) => {
    if (!editingImgFile) return;
    setUploadingImage(true);
    const url = await uploadImageFile(editingImgFile);
    if (url) {
      await supabase.from('items').update({ image_url: url }).eq('id', item.id);
      fetchItems();
      setEditingImgId(null);
      setEditingImgFile(null);
    }
    setUploadingImage(false);
  };

  // ── Save edited fields on existing item ────────────────────────────────────
  const handleEditSave = async () => {
    if (!editingItem) return;
    const { error } = await supabase.from('items').update({
      name:       editingItem.name,
      category:   editingItem.category,
      base_price: parseFloat(editingItem.base_price || '0'),
      metadata:   { description: editingItem.description },
    }).eq('id', editingItem.id);
    if (!error) { fetchItems(); setEditingItem(null); }
    else alert('Save failed: ' + error.message);
  };

  // ── Bulk upload multiple images → auto-create entries ───────────────────────
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBulkUploading(true);
    let done = 0;
    for (const file of files) {
      setBulkProgress(`Uploading ${file.name} (${done + 1}/${files.length})…`);
      const url = await uploadImageFile(file);
      if (url) {
        const name = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        await supabase.from('items').insert([{
          name,
          category:   categories[0], // default Decor — admin can edit
          base_price: 0,
          image_url:  url,
          cost_type:  'unit_based',
          metadata:   {}
        }]);
      }
      done++;
    }
    setBulkUploading(false);
    setBulkProgress('');
    fetchItems();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) return <div className="p-6 text-purple-300 animate-pulse">Loading studio elements…</div>;

  const allCategories = ['All', ...categories];
  const filtered = filterCat === 'All' ? items : items.filter(i => i.category === filterCat);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brush className="w-6 h-6 text-purple-400" />
            Design Studio Resources
          </h2>
          <p className="text-sm text-purple-300/60 mt-1">
            Manage decor, lighting & stage backgrounds for the drag-and-drop canvas. ({items.length} elements)
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Bulk upload */}
          <label className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm cursor-pointer transition-all
            ${bulkUploading ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'}`}>
            <Upload className="w-4 h-4" />
            {bulkUploading ? bulkProgress : 'Bulk Upload Images'}
            <input
              ref={fileInputRef}
              type="file" accept="image/*" multiple
              onChange={handleBulkUpload}
              disabled={bulkUploading}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {isAdding ? 'Cancel' : 'Add New Element'}
          </button>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300/80 flex items-start gap-2">
        <ImagePlus className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          <strong>Tip:</strong> Use <strong>transparent PNG</strong> files for Decor and Infrastructure elements — they layer cleanly on the stage canvas.
          Stage Backgrounds work best as full JPG/WEBP images. Use <strong>Bulk Upload</strong> to import multiple files at once.
        </span>
      </div>

      {/* ── Add element form ── */}
      {isAdding && (
        <form onSubmit={handleSave} className="bg-[#231534] border border-purple-500/30 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Element Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Arch Backdrop"
              className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Studio Category *</label>
            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Rental Price (₹) *</label>
            <input required type="number" min="0" value={formData.base_price} onChange={e => setFormData({ ...formData, base_price: e.target.value })}
              placeholder="1500"
              className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Element Image (PNG preferred)</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage}
              className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-2 text-white focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-purple-500 file:text-white hover:file:bg-purple-600" />
            {uploadingImage && <p className="text-xs text-purple-400 mt-1 animate-pulse">Uploading…</p>}
            {formData.image_url && (
              <img src={formData.image_url} alt="Preview"
                className="mt-2 h-16 w-16 object-contain rounded-xl border border-purple-500/30 bg-[#1a1025]" />
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Specs & Details (optional)</label>
            <textarea rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add dimensions, material, color options…"
              className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400 resize-none" />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setIsAdding(false)}
              className="px-5 py-2.5 rounded-xl font-bold border border-purple-500/30 text-purple-300 hover:bg-purple-500/10">Cancel</button>
            <button type="submit" disabled={uploadingImage}
              className="px-5 py-2.5 rounded-xl font-bold bg-purple-500 hover:bg-purple-400 text-white disabled:opacity-50">
              {uploadingImage ? 'Uploading…' : '✓ Save Element'}
            </button>
          </div>
        </form>
      )}

      {/* ── Category filter ── */}
      <div className="flex gap-2 flex-wrap">
        {allCategories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterCat === cat
              ? 'bg-purple-500 text-white'
              : 'bg-[#231534] text-purple-300/60 border border-purple-500/20 hover:border-purple-500/50'}`}>
            {cat} ({cat === 'All' ? items.length : items.filter(i => i.category === cat).length})
          </button>
        ))}
      </div>

      {/* ── Elements grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-purple-500/20 rounded-2xl">
          <Brush className="w-12 h-12 text-purple-300/20 mx-auto mb-3" />
          <p className="text-purple-300/50 font-medium">No elements in this category yet.</p>
          <p className="text-xs text-purple-300/30 mt-1">Click "Add New Element" or "Bulk Upload Images" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-[#231534] border border-purple-500/20 rounded-2xl overflow-hidden relative group hover:border-purple-500/50 transition-all">

              {/* Image area with edit overlay */}
              <div className="aspect-square bg-[#1a1025] overflow-hidden relative flex items-center justify-center p-2">
                {item.image_url
                  ? <img src={item.image_url} alt={item.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                  : <Brush className="w-10 h-10 text-purple-500/30" />
                }

                {editingImgId === item.id ? (
                  <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 p-2">
                    <input type="file" accept="image/*"
                      onChange={e => setEditingImgFile(e.target.files?.[0] || null)}
                      className="text-[10px] text-white w-full file:bg-purple-500 file:text-white file:border-0 file:rounded-lg file:px-2 file:py-1 file:text-[10px] file:font-bold" />
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateImage(item)} disabled={!editingImgFile || uploadingImage}
                        className="p-1.5 bg-emerald-500 text-white rounded-lg disabled:opacity-40">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { setEditingImgId(null); setEditingImgFile(null); }}
                        className="p-1.5 bg-red-500 text-white rounded-lg">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {uploadingImage && <span className="text-[10px] text-purple-300 animate-pulse">Uploading…</span>}
                  </div>
                ) : (
                  <button onClick={() => setEditingImgId(item.id)}
                    className="absolute bottom-1 left-1 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Change image">
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Info / Inline Edit form */}
              {editingItem?.id === item.id ? (
                <div className="p-3 space-y-2">
                  <input
                    className="w-full bg-[#1a1025] border border-purple-500/40 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-purple-400"
                    value={editingItem.name}
                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="Element name"
                  />
                  <select
                    className="w-full bg-[#1a1025] border border-purple-500/40 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-purple-400"
                    value={editingItem.category}
                    onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    type="number" min="0"
                    className="w-full bg-[#1a1025] border border-purple-500/40 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-purple-400"
                    value={editingItem.base_price}
                    onChange={e => setEditingItem({ ...editingItem, base_price: e.target.value })}
                    placeholder="Rental price (₹)"
                  />
                  <textarea
                    rows={2}
                    className="w-full bg-[#1a1025] border border-purple-500/40 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-purple-400 resize-none"
                    value={editingItem.description || ''}
                    onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder="Description / specs…"
                  />
                  <div className="flex gap-1.5">
                    <button onClick={handleEditSave}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-bold">
                      <Check className="w-3 h-3" /> Save
                    </button>
                    <button onClick={() => setEditingItem(null)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#1a1025] text-purple-300 text-[10px] font-bold border border-purple-500/20">
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 pb-1">
                    <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">{item.category}</span>
                    <h3 className="font-bold text-sm leading-tight mt-0.5 truncate text-white">{item.name}</h3>
                    {item.metadata?.description && (
                      <p className="text-[10px] text-purple-300/50 mt-1 line-clamp-2">{item.metadata.description}</p>
                    )}
                    <p className="text-sm font-black text-emerald-400 mt-1">
                      {item.base_price > 0 ? `₹${item.base_price.toLocaleString('en-IN')}` : 'Free'}
                      <span className="text-[10px] font-normal text-purple-300/40"> / event</span>
                    </p>
                  </div>
                  {/* Action bar — 2 rows */}
                  <div className="px-3 pb-3 mt-1 space-y-1.5">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setEditingItem({
                          id: item.id, name: item.name, category: item.category,
                          base_price: item.base_price, description: item.metadata?.description || ''
                        })}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 text-[10px] font-bold transition-all border border-blue-500/20"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => setEditingImgId(editingImgId === item.id ? null : item.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 text-[10px] font-bold transition-all border border-purple-500/20"
                      >
                        <ImagePlus className="w-3 h-3" /> Image
                      </button>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 text-[10px] font-bold transition-all border border-red-500/30"
                    >
                      <Trash2 className="w-3 h-3" /> Delete Prop
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
